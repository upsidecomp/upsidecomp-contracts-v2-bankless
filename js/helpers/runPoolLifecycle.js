const hardhat = require('hardhat')
const chalk = require("chalk")

function dim() {
  console.log(chalk.dim.call(chalk, ...arguments))
}

function green() {
  console.log(chalk.green.call(chalk, ...arguments))
}

const { ethers } = hardhat

async function getPrizePoolAddressFromBuilderTransaction(tx) {
  const ProxyFactory = await hardhat.artifacts.readArtifact('ProxyFactory')
  const proxyFactory = new ethers.utils.Interface(ProxyFactory.abi)
  const createResultReceipt = await ethers.provider.getTransactionReceipt(tx.hash)
  const createResultEvents = createResultReceipt.logs.map(log => { try { return proxyFactory.parseLog(log) } catch (e) { return null } })
  const address = createResultEvents[0].args.proxy
  dim(`Found pool address at ${address}`)
  return address
}

module.exports = {
  getPrizePoolAddressFromBuilderTransaction,
}
