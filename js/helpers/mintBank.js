const hardhat = require('hardhat')
const chalk = require("chalk")

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

  const user = "0x048d0BB5AD612f817a554f0EF56b0585e9460294" // fix: address
  const signer = await ethers.provider.getSigner(admin)

  let tokenResult = await deployments.get("Bank")

  console.log(`Using deployer address: ${deployer}\n`)
  console.log(`Using admin address: ${admin}\n`)
  console.log(`Found BANK address: ${tokenResult.address}\n`)

  const token = await hardhat.ethers.getContractAt('Bank', tokenResult.address, signer)

  console.log("Minter Address: ", await token.minter())
  const tx = await token.mint(user, ethers.utils.parseUnits('3500000', 18));
  console.log(tx)
  const tx2 = await token.balanceOf(user)
  console.log(tx2)
}

mintBank()
