const hardhat = require("hardhat");
const chalk = require("chalk");

const {
  getPrizePoolAddressFromBuilderTransaction
} = require("../helpers/runPoolLifecycle");

const debug = require("debug")("ptv3:deployTestnetPool");
const {mintBank} = require("../helpers/mintBank");
const {addTestnetPrizes} = require("../helpers/addTestnetPrizes");
const {getEvents} = require("../../test/helpers/getEvents");

function dim() {
  console.log(chalk.dim.call(chalk, ...arguments));
}

function green() {
  console.log(chalk.green.call(chalk, ...arguments));
}

async function main() {
  const {getNamedAccounts, deployments, getChainId, ethers} = hardhat;
  const toWei = ethers.utils.parseEther;
  let {
    deployer,
    rng,
    admin,
    sablier,
    reserveRegistry
  } = await getNamedAccounts();

  const signer = await ethers.provider.getSigner(deployer);
  debug(`Using deployer address: ${deployer}\n`);
  debug(`Using admin address: ${admin}\n`);

  let tokenResult = await deployments.get("Bank");
  let banklessPoolBuilder = await deployments.get("BanklessPoolBuilder");
  const builder = await hardhat.ethers.getContractAt(
    "BanklessPoolBuilder",
    banklessPoolBuilder.address,
    signer
  );

  debug(`Using BanklessPoolBuilder @ ${builder.address}`);
  debug(`Using RNG Service @ ${rng}`);
  debug(`Using BANK @ ${tokenResult.address}`);

  const block = await ethers.provider.getBlock();

  const numberOfPrizes = 5;

  const banklessPrizePoolConfig = {
    token: tokenResult.address,
    maxExitFeeMantissa: ethers.utils.parseEther("0")
  };

  const multipleWinnersConfig = {
    rngService: rng,
    prizePeriodStart: block.timestamp,
    prizePeriodSeconds: 604800,
    ticketName: "Upside x BanklessDAO Ticket",
    ticketSymbol: "upBANK",
    sponsorshipName: "Upside x BanklessDAO Sponsorship",
    sponsorshipSymbol: "upsBANK",
    ticketCreditLimitMantissa: ethers.utils.parseEther("0"),
    ticketCreditRateMantissa: ethers.utils.parseEther("0")
  };

  debug(`Creating Bankless Prize Pool...`);

  let tx = await builder.createBanklessMultipleWinners(
    banklessPrizePoolConfig,
    multipleWinnersConfig,
    18,
    admin
  );
  await ethers.provider.waitForTransaction(tx.hash);
  let prizePoolAddress = await getPrizePoolAddressFromBuilderTransaction(tx);
  let prizePool = await hardhat.ethers.getContractAt(
    "BanklessPrizePool",
    prizePoolAddress,
    signer
  );
  debug("created prizePool: ", prizePool.address);

  let sponsorship = await hardhat.ethers.getContractAt(
    "ControlledToken",
    (await prizePool.tokens())[0],
    signer
  );
  let ticket = await hardhat.ethers.getContractAt(
    "Ticket",
    (await prizePool.tokens())[1],
    signer
  );

  debug(`sponsorship: ${sponsorship.address}, ticket: ${ticket.address}`);

  const prizeStrategyAddress = await prizePool.prizeStrategy();
  const prizePoolOwner = await prizePool.owner();

  debug("Addresses: \n", {
    rngService: rng,
    token: tokenResult.address,
    ticket: ticket.address,
    prizePool: prizePool.address,
    prizePoolOwner: prizePoolOwner,
    sponsorship: sponsorship.address,
    prizeStrategy: prizeStrategyAddress
  });

  const prizeStrategy = await hardhat.ethers.getContractAt(
    "BanklessMultipleWinners",
    prizeStrategyAddress,
    await ethers.provider.getSigner(admin)
  );

  debug("prizeStrategyAddress: ", prizeStrategy.address);

  debug("Post-Contract Deployment Strategies");

  // create bank tokens
  await mintBank();

  // create prizes
  const res = await addTestnetPrizes(prizePool.address, numberOfPrizes);

  debug(`Add prizes w tokenIds ${res.tokenIds} to prizes strategy`);

  // add prizes
  let tx2 = await prizeStrategy.addPrizes(res.erc721Address, res.tokenIds);
  await ethers.provider.waitForTransaction(tx2.hash);

  let prizes = await prizeStrategy.currentPrizeAddresses();
  console.log(prizes);
  let tokenIds = await prizeStrategy.currentPrizeTokenIds(prizes[0]);

  debug("Prizes: ", {
    prizeAddress: prizes[0],
    tokenIds: tokenIds
  });
  // debug("Prizes: \n", {
  //   prizes: addresses.map(async (item) => {
  //     return {
  //       address: item,
  //       tokenIds: await prizeStrategy.currentPrizeTokenIds(item)
  //     }
  //   })
  // })

  debug(`Done!`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
