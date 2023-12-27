const XYKPoolContract = artifacts.require("XYKPool");

module.exports = function (deployer) {
  // Replace these addresses with the actual addresses of your ERC-20 tokens
  const token1Address = "0xad665bccbb3384892e28f3d41cb564f437371eda"; // Address of Token 1
  const token2Address = "0x4aa39b445ee1d56089e096175e82aaa793f51f26"; // Address of Token 2
  const ownerAddress = "0xcC1E8559c326577e911DeD872621698eD91E8f5F";

  deployer.deploy(XYKPoolContract, token1Address, token2Address, ownerAddress );
};

