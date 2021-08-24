const hardhat = require('hardhat')
const chalk = require("chalk")

const {
  getPrizePoolAddressFromBuilderTransaction,
} = require('../helpers/runPoolLifecycle')

const debug = require('debug')('ptv3:deployBankless')

const { getEvents } = require('../../test/helpers/getEvents')

function dim() {
  console.log(chalk.dim.call(chalk, ...arguments))
}

function green() {
  console.log(chalk.green.call(chalk, ...arguments))
}

async function run() {
  const { getNamedAccounts, deployments, getChainId, ethers } = hardhat
  const toWei = ethers.utils.parseEther
  let {
    deployer,
    rng,
    admin,
    sablier,
    reserveRegistry,
  } = await getNamedAccounts()

  const signer = await ethers.provider.getSigner(deployer)
  debug(`Using deployer address: ${deployer}\n`)
  debug(`Using admin address: ${admin}\n`)
  debug(`Using rng address: ${rng}\n`)


  let tokenResult = await deployments.get("Bank")
  let banklessPoolBuilder = await deployments.get("BanklessPoolBuilder")
  const builder = await hardhat.ethers.getContractAt('BanklessPoolBuilder', banklessPoolBuilder.address, signer)

  debug(`Using BanklessPoolBuilder @ ${builder.address}`)
  debug(`Using RNG Service @ ${rng}`)
  debug(`Using BANK @ ${tokenResult.address}`)

  const block = await ethers.provider.getBlock()

  const banklessPrizePoolConfig = {
    token: tokenResult.address,
    maxExitFeeMantissa: ethers.utils.parseEther('0.1')
  }

  const multipleWinnersConfig = {
    rngService: rng,
    prizePeriodStart: block.timestamp,
    prizePeriodSeconds: 864000,
    ticketName: "Upside x BanklessDAO Ticket",
    ticketSymbol: "upBANK",
    sponsorshipName: "Upside x BanklessDAO Sponsorship",
    sponsorshipSymbol: "upsBANK",
    ticketCreditLimitMantissa: ethers.utils.parseEther('0'),
    ticketCreditRateMantissa: ethers.utils.parseEther('0'),
    prizeSplits: [],
    numberOfWinners: 1,
  }

  debug(`Creating Bankless Prize Pool...`)

  let tx = await builder.createBanklessMultipleWinners(banklessPrizePoolConfig, multipleWinnersConfig, 18)
  await ethers.provider.waitForTransaction(tx.hash);
  let prizePoolAddress = await getPrizePoolAddressFromBuilderTransaction(tx);
  let prizePool = await hardhat.ethers.getContractAt('BanklessPrizePool', prizePoolAddress, signer)
  debug("created prizePool: ", prizePool.address)

  let sponsorship = await hardhat.ethers.getContractAt('ControlledToken', (await prizePool.tokens())[0], signer)
  let ticket = await hardhat.ethers.getContractAt('Ticket', (await prizePool.tokens())[1], signer)

  debug(`sponsorship: ${sponsorship.address}, ticket: ${ticket.address}`)


  // await runPoolLifecycle(prizePool, usdtHolder)
}

run()
