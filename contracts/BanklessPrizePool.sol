// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "@pooltogether/pooltogether-contracts/contracts/prize-pool/stake/StakePrizePool.sol";

contract BanklessPrizePool is StakePrizePool {
    function award(
    address to,
    address externalToken,
    uint256[] calldata tokenIds
  )
    external
    onlyPrizeStrategy
  {
    require(_canAwardExternal(externalToken), "BanklessPrizePool/invalid-external-token");

    if (tokenIds.length == 0) {
      return;
    }

    for (uint256 i = 0; i < tokenIds.length; i++) {
      try IERC721Upgradeable(externalToken).safeTransferFrom(address(this), to, tokenIds[i]){

      }
      catch(bytes memory error){
        emit ErrorAwardingExternalERC721(error);
      }

    }

    emit AwardedExternalERC721(to, externalToken, tokenIds);
  }
}
