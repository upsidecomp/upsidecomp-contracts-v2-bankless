//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

contract ERC721Minter is ERC721Upgradeable {
    event Minted(address indexed owner, uint256 tokenId);

    constructor(string memory name, string memory symbol) public {
      ERC721Upgradeable.__ERC721_init(name, symbol);
    }

    uint256 private tokenId = 0;

    function mint() public {
        tokenId++;

        _safeMint(msg.sender, tokenId);

        emit Minted(msg.sender, tokenId);
    }
}
