const hardhat = require('hardhat')
const chalk = require("chalk")

const debug = require('debug')('ptv3:mintBank')

function dim() {
  console.log(chalk.dim.call(chalk, ...arguments))
}

function green() {
  console.log(chalk.green.call(chalk, ...arguments))
}

async function mintBank() {
  const { getNamedAccounts, deployments, ethers } = hardhat
  const { deploy } = deployments
  const toWei = ethers.utils.parseEther

  const { deployer, admin } = await getNamedAccounts()

  const user = admin // mint to admin
  const signer = await ethers.provider.getSigner(admin)

  let tokenResult = await deployments.get("Bank")

  debug(`Using deployer address: ${deployer}\n`)
  debug(`Found BANK address: ${tokenResult.address}\n`)

  const token = await hardhat.ethers.getContractAt('Bank', tokenResult.address, signer)
  await token.mint(user, ethers.utils.parseUnits('10000000', 18));

  debug(`Admin has ${await token.balanceOf(user)} testnet BANK`)
}

module.exports = {
  mintBank
}
