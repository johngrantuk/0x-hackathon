"use strict";
exports.__esModule = true;
var Web3 = require('web3');
var _0x_js_1 = require("0x.js");
var bodyParser = require("body-parser");
var express = require("express");
var configs_1 = require("./configs");
var constants_1 = require("./constants");
var provider_engine_1 = require("./provider_engine");
var cors = require('cors');
var HTTP_OK_STATUS = 200;
var HTTP_BAD_REQUEST_STATUS = 400;
var HTTP_PORT = 3000;
var requestHelper = require("../src/utils/request-helper");
const Card = require("../src/contracts/Card.json");
var _0x_contractAddresses = require('@0x/contract-addresses');
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
// Global state
var orders = [];
var offers = [];
var ordersByHash = {};
var requests = [];
var challenges = [
  { type: 'type', id: 1, name: 'Free Coffee', owner: 'MilkMan', prize: 'Free Coffee', requiredTokens: [
    { id: 1, tokenOwner: 'MilkMan', tokenType: 'Coffee', image: constants_1.COFFEE, qty: 5 }
  ] },

  { type: 'type', id: 2, name: 'Coffee King', owner: 'MilkMan', prize: 'Coffee King', requiredTokens: [
    { id: 2, tokenOwner: 'MilkMan', tokenType: 'Coffee', image: constants_1.COFFEE, qty: 6 }
  ] },

  { type: 'type', id: 3, name: 'Tea King', owner: 'MilkMan', prize: 'Tea King', requiredTokens: [
    { id: 3, tokenOwner: 'MilkMan', tokenType: 'Tea', image: constants_1.TEA, qty: 6 }
  ] },

  { type: 'type', id: 4, name: 'Biscuit King', owner: 'MilkMan', prize: 'Biscuit King', requiredTokens: [
    { id: 4, tokenOwner: 'MilkMan', tokenType: 'Biscuit', image: constants_1.BISCUIT, qty: 6 }
  ] },

  { type: 'type', id: 5, name: 'VIP MilkMan', owner: 'MilkMan', prize: 'VIP MilkMan', requiredTokens: [
    { id: 5, tokenOwner: 'MilkMan', tokenType: 'Coffee King', image: constants_1.COFFEE_KING, qty: 1 },
    { id: 6, tokenOwner: 'MilkMan', tokenType: 'Tea King', image: constants_1.TEA_KING, qty: 1 },
    { id: 7, tokenOwner: 'MilkMan', tokenType: 'Big King', image: constants_1.BISCUIT_KING, qty: 1 }
  ] },

  { type: 'type', id: 6, name: 'IrnBru Hunter', owner: 'IrnBru', prize: 'IrnBru Hunter', requiredTokens: [
    { id: 8, tokenOwner: 'IrnBru', tokenType: 'Dundee', image: constants_1.DUNDEE, qty: 1 },
    { id: 9, tokenOwner: 'IrnBru', tokenType: 'Aberdeen', image: constants_1.ABERDEEN, qty: 1 },
    { id: 10, tokenOwner: 'IrnBru', tokenType: 'Glasgow', image: constants_1.GLASGOW, qty: 1 },
    { id: 11, tokenOwner: 'IrnBru', tokenType: 'Edinburgh', image: constants_1.EDINBURGH, qty: 1 },
  ] },

];

// We subscribe to the Exchange Events to remove any filled or cancelled orders
var contractWrappers = new _0x_js_1.ContractWrappers(provider_engine_1.providerEngine, { networkId: configs_1.NETWORK_CONFIGS.networkId });
contractWrappers.exchange.subscribe(_0x_js_1.ExchangeEvents.Fill, {}, function (err, decodedLogEvent) {
    if (err) {
        console.log('error:', err);
    }
    else if (decodedLogEvent) {
        var fillLog = decodedLogEvent.log;
        var orderHash = fillLog.args.orderHash;
        console.log("Order filled " + fillLog.args.orderHash);
        removeOrder(orderHash);
    }
});
// Listen for Cancel Exchange Events and remove any orders
contractWrappers.exchange.subscribe(_0x_js_1.ExchangeEvents.Cancel, {}, function (err, decodedLogEvent) {
    if (err) {
        console.log('error:', err);
    }
    else if (decodedLogEvent) {
        var fillLog = decodedLogEvent.log;
        var orderHash = fillLog.args.orderHash;
        console.log("Order cancelled " + fillLog.args.orderHash);
        removeOrder(orderHash);
    }
});
// HTTP Server
var app = express();

