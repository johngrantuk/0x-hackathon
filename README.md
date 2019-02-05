# Description
Treasure Hunt wallet with built in trading of NFT tokens via 0x.
Relayer extended to accept 'Requests' for NFT tokens so user can complete a challenge. Negotiate NFT exchange.

## Relayer
Based on the 0x-starter-project partial relayer.
Extended to accept requests for trade.

## Contract ERC721x

## tests
Full range of tests for MultiAsset transfer.
https://github.com/0xProject/0x-starter-project/blob/master/src/scenarios/fill_order_multi_asset.ts#L19


An ERC721 Treasure Hunt Dapp that allows users to source, negotiate and trade bundles of NFTs via 0x.

## Instructions To Run

### Run The Latest 0x Ganache Snapshot

yarn ganache-cli

### Compile and deploy the project contract

truffle migrate

### Mint some demo tokens

In ./client/src/utils directory, you can run:

npm loadTokens

This mints some example NFTs for accounts 0, 1, 2

### Start the example relayer

In ./client/relayer directory, you can run:

node sra_server.js

This will run the relayer that has extended endpoints. Accessible at localhost:3000

### Run the app

In ./client/ directory you can run:

npm run start

Hit yes to change from default port as relayer will be listening on that.

Open [http://localhost:3001](http://localhost:3001) to view it in the browser.
