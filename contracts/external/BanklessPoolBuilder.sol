// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/utils/SafeCastUpgradeable.sol";

import "@pooltogether/pooltogether-contracts/contracts/registry/RegistryInterface.sol";
import "@pooltogether/pooltogether-contracts/contracts/builders/MultipleWinnersBuilder.sol";

import "../prize-pool/BanklessPrizePoolProxyFactory.sol";

contract BanklessPoolBuilder {
  using SafeCastUpgradeable for uint256;

  event StakePrizePoolWithMultipleWinnersCreated(
    StakePrizePool indexed prizePool,
    MultipleWinners indexed prizeStrategy
  );

  struct StakePrizePoolConfig {
    IERC20Upgradeable token;
    uint256 maxExitFeeMantissa;
  }

  RegistryInterface public reserveRegistry;
  StakePrizePoolProxyFactory public stakePrizePoolProxyFactory;
  MultipleWinnersBuilder public multipleWinnersBuilder;

  constructor (
    RegistryInterface _reserveRegistry,
    StakePrizePoolProxyFactory _stakePrizePoolProxyFactory,
    MultipleWinnersBuilder _multipleWinnersBuilder
  ) public {
    require(address(_reserveRegistry) != address(0), "GlobalBuilder/reserveRegistry-not-zero");
    require(address(_stakePrizePoolProxyFactory) != address(0), "GlobalBuilder/stakePrizePoolProxyFactory-not-zero");
    require(address(_multipleWinnersBuilder) != address(0), "GlobalBuilder/multipleWinnersBuilder-not-zero");
    reserveRegistry = _reserveRegistry;
    stakePrizePoolProxyFactory = _stakePrizePoolProxyFactory;
    multipleWinnersBuilder = _multipleWinnersBuilder;
  }

  function createBanklessMultipleWinners(
    StakePrizePoolConfig memory prizePoolConfig,
    MultipleWinnersBuilder.MultipleWinnersConfig memory prizeStrategyConfig,
    uint8 decimals
  ) external returns (StakePrizePool) {
    StakePrizePool prizePool = stakePrizePoolProxyFactory.create();
    MultipleWinners prizeStrategy = multipleWinnersBuilder.createMultipleWinners(
      prizePool,
      prizeStrategyConfig,
      decimals,
      msg.sender
    );
    prizePool.initialize(
      reserveRegistry,
      _tokens(prizeStrategy),
      prizePoolConfig.maxExitFeeMantissa,
      prizePoolConfig.token
    );
    prizePool.setPrizeStrategy(prizeStrategy);
    prizePool.setCreditPlanOf(
      address(prizeStrategy.ticket()),
      prizeStrategyConfig.ticketCreditRateMantissa.toUint128(),
      prizeStrategyConfig.ticketCreditLimitMantissa.toUint128()
    );
    prizePool.transferOwnership(msg.sender);
    emit StakePrizePoolWithMultipleWinnersCreated(prizePool, prizeStrategy);
    return prizePool;
  }

  function _tokens(MultipleWinners _multipleWinners) internal view returns (ControlledTokenInterface[] memory) {
    ControlledTokenInterface[] memory tokens = new ControlledTokenInterface[](2);
    tokens[0] = ControlledTokenInterface(address(_multipleWinners.ticket()));
    tokens[1] = ControlledTokenInterface(address(_multipleWinners.sponsorship()));
    return tokens;
  }
}
