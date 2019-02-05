# Token Squirrel
Token Squirrel is my entry to the 0x Hackathon. The Dapp is based on the idea of a loyalty scheme where merchants give a customer a 'stamp' when they make a purchase. In this case the stamps are NFTs that the user can 'Squirrel' away  :squirrel: :smiley: until they have enough to claim a reward. For example a coffee shop owner might offer one free coffee after 5 have been purchased.

In Token Squirrel the reward itself is an NFT and the reward claim process uses a 0x order to exchange the NFTs between the parties.

To make this even more interesting the Dapp allows users to make requests for NFTs they want that other users can then make an exchange offer. The exchange of NFTs between the users also uses a 0x order and bundles of NFTs can be exchanged using MultiAssetData. The idea is that this trading options helps to generate liquidity and also enables natural price discovery.

[Watch a demo here.](http://localhost:3001)

# The Parts

## Contract ERC721x

## Relayer
Based on the 0x-starter-project partial relayer.
Extended to accept requests for trade.

## Dapp

React app using web3 and various 0x libraries.
Time was limited but possible additions would include:
* UI page for users to create a challenge.
* Add QR scanner functionality to enable scanning of purchases to claim NFTs. i.e. a user buys a coffee which has a QR code that allows the user to claim the NFT.
* Add metatransactions so that a new user can be on-boarded easily. Once they have some NFTs and see potential requests this would encourage them to 'upgrade' to a proper Web3 browser.


# Instructions To Run

### Run The Latest 0x Ganache Snapshot

yarn ganache-cli

### Compile and deploy the project contract

truffle migrate

### Mint some demo tokens

This sets up some demo tokens for various accounts as shown in the video. In ./client/src/utils directory, you can run:

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
