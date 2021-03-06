
# Upside x BanklessDAO - No-Loss NFT Giveaways

[Upside Protocol](https://www.upsidecomp.com/): No-Loss NFT Giveaways

# Setup

This project is available as an NPM package:

```bash
$ yarn add @upsidecomp-contracts-bankless
```

# Usage

## Artifacts

There are deployment artifacts available in the `deployments/` directory. For example, to pull in the PoolWithMultipleWinnersBuilder artifact:

```javascript
const BanklessPoolBuilder = require('@upsidecomp/upsidecomp-contracts-bankless-core/deployments/rinkeby/BanklessPoolBuilder.json')
const {
  abi,
  address,
  receipt
 } = BanklessPoolBuilder
```

## ABIs

Application Binary Interfaces for all Upside contracts and related contracts are available in the `abis/` directory.

For example, to pull in the PrizePool ABI:

```javascript
const BanklessPrizePool = require('@upsidecomp/upsidecomp-contracts-bankless-core/abis/BanklessPrizePool.json')
```

# Development

First clone this repository and enter the directory.

Install dependencies:

```
$ yarn
```

We use [direnv](https://direnv.net/) to manage environment variables.  You'll likely need to install it.

# Testing

We use [Hardhat](https://hardhat.dev) and [hardhat-deploy](https://github.com/wighawag/hardhat-deploy)

To run unit & integration tests:

```sh
$ yarn test
```

To run coverage:

```sh
$ yarn coverage
```

To run fuzz tests:

```sh
$ yarn echidna
```

# Fork Testing

Ensure your environment variables are set up.  Make sure your Alchemy URL is set.  Now start a local fork:

```sh
$ yarn start-fork
```

Setup account impersonation and transfer eth:

```sh
$ ./scripts/setup.sh
```

# Deployment

## Deploy Locally

Start a local node and deploy the top-level contracts:

```bash
$ yarn start
```

NOTE: When you run this command it will reset the local blockchain.

## Connect Locally

Start up a [Hardhat Console](https://hardhat.dev/guides/hardhat-console.html):

```bash
$ hardhat console --network localhost
```

Now you can load up the deployed contracts using [hardhat-deploy](https://github.com/wighawag/hardhat-deploy):

```javascript
> await deployments.all()
```

If you want to send transactions, you can get the signers like so:

```javascript
> let signers = await ethers.getSigners()
```

Let's mint some Dai for ourselves:

```javascript
> let dai = await ethers.getContractAt('ERC20Mintable', (await deployments.get('Dai')).address, signers[0])
> await dai.mint(signers[0].address, ethers.utils.parseEther('10000'))
> ethers.utils.formatEther(await dai.balanceOf(signers[0].address))
```

## Deploy to Live Networks

Copy over .envrc.example to .envrc

```
$ cp .envrc.example .envrc
```

Make sure to update the enviroment variables with suitable values.

Now enable the env vars using [direnv](https://direnv.net/docs/installation.html)

```
$ direnv allow
```

Now deploy to a network like so:

```
$ yarn deploy rinkeby
```

It will update the `deployments/` dir.
