//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

contract ERC721Mintable is ERC721Upgradeable {
    event Minted(address indexed owner, uint256 tokenId);

    constructor(string memory name, string memory symbol) public {
      ERC721Upgradeable.__ERC721_init(name, symbol);
    }

    function mint(address to, uint256 tokenId) public returns (bool) {
        _safeMint(to, tokenId);

        emit Minted(to, tokenId);

        return true;
    }
}
