const { expect } = require("chai");

describe("MyERC20Token", function() {
  let token;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function() {
    const MyToken = await ethers.getContractFactory("MyERC20Token");
    [owner, addr1, addr2] = await ethers.getSigners();
    token = await MyToken.deploy("MyToken", "MTK", 18);
    await token.deployed();
  });

  it("should have the correct name, symbol, and decimals", async function() {
    expect(await token.name()).to.equal("MyToken");
    expect(await token.symbol()).to.equal("MTK");
    expect(await token.decimals()).to.equal(18);
  });

  it("should allow minting of tokens", async function() {
    const initialBalance = await token.balanceOf(addr1.address);
    await token.mint(addr1.address, 100);
    const newBalance = await token.balanceOf(addr1.address);
    expect(newBalance).to.equal(initialBalance.add(100));
  });
});

describe("Crowdfunding", function() {
  let token;
  let crowdfunding;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function() {
    const MyToken = await ethers.getContractFactory("MyToken");
    const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
    [owner, addr1, addr2] = await ethers.getSigners();
    token = await MyToken.deploy("MyToken", "MTK", 18);
    crowdfunding = await Crowdfunding.deploy(token.address);
    await token.deployed();
    await crowdfunding.deployed();
  });

  it("should allow creation of campaigns", async function() {
    await crowdfunding.createCampaign(1000, Math.floor(Date.now() / 1000) + 3600);
    const campaign = await crowdfunding.campaigns(0);
    expect(campaign.goal).to.equal(1000);
    expect(campaign.deadline).to.be.at.least(Math.floor(Date.now() / 1000) + 3599);
    expect(campaign.deadline).to.be.at.most(Math.floor(Date.now() / 1000) + 3601);
    expect(campaign.raised).to.equal(0);
  });

  it("should allow users to contribute to campaigns", async function() {
    await crowdfunding.createCampaign(1000, Math.floor(Date.now() / 1000) + 3600);
    await token.mint(addr1.address, 10000);
    await token.connect(addr1).approve(crowdfunding.address, 10000);
    await crowdfunding.connect(addr1).contribute(0, 500);
    const campaign = await crowdfunding.campaigns(0);
    expect(campaign.raised).to.equal(500);
    expect(await token.balanceOf(crowdfunding.address)).to.equal(500);
    expect(await token.balanceOf(addr1.address)).to.equal(9500);
    expect(await crowdfunding.contributions(0, addr1.address)).to.equal(500);
  });

  it("should allow users to withdraw funds after campaign deadline if goal not met", async function() {
    await crowdfunding.createCampaign(1000, Math.floor(Date.now() / 1000) + 1);
    await token.mint(addr1.address, 10000);
    await token.connect(addr1).approve(crowdfunding.address, 10000);
    await crowdfunding.connect(addr1).contribute(0, 500);
    await ethers.provider.send("evm_increaseTime", [86400]); // move time forward 1 day
    await ethers.provider.send("evm_mine"); // mine block to update state
    await crowdfunding.connect(addr1).withdraw(0);
    expect(await token.balanceOf(addr1.address)).to.equal(10000);
    expect(await crowdfunding.contributions(0, addr1.address)).to.equal(0);
  });

  it("should not allow users to withdraw funds before campaign deadline", async function() {
    await crowdfunding.createCampaign(1000, Math.floor(Date.now() / 1000) + 3600);
    await token.mint(addr1.address, 10000);
    await token.connect(addr1).approve(crowdfunding.address, 10000);
    await crowdfunding.connect(addr1).contribute(0, 500);
    await expect(crowdfunding.connect(addr1).withdraw(0)).to.be.revertedWith("Campaign is still ongoing");
  });

  it("should not allow users to withdraw funds if campaign goal is met", async function() {
    await crowdfunding.createCampaign(1000, Math.floor(Date.now() / 1000) + 3600);
    await token.mint(addr1.address, 10000);
    await token.connect(addr1).approve(crowdfunding.address, 10000);
    await crowdfunding.connect(addr1).contribute(0, 1000);
    await ethers.provider.send("evm_increaseTime", [86400]); // move time forward 1 day
    await ethers.provider.send("evm_mine"); // mine block to update state
    await expect(crowdfunding.connect(addr1).withdraw(0)).to.be.revertedWith("Campaign has met its funding goal");
  });
});