const hardhat = require("hardhat");
const chalk = require("chalk");
const debug = require("debug")("ptv3:drawWinner");

function dim() {
  console.log(chalk.dim.call(chalk, ...arguments));
}

function green() {
  console.log(chalk.green.call(chalk, ...arguments));
}

async function main() {
  const {getNamedAccounts, deployments, ethers} = hardhat;
  const {deploy} = deployments;
  const toWei = ethers.utils.parseEther;

  const {deployer, admin} = await getNamedAccounts();
  const signer = await ethers.provider.getSigner(admin);

  const prizeStrategy = await hardhat.ethers.getContractAt(
    "BanklessMultipleWinners",
    "0x4C0216192e671e2E767236045067E48762Ec6c96",
    signer
  );

  debug("prizeStrategyAddress: ", prizeStrategy.address);

  debug("Start Award Winner");
  let tx = await prizeStrategy.startAward();
  console.log("tx1", tx.hash);
  debug("tx1", tx.hash);
  await ethers.provider.waitForTransaction(tx.hash);

  debug("Complete Award Winner");
  let tx2 = await prizeStrategy.completeAward();
  console.log("tx2", tx2.hash);
  debug("tx2", tx2.hash);
  await ethers.provider.waitForTransaction(tx2.hash);

  debug("Done!");
  // const BanklessMultipleWinners = await hardhat.artifacts.readArtifact(
  //   "BanklessMultipleWinners"
  // );
  // const bmw = new ethers.utils.Interface(BanklessMultipleWinners.abi);
  // const createResultReceipt = await ethers.provider.getTransactionReceipt(
  //   tx2.hash
  // );
  // console.log("all", createResultReceipt);
  // console.log(
  //   "logs",
  //   createResultReceipt.logs.forEach(log => {
  //     l = bmw.parseLog(log);
  //     if (l.name == "")
  //   })
  // );
  // const tokenIds = createResultReceipt.logs
  //   .map(log => {
  //     try {
  //       l = erc721.parseLog(log);
  //       if (l.name == "Minted") return l.args.tokenId.toNumber();
  //     } catch (e) {
  //       return nulls;
  //     }
  //   })
  //   .filter(x => x !== undefined);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