app.use(cors());
app.use(bodyParser.json());
/**
 * GET Orderbook endpoint retrieves the orderbook for a given asset pair.
 * http://sra-spec.s3-website-us-east-1.amazonaws.com/#operation/getOrderbook
 */
app.get('/v2/orderbook', function (req, res) {
    console.log('HTTP: GET orderbook');
    var baseAssetData = req.query.baseAssetData;
    var quoteAssetData = req.query.quoteAssetData;
    var networkIdRaw = req.query.networkId;
    // tslint:disable-next-line:custom-no-magic-numbers
    var networkId = parseInt(networkIdRaw, 10);
    if (networkId !== configs_1.NETWORK_CONFIGS.networkId) {
        console.log("Incorrect Network ID: " + networkId);
        res.status(HTTP_BAD_REQUEST_STATUS).send({});
    }
    else {
        var orderbookResponse = renderOrderbookResponse(baseAssetData, quoteAssetData);
        res.status(HTTP_OK_STATUS).send(orderbookResponse);
    }
});
/**
 * POST Order config endpoint retrives the values for order fields that the relayer requires.
 * http://sra-spec.s3-website-us-east-1.amazonaws.com/#operation/getOrderConfig
 */
app.post('/v2/order_config', function (req, res) {
    console.log('HTTP: POST order config');
    var networkIdRaw = req.query.networkId;
    // tslint:disable-next-line:custom-no-magic-numbers
    var networkId = parseInt(networkIdRaw, 10);
    if (networkId !== configs_1.NETWORK_CONFIGS.networkId) {
        console.log("Incorrect Network ID: " + networkId);
        res.status(HTTP_BAD_REQUEST_STATUS).send({});
    }
    else {
        var orderConfigResponse = {
            senderAddress: constants_1.NULL_ADDRESS,
            feeRecipientAddress: constants_1.NULL_ADDRESS,
            makerFee: constants_1.ZERO,
            takerFee: '1000'
        };
        res.status(HTTP_OK_STATUS).send(orderConfigResponse);
    }
});
/**
 * POST Order endpoint submits an order to the Relayer.
 * http://sra-spec.s3-website-us-east-1.amazonaws.com/#operation/postOrder
 */
app.post('/v2/order', function (req, res) {
    console.log('HTTP: POST order');
    var networkIdRaw = req.query.networkId;
    // tslint:disable-next-line:custom-no-magic-numbers
    var networkId = parseInt(networkIdRaw, 10);
    if (networkId !== configs_1.NETWORK_CONFIGS.networkId) {
        console.log("Incorrect Network ID: " + networkId);
        res.status(HTTP_BAD_REQUEST_STATUS).send({});
    }
    else {
        var signedOrder = parseHTTPOrder(req.body);
        var orderHash = _0x_js_1.orderHashUtils.getOrderHashHex(signedOrder);
        ordersByHash[orderHash] = signedOrder;
        orders.push(signedOrder);
        res.status(HTTP_OK_STATUS).send({});
    }
});


/**
 * GET requestsbyname endpoint retrieves the requests matching tokenName
 * Extension added by JG for 0x Hackathon
 */
app.get('/requestsbytype', async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
    var networkIdRaw = req.query.networkId;
    var tokenOwner = req.query.tokenOwner;
    var tokenType = req.query.tokenType;

    var networkId = parseInt(networkIdRaw, 10);

    console.log('HTTP: GET requests by name: ' + tokenOwner + ': ' + tokenType);

    if (networkId !== configs_1.NETWORK_CONFIGS.networkId) {
        console.log("Incorrect Network ID: " + networkId);
        res.status(HTTP_BAD_REQUEST_STATUS).send({});
    }
    else {
        //var requestsByType = getRequestByName(requests, tokenOwner, tokenType);
        var requestsByType = await requestHelper.getRequestByName(requests, tokenOwner, tokenType);
        console.log(requestsByType);
        res.status(HTTP_OK_STATUS).send(requestsByType);
    }
});
/**
 * GET requestbyid endpoint retrieves the request matching ID
 * Extension added by JG for 0x Hackathon
 */
