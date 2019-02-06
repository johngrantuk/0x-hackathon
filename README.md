# Token Squirrel
Token Squirrel is my entry to the 0x Hackathon. The Dapp is based on the idea of a loyalty scheme where merchants give a customer a 'stamp' when they make a purchase. In this case the stamps are NFTs that the user can 'Squirrel' away  :squirrel: :smiley: until they have enough to claim a reward. For example a coffee shop owner might offer one free coffee after 5 have been purchased.

In Token Squirrel the reward itself is an NFT and the reward claim process uses a 0x order to exchange the NFTs between the parties.

To make this even more interesting the Dapp allows users to make requests for NFTs they want that other users can then make an exchange offer. The exchange of NFTs between the users also uses a 0x order and bundles of NFTs can be exchanged using MultiAssetData. The idea is that this trading options helps to generate liquidity and also enables natural price discovery.

[Watch a demo here.](http://localhost:3001)

# The Parts

## Dapp

Time was limited so it's very much (an ugly) MVP to build out the Reward exchange and user trading functionality using the 0x protocol but I believe the app could grow much further. I worked a bit on Austin Griffiths [Burner Wallet](https://github.com/austintgriffith/burner-wallet) and I believe following this example of an easy to use web based wallet functionality with an initial ephemeral private key can drive initial adoption and ease on-boarding (i.e. no initial mention of crypto, just scan the QR on your coffee and start claiming rewards). Enabling 'Challenge/Reward' type incentives and trading between users using 0x gets people coming back for more and could drive mass adoption.

Obvious next steps are:

* Design!
* UI page for users to create a challenge.
* Add QR scanner functionality to enable scanning of purchases to claim NFTs. i.e. a user buys a coffee which has a QR code that allows the user to claim the NFT.
* Add metatransactions so that a new user can be on-boarded easily. Once they have some NFTs and see potential requests this would encourage them to 'upgrade' to a proper Web3 browser.


## Relayer
Based on the 0x-starter-project partial relayer example.
I extended the endpoints to enable users to make requests and offers for tokens (NFTs) and claim rewards (NFTs).
* POST, /request - Submits a request to the Relayer. Currently the request is added to a local requests array but this would be stored in a db in future.
* GET, /filteredrequestsbytypes - Retrieves all requests matching token types.
* POST, /offer - Submits a new offer to the Relayer. The offer contrains a 0x signed order. Currently the offer is added to a local offers array but this would be stored in a db in future.
* GET, /alloffers - alloffers endpoint retrieves all offers stored by Relayer.
* GET, /challenges - retrieves all challenges.
* GET, /claim - allows a user to claim a reward from the reward owner. This is done by creating a 0x signed order that is returned to the claimer so they can fill.

Code is under ./client/relayer.

## 0x

[erc721 token wrapper](https://0x.org/docs/contract-wrappers#ERC721TokenWrapper-setApprovalForAllAsync):
* [setProxyApprovalForAllAsync](https://0x.org/docs/contract-wrappers#ERC721TokenWrapper-setApprovalForAllAsync) to approve Dapp and Relayer.

[0x.js](https://0x.org/docs/0x.js) Javascript library for interacting with the 0x protocol:
* [assetDataUtils.encodeERC721AssetData](https://0x.org/docs/0x.js#assetDataUtils-encodeERC721AssetData) to encode an ERC721 token address into a hex encoded assetData string, usable in the makerAssetData or takerAssetData fields in a 0x order.
* [assetDataUtils.encodeMultiAssetData](https://0x.org/docs/0x.js#assetDataUtils-encodeMultiAssetData)to encodes assetData (produced from above) for multiple AssetProxies into a single hex encoded assetData string, usable in the makerAssetData or takerAssetData fields in a 0x order.
* [orderHashUtils.getOrderHashHex](https://0x.org/docs/0x.js#orderHashUtils-getOrderHashHex) and [signatureUtils.ecSignHashAsync](https://0x.org/docs/0x.js#signatureUtils-ecSignOrderAsync) to sign 0x orders, i.e. user offers and challenge rewards.

[Exchange wrapper](https://0x.org/docs/contract-wrappers) to interact with the 0x Exchange smart contract:
* [fillOrderAsync](https://0x.org/docs/contract-wrappers#ERC721TokenWrapper-setApprovalForAllAsync) to allow the Dapp to fill offers or challenges which are 0x signed orders.



## Contract - ERC721x

Based on the ERC721x standard from Loom ([Understanding ERC721x Token Standard](https://medium.com/loom-network/understanding-erc721x-token-standard-204eee74b8e8)). It's Loom’s extension of ERC721. It’s an ERC721-compatible token that supports multiple fungible classes.


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
