const XYKPool = artifacts.require("XYKPool");
const Token1 = artifacts.require("Flare"); 
const Token2 = artifacts.require("Zenix");

contract("XYKPool", (accounts) => {
  it("should update reserves after adding liquidity", async () => {
    const xykPoolInstance = await XYKPool.deployed();
    const token1Instance = await Token1.deployed();
    const token2Instance = await Token2.deployed();

    // Get initial reserves
    const [initialReserve1, initialReserve2] = await xykPoolInstance.getReserves();

    // Approve XYKPool to spend tokens (adjust amounts as needed)
    const approvalAmount1 = 100;
    const approvalAmount2 = 150;
    await token1Instance.approve(xykPoolInstance.address, approvalAmount1, { from: accounts[0] });
    await token2Instance.approve(xykPoolInstance.address, approvalAmount2, { from: accounts[0] });

    // Perform liquidity addition
    const liquidityAmount1 = 100;
    const liquidityAmount2 = 150;
    await xykPoolInstance.addLiquidity(liquidityAmount1, liquidityAmount2, { from: accounts[0] });

    // Get updated reserves after liquidity addition
    const [updatedReserve1, updatedReserve2] = await xykPoolInstance.getReserves();

    // Add your assertions based on the expected changes in reserves
    assert.isAbove(
      Number(updatedReserve1),
      Number(initialReserve1),
      "Reserve1 should increase"
    );
    assert.isAbove(
      Number(updatedReserve2),
      Number(initialReserve2),
      "Reserve2 should increase"
    );
  });
});
  // Add more test cases as needed

