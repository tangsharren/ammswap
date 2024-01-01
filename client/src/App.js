import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import XYKPoolABI from './ABI/XYKPoolABI.json';
import FlareABI from './ABI/flareABI.json';
import ZenixABI from './ABI/zenixABI.json';
import './App.css';
import logo from './logo.svg'
import Big from 'big.js';

const xykPoolAbi = XYKPoolABI;
const flareAbi = FlareABI;
const zenixAbi = ZenixABI;
const flareAddress = '0xDB96902Afb5208421657344eD87cf70fEB2DecF9';
const zenixAddress = '0x920B26Ba017b897EA6276863051e3AcD730078F6';
const xykPoolAddress = '0xd7eCe7B6F08dA9CDc81E044caE9fFF5b9f1A3c5D';

function App() {
    const [web3, setWeb3] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [xykPoolContract, setXykPoolContract] = useState(null);
    const [flrContract, setFlrContract] = useState(null);
    const [znxContract, setZnxContract] = useState(null);
    const [UserFlare, setFlareBalance] = useState(0);
    const [UserZenix, setZenixBalance] = useState(0);
    const [reserveFlare, setReserveFlare] = useState(0);
    const [reserveZenix, setReserveZenix] = useState(0);
    const [amountToAddFlare, setAmountToAddFlare] = useState("");
    const [amountToAddZenix, setAmountToAddZenix] = useState("");
    const [totalLiquidity, setTotalLiquidity] = useState(0);
    const [userShareAmount, setUsershared] = useState(0);
    const [suggestedLiquidity, setSuggestedLiquidity] = useState(0);
    const [amountToSwap, setAmountToSwap] = useState("");
    const [tokenIn, setTokenIn] = useState("");
    const connected = accounts.length > 0;
    useEffect(() => {
      const initializeWeb3 = async () => {
          try {
              // Connect to MetaMask or other Ethereum provider
              const web3 = new Web3(window.ethereum);
              setWeb3(web3);
  
              // Initialize contracts
              const xykPoolContract = new web3.eth.Contract(xykPoolAbi, xykPoolAddress);
              setXykPoolContract(xykPoolContract);
  
              const flrContract = new web3.eth.Contract(flareAbi, flareAddress);
              setFlrContract(flrContract);
  
              const znxContract = new web3.eth.Contract(zenixAbi, zenixAddress);
              setZnxContract(znxContract);
  
              // Fetch and set initial data
              await showLiquidityPoolInfo();
          } catch (error) {
              console.error('Error initializing web3 and contracts:', error);
          }
      };
  
      initializeWeb3();
  }, []); // Empty dependency array ensures it runs once on mount
  
    const showLiquidityPoolInfo = async() => {
      if (xykPoolContract) {
          try {
              // Load user's holdings
              const userFlrBalance = await flrContract.methods.balanceOf(accounts[0]).call();
              const userZnxBalance = await znxContract.methods.balanceOf(accounts[0]).call();

              console.log("User Flare Balance:", userFlrBalance);
              console.log("User Zenix Balance:", userZnxBalance);
              const ownerAddress = await xykPoolContract.methods.owner().call();
              console.log(ownerAddress);
              console.log(accounts[0]);
              // Set state to update the UI with user's holdings
              setFlareBalance(parseInt(Big(userFlrBalance).div(1e18).toString(), 10));
              setZenixBalance(parseInt(Big(userZnxBalance).div(1e18).toString(), 10));

              const reserve1 = await xykPoolContract.methods.reserve1().call();
              const reserve2 = await xykPoolContract.methods.reserve2().call();
              const totalLiquidity = await xykPoolContract.methods.getTotalLiquidity().call();
              const sharedAmount = await xykPoolContract.methods.getUserShare(accounts[0]).call();
              console.log("flare reserve:",reserveFlare)
              console.log("Reserve1:", reserve1);
              console.log("Reserve2:", reserve2);
              console.log("Total Liquidity:", totalLiquidity);


              setReserveFlare(parseInt(Big(reserve2).div(1e18).toString(), 10));
              setReserveZenix(parseInt(Big(reserve1).div(1e18).toString(), 10));
              setTotalLiquidity(parseInt(Big(totalLiquidity).div(1e18).toString(), 10));
              setUsershared(parseInt(Big(sharedAmount).div(1e18).toString(), 10));



              // Add additional logging for events
              xykPoolContract.events.ShareChanged({}, (error, event) => {
                  if (error) {
                      console.error("Error in ShareChanged event:", error);
                  } else {
                      console.log("ShareChanged Event:", event.returnValues);
                  }
              });

              xykPoolContract.events.LiquidityChanged({}, (error, event) => {
                  if (error) {
                      console.error("Error in LiquidityChanged event:", error);
                  } else {
                      console.log("LiquidityChanged Event:", event.returnValues);
                  }
              });

              xykPoolContract.events.ReserveChanged({}, (error, event) => {
                  if (error) {
                      console.error("Error in ReserveChanged event:", error);
                  } else {
                      console.log("ReserveChanged Event:", event.returnValues);
                  }
              });
          } catch (error) {
              console.error("Error fetching liquidity pool info:", error);
          }
      }
  };

  useEffect(() => {
      showLiquidityPoolInfo();
  }, []);
  const [estimatedAmountOut, setEstimatedAmountOut] = useState(0);
    useEffect(() => {
        const fetchEstimatedAmountOut = async() => {
            try {


                const tokenData = {
                    flare: { address: flareAddress, abi: flareAbi },
                    zenix: { address: zenixAddress, abi: zenixAbi },
                };

                // Set a default token in case the user hasn't selected one
                const defaultToken = "flare";
                const selectedToken = tokenData[tokenIn] || tokenData[defaultToken];

                const result = await xykPoolContract.methods
                    .getPrice(selectedToken.address, web3.utils.toWei(amountToSwap, 'ether'))
                    .call({ gas: '5000000' });



                // Update the estimatedAmountOut state
                setEstimatedAmountOut(Big(result).div(1e18).toString());
            } catch (error) {
                console.error('Error fetching estimated amount:', error);
            }
        };


        fetchEstimatedAmountOut();
    }, [tokenIn, amountToSwap]);

    
    useEffect(() => {
        const initWeb3 = async() => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                try {
                    await window.ethereum.enable();
                    setWeb3(web3Instance);
                } catch (error) {
                    console.error('User denied account access');
                }
            } else if (window.web3) {
                setWeb3(new Web3(window.web3.currentProvider));
            } else {
                console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
            }
        };

        initWeb3();
        showLiquidityPoolInfo();
    }, []);



    useEffect(() => {
        const loadAccounts = async() => {
            const accounts = await web3.eth.getAccounts();
            setAccounts(accounts);
        };

        if (web3) {
            loadAccounts();
        }
    }, [web3]);

    const connectToMetaMask = async() => {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const accounts = await web3.eth.getAccounts();
            setAccounts(accounts);
            showLiquidityPoolInfo();
        } catch (error) {
            console.error('User denied account access');
        }
    };

    const addLiquidity = async() => {
 
        if (!flrContract || !znxContract || !xykPoolContract) {
            alert("Contracts not initialized");
            return;
        }

        try {
           
            const [flrBalance, znxBalance] = await Promise.all([
                flrContract.methods.balanceOf(accounts[0]).call(),
                znxContract.methods.balanceOf(accounts[0]).call(),
            ]);

            // Check if the connected account is the owner of the XYK contract
            const ownerAddress = await xykPoolContract.methods.owner().call();
            console.log(ownerAddress);
            console.log(accounts[0]);
            if (accounts[0] === ownerAddress) {
                alert("Owner is forbidden from adding liquidity");
                return;
            }
            // Check if amountToAddFlare and amountToAddZenix have valid values
            if (!amountToAddFlare || !amountToAddZenix) {
                alert("Please enter valid values for Flare and Zenix amounts");
                return;
            }

            // Convert amounts to appropriate scale
            const amountToAddFlareWei = web3.utils.toWei(amountToAddFlare, 'ether');
            const amountToAddZenixWei = web3.utils.toWei(amountToAddZenix, 'ether');
            console.log(flrBalance)
            console.log(znxBalance)
            console.log(amountToAddFlareWei)
            console.log(amountToAddZenixWei)
            // Check if the account has sufficient balances
            if (Number(flrBalance) < Number(amountToAddFlareWei) || Number(znxBalance) < Number(amountToAddZenixWei)) {
                alert("Insufficient token balances");
                return;
            }

            // Step 1: Approval
            // To set the maximum spending
            const approveFlr = await approveTokenIfNeeded(flrContract, xykPoolAddress, flrBalance, amountToAddFlareWei);
            const approveZnx = await approveTokenIfNeeded(znxContract, xykPoolAddress, znxBalance, amountToAddZenixWei);

            // Check if approval transactions are successful
            if (!approveFlr.status || !approveZnx.status) {
                alert("Approval transaction failed");
                return;
            }

            // Step 2: Adding Liquidity
            const addLiquidityTx = await xykPoolContract.methods
                .addLiquidity(amountToAddZenixWei,amountToAddFlareWei)
                .send({ from: accounts[0], gas: 500000 });
              
            console.log(reserveFlare)
            // Listen for events emitted by the XYKPool contract
            addLiquidityTx.events.ShareChanged &&
                setFlareBalance((prevBalance) => prevBalance + addLiquidityTx.events.ShareChanged.returnValues.userShareAmount);

            addLiquidityTx.events.LiquidityChanged &&
                setTotalLiquidity((prevLiquidity) => prevLiquidity + addLiquidityTx.events.LiquidityChanged.returnValues.newLiquidity);

            addLiquidityTx.events.ReserveChanged &&
                setReserveFlare((prevReserve) => prevReserve + addLiquidityTx.events.ReserveChanged.returnValues.newReserve);

            addLiquidityTx.events.ReserveChanged &&
                setReserveZenix((prevReserve) => prevReserve + addLiquidityTx.events.ReserveChanged.returnValues.newReserve);

           
            showLiquidityPoolInfo();
        } catch (error) {
          if (error.message) {
            console.error("Transaction failed:", error);
            // Call the getRatio function to suggest a proper ratio
            const suggestedRatio = await xykPoolContract.methods.getRatio(zenixAddress, amountToAddZenix).call();
            alert(`Transaction failed: Not proper ratio between tokens. Suggested ratio(FLR:ZNX) is ${suggestedRatio}:${amountToAddZenix}`);
        } else {
            console.error("Transaction failed:", error);
            alert("Transaction failed");
        }
    }      
      
    };


    const approveTokenIfNeeded = async(tokenContract, spender, balance, amount) => {
        const allowance = await tokenContract.methods.allowance(accounts[0], spender).call();

        if (allowance < amount) {
            // Increase allowance if needed
            await tokenContract.methods
                .increaseAllowance(spender, web3.utils.toWei(amount, 'ether'))
                .send({ from: accounts[0] });
        }

        return { status: true }; // You might want to enhance this with actual status checking
    };



    const removeLiquidity = async() => {
        if (!flrContract || !znxContract || !xykPoolContract) {
            console.error("Contracts not initialized");
            return;
        }

        try {
            // Check if the connected account is the owner of the XYK contract
            const ownerAddress = await xykPoolContract.methods.owner().call();
            const sharedAmount = await xykPoolContract.methods.getUserShare(accounts[0]).call();
            console.log("shared",sharedAmount);
            if (Number(sharedAmount) === 0) {
              alert("You have no share contributed in the liquidity pool.");
              return;
            }
            if (accounts[0] === ownerAddress) {
                alert("Owner is forbidden from removing liquidity");
                return;
            }
            
            
            // Removing Liquidity
            const tx = await xykPoolContract.methods
                .removeLiquidity()
                .send({ from: accounts[0] });

            // Listen for events emitted by the XYKPool contract
            tx.events.ShareChanged &&
                setFlareBalance((prevBalance) => prevBalance - tx.events.ShareChanged.returnValues.userShareAmount);

            tx.events.LiquidityChanged &&
                setTotalLiquidity((prevLiquidity) => prevLiquidity - tx.events.LiquidityChanged.returnValues.removedLiquidity);

            tx.events.ReserveChanged &&
                setReserveFlare((prevReserve) => prevReserve - tx.events.ReserveChanged.returnValues.removedReserve);

            
            showLiquidityPoolInfo();
        } catch (error) {
            alert("Error removing liquidity:", error.message);
            console.error(error.message)
        }
    };

    const swapTokens = async (tokenIn, amountIn) => {
      try {
        // Check if the amountIn is 0
        if (!amountIn) {
          alert("Please enter a non-zero amount to swap.");
          return;
        }
    
        if (!xykPoolContract || !web3) {
          alert("Contracts not initialized");
          return;
        }
    
        const tokenData = {
          flare: { address: flareAddress, abi: flareAbi },
          zenix: { address: zenixAddress, abi: zenixAbi },
        };
    
        // Set a default token in case the user hasn't selected one
        const defaultToken = "flare";
        const selectedToken = tokenData[tokenIn] || tokenData[defaultToken];
    
        if (!selectedToken) {
          alert("Invalid token selection");
          return;
        }
    
        const tokenContract = new web3.eth.Contract(
          selectedToken.abi,
          selectedToken.address
        );
          try {
            const reserve1 = await xykPoolContract.methods.reserve1().call();
            const reserve2 = await xykPoolContract.methods.reserve2().call();
            let reserve = selectedToken === "flare" ? reserve2 : reserve1;
        
            console.log("Reserve of flare:", reserve2);
            console.log("Reserve of zenix:", reserve1);
            console.log("Reserve selected", reserve);
        
            const amountInWei = web3.utils.toWei(amountIn, "ether");
            
            console.log("Amt in wei",amountInWei)
            if (parseInt(amountInWei) > parseInt(reserve)) {
                alert("Amount to swap is greater than the available reserve. Please enter a lower amount.");
                return;
            }
          const approveTx = await tokenContract.methods
            .approve(xykPoolContract.options.address, amountInWei)
            .send({ from: accounts[0] });
          // Log transaction hash after token approval
          console.log("Token approval transaction hash:", approveTx.transactionHash);
      
          //alert("Swapping tokens...");
          console.log("Token In:", tokenIn);
          console.log("Token selected:", selectedToken);
      
          // Call swap function on XYKPool contract
          const swapTx = await xykPoolContract.methods
            .swap(selectedToken.address, amountInWei)
            .send({ from: accounts[0] });
          console.log("Swap transaction hash:", swapTx.transactionHash);
      
          // Update shares after the swap
          showLiquidityPoolInfo();
          const updatedUserShares = await xykPoolContract.methods
            .getUserShare(accounts[0])
            .call();
          console.log("Updated User Shares:", updatedUserShares);
        } catch (error) {
          alert("Error fetching reserves: " + error.message);
          // Log additional details about the error
          console.error(error.message);
      }
      } catch (error) {
        alert("Error swapping tokens: " + error.message);
        // Log additional details about the error
        alert("Error stack: " + error.stack);
        console.error(error.message);
      }
    };
    
    const [selectedContainer, setSelectedContainer] = useState('liquidity');
    const selectContainer = (container) => {
        setSelectedContainer(container);
        showLiquidityPoolInfo();
    };


    return (
      <div className="App">
   
      <header className="navbar">
        <div className="logo">
            <img src={require('./fire.png')} alt="FlareSwap Logo" />

          <span>FlareSwap</span>
        </div>
        <div className="wallet-status">
          <p>Connected Account: {connected && accounts.length > 0 ? accounts[0] : 'Not connected'}</p>
        </div>
        <div className="connect-button">
          <button onClick={connectToMetaMask}>Connect to MetaMask</button>
        </div>
      </header>
      <
      div className = "container" >
      <
      div className = "container-buttons" >
      <
      button style = {
      { margin: '10px', width: '25%', marginLeft: '15px' }
      }
      onClick = {
      () => selectContainer('liquidity')
      } >
      Add Liquidity < / button > <
      button style = {
      { margin: '10px', width: '30%', marginLeft: '15px' }
      }
      onClick = {
      () => selectContainer('removeLiquidity')
      } >
      Remove Liquidity < / button > <
      button style = {
      { margin: '10px', width: '30%' }
      }
      onClick = {
      () => selectContainer('swapTokens')
      } >
      Swap Tokens < / button > < /
      div > {
      selectedContainer === 'liquidity' && ( <
      div className = "LiquidityForm" >
      <
      div >
      <
      div > < strong > Flare / Zenix Liquidity Pool < / strong >  <  /
      div >
      <
      div className = "d-flex" >
      <
      div className = 'info-card' >
      <
      div style = {
      { textAlign: 'center', fontWeight: 'bold', fontSize: '1em' }
      } > < strong > Total Flare < / strong >  <  /
      div >
      <
      div style = {
      { textAlign: 'center', marginTop: '5px' }
      } > {
      reserveFlare
      } <
      / div > < /
      div > <
      div className = 'info-card' >
      <
      div style = {
      { textAlign: 'center', fontWeight: 'bold', fontSize: '1em' }
      } > < strong > Total Zenix < / strong >  <  /
      div >
      <
      div style = {
      { textAlign: 'center', marginTop: '5px' }
      } > {
      reserveZenix
      } <
      / div > < /
      div > <
      div className = 'info-card' >
      <
      div style = {
      { textAlign: 'center', fontWeight: 'bold', fontSize: '1em' }
      } > < strong > Total Liquidity < / strong >  <  /
      div >
      <
      div style = {
      { textAlign: 'center', marginTop: '5px' }
      } > {
      totalLiquidity
      } <
      / div > < /
      div > <
      / div > < /
      div >
      <
      div >
      <
      div > < strong > Users Holdings < / strong >  <  /
      div >
      <
      div className = "d-flex" >
      <
      div className = 'info-card' >
      <
      div style = {
      { textAlign: 'center', fontWeight: 'bold', fontSize: '1em' }
      } > < strong > Flare balance < / strong >  <  /
      div >
      <
      div style = {
      { textAlign: 'center', marginTop: '5px' }
      } > {
      UserFlare
      } <
      / div > < /
      div > <
      div className = 'info-card' >
      <
      div style = {
      { textAlign: 'center', fontWeight: 'bold', fontSize: '1em' }
      } > < strong > Zenix balance < / strong >  <  /
      div >
      <
      div style = {
      { textAlign: 'center', marginTop: '5px' }
      } > {
      UserZenix
      } <
      / div > < /
      div > <
      div className = 'info-card' >
      <
      div style = {
      { textAlign: 'center', fontWeight: 'bold', fontSize: '1em' }
      } > < strong > User Share < / strong >  <  /
      div >
      <
      div style = {
      { textAlign: 'center', marginTop: '5px' }
      } > {
      userShareAmount
      } <
      / div > < /
      div > <
      / div > < /
      div >
      <
      div className = "AddLiquidityForm" >
      <
      div style = {
      { fontSize: '1em', marginBottom: '15px' }
      } > < strong > Add Liquidity < / strong >  <  /
      div >
      <
      div className = 'input-field' >
      <
      div className = 'FLR' > < strong > FLR < / strong >  <  /
      div >
      <
      div className = 'I_FLR' >
      <
      input type = "number"
      placeholder = 'Enter amount of FLR..'
      value = {
      amountToAddFlare
      }
      onChange = {
      (e) => setAmountToAddFlare(e.target.value)
      }
      /> < /
      div > <
      / div > <
      div className = 'input-field' >
      <
      div className = 'ZNX' > < strong > ZNX < / strong >  <  /
      div >
      <
      div className = 'I_ZNX' >
      <
      input type = "number"
      placeholder = 'Enter amount of ZNX..'
      value = {
      amountToAddZenix
      }
      onChange = {
      (e) => setAmountToAddZenix(e.target.value)
      }
      /> < /
      div > <
      / div > <
      button style = {
      { fontWeight: 'bold', fontSize: '1em', margin: 'auto', width: '100%' }
      }
      onClick = {
      () => addLiquidity( amountToAddZenix, amountToAddFlare)
      } >
      Add Liquidity <
      / button > < /
      div > <
      / div > )
      } {
      selectedContainer === 'removeLiquidity' && ( <
      div className = "RemoveLiquidityForm" >
      <
      div style = {
      { marginTop: '20px' }
      } >
      <
      div > < strong > Flare / Zenix Liquidity Pool < / strong >  <  /
      div >
      <
      div className = "d-flex" >
      <
      div className = 'info-card' >
      <
      div style = {
      { textAlign: 'center', fontWeight: 'bold', fontSize: '1em' }
      } > < strong > Total Flare < / strong >  <  /
      div >
      <
      div style = {
      { textAlign: 'center', marginTop: '5px' }
      } > {
      reserveFlare
      } <
      / div > < /
      div > <
      div className = 'info-card' >
      <
      div style = {
      { textAlign: 'center', fontWeight: 'bold', fontSize: '1em' }
      } > < strong > Total Zenix < / strong >  <  /
      div >
      <
      div style = {
      { textAlign: 'center', marginTop: '5px' }
      } > {
      reserveZenix
      } <
      / div > < /
      div > <
      div className = 'info-card' >
      <
      div style = {
      { textAlign: 'center', fontWeight: 'bold', fontSize: '1em' }
      } > < strong > Total Liquidity < / strong >  <  /
      div >
      <
      div style = {
      { textAlign: 'center', marginTop: '5px' }
      } > {
      totalLiquidity
      } <
      / div > < /
      div > <
      / div > < /
      div >
      <
      div >
      <
      div > < strong > Users Holdings < / strong >  <  /
      div >
      <
      div className = "d-flex" >
      <
      div className = 'info-card' >
      <
      div style = {
      { textAlign: 'center', fontWeight: 'bold', fontSize: '1em' }
      } > < strong > Flare balance < / strong >  <  /
      div >
      <
      div style = {
      { textAlign: 'center', marginTop: '5px' }
      } > {
      UserFlare
      } <
      / div > < /
      div > <
      div className = 'info-card' >
      <
      div style = {
      { textAlign: 'center', fontWeight: 'bold', fontSize: '1em' }
      } > < strong > Zenix balance < / strong >  <  /
      div >
      <
      div style = {
      { textAlign: 'center', marginTop: '5px' }
      } > {
      UserZenix
      } <
      / div > < /
      div > <
      div className = 'info-card' >
      <
      div style = {
      { textAlign: 'center', fontWeight: 'bold', fontSize: '1em' }
      } > < strong > User Share < / strong >  <  /
      div >
      <
      div style = {
      { textAlign: 'center', marginTop: '5px' }
      } > {
      userShareAmount
      } <
      / div > < /
      div > <
      / div > < /
      div >
      <
      div >
      <
      button style = {
      { fontWeight: 'bold', fontSize: '1em', marginTop: '10px', width: '100%' }
      }
      onClick = {
      removeLiquidity
      } >
      Remove Liquidity < / button > < /
      div > <
      / div > )
      } {
      selectedContainer === 'swapTokens' && ( <
      div className = "SwapTokensForm" >
      <
      h2 > Swap Tokens < / h2 > 
      <label >
      Token In:
      <
      select className = "select-style"
      value = {
      tokenIn
      }
      onChange = {
      (e) => setTokenIn(e.target.value)
      } >
      <
      option value = "flare" > Flare(FLR) < / option > <
      option value = "zenix" > Zenix(ZNX) < / option > < /
      select > <
      / label > <
      label >
      Amount to Swap:
      <
      input className = "input-style"
      type = "text"
      value = {
      amountToSwap
      }
      onChange = {
      (e) => setAmountToSwap(e.target.value)
      }
      /> < /
      label > <
      p > Estimated Amount Out: {
      estimatedAmountOut
      } <
      / p > <
      button style = {
      { fontWeight: 'bold', fontSize: '1em', margin: 'auto', width: '100%' }
      }
      className = "button-style"
      onClick = {
      () => swapTokens(tokenIn, amountToSwap)
      } >
      Swap Tokens <
      / button > < /
      div > )
      } <
      / div > < /
      div > );
      }
      export default App;
