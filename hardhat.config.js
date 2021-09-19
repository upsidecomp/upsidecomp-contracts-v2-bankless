const networks = require('./hardhat.networks')

const RNGBlockhashRopsten = require('@pooltogether/pooltogether-rng-contracts/deployments/ropsten/RNGBlockhash.json')
const RNGBlockhashRinkeby = require('@pooltogether/pooltogether-rng-contracts/deployments/rinkeby/RNGBlockhash.json')
const RNGBlockhashKovan = require('@pooltogether/pooltogether-rng-contracts/deployments/kovan/RNGBlockhash.json')

require("@nomiclabs/hardhat-waffle");
require('hardhat-deploy')
require('hardhat-deploy-ethers')
require('solidity-coverage')
require("@nomiclabs/hardhat-etherscan")
require('hardhat-abi-exporter')
require("hardhat-gas-reporter");

const testnetAdmin = '0xe693cb9ca5ec4b2f6a4111ae53308bef811e9e3e' // Account 1
const testnetUser1 = '0x2976134d99b6c9ac1bc8d6407f07b31c9247c230' // Account 3
const testnetUser2 = '0x1e33edfd7bb11ea57cc8e2bd7547ccfef8f21e6f' // Account 4
const testnetUser3 = '0x36e1d0a149b5ab87c74e91cbd4903fef709421c6' // Account 5

const optimizerEnabled = !process.env.OPTIMIZER_DISABLED

const config = {
  solidity: {
    version: "0.6.12",
    settings:{
      optimizer: {
        enabled: optimizerEnabled,
        runs: 200
      },
      evmVersion: "istanbul"
    }
  },
  networks,
  gasReporter: {
    currency: 'USD',
    gasPrice: 100,
    enabled: (process.env.REPORT_GAS) ? true : false
  },
  namedAccounts: {
    deployer: {
      default: 0
    },
    pool: {
      default: "0x0cEC1A9154Ff802e7934Fc916Ed7Ca50bDE6844e"
    },
    comptroller: {
      1: '0x4027dE966127af5F015Ea1cfd6293a3583892668',
      77: '0x14e194Cf5E1dd73BB46256495aEa8ff36A7Aa454'
    },
    reserveRegistry: {
      1: '0x3e8b9901dBFE766d3FE44B36c180A1bca2B9A295', // mainnet
      4: '0x648979EC0b11f5f6E036cCC43A360d2DDF270242', // rinkeby
      42: '0xdcC0D09beE9726E23256ebC059B7487Cd78F65a0', // kovan
      100: '0x20F29CCaE4c9886964033042c6b79c2C4C816308', // xdai
      77: '0x4d1639e4b237BCab6F908A1CEb0995716D5ebE36', // poaSokol
      137: '0x20F29CCaE4c9886964033042c6b79c2C4C816308', //matic
      80001: '0xdcC0D09beE9726E23256ebC059B7487Cd78F65a0', // mumbai
      56: '0x3e8b9901dBFE766d3FE44B36c180A1bca2B9A295', // bsc
      97: '0x3e8b9901dBFE766d3FE44B36c180A1bca2B9A295' //bscTestnet
    },
    rng: {
      42: RNGBlockhashKovan.address,
      4: RNGBlockhashRinkeby.address,
      3: RNGBlockhashRopsten.address
    },
    admin: {
      42: testnetAdmin,
      4: testnetAdmin,
      3: testnetAdmin
    },
    testnetUser1: {
      default: testnetUser1,
      3: testnetUser1,
      4: testnetUser1,
      42: testnetUser1,
    },
    testnetUser2: {
      default: testnetUser2,
      3: testnetUser2,
      4: testnetUser2,
      42: testnetUser2,
    },
    testnetUser3: {
      default: testnetUser3,
      3: testnetUser3,
      4: testnetUser3,
      42: testnetUser3,
    },
    sablier: {
      1: "0xA4fc358455Febe425536fd1878bE67FfDBDEC59a",
      3: "0xc04Ad234E01327b24a831e3718DBFcbE245904CC",
      4: "0xc04Ad234E01327b24a831e3718DBFcbE245904CC",
      5: "0x590b3974533141a44a89033deEcf932F52fcFDea",
      42: "0xc04Ad234E01327b24a831e3718DBFcbE245904CC"
    },
    testnetCDai: {
      4: '0x6d7f0754ffeb405d23c51ce938289d4835be3b14',
      42: '0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad'
    },
    bank: {
      4: "0xd12DAcb1495DE319f5667C218345DCbE54021233"
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  mocha: {
    timeout: 30000
  },
  abiExporter: {
    path: './abis',
    clear: true,
    flat: true
  }
};

module.exports = config
