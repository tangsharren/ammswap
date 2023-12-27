// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
// import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract XYKPool {
    // using SafeMath for uint256;
    using Address for address;

    IERC20 public immutable token1;
    IERC20 public immutable token2;
    uint256 public reserve1;
    uint256 public reserve2;
    uint256 public totalLiquidity;
    mapping(address => uint256) public userShare;
    address public token1Address;
    address public token2Address;

    event ShareChanged(address indexed user, bool isAdded, uint256 share);
    event LiquidityChanged(uint256 totalLiquidity, bool isAdded);
    event ReserveChanged(address indexed user, bool isAdded, uint256 amount1, uint256 amount2);
    event Swapped(address user, IERC20 tokenIn, IERC20 tokenOut, uint256 amountIn, uint256 amountOut);

    // Custom errors
    error XYZPool__ValueCannotBeZero(uint256 value);
    error XYZPool__NotProperRatio(uint256 value1, uint256 value2);
    error XYZPool__AmountNotApproved(IERC20 token, uint256 value);
    error XYZPool__IdenticalTokenAddress(IERC20 token1, IERC20 token2);
    error XYZPool__ZeroTokenAddress(IERC20 token);
    error XYZPool__InsufficientBalance(IERC20 token, uint256 value);
    error XYZPool__TransferFromFailed(address from, address to, IERC20 token, uint256 value);
    error XYZPool__TransferFailed(address to, IERC20 token, uint256 value);
    error XYZPool__ZeroUserShare(uint256 value);
    error XYZPool__InvalidTokenAddress(IERC20 token);
    error XYZPool__PoolIsEmpty();
    error XYZPool__AmountBiggerThanReserve(uint256 value1, uint256 value2);

    modifier identicalTokenAddresses(IERC20 _token1, IERC20 _token2) {
        if (_token1 == _token2) {
            revert XYZPool__IdenticalTokenAddress(_token1, _token2);
        }
        _;
    }


    modifier zeroTokenAddress(IERC20 token) {
        if (address(token) == address(0)) {
            revert XYZPool__ZeroTokenAddress(token);
        }
        _;
    }

    modifier validTokenAddress(IERC20 token) {
        if (token != token1 && token != token2) {
            revert XYZPool__InvalidTokenAddress(token);
        }
        _;
    }

    modifier nonZeroAmount(uint256 amount) {
        if (amount == 0) {
            revert XYZPool__ValueCannotBeZero(amount);
        }
        _;
    }

    modifier notProperRatio(uint256 amount1, uint256 amount2) {
        if (totalLiquidity > 0) {
            if (amount2 != getRatio(token1, amount1)) {
                revert XYZPool__NotProperRatio(amount1, amount2);
            }
        }
        _;
    }

    modifier isAmountApproved(IERC20 token, uint256 amount) {
        if (token.allowance(msg.sender, address(this)) < amount) {
            revert XYZPool__AmountNotApproved(token, amount);
        }
        _;
    }

    modifier hasBalance(IERC20 token, uint256 amount) {
        if (token.balanceOf(msg.sender) < amount) {
            revert XYZPool__InsufficientBalance(token, amount);
        }
        _;
    }

    modifier zeroReserve() {
        if (reserve1 == 0 || reserve2 == 0) {
            revert XYZPool__PoolIsEmpty();
        }
        _;
    }

    constructor(IERC20 _token1, IERC20 _token2) zeroTokenAddress(_token1) zeroTokenAddress(_token2) identicalTokenAddresses(_token1, _token2) {
        token1 = _token1;
        token2 = _token2;
    }



    function addLiquidity(uint256 amountToken1, uint256 amountToken2)
        external
        nonZeroAmount(amountToken1)
        nonZeroAmount(amountToken2)
        hasBalance(token1, amountToken1)
        hasBalance(token2, amountToken2)
        isAmountApproved(token1, amountToken1)
        isAmountApproved(token2, amountToken2)
        notProperRatio(amountToken1, amountToken2)
    {
        _addLiquidity(amountToken1, amountToken2);
    }

    function swap(IERC20 tokenIn, uint256 amountIn)
        external
        zeroTokenAddress(tokenIn)
        validTokenAddress(tokenIn)
        nonZeroAmount(amountIn)
        zeroReserve
        hasBalance(tokenIn, amountIn)
        isAmountApproved(tokenIn, amountIn)
    {
        _swap(tokenIn, amountIn);
    }

    function removeLiquidity() external {
        uint256 userShareAmount = userShare[msg.sender];
        if (userShareAmount == 0) {
            revert XYZPool__ZeroUserShare(0);
        }

        uint256 amountToken1 = (reserve1 * userShareAmount) / totalLiquidity;
        uint256 amountToken2 = (reserve2 * userShareAmount) / totalLiquidity;

        _checkAmount(amountToken1, reserve1);
        _checkAmount(amountToken2, reserve2);
        _checkAmount(amountToken1, token1.balanceOf(address(this)));
        _checkAmount(amountToken2, token2.balanceOf(address(this)));

        _burnShare(userShareAmount);
        _transferToken(token1, msg.sender, amountToken1);
        _transferToken(token2, msg.sender, amountToken2);

        reserve1 -= amountToken1;
        reserve2 -= amountToken2;

        emit ShareChanged(msg.sender, false, userShareAmount);
        emit LiquidityChanged(totalLiquidity, false);
        emit ReserveChanged(msg.sender, false, reserve1, reserve2);
    }

    function getPrice(IERC20 tokenIn, uint256 amountIn) external view returns (uint256 amountOut) {
        bool isToken1 = tokenIn == token1;
        if (isToken1) {
            amountOut = (reserve2 * amountIn) / (reserve1 + amountIn);
        } else {
            amountOut = (reserve1 * amountIn) / (reserve2 + amountIn);
        }
    }

    function getRatio(IERC20 tokenIn, uint256 amountIn) public view returns (uint256 amountOut) {
        bool isToken1 = tokenIn == token1;
        if (isToken1) {
            amountOut = (reserve2 * amountIn) / reserve1;
        } else {
            amountOut = (reserve1 * amountIn) / reserve2;
        }
    }
    //calculates the user's share of liquidity based on the provided amounts of token1 and token2, 
    //(provided amounts of token1 & token2 = amounts of token1 and token2 user want to add to the pool.
    //and it updates the reserves accordingly.
    function _addLiquidity(uint256 amountToken1, uint256 amountToken2) private {
        // Transfer tokens from the user to the contract
        _transferTokenToContract(token1, amountToken1);
        _transferTokenToContract(token2, amountToken2);
         // Calculate user's share of liquidity
         //determining how many liquidity shares they should receive based on the amounts of tokens they provide to the liquidity pool
         //to ensure that the ratio of the two tokens in the pool remains balanced
        uint256 userShareAmount;
        if (totalLiquidity == 0) {
            // If the pool is empty, use a formula to initialize the user's share
            userShareAmount = Math.sqrt(amountToken1 * amountToken2);
        } else {
            // If the pool is not empty, calculate the minimum share to maintain ratio
            userShareAmount = Math.min((amountToken1 * totalLiquidity) / reserve1, (amountToken2 * totalLiquidity) / reserve2);
        }

        if (userShareAmount == 0) {
            revert XYZPool__ZeroUserShare(userShareAmount);
        }

        _mintShare(userShareAmount);

        reserve1 += amountToken1;
        reserve2 += amountToken2;

        emit ShareChanged(msg.sender, true, userShareAmount);
        emit LiquidityChanged(totalLiquidity, true);
        emit ReserveChanged(msg.sender, true, reserve1, reserve2);
    }

    function _swap(IERC20 tokenIn, uint256 amountIn) private {
        IERC20 tokenOut;
        uint256 reserveIn;
        uint256 reserveOut;

        bool isToken1 = tokenIn == token1;
        (tokenIn, tokenOut, reserveIn, reserveOut) = isToken1
            ? (token1, token2, reserve1, reserve2)
            : (token2, token1, reserve2, reserve1);

        {
            uint256 amountOut = (reserveOut * amountIn) / reserveIn;

            _checkAmount(amountOut, reserveOut);

            _transferTokenToContract(tokenIn, amountIn);
            _transferTokenToUser(tokenOut, msg.sender, amountOut);

            if (isToken1) {
                reserve1 += amountIn;
                reserve2 -= amountOut;
            } else {
                reserve2 += amountIn;
                reserve1 -= amountOut;
            }

            emit Swapped(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
        }
    }

    function _transferTokenToContract(IERC20 token, uint256 amount) private {
        if (!token.transferFrom(msg.sender, address(this), amount)) {
            revert XYZPool__TransferFromFailed(msg.sender, address(this), token, amount);
        }
    }

    function _transferTokenToUser(IERC20 token, address to, uint256 amount) private {
        if (!token.transfer(to, amount)) {
            revert XYZPool__TransferFailed(to, token, amount);
        }
    }

    function _transferToken(IERC20 token, address to, uint256 amount) private {
        if (token == token1 || token == token2) {
            _transferTokenToUser(token, to, amount);
        } else {
            revert XYZPool__InvalidTokenAddress(token);
        }
    }

    function _mintShare(uint256 share) private {
        userShare[msg.sender] += share;
        totalLiquidity += share;
    }

    function _burnShare(uint256 share) private {
        userShare[msg.sender] -= share;
        totalLiquidity -= share;
    }

    function _checkAmount(uint256 amountToken, uint256 reserve) private pure {
        if (amountToken > reserve) {
            revert XYZPool__AmountBiggerThanReserve(amountToken, reserve);
        }
    }
}
