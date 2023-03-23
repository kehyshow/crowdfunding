// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers, upgrades } = require("hardhat");

async function main() {
  // Deploy MyERC20Token contract
  const MyERC20Token = await ethers.getContractFactory("MyERC20Token");
  const myERC20Token = await upgrades.deployProxy(MyERC20Token, ["MyToken", "MTK", 18]);
  await myERC20Token.deployed();
  console.log("MyToken deployed to:", myERC20Token.address);

  // Deploy Crowdfunding contract
  const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
  const crowdfunding = await upgrades.deployProxy(Crowdfunding, [myERC20Token.address]);
  await crowdfunding.deployed();
  console.log("Crowdfunding deployed to:", crowdfunding.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
