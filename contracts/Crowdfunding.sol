// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./MyERC20Token.sol";

contract Crowdfunding is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    struct Campaign {
        uint256 goal;
        uint256 deadline;
        uint256 raised;
        mapping(address => uint256) contributions;
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public campaignCount;

    MyERC20Token public fundToken;

    event CampaignCreated(uint256 indexed campaignId, uint256 goal, uint256 deadline);
    event ContributionMade(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    event Withdrawal(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    event TokenWithdrawn(address indexed toAddress, uint256 amount);

    function initialize(address _tokenAddress) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();

        fundToken = MyERC20Token(_tokenAddress);
    }

    function createCampaign(uint256 _goal, uint256 _deadline) public onlyOwner {
        Campaign storage newCampaign = campaigns[campaignCount];
        newCampaign.goal = _goal;
        newCampaign.deadline = _deadline;
        newCampaign.raised = 0;
        emit CampaignCreated(campaignCount, _goal, _deadline);
        campaignCount++;
    }

    function contribute(uint256 _id, uint256 _amount) public {
        require(_id < campaignCount, "Invalid campaign ID");
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp < campaign.deadline, "Campaign has ended");

        campaign.raised += _amount;
        campaign.contributions[msg.sender] += _amount;

        // Transfer tokens to the crowdfunding contract
        fundToken.transferFrom(msg.sender, address(this), _amount);

        emit ContributionMade(_id, msg.sender, _amount);
    }

    function withdraw(uint256 _id) public {
        require(_id < campaignCount, "Invalid campaign ID");
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp > campaign.deadline, "Campaign is still ongoing");
        require(campaign.raised < campaign.goal, "Campaign has met its funding goal");

        uint256 contribution = campaign.contributions[msg.sender];
        campaign.contributions[msg.sender] = 0;

        // Transfer tokens back to the contributor
        fundToken.transfer(msg.sender, contribution);

        emit Withdrawal(_id, msg.sender, contribution);
    }

    function withdrawToken(address toAddress, uint256 _amount) public onlyOwner {
        fundToken.transfer(toAddress, _amount);

        emit TokenWithdrawn(toAddress, _amount);
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}
