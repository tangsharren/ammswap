var Flare = artifacts.require("Flare");
var Zenix = artifacts.require("Zenix");

module.exports = function (deployer) {
  const ownerAddress1 = "0xBFb9Ff9e5c4c5B9428798e13E2C7ba208fF2813f";
  const ownerAddress2 = "0x3a372AeDE13eE052F36f15F9D0AB966EE6b39B59";
  deployer.deploy(Flare, ownerAddress1);
  deployer.deploy(Zenix, ownerAddress2);
};