app.get('/requestbyid', async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
    var networkIdRaw = req.query.networkId;
    var requestIdRaw = req.query.requestId;

    var networkId = parseInt(networkIdRaw, 10);
    var requestId = parseInt(requestIdRaw, 10);

    console.log('HTTP: GET request by ID: ' + requestId);

    if (networkId !== configs_1.NETWORK_CONFIGS.networkId) {
        console.log("Incorrect Network ID: " + networkId);
        res.status(HTTP_BAD_REQUEST_STATUS).send({});
    }
    else {
        var request = await requestHelper.getRequest(requests, requestId);
        res.status(HTTP_OK_STATUS).send(request);
    }
});
/**
 * POST request endpoint submits a request to the Relayer.
 * Extension added by JG for 0x Hackathon
 */
app.post('/request', async function (req, res) {

    console.log('HTTP: POST request!');
    var networkIdRaw = req.query.networkId;

    var networkId = parseInt(networkIdRaw, 10);
    if (networkId !== configs_1.NETWORK_CONFIGS.networkId) {
        console.log("Incorrect Network ID: " + networkId);
        res.status(HTTP_BAD_REQUEST_STATUS).send({});
    }
    else {
      // console.log(req.body);
      var id = await requestHelper.addRequest(requests, req.body);
      // var signedOrder = parseHTTPOrder(req.body);
      // var orderHash = _0x_js_1.orderHashUtils.getOrderHashHex(signedOrder);
      // ordersByHash[orderHash] = signedOrder;
      // orders.push(signedOrder);
      res.status(200).send({id: id});
      //res.status(HTTP_OK_STATUS).send({id: id});
    }
});
/**
 * GET requestbyid endpoint retrieves the request matching ID
 * Extension added by JG for 0x Hackathon
 */
app.get('/filteredrequestsbynames', async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    var networkIdRaw = req.query.networkId;
    var tokens = req.query.tokens;

    var networkId = parseInt(networkIdRaw, 10);

    console.log('HTTP: GET filter request book by names: ');
    console.log('Current Requests:');
    console.log(requests);

    console.log(tokens)

    if(tokens === undefined){
      res.status(HTTP_OK_STATUS).send([]);
      return;
    }
    //console.log(tokens);
    var tokenJson = tokens.map(token => JSON.parse(token));
    console.log('Filters:')
    console.log(tokenJson)

    if (networkId !== configs_1.NETWORK_CONFIGS.networkId) {
        console.log("Incorrect Network ID: " + networkId);
        res.status(HTTP_BAD_REQUEST_STATUS).send({});
    }
    else {
        var filteredRequests = await requestHelper.getFilteredRequestBookByName(requests, tokenJson);
        console.log(filteredRequests)
        res.status(HTTP_OK_STATUS).send(filteredRequests);
    }
});
/**
 * POST offer endpoint submits an offer to the Relayer.
 * Extension added by JG for 0x Hackathon
 */
app.post('/offer', async function (req, res) {

  console.log(req.body)
    var networkIdRaw = req.body.networkId;

    var requestIdRaw = req.body.requestId;
    var order = req.body.order;
    var signedOrder = req.body.signedOrder;

    var networkId = parseInt(networkIdRaw, 10);
    var requestId = parseInt(requestIdRaw, 10);
    var request = req.body.request;
    var takerTokens = req.body.offers;
    var makerTokens = req.body.makerTokens;

    console.log('HTTP: POST offer: ' + requestId);
    if (networkId !== configs_1.NETWORK_CONFIGS.networkId) {
        console.log("Incorrect Network ID: " + networkId);
        res.status(HTTP_BAD_REQUEST_STATUS).send({});
    }
    else {
      // console.log(req.body);
      // var signedOrder = parseHTTPOrder(req.body);
      await requestHelper.addOffer(offers, order, signedOrder, requestId, request, takerTokens, makerTokens);

      res.status(HTTP_OK_STATUS).send({});
    }
});
/**
 * GET offers endpoint retrieves the offers matching ID
 * Extension added by JG for 0x Hackathon
 */
app.get('/offers', async function (req, res) {

    var networkIdRaw = req.query.networkId;
    var requestIdRaw = req.query.requestId;

    var networkId = parseInt(networkIdRaw, 10);
    var requestId = parseInt(requestIdRaw, 10);

    console.log('HTTP: GET offers by requestID: ' + requestId);

    if (networkId !== configs_1.NETWORK_CONFIGS.networkId) {
        console.log("Incorrect Network ID: " + networkId);
        res.status(HTTP_BAD_REQUEST_STATUS).send({});
    }
    else {
        var filteredOffers = await requestHelper.getFilteredOffersBook(offers, requestId);
        res.status(HTTP_OK_STATUS).send(filteredOffers);
    }
});
/**
 * GET offers endpoint
 * Extension added by JG for 0x Hackathon
 */
app.get('/alloffers', async function (req, res) {

    var networkIdRaw = req.query.networkId;

    var networkId = parseInt(networkIdRaw, 10);

    console.log('HTTP: GET alloffers...');

    if (networkId !== configs_1.NETWORK_CONFIGS.networkId) {
        console.log("Incorrect Network ID: " + networkId);
        res.status(HTTP_BAD_REQUEST_STATUS).send({});
    }
    else {
        res.status(HTTP_OK_STATUS).send(offers);
    }
});

/**
 * GET challenges
 * Extension added by JG for 0x Hackathon
 */
app.get('/challenges', async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    var networkIdRaw = req.query.networkId;
    var networkId = parseInt(networkIdRaw, 10);

    console.log('HTTP: GET challenges');

    if (networkId !== configs_1.NETWORK_CONFIGS.networkId) {
        console.log("Incorrect Network ID: " + networkId);
        res.status(HTTP_BAD_REQUEST_STATUS).send({});
    }
    else {
        res.status(HTTP_OK_STATUS).send(challenges);
    }
});

/**
 * GET claim
 * Extension added by JG for 0x Hackathon
 */
app.get('/claim', async function (req, res) {

    var networkIdRaw = req.query.networkId;
    var claimId = req.query.id;
    var takerAssetData = req.query.takerAssetData;

    var networkId = parseInt(networkIdRaw, 10);
    claimId = parseInt(claimId, 10);

    console.log('HTTP: GET claim for Challenge ID: ' + claimId);
    // console.log(assetData);

    if (networkId !== configs_1.NETWORK_CONFIGS.networkId) {
        console.log("Incorrect Network ID: " + networkId);
        res.status(HTTP_BAD_REQUEST_STATUS).send({});
    }
    else {
      console.log('Generating Signed Order: ');

      let challenge;
      for(var i = 0;i < challenges.length;i++){           // Find Challenge details
        if(challenges[i].id === claimId){
          challenge = challenges[i];
          break;
        }
      }

      if(!challenge){
        console.log('Challenge Not Found');
        res.status(HTTP_BAD_REQUEST_STATUS).send({});
        return;
      }

      console.log('Challenge: ')
      console.log(challenge)

      const provider = new Web3.providers.HttpProvider(
        "http://127.0.0.1:8545"
      );

      const web3 = new Web3(provider);
      const accounts = await web3.eth.getAccounts();

      // Find address of tokenOwner
      var makerAddress = accounts[0];
      var tokenId = 1;
      if(challenge.tokenOwner === 'MilkMan')            // The following is a cheat to get this finished. Woud have to search contract in future.
        makerAddress = accounts[0];

      // Find token ID of matching prize: 'Free Coffee' for address
      if(challenge.prize === 'Free Coffee')
        tokenId = 1;

      const deployedNetwork = Card.networks[50];
      var contractAddress = deployedNetwork.address;

      const makerAssetData = _0x_js_1.assetDataUtils.encodeERC721AssetData(contractAddress, tokenId);

      const randomExpiration = new _0x_js_1.BigNumber(Date.now() + 1000*60*10).div(1000).ceil();

      const contractAddresses = _0x_contractAddresses.getContractAddressesForNetworkOrThrow(50);
      const exchangeAddress = contractAddresses.exchange;

      const ZERO = new _0x_js_1.BigNumber(0);

      // Create the order
      const order = {
          exchangeAddress,
          makerAddress: makerAddress.toLowerCase(),
          takerAddress: NULL_ADDRESS,
          senderAddress: NULL_ADDRESS,
          feeRecipientAddress: NULL_ADDRESS,
          expirationTimeSeconds: randomExpiration,
          salt: _0x_js_1.generatePseudoRandomSalt(),
          makerAssetAmount: new _0x_js_1.BigNumber(1),
          takerAssetAmount: new _0x_js_1.BigNumber(1),
          makerAssetData: makerAssetData,
          takerAssetData: takerAssetData,
          makerFee: ZERO,
          takerFee: ZERO,
      };

      const pe = new _0x_js_1.Web3ProviderEngine();
      pe.addProvider(new _0x_js_1.RPCSubprovider('http://127.0.0.1:8545'));
      pe.start();

      // Generate the order hash and sign it
      const orderHashHex = _0x_js_1.orderHashUtils.getOrderHashHex(order);
      const signature = await _0x_js_1.signatureUtils.ecSignHashAsync(pe, orderHashHex, makerAddress.toLowerCase());
      const signedOrder = { ...order, signature: signature };

      res.status(HTTP_OK_STATUS).send({signedOrder: signedOrder});
  }
});



app.listen(HTTP_PORT, function () { return console.log('JG Extended relayer API (HTTP) listening on port 3000!'); });
function getCurrentUnixTimestampSec() {
    var milisecondsInSecond = 1000;
    return new _0x_js_1.BigNumber(Date.now() / milisecondsInSecond).round();
}
function renderOrderbookResponse(baseAssetData, quoteAssetData) {
    var bidOrders = orders.filter(function (order) {
        return (order.takerAssetData === baseAssetData &&
            order.makerAssetData === quoteAssetData &&
            order.expirationTimeSeconds.greaterThan(getCurrentUnixTimestampSec()));
    });
    var askOrders = orders.filter(function (order) {
        return (order.takerAssetData === quoteAssetData &&
            order.makerAssetData === baseAssetData &&
            order.expirationTimeSeconds.greaterThan(getCurrentUnixTimestampSec()));
    });
    var bidApiOrders = bidOrders.map(function (order) {
        return { metaData: {}, order: order };
    });
    var askApiOrders = askOrders.map(function (order) {
        return { metaData: {}, order: order };
    });
    return {
        bids: {
            records: bidApiOrders,
            page: 1,
            perPage: 100,
            total: bidOrders.length
        },
        asks: {
            records: askApiOrders,
            page: 1,
            perPage: 100,
            total: askOrders.length
        }
    };
}
// As the orders come in as JSON they need to be turned into the correct types such as BigNumber
function parseHTTPOrder(signedOrder) {
    signedOrder.salt = new _0x_js_1.BigNumber(signedOrder.salt);
    signedOrder.makerAssetAmount = new _0x_js_1.BigNumber(signedOrder.makerAssetAmount);
    signedOrder.takerAssetAmount = new _0x_js_1.BigNumber(signedOrder.takerAssetAmount);
    signedOrder.makerFee = new _0x_js_1.BigNumber(signedOrder.makerFee);
    signedOrder.takerFee = new _0x_js_1.BigNumber(signedOrder.takerFee);
    signedOrder.expirationTimeSeconds = new _0x_js_1.BigNumber(signedOrder.expirationTimeSeconds);
    return signedOrder;
}
function removeOrder(orderHash) {
    var order = ordersByHash[orderHash];
    var orderIndex = orders.indexOf(order);
    if (orderIndex > -1) {
        orders.splice(orderIndex, 1);
    }
}
