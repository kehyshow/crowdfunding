# Crowdfunding Project

This project is a simple crowdfunding platform built using Solidity, Hardhat, and OpenZeppelin. Users can create and contribute to crowdfunding campaigns using an ERC20 token.

## Features

1. Create new crowdfunding campaigns
2. Contribute to existing campaigns
3. Withdraw contributions if the campaign does not reach its goal
4. Owner can withdraw raised funds for successful campaigns

## Prerequisites

1. Node.js (v14+ recommended)
2. npm

## Installation

1. Clone the repository

```shell
git clone https://github.com/your-repo/crowdfunding.git
```

2. Change to the project directory

```shell
cd crowdfunding
```

3. Install the dependencies

```shell
npm install
```

## Usage

### Compile Contract

To compile the Solidity contracts, run:

```shell
npx hardhat compile
```

### Deploy Contracts

Before deploying the contracts, make sure to update the hardhat.config.js file with your desired network configuration. You can use a local network for testing purposes.

If you want to run node in localhost, then run:

```shell
npx hardhat node
```

and open another terminal.
To deploy the contracts, run the deploy.js script using Hardhat:

```shell
npx hardhat run --network localhost scripts/deploy.js
```

This script will deploy the MyERC20Token and Crowdfunding contracts.

## License
This project is licensed under the MIT License