// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "@pooltogether/pooltogether-contracts/contracts/builders/ControlledTokenBuilder.sol";
import "../prize-strategy/multiple-winners/BanklessMultipleWinnersProxyFactory.sol";

/* solium-disable security/no-block-members */
contract BanklessMultipleWinnersBuilder {

  event MultipleWinnersCreated(address indexed prizeStrategy);

  struct MultipleWinnersConfig {
    RNGInterface rngService;
    uint256 prizePeriodStart;
    uint256 prizePeriodSeconds;
    string ticketName;
    string ticketSymbol;
    string sponsorshipName;
    string sponsorshipSymbol;
    uint256 ticketCreditLimitMantissa;
    uint256 ticketCreditRateMantissa;
    uint256 numberOfWinners;
    // BanklessMultipleWinners.PrizeSplitConfig[] prizeSplits;
    bool splitExternalErc20Awards;
  }

  BanklessMultipleWinnersProxyFactory public multipleWinnersProxyFactory;
  ControlledTokenBuilder public controlledTokenBuilder;

  constructor (
    BanklessMultipleWinnersProxyFactory _multipleWinnersProxyFactory,
    ControlledTokenBuilder _controlledTokenBuilder
  ) public {
    require(address(_multipleWinnersProxyFactory) != address(0), "MultipleWinnersBuilder/multipleWinnersProxyFactory-not-zero");
    require(address(_controlledTokenBuilder) != address(0), "MultipleWinnersBuilder/token-builder-not-zero");
    multipleWinnersProxyFactory = _multipleWinnersProxyFactory;
    controlledTokenBuilder = _controlledTokenBuilder;
  }

  function createMultipleWinners(
    BanklessPrizePool prizePool,
    MultipleWinnersConfig memory prizeStrategyConfig,
    uint8 decimals,
    address owner
  ) external returns (BanklessMultipleWinners) {
    BanklessMultipleWinners mw = multipleWinnersProxyFactory.create();

    Ticket ticket = _createTicket(
      prizeStrategyConfig.ticketName,
      prizeStrategyConfig.ticketSymbol,
      decimals,
      prizePool
    );

    ControlledToken sponsorship = _createSponsorship(
      prizeStrategyConfig.sponsorshipName,
      prizeStrategyConfig.sponsorshipSymbol,
      decimals,
      prizePool
    );

    mw.initializeMultipleWinners(
      prizeStrategyConfig.prizePeriodStart,
      prizeStrategyConfig.prizePeriodSeconds,
      prizePool,
      ticket,
      sponsorship,
      prizeStrategyConfig.rngService,
      prizeStrategyConfig.numberOfWinners
    );

    // mw.setPrizeSplits(prizeStrategyConfig.prizeSplits);

    // if (prizeStrategyConfig.splitExternalErc20Awards) {
      // mw.setSplitExternalErc20Awards(true);
    // }

    mw.transferOwnership(owner);

    emit MultipleWinnersCreated(address(mw));

    return mw;
  }

  function _createTicket(
    string memory name,
    string memory token,
    uint8 decimals,
    PrizePool prizePool
  ) internal returns (Ticket) {
    return controlledTokenBuilder.createTicket(
      ControlledTokenBuilder.ControlledTokenConfig(
        name,
        token,
        decimals,
        prizePool
      )
    );
  }

  function _createSponsorship(
    string memory name,
    string memory token,
    uint8 decimals,
    PrizePool prizePool
  ) internal returns (ControlledToken) {
    return controlledTokenBuilder.createControlledToken(
      ControlledTokenBuilder.ControlledTokenConfig(
        name,
        token,
        decimals,
        prizePool
      )
    );
  }
}