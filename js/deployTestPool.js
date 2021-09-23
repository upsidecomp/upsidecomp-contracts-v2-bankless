const { deployments } = require("hardhat");
const hardhat = require('hardhat')


const { getEvents } = require('../test/helpers/getEvents')
const ethers = require('ethers')
const { AddressZero } = ethers.constants;

const toWei = (val) => ethers.utils.parseEther('' + val)

const debug = require('debug')('ptv3:deployTestPool')

async function deployTestPool({
  wallet,
  prizePeriodStart = 0,
  prizePeriodSeconds,
  maxExitFeeMantissa,
  creditLimit,
  creditRate,
  overrides = { gasLimit: 20000000 }
}) {
  await deployments.fixture()
  const ERC20Mintable = await hre.ethers.getContractFactory("ERC20Mintable", wallet, overrides)

  debug('beforeEach deploy rng, forwarder etc...')

  debug('Deploying Governor...')

  let governanceToken = await ERC20Mintable.deploy('Governance Token', 'GOV')

  let banklessPoolBuilder = await deployments.get("BanklessPoolBuilder")
  let rngServiceMockResult = await deployments.get("RNGServiceMock")
  let tokenResult = await deployments.get("ERC20Mintable")
  let reserveResult = await deployments.get('Reserve')

  const reserve = await hardhat.ethers.getContractAt('Reserve', reserveResult.address, wallet)
  const token = await hardhat.ethers.getContractAt('ERC20Mintable', tokenResult.address, wallet)
  const poolBuilder = await hardhat.ethers.getContractAt('BanklessPoolBuilder', banklessPoolBuilder.address, wallet)

  let linkToken = await ERC20Mintable.deploy('Link Token', 'LINK')
  let rngServiceMock = await hardhat.ethers.getContractAt('RNGServiceMock', rngServiceMockResult.address, wallet)
  await rngServiceMock.setRequestFee(linkToken.address, toWei('0'))

  const multipleWinnersConfig = {
    proxyAdmin: AddressZero,
    rngService: rngServiceMock.address,
    prizePeriodStart,
    prizePeriodSeconds,
    ticketName: "Ticket",
    ticketSymbol: "TICK",
    sponsorshipName: "Sponsorship",
    sponsorshipSymbol: "SPON",
    ticketCreditLimitMantissa: creditLimit,
    ticketCreditRateMantissa: creditRate,
  }

    debug('deploying bankless stake pool')
    const stakePoolConfig = {token: tokenResult.address, maxExitFeeMantissa}
    let tx = await poolBuilder.createBanklessMultipleWinners(stakePoolConfig, multipleWinnersConfig, await token.decimals())
    let events = await getEvents(poolBuilder, tx)
    let event = events[0]
    prizePool = await hardhat.ethers.getContractAt('BanklessPrizePoolHarness', event.args.prizePool, wallet)

  debug("created prizePool: ", prizePool.address)

  let sponsorship = await hardhat.ethers.getContractAt('ControlledToken', (await prizePool.tokens())[0], wallet)
  let ticket = await hardhat.ethers.getContractAt('Ticket', (await prizePool.tokens())[1], wallet)

  debug(`sponsorship: ${sponsorship.address}, ticket: ${ticket.address}`)

  await prizePool.setCreditPlanOf(ticket.address, creditRate || toWei('0.1').div(prizePeriodSeconds), creditLimit || toWei('0.1'))

  const prizeStrategyAddress = await prizePool.prizeStrategy()

  debug("Addresses: \n", {
    rngService: rngServiceMock.address,
    token: tokenResult.address,
    ticket: ticket.address,
    prizePool: prizePool.address,
    sponsorship: sponsorship.address,
    prizeStrategy: prizeStrategyAddress,
    governanceToken: governanceToken.address
  })

  const prizeStrategy = await hardhat.ethers.getContractAt('BanklessMultipleWinnersHarness', prizeStrategyAddress, wallet)

  debug(`Done!`)

  return {
    rngService: rngServiceMock,
    token,
    reserve,
    prizeStrategy,
    prizePool,
    ticket,
    sponsorship,
    governanceToken
  }
}

module.exports = {
  deployTestPool
}
