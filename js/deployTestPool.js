const { deployments } = require("hardhat");
const hardhat = require('hardhat')


const { getEvents } = require('../test/helpers/getEvents')
const ethers = require('ethers')
const { AddressZero } = ethers.constants;

const toWei = (val) => ethers.utils.parseEther('' + val)

const debug = require('debug')('ptv3:deployBankless')

async function main() {
  // await deployments.fixture()

  const { getNamedAccounts, deployments, getChainId, ethers } = hardhat
  const { deploy } = deployments
  const toWei = ethers.utils.parseEther

  const { deployer } = await getNamedAccounts()
  const signer = await ethers.provider.getSigner(deployer)
  console.log(`Using deployer address: ${deployer}\n`)

  const params = {
    prizePeriodStart: 0,
    prizePeriodSeconds: 10,
    creditLimit: toWei("0"),
    creditRate: toWei("0"),
    externalERC20Awards: false,
    maxExitFeeMantissa: toWei('0.5'),
  }

  const ERC20Mintable = await hre.ethers.getContractFactory("ERC20Mintable", signer, { gasLimit: 9500000 })

  debug('beforeEach deploy rng, forwarder etc...')

  let rngServiceMockResult = await deployments.get("RNGServiceMock")
  let tokenResult = await deployments.get("Bank")
  let reserveResult = await deployments.get('Reserve')
  let banklessPoolBuilder = await deployments.get("BanklessPoolBuilder")

  const reserve = await hardhat.ethers.getContractAt('Reserve', reserveResult.address, signer)
  const token = await hardhat.ethers.getContractAt('ERC20Mintable', tokenResult.address, signer)
  const poolBuilder = await hardhat.ethers.getContractAt('BanklessPoolBuilder', banklessPoolBuilder.address, signer)

  let linkToken = await ERC20Mintable.deploy('Link Token', 'LINK')
  let rngServiceMock = await hardhat.ethers.getContractAt('RNGServiceMock', rngServiceMockResult.address, signer)
  await rngServiceMock.setRequestFee(linkToken.address, toWei('1'))

  const multipleWinnersConfig = {
    proxyAdmin: AddressZero,
    rngService: rngServiceMock.address,
    prizePeriodStart: params.prizePeriodStart,
    prizePeriodSeconds: params.prizePeriodSeconds,
    ticketName: "Ticket",
    ticketSymbol: "TICK",
    sponsorshipName: "Sponsorship",
    sponsorshipSymbol: "SPON",
    ticketCreditLimitMantissa: params.creditLimit,
    ticketCreditRateMantissa: params.creditRate,
    // splitExternalErc20Awards: params.externalERC20Awards,
    prizeSplits: [],
    numberOfWinners: 1
  }

  debug('deploying bank stake pool')
  const stakePoolConfig = {
    token: tokenResult.address,
    maxExitFeeMantissa: params.maxExitFeeMantissa
  }
  // console.log(poolBuilder)
  let tx = await poolBuilder.createBanklessMultipleWinners(stakePoolConfig, multipleWinnersConfig, token.decimals())
  let events = await getEvents(poolBuilder, tx)
  let event = events[0]
  let prizePool = await hardhat.ethers.getContractAt('BanklessPrizePoolHarness', event.args.prizePool, signer)
  debug("created prizePool: ", prizePool.address)

  let sponsorship = await hardhat.ethers.getContractAt('ControlledToken', (await prizePool.tokens())[0], signer)
  let ticket = await hardhat.ethers.getContractAt('Ticket', (await prizePool.tokens())[1], signer)

  debug(`sponsorship: ${sponsorship.address}, ticket: ${ticket.address}`)

  await prizePool.setCreditPlanOf(ticket.address, params.creditRate || toWei('0.1').div(prizePeriodSeconds), params.creditLimit || toWei('0.1'))

  const prizeStrategyAddress = await prizePool.prizeStrategy()

  debug("Addresses: \n", {
    rngService: rngServiceMock.address,
    token: tokenResult.address,
    ticket: ticket.address,
    prizePool: prizePool.address,
    sponsorship: sponsorship.address,
    prizeStrategy: prizeStrategyAddress,
  })

  const prizeStrategy = await hardhat.ethers.getContractAt('BanklessMultipleWinnersHarness', prizeStrategyAddress, signer)

  debug(`Done!`)

  process.exit(0)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
