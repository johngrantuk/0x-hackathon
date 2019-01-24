import {
    assetDataUtils,
    BigNumber,
    ContractWrappers,
    generatePseudoRandomSalt,
    Order,
    orderHashUtils,
    signatureUtils,
    RPCSubprovider,
    Web3ProviderEngine
} from '0x.js';

let axios = require('axios');

import { Web3Wrapper } from '@0x/web3-wrapper';
import { MnemonicWalletSubprovider } from '@0x/subproviders';
import { getContractAddressesForNetworkOrThrow } from '@0x/contract-addresses';

import { addRequest, getRequest, getFilteredRequestBook, addOffer, getFilteredOffersBook, getRequestByName, getFilteredRequestBookByName,
  parseHTTPOrder} from "../client/src/utils/request-helper";
import { getTokens } from "../client/src/utils/contract-helper";

const Card = artifacts.require("./Card.sol");

const MNEMONIC = 'concert load couple harbor equip island argue ramp clarify fence smart topic';
const BASE_DERIVATION_PATH = `44'/60'/0'/0`;
const DECIMALS = 18;
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const ZERO = new BigNumber(0);

const contractAddresses = getContractAddressesForNetworkOrThrow(50);

const mnemonicWallet = new MnemonicWalletSubprovider({
    mnemonic: MNEMONIC,
    baseDerivationPath: BASE_DERIVATION_PATH,
});

const pe = new Web3ProviderEngine();
pe.addProvider(mnemonicWallet);
pe.addProvider(new RPCSubprovider('http://127.0.0.1:8545'));
pe.start();

const contractWrappers = new ContractWrappers(pe, { networkId: 50 });

const web3Wrapper = new Web3Wrapper(pe);

var requests = [];
var offers = [];
var id1;
var id2;
var requestTokenAddress;

const requestTokenId = 1;
const requestAmount = 2;
const requestSwaps = [{requestTokenAddress: 1}, {requestTokenAddress: 2}]; // TokenAddress, TokenId


