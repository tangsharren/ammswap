const Zenix = artifacts.require('Zenix');
const Flare = artifacts.require('Flare');
const XYKPool = artifacts.require('XYKPool');

module.exports = async function (deployer, network, accounts) {
    // Deploy Zenix token
    await deployer.deploy(Zenix, accounts[0]); // Use accounts[0] as the initial owner
    const zenixInstance = await Zenix.deployed();

    // Deploy Flare token
    await deployer.deploy(Flare, accounts[0]); // Use accounts[0] as the initial owner
    const flareInstance = await Flare.deployed();

    // Deploy XYKPool contract with the deployed Zenix and Flare token contracts
    await deployer.deploy(XYKPool, zenixInstance.address, flareInstance.address);
};
