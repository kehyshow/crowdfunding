// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract MyERC20Token is Initializable, ERC20Upgradeable {
    uint8 private _tokenDecimals;

    function initialize(string memory _name, string memory _symbol, uint8 _decimals) public initializer {
        __ERC20_init(_name, _symbol);
        _tokenDecimals = _decimals;
    }

    function decimals() public view virtual override returns (uint8) {
        return _tokenDecimals;
    }
}