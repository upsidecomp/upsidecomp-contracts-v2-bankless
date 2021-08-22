const hardhat = require('hardhat')
const chalk = require("chalk")

const {
  getPrizePoolAddressFromBuilderTransaction,
} = require('../helpers/runPoolLifecycle')

function dim() {
  console.log(chalk.dim.call(chalk, ...arguments))
}

function green() {
  console.log(chalk.green.call(chalk, ...arguments))
}

const { ethers, getNamedAccounts } = hardhat

async function run() {
  let banklessPoolBuilder = await deployments.get("BanklessPoolBuilder")

  const { deployer, admin, rng } = await getNamedAccounts()
  const signer = await ethers.provider.getSigner(admin)
  console.log(`Using admin address: ${admin}\n`)

  const builder = await ethers.getContract('BanklessPoolBuilder', signer)

  dim(`Using BanklessPoolBuilder @ ${builder.address}`)
  dim(`Using RNG Service @ ${rng}`)

  const block = await ethers.provider.getBlock()

  let tokenResult = await deployments.get("Bank")

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

  dim(`Creating Bankless Prize Pool...`)

  const tx = await builder.createBanklessMultipleWinners(
    banklessPrizePoolConfig,
    multipleWinnersConfig,
    18
  )

  // const address = await getPrizePoolAddressFromBuilderTransaction(tx)
  // const prizePool = await ethers.getContractAt('BanklessPrizePool', address, signer)

  green(`Created BanklessPrizePool ${prizePool.address}`)

  // await runPoolLifecycle(prizePool, usdtHolder)
}

run()
