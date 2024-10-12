const { ethers, upgrades } = require("hardhat");

async function main() {
  const RccToken = "0x264e0349deEeb6e8000D40213Daf18f8b3dF02c3";
  const startBlock = 6529999;
  const endBlock = 9529999;
  const RccPerBlock = "20000000000000000";
  const Stake = await hre.ethers.getContractFactory("RCCStake");
  console.log("Deploying RCCStake...");
  const s = await upgrades.deployProxy(
    Stake,
    [RccToken, startBlock, endBlock, RccPerBlock],
    { initializer: "initialize" }
  );
  //await box.deployed();
  console.log("Box deployed to:", await s.getAddress());
}

main();
