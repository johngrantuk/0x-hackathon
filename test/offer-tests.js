/*
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

import { Web3Wrapper } from '@0x/web3-wrapper';
import { MnemonicWalletSubprovider } from '@0x/subproviders';
import { getContractAddressesForNetworkOrThrow } from '@0x/contract-addresses';

import { addRequest, getRequest, getFilteredRequestBook, addOffer, getFilteredOffersBook} from "../client/src/utils/request-helper";
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

contract("Offers", accounts => {

  it("...should create request", async () => {

    const cardInstance = await Card.deployed();

    // requestTokenAddress = cardInstance.address;

    var request = {
      requestTokenAddress: cardInstance.address,
      requestTokenId: requestTokenId,
      requestAmount: requestAmount,
      requestSwaps: requestSwaps
    }

    id1 = await addRequest(requests, request);

    request = {
      requestTokenAddress: cardInstance.address,
      requestTokenId: 2,
      requestAmount: 3,
      requestSwaps: [{requestTokenAddress: 1}]
    }

    id2 = await addRequest(requests, request);

    assert.equal(requests.length, 2);
  });

  it("...should return null for non order id", async () => {
    const cardInstance = await Card.deployed();

    var retrievedId = await getRequest(requests, 1);

    assert.equal(retrievedId, null);
  });

  it("...should return request matching id", async () => {
    const cardInstance = await Card.deployed();

    var request = await getRequest(requests, id1);

    assert.equal(request.id, id1, 'Should have matching ids.');
    assert.equal(request.requestTokenId, 1);

  });

  it("...should test getting filtered request book", async () => {
    const cardInstance = await Card.deployed();

    var filteredRequests = await getFilteredRequestBook(requests, [{address: cardInstance.address, id: 1}]);

    assert.equal(filteredRequests.length, 1);
    assert.equal(filteredRequests[0].id, id1);
  })

  it("...should add an offer", async () => {
    var Order = { this: 'has', lots: 'more'};
    var signedOrder = { this: 'has', lots: 'more'};
    await addOffer(offers, Order, signedOrder, id1);

    assert.equal(offers.length, 1);

    await addOffer(offers, Order, signedOrder, '2');
    await addOffer(offers, Order, signedOrder, id1);
    await addOffer(offers, Order, signedOrder, '3');
    await addOffer(offers, Order, signedOrder, id1);

    var filteredOffers = await getFilteredOffersBook(offers, id1);

    assert.equal(filteredOffers.length, 3, 'Should have 3 offers');

    filteredOffers = await getFilteredOffersBook(offers, '2');
    assert.equal(filteredOffers.length, 1, '2 should have 1 offer');

    filteredOffers = await getFilteredOffersBook(offers, '3', '3 should have 1 offer');
    assert.equal(filteredOffers.length, 1);

  })

  it("...should test complete offer negotiation ERC721", async () => {

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

    // 2 coffee & 3 water & 1 specialIrnBruTokenId
    await cardInstance.mint(10, requester);
    await cardInstance.mint(11, requester);
    await cardInstance.mint(40, requester);
    await cardInstance.mint(41, requester);
    await cardInstance.mint(42, requester);
    await cardInstance.mint(specialIrnBruTokenId, requester);

    // 1 coke
    await cardInstance.mint(cokeTokenId, client2, new BigNumber(4));

    // 3 tea & 3 milk
    await cardInstance.mint(20, client3);
    await cardInstance.mint(21, client3);
    await cardInstance.mint(22, client3);
    await cardInstance.mint(client3milkId, client3);
    await cardInstance.mint(32, client3);
    await cardInstance.mint(33, client3);

    // 3 irn bru & 1 milk
    await cardInstance.mint(50, client4);
    await cardInstance.mint(51, client4);
    await cardInstance.mint(52, client4);
    await cardInstance.mint(client4milkId, client4);

    const milkRequestAmount = 1;
    // SET UP COMPLETE

    // Post request
    var request = {
      requestTokenAddress: cardInstance.address,
      requestTokenId: client4milkId,
      requestAmount: milkRequestAmount,
      requestSwaps: [{address: cardInstance.address, id: specialIrnBruTokenId}, {address: cardInstance.address, id: waterTokenId}, {address: cardInstance.address, id: coffeeTokenId}]
    }

    var requestId = await addRequest(requests, request);


    // client 2 without tokens matching doesn't see request
    // need to get list of tokenAdrresses and ids
    var filteredRequests = await getFilteredRequestBook(requests, [{address: cardInstance.address, id: cokeTokenId}]);
    assert.equal(filteredRequests.length, 0, 'Client2 Should See No Requests');


    var client3filteredRequests = await getFilteredRequestBook(requests, [{address: cardInstance.address, id: client4milkId}, {address: cardInstance.address, id: teaTokenId}]);
    assert.equal(client3filteredRequests.length, 1, 'Client3 Should See 1 Request');
    assert.equal(client3filteredRequests[0].id, requestId, 'Request ID should match');

    filteredRequests = await getFilteredRequestBook(requests, [{address: cardInstance.address, id: irnBruTokenId}, {address: cardInstance.address, id: client4milkId}]);
    assert.equal(filteredRequests.length, 1, 'Client4 Should See 1 Request');
    assert.equal(filteredRequests[0].id, requestId, 'Request ID should match');

    var requesterTokens = await getTokens(cardInstance, requester);
    /*
    console.log('Requester: ')
    for(var key in requesterTokens){
      console.log(key + ':' + requesterTokens[key])
    }


    assert.equal(requesterTokens['length'], 6, 'Requester should have 6 tokens');
    assert.equal(requesterTokens[specialIrnBruTokenId], 1, 'Requester should have the Special Irn Bru token');
    assert.equal(requesterTokens[client4milkId], undefined, 'Requester should not have the Milk token');

    var client4Tokens = await getTokens(cardInstance, client4);

    assert.equal(client4Tokens['length'], 4, 'Client 4 should have 4 tokens');
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


    // await addOffer(offers, signedOrder, id1);
    var client3offer = await addOffer(offers, client3order, client3signedOrder, client3filteredRequests[0].id);

    var filteredOffers = await getFilteredOffersBook(offers, client3filteredRequests[0].id);

    assert.equal(filteredOffers.length, 1, 'Should have 1 offer');
    assert.equal(filteredOffers[0].order.makerAddress, client3, 'Offer should have client3 address');
    assert.equal(filteredOffers[0].order.takerAssetAmount, client3coffeeAmount, 'Offer should have same taker amount');


    // client 4 sends an offer - signed order
    const client4milkOfferAmount = new BigNumber(1);
    const client4irnBruAmount = new BigNumber(1);

    const client4milkMakerAssetData = assetDataUtils.encodeERC721AssetData(cardInstance.address, client4milkId);   // 30, MAKER ASSET
    const client4irnBruTakerAssetData = assetDataUtils.encodeERC721AssetData(cardInstance.address, specialIrnBruTokenId); // 40, TAKER

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
        makerAssetAmount: client4milkOfferAmount,      // Makes 1 milk token
        takerAssetAmount: client4irnBruAmount,    // Takes 1 coffee token
        makerAssetData: client4milkMakerAssetData,
        takerAssetData: client4irnBruTakerAssetData,
        makerFee: ZERO,
        takerFee: ZERO,
    };

    // Generate the order hash and sign it
    const orderHashHex4 = orderHashUtils.getOrderHashHex(client4order);
    const signature4 = await signatureUtils.ecSignHashAsync(pe, orderHashHex4, client4);
    const client4signedOrder = { ...client4order, signature: signature4 };
    //console.log(signedOrder);


    // await addOffer(offers, signedOrder, id1);
    var client4offer = await addOffer(offers, client4order, client4signedOrder, client3filteredRequests[0].id); /// ID???

    var filteredOffers = await getFilteredOffersBook(offers, client3filteredRequests[0].id);

    assert.equal(filteredOffers.length, 2, 'Should have 2 offers');
    assert.equal(filteredOffers[1].order.makerAddress, client4, 'Offer should have client4 address');
    assert.equal(filteredOffers[1].order.takerAssetAmount, client4irnBruAmount, 'Offer should have same taker amount');

    // client 1 gets offerbook with offers above

    // client 1 accepts an offer - fills


    // Fill the Order via 0x.js Exchange contract
    var txHash = await contractWrappers.exchange.fillOrderAsync(filteredOffers[1].signedOrder, filteredOffers[1].order.takerAssetAmount, requester, {
        gasLimit: 400000,
    });

    // confirm tokens have swapped
    var requesterTokens = await getTokens(cardInstance, requester);

    assert.equal(requesterTokens['length'], 6, 'Requester should have 6 tokens');
    assert.equal(requesterTokens[specialIrnBruTokenId], undefined, 'Requester should not have the Special Irn Bru token');
    assert.equal(requesterTokens[client4milkId], 1, 'Requester should have the Milk token');

    var client4Tokens = await getTokens(cardInstance, client4);

    assert.equal(client4Tokens['length'], 4, 'Client 4 should have 4 tokens');
    assert.equal(client4Tokens[client4milkId], undefined, 'Client 4 should not have the Milk token');
    assert.equal(client4Tokens[specialIrnBruTokenId], 1, 'Client 4 should have the Special Irn Bru token');


    // Stop the Provider Engine
    pe.stop();
  });

  /*
  This one isn't working because the ERC721x contract isn't a FT.
  it("...should test complete offer negotiation", async () => {

    const cardInstance = await Card.deployed();

    const [requester, client2, client3, client4] = await web3Wrapper.getAvailableAddressesAsync();

    const coffeeTokenId = 10;
    const teaTokenId = 20;
    const milkTokenId = 30;
    const waterTokenId = 40;
    const irnBruTokenId = 50;
    const cokeTokenId = 60;
    const specialIrnBruTokenId = 70;

    const mintCoffeeTxHash = await cardInstance.mint(coffeeTokenId, requester, new BigNumber(2));
    const mintWaterTxHash = await cardInstance.mint(waterTokenId, requester, new BigNumber(3));
    await cardInstance.mint(specialIrnBruTokenId, requester);

    await cardInstance.mint(cokeTokenId, client2, new BigNumber(4));

    await cardInstance.mint(teaTokenId, client3, new BigNumber(3));
    await cardInstance.mint(milkTokenId, client3, new BigNumber(3));

    await cardInstance.mint(irnBruTokenId, client4, new BigNumber(10));
    await cardInstance.mint(milkTokenId, client4, new BigNumber(2));

    const milkRequestAmount = 1;

    // Post request
    var request = {
      requestTokenAddress: cardInstance.address,
      requestTokenId: milkTokenId,
      requestAmount: milkRequestAmount,
      requestSwaps: [{address: cardInstance.address, id: specialIrnBruTokenId}, {address: cardInstance.address, id: waterTokenId}, {address: cardInstance.address, id: coffeeTokenId}]
    }

    var requestId = await addRequest(requests, request);


    // client 2 without tokens matching doesn't see request
    // need to get list of tokenAdrresses and ids
    var filteredRequests = await getFilteredRequestBook(requests, [{address: cardInstance.address, id: cokeTokenId}]);
    assert.equal(filteredRequests.length, 0, 'Client2 Should See No Requests');


    filteredRequests = await getFilteredRequestBook(requests, [{address: cardInstance.address, id: milkTokenId}, {address: cardInstance.address, id: teaTokenId}]);
    assert.equal(filteredRequests.length, 1, 'Client3 Should See 1 Request');
    assert.equal(filteredRequests[0].id, requestId, 'Request ID should match');

    filteredRequests = await getFilteredRequestBook(requests, [{address: cardInstance.address, id: irnBruTokenId}, {address: cardInstance.address, id: milkTokenId}]);
    assert.equal(filteredRequests.length, 1, 'Client4 Should See 1 Request');
    assert.equal(filteredRequests[0].id, requestId, 'Request ID should match');

    var tokensOwned = await cardInstance.tokensOwned.call(requester);

    var indexes = tokensOwned[0];
    var balances = tokensOwned[1];

    console.log('Requester: ')
    for(var i = 0;i < indexes.length;i++){
      console.log('ID: ' + indexes[i] + ' Balance: ' + balances[i])
    }

    assert.equal(indexes[0], coffeeTokenId, 'Token 1s ID Should be 1.');
    assert.equal(balances[0], 2, 'Tokens ID 1 Balance Should Be 1.');
    assert.equal(indexes[1], waterTokenId, 'Token 1s ID Should be 1.');
    assert.equal(balances[1], 3, 'Tokens ID 1 Balance Should Be 1.');

    tokensOwned = await cardInstance.tokensOwned.call(client3);

    console.log('Client3: ')
    for(var i = 0;i < indexes.length;i++){
      console.log('ID: ' + indexes[i] + ' Balance: ' + balances[i])
    }

    indexes = tokensOwned[0];
    balances = tokensOwned[1];

    assert.equal(indexes[0], teaTokenId, 'Token 1s ID Should be 1.');
    assert.equal(balances[0], 3, 'Tokens ID 1 Balance Should Be 1.');
    assert.equal(indexes[1], milkTokenId, 'Token 1s ID Should be 1.');
    assert.equal(balances[1], 3, 'Tokens ID 1 Balance Should Be 1.');

    const exchangeAddress = contractAddresses.exchange;

    // Allow the 0x ERC721 Proxy to move ERC721 tokens on behalf of requester
    const requesterERC721ApprovalTxHash = await contractWrappers.erc721Token.setProxyApprovalForAllAsync(
        cardInstance.address,
        requester,
        true,
    );

    const client4ERC721ApprovalTxHash = await contractWrappers.erc721Token.setProxyApprovalForAllAsync(
        cardInstance.address,
        client3,
        true,
    );

    // client 3 sends an offer - signed order
    // the client3 will give of milk token
    const client1milkAmount = new BigNumber(1);
    // the amount the requester wants of coffee token
    const client3coffeeAmount = new BigNumber(1);

    const requesterAssetData = assetDataUtils.encodeERC721AssetData(cardInstance.address, milkTokenId);
    const client3offerAssetData = assetDataUtils.encodeERC721AssetData(cardInstance.address, coffeeTokenId);

    const randomExpiration = new BigNumber(Date.now() + 1000*60*10).div(1000).ceil();

    // Create the order
    const order = {
        exchangeAddress,
        makerAddress: client3,
        takerAddress: NULL_ADDRESS,
        senderAddress: NULL_ADDRESS,
        feeRecipientAddress: NULL_ADDRESS,
        expirationTimeSeconds: randomExpiration,
        salt: generatePseudoRandomSalt(),
        makerAssetAmount: client3coffeeAmount,
        takerAssetAmount: client1milkAmount,
        makerAssetData: requesterAssetData,
        takerAssetData: client3offerAssetData,
        makerFee: ZERO,
        takerFee: ZERO,
    };

    // Generate the order hash and sign it
    const orderHashHex = orderHashUtils.getOrderHashHex(order);
    const signature = await signatureUtils.ecSignHashAsync(pe, orderHashHex, client3);
    const signedOrder = { ...order, signature };
    //console.log(signedOrder);

    // Fill the Order via 0x.js Exchange contract
    var txHash = await contractWrappers.exchange.fillOrderAsync(signedOrder, client3coffeeAmount, requester, {
        gasLimit: 400000,
    });

    tokensOwned = await cardInstance.tokensOwned.call(requester);

    console.log('Requester: ')
    for(var i = 0;i < indexes.length;i++){
      console.log('ID: ' + indexes[i] + ' Balance: ' + balances[i])
    }

    indexes = tokensOwned[0];
    balances = tokensOwned[1];

    assert.equal(indexes[0], coffeeTokenId, 'Requester coffee token ID');
    assert.equal(balances[0], 0, 'Requester coffee token balance.');
    assert.equal(indexes[1], waterTokenId, 'Token 1s ID Should be 1.');
    assert.equal(balances[1], 3, 'Tokens ID 1 Balance Should Be 1.');

    tokensOwned = await cardInstance.tokensOwned.call(client3);

    console.log('Client3: ')
    for(var i = 0;i < indexes.length;i++){
      console.log('ID: ' + indexes[i] + ' Balance: ' + balances[i])
    }

    indexes = tokensOwned[0];
    balances = tokensOwned[1];

    assert.equal(indexes[0], teaTokenId, 'Token 1s ID Should be 1.');
    assert.equal(balances[0], 3, 'Tokens ID 1 Balance Should Be 1.');
    assert.equal(indexes[1], milkTokenId, 'Token 1s ID Should be 1.');
    assert.equal(balances[1], 2, 'Tokens ID 1 Balance Should Be 1.');
    assert.equal(indexes[2], coffeeTokenId, 'Token 1s ID Should be 1.');
    assert.equal(balances[2], 2, 'Tokens ID 1 Balance Should Be 1.');

    // await addOffer(offers, signedOrder, id1);
    //var clien3offer =

    // client 4 sends an offer - signed order

    // client 1 gets offerbook with offers above

    // client 1 accepts an offer - fills
    // confirm tokens have swapped

    /*






    var ownerOfCoffeeToken = await cardInstance.ownerOf(coffeeTokenId);
    var ownerOfTeaToken = await cardInstance.ownerOf(teaTokenId);

    console.log('coffeeToken Owner: ' + ownerOfCoffeeToken);
    console.log('teaToken Owner: ' + ownerOfTeaToken);

    assert.equal(web3.utils.toChecksumAddress(ownerOfCoffeeToken), web3.utils.toChecksumAddress(requester), "requester Should Own Coffee Token Before Trade");
    assert.equal(web3.utils.toChecksumAddress(ownerOfTeaToken), web3.utils.toChecksumAddress(client2), "client2 Should Own Tea Token Before Trade");



    var ownerOfCoffeeToken = await cardInstance.ownerOf(coffeeTokenId);
    var ownerOfTeaToken = await cardInstance.ownerOf(teaTokenId);

    console.log('coffeeToken Owner: ' + ownerOfCoffeeToken);
    console.log('teaToken Owner: ' + ownerOfTeaToken);

    assert.equal(web3.utils.toChecksumAddress(ownerOfCoffeeToken), web3.utils.toChecksumAddress(client2), "client2 Should Own Coffee Token After Trade");
    assert.equal(web3.utils.toChecksumAddress(ownerOfTeaToken), web3.utils.toChecksumAddress(requester), "requester Should Own Tea Token After Trade");

    // Stop the Provider Engine
    pe.stop();
    */

  //});

//});
