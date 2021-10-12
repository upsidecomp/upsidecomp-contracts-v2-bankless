// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "@pooltogether/pooltogether-contracts/contracts/prize-strategy/PrizeSplit.sol";

import "../PeriodicPrizeStrategy.sol";

contract BanklessMultipleWinners is PeriodicPrizeStrategy {
    /**
     * @notice Emitted when no winner can be selected during the prize distribution.
     * @dev Emitted when no winner can be selected in _distribute due to ticket.totalSupply() equaling zero.
     */
    event NoWinners();

    function initializeMultipleWinners(
        uint256 _prizePeriodStart,
        uint256 _prizePeriodSeconds,
        BanklessPrizePool _prizePool,
        TicketInterface _ticket,
        IERC20Upgradeable _sponsorship,
        RNGInterface _rng
    ) public initializer {
        PeriodicPrizeStrategy.initialize(
            _prizePeriodStart,
            _prizePeriodSeconds,
            _prizePool,
            _ticket,
            _sponsorship,
            _rng
        );
    }

    /**
     * @notice Maximum number of winners per award distribution period
     * @dev Read maximum number of winners per award distribution period from internal __numberOfWinners variable.
     * @return __numberOfWinners The total number of winners per prize award.
     */
    function numberOfWinners() external view returns (uint256) {
        return numberOfPrizes;
    }

    /**
     * @notice Distributes captured award balance to winners
     * @dev Distributes the captured award balance to the main winner and secondary winners if __numberOfWinners greater than 1.
     * @param randomNumber Random number seed used to select winners
     */
    function _distribute(uint256 randomNumber) internal override {
        require(numberOfPrizes > 0, "BanklessMultipleWinners/no-prizes-to-award");

        if (IERC20Upgradeable(address(ticket)).totalSupply() == 0) {
            emit NoWinners();
            return;
        }

        uint256 nextRandom = randomNumber;
        address currentToken = prizesErc721.start();
        uint256 nonce = 0;

        while (currentToken != address(0) && currentToken != prizesErc721.end()) {
            uint256 balance = IERC721Upgradeable(currentToken).balanceOf(address(prizePool));
            if (balance > 0) {
                for (uint256 i = 0; i < prizesErc721TokenIds[IERC721Upgradeable(currentToken)].length; ) {
                    address winner = ticket.draw(nextRandom);
                    if (
                        prizePool.awardPrize(
                            winner,
                            currentToken,
                            prizesErc721TokenIds[IERC721Upgradeable(currentToken)][i]
                        )
                    ) {
                        i++;
                    }
                    nonce += 1;
                    nextRandom = uint256(keccak256(abi.encodePacked(nextRandom + 499 + nonce * 521)));
                }
            }
            _removePrizeByAwardTokens(IERC721Upgradeable(currentToken));
            currentToken = prizesErc721.next(currentToken);
        }

        prizesErc721.clearAll();
        numberOfPrizes = 0;
    }
}