contract("MultiAsset Via Relayer", accounts => {

  it("...should create request", async () => {
    console.log('Fill Order Multi Asset');

    const cardInstance = await Card.deployed();
    // SET UP
    const [requester, client2, client3, client4] = await web3Wrapper.getAvailableAddressesAsync();

    const coffeeTokenId = 10;
    const teaTokenId = 20;
    const client4milkId = 30;
    const client3milkId = 31;
    const waterTokenId = 40;
    const irnBruTokenId = 50;
    const cokeTokenId = 60;
    const specialIrnBruTokenId = 70;
    const client4coffeId = 71;

    // 2 coffee & 3 water & 1 specialIrnBruTokenId
    await cardInstance.mint(10, requester, 'MilkMan', 'Coffee', 'Coffee10', 'https://www.brian-coffee-spot.com/wp-content/uploads/2015/10/Thumbnail-The-Milkman-DSC_1913t-150x200.jpg');
    await cardInstance.mint(11, requester, 'MilkMan', 'Coffee', 'Coffee11','https://www.brian-coffee-spot.com/wp-content/uploads/2015/10/Thumbnail-The-Milkman-DSC_1913t-150x200.jpg');
    await cardInstance.mint(40, requester, 'MilkMan', 'Water', 'Water40', 'image');
    await cardInstance.mint(41, requester, 'MilkMan', 'Water', 'Water41', 'image');
    await cardInstance.mint(42, requester, 'MilkMan', 'Water', 'Water42', 'image');
    await cardInstance.mint(specialIrnBruTokenId, requester, 'IrnBru', 'IrnBruSpecial', 'Orange','image');

    // 1 coke
    await cardInstance.mint(cokeTokenId, client2, 'Coca Cola', 'Coke', 'Coke60','Image');

    // 3 tea & 3 milk
    await cardInstance.mint(20, client3, 'Costa', 'Tea', 'Tea20', 'teaImage');
    await cardInstance.mint(21, client3, 'Costa', 'Tea', 'Tea21', 'teaImage');
    await cardInstance.mint(22, client3, 'Costa', 'Tea', 'Tea22', 'teaImage');
    await cardInstance.mint(client3milkId, client3, 'MilkMan', 'Milk', 'Milk31', 'milkImage');
    await cardInstance.mint(32, client3, 'MilkMan', 'Milk', 'Milk32', 'milkImage');
    await cardInstance.mint(33, client3, 'MilkMan', 'Milk', 'Milk33', 'milkImage');

    // 3 irn bru & 1 milk
    await cardInstance.mint(50, client4, 'IrnBru', 'IrnBru', 'IrnBru50','image');
    await cardInstance.mint(51, client4, 'IrnBru', 'IrnBru', 'IrnBru51','image');
    await cardInstance.mint(52, client4, 'IrnBru', 'IrnBru', 'IrnBru52','image');
    await cardInstance.mint(client4milkId, client4, 'MilkMan', 'Milk', 'Milk30', 'milkImage');
    await cardInstance.mint(client4coffeId, client4, 'MilkMan', 'Coffee', 'Coffee71', 'coffeeImage');

    const milkRequestAmount = 1;
    // SET UP COMPLETE

    // Post request
    var request = {                       // DO WE NEED TO ADD CLIENT??
      requestTokenAddress: cardInstance.address,
      requestTokenId: client4milkId,
      tokenOwner: 'MilkMan',
      tokenType: 'Milk',
      requestAmount: milkRequestAmount,
      swaps: [{address: cardInstance.address, id: specialIrnBruTokenId}, {address: cardInstance.address, id: waterTokenId}, {address: cardInstance.address, id: coffeeTokenId}]
    }

    var response = await axios.post('http://localhost:3000/request?networkId=50', request);
    assert.equal(response.status, 200);

    var relayRequestId = response.data.id;

    console.log('Created MilkRequest: ' + relayRequestId);

    // client 2 without tokens matching doesn't see request
    // need to get list of tokenAdrresses and ids
    response = await axios.get('http://localhost:3000/filteredrequestsbynames', {
      params: {
        networkId: 50,
        tokens: [{tokenOwner: 'CocaCola', tokenType: 'Coke'}]
      }
    });

    assert.equal(response.data.length, 0, 'Client2 Should See No Requests');

    var client3filteredRequests = await axios.get('http://localhost:3000/filteredrequestsbynames', {
      params: {
        networkId: 50,
        tokens: [{tokenOwner: 'MilkMan', tokenType: 'Milk'}, {tokenOwner: 'Costa', tokenType: 'Tea'}]
      }
    });

    console.log('Client3 filtered requests: ');
    console.log(client3filteredRequests.data);
    assert.equal(client3filteredRequests.data.length, 1, 'Client3 Should See 1 Request');
    assert.equal(client3filteredRequests.data[0].id, relayRequestId, 'Request ID should match');

    var client4filteredRequests = await axios.get('http://localhost:3000/filteredrequestsbynames', {
      params: {
        networkId: 50,
        tokens: [{tokenOwner: 'MilkMan', tokenType: 'Milk'}, {tokenOwner: 'MilkMan', tokenType: 'Coffee'}, {tokenOwner: 'IrnBru', tokenType: 'IrnBru'}]
      }
    });

    console.log('Client4 filtered requests: ');
    console.log(client4filteredRequests.data);
    assert.equal(client4filteredRequests.data.length, 1, 'Client4 Should See 1 Request');
    assert.equal(client4filteredRequests.data[0].id, relayRequestId, 'Request ID should match');

    var requesterTokens = await getTokens(cardInstance, requester);
    console.log('Requester: ')
    for(var key in requesterTokens){
      console.log(key + ':' + requesterTokens[key])
    }

    assert.equal(requesterTokens['length'], 6, 'Requester should have 6 tokens');
    assert.equal(requesterTokens[specialIrnBruTokenId], 1, 'Requester should have the Special Irn Bru token');
    assert.equal(requesterTokens[client4milkId], undefined, 'Requester should not have the Milk token');

    var client4Tokens = await getTokens(cardInstance, client4);
    console.log('Client4: ')
    for(var key in client4Tokens){
      console.log(key + ':' + client4Tokens[key])
    }

    assert.equal(client4Tokens['length'], 5, 'Client 4 should have 5 tokens');
    assert.equal(client4Tokens[client4milkId], 1, 'Client 4 should have the Milk token');
    assert.equal(client4Tokens[specialIrnBruTokenId], undefined, 'Client 4 should not have the Special Irn Bru token');

    const exchangeAddress = contractAddresses.exchange;

    // Allow the 0x ERC721 Proxy to move ERC721 tokens on behalf of requester
    const requesterERC721ApprovalTxHash = await contractWrappers.erc721Token.setProxyApprovalForAllAsync(
        cardInstance.address,
        requester,
        true,
    );

    const client3ERC721ApprovalTxHash = await contractWrappers.erc721Token.setProxyApprovalForAllAsync(
        cardInstance.address,
        client3,
        true,
    );

    const client4ERC721ApprovalTxHash = await contractWrappers.erc721Token.setProxyApprovalForAllAsync(
        cardInstance.address,
        client4,
        true,
    );

    // client 3 sends an offer - signed order

    // the client3 will give of milk token
    const client1milkAmount = new BigNumber(1);
    // the amount the requester wants of coffee token

    const client3milkOfferAmount = new BigNumber(1);
    const client3coffeeAmount = new BigNumber(1);

    const client3milkMakerAssetData = assetDataUtils.encodeERC721AssetData(cardInstance.address, client3milkId);   // 31, MAKER ASSET
    const client3coffeeTakerAssetData = assetDataUtils.encodeERC721AssetData(cardInstance.address, coffeeTokenId); // 10, TAKER

    const randomExpiration = new BigNumber(Date.now() + 1000*60*10).div(1000).ceil();

    // Create the order
    const client3order = {
        exchangeAddress,
        makerAddress: client3,
        takerAddress: NULL_ADDRESS,
        senderAddress: NULL_ADDRESS,
        feeRecipientAddress: NULL_ADDRESS,
        expirationTimeSeconds: randomExpiration,
        salt: generatePseudoRandomSalt(),
        makerAssetAmount: client3milkOfferAmount,      // Makes 1 milk token
        takerAssetAmount: client3coffeeAmount,        // Takes 1 coffee token
        makerAssetData: client3milkMakerAssetData,
        takerAssetData: client3coffeeTakerAssetData,
        makerFee: ZERO,
        takerFee: ZERO,
    };

    // Generate the order hash and sign it
    const orderHashHex = orderHashUtils.getOrderHashHex(client3order);
    const signature = await signatureUtils.ecSignHashAsync(pe, orderHashHex, client3);
    const client3signedOrder = { ...client3order, signature };
    //console.log(signedOrder);

    var request = {
      networkId: 50,
      requestId: relayRequestId,                // User will get this when they click on request to fill
      order: client3order,
      signedOrder: client3signedOrder
    }

    response = await axios.post('http://localhost:3000/offer', request);
    assert.equal(response.status, 200);

    var filteredOffers = await axios.get('http://localhost:3000/offers', {
      params: {
        networkId: 50,
        requestId: relayRequestId
      }
    });

    assert.equal(filteredOffers.data.length, 1, 'Should have 1 offer');
    assert.equal(filteredOffers.data[0].order.makerAddress, client3, 'Offer should have client3 address');
    assert.equal(filteredOffers.data[0].order.takerAssetAmount, client3coffeeAmount, 'Offer should have same taker amount');

    // client 4 sends an offer - signed order
    const client4milkOfferAmount = new BigNumber(1);
    const client4irnBruAmount = new BigNumber(1);

    const client4milkMakerAssetData = assetDataUtils.encodeERC721AssetData(cardInstance.address, client4milkId);   // 30, MAKER ASSET
    const client4coffeeMakerAssetData = assetDataUtils.encodeERC721AssetData(cardInstance.address, client4coffeId);   // 71, MAKER ASSET
    const client4irnBruTakerAssetData = assetDataUtils.encodeERC721AssetData(cardInstance.address, specialIrnBruTokenId); // 40, TAKER


    const makerAssetData = assetDataUtils.encodeMultiAssetData(
        [new BigNumber(1), new BigNumber(1)],
        [client4milkMakerAssetData, client4coffeeMakerAssetData],
    );

    const randomExpiration4 = new BigNumber(Date.now() + 1000*60*10).div(1000).ceil();

    // Create the order
    const client4order = {
        exchangeAddress,
        makerAddress: client4,
        takerAddress: NULL_ADDRESS,
        senderAddress: NULL_ADDRESS,
        feeRecipientAddress: NULL_ADDRESS,
        expirationTimeSeconds: randomExpiration4,
        salt: generatePseudoRandomSalt(),
        makerAssetAmount: new BigNumber(1),      // Makes 1 milk token
        takerAssetAmount: client4irnBruAmount,    // Takes 1 coffee token
        makerAssetData: makerAssetData,
        takerAssetData: client4irnBruTakerAssetData,
        makerFee: ZERO,
        takerFee: ZERO,
    };

    // Generate the order hash and sign it
    const orderHashHex4 = orderHashUtils.getOrderHashHex(client4order);
    const signature4 = await signatureUtils.ecSignHashAsync(pe, orderHashHex4, client4);
    const client4signedOrder = { ...client4order, signature: signature4 };
    //console.log(signedOrder);

    var request = {
      networkId: 50,
      requestId: relayRequestId,                // User will get this when they click on request to fill
      order: client4order,
      signedOrder: client4signedOrder
    }

    response = await axios.post('http://localhost:3000/offer', request);
    assert.equal(response.status, 200);

    var filteredOffers = await axios.get('http://localhost:3000/offers', {
      params: {
        networkId: 50,
        requestId: relayRequestId
      }
    });

    assert.equal(filteredOffers.data.length, 2, 'Should have 2 offer');
    assert.equal(filteredOffers.data[1].order.makerAddress, client4, 'Offer should have client3 address');
    assert.equal(filteredOffers.data[1].order.takerAssetAmount, client4irnBruAmount, 'Offer should have same taker amount');


    // client 1 gets offerbook with offers above

    // client 1 accepts an offer - fills

    // var acceptedSignedOrder = parseHTTPOrder(filteredOffers.data[1].signedOrder);
    var acceptedSignedOrder = {
      exchangeAddress: filteredOffers.data[1].signedOrder.exchangeAddress,
      makerAddress: filteredOffers.data[1].signedOrder.makerAddress,
      takerAddress: filteredOffers.data[1].signedOrder.takerAddress,
      senderAddress: filteredOffers.data[1].signedOrder.senderAddress,
      feeRecipientAddress: filteredOffers.data[1].signedOrder.feeRecipientAddress,
      expirationTimeSeconds: new BigNumber(filteredOffers.data[1].signedOrder.expirationTimeSeconds),
      salt: new BigNumber(filteredOffers.data[1].signedOrder.salt),
      makerAssetAmount: new BigNumber(filteredOffers.data[1].signedOrder.makerAssetAmount),
      takerAssetAmount: new BigNumber(filteredOffers.data[1].signedOrder.takerAssetAmount),
      makerAssetData: filteredOffers.data[1].signedOrder.makerAssetData,
      takerAssetData: filteredOffers.data[1].signedOrder.takerAssetData,
      makerFee: new BigNumber(filteredOffers.data[1].signedOrder.makerFee),
      takerFee: new BigNumber(filteredOffers.data[1].signedOrder.takerFee),
      signature: filteredOffers.data[1].signedOrder.signature
    }

    // Fill the Order via 0x.js Exchange contract
    var txHash = await contractWrappers.exchange.fillOrderAsync(acceptedSignedOrder, acceptedSignedOrder.takerAssetAmount, requester, {
        gasLimit: 400000,
    });

    // confirm tokens have swapped
    var requesterTokens = await getTokens(cardInstance, requester);

    console.log('Requester: ')
    for(var key in requesterTokens){
      console.log(key + ':' + requesterTokens[key])
    }


    assert.equal(requesterTokens['length'], 7, 'Requester should have 7 tokens');
    assert.equal(requesterTokens[specialIrnBruTokenId], undefined, 'Requester should not have the Special Irn Bru token');
    assert.equal(requesterTokens[client4milkId], 1, 'Requester should have the Milk token');
    assert.equal(requesterTokens[client4coffeId], 1, 'Requester should have the Coffee token');

    var client4Tokens = await getTokens(cardInstance, client4);
    console.log('Client4: ')
    for(var key in client4Tokens){
      console.log(key + ':' + client4Tokens[key])
    }
    assert.equal(client4Tokens['length'], 4, 'Client 4 should have 4 tokens');
    assert.equal(client4Tokens[client4milkId], undefined, 'Client 4 should not have the Milk token');
    assert.equal(client4Tokens[client4coffeId], undefined, 'Client 4 should not have the Coffee token');
    assert.equal(client4Tokens[specialIrnBruTokenId], 1, 'Client 4 should have the Special Irn Bru token');


    // Stop the Provider Engine
    pe.stop();

  });

});
