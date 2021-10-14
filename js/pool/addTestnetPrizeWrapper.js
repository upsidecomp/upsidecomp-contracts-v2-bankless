const hardhat = require("hardhat");
const chalk = require("chalk");

const {
  getPrizePoolAddressFromBuilderTransaction
} = require("../helpers/runPoolLifecycle");

const debug = require("debug")("ptv3:deployTestnetPool");
const { mintBank } = require("../helpers/mintBank");
const { addTestnetPrizes } = require("../helpers/addTestnetPrizes");
const { getEvents } = require("../../test/helpers/getEvents");

function dim() {
  console.log(chalk.dim.call(chalk, ...arguments));
}

function green() {
  console.log(chalk.green.call(chalk, ...arguments));
}

async function main() {
  const { getNamedAccounts, deployments, getChainId, ethers } = hardhat;
  const toWei = ethers.utils.parseEther;
  let {
    deployer,
    rng,
    admin,
    sablier,
    reserveRegistry
  } = await getNamedAccounts();

  const signer = await ethers.provider.getSigner(admin);
  debug(`Using deployer address: ${deployer}\n`);
  debug(`Using admin address: ${admin}\n`);

  const config = {
    numberOfPrizes: 6,
    prizePoolAddress: "0x29c4B18a595E5e78C7Bcd2aDcCE881F677FF2Ab7",
    prizeStrategyAddress: "0x4C0216192e671e2E767236045067E48762Ec6c96"
  };

  const prizeStrategy = await hardhat.ethers.getContractAt(
    "BanklessMultipleWinners",
    config.prizeStrategyAddress,
    signer
  );

  const res = await addTestnetPrizes(
    config.prizePoolAddress,
    config.numberOfPrizes
  );

  debug(`Add prizes w tokenIds ${res.tokenIds} to prizes strategy`);

  // add prizes
  let tx2 = await prizeStrategy.addPrizes(res.erc721Address, res.tokenIds);
  await ethers.provider.waitForTransaction(tx2.hash);
  let prizes = await prizeStrategy.currentPrizeAddresses();
  let tokenIds = await prizeStrategy.currentPrizeTokenIds(prizes[0]);

  debug("Prizes: ", {
    prizeAddress: prizes[0],
    tokenIds: tokenIds
  });

  debug(`Done!`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
