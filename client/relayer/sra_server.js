"use strict";
exports.__esModule = true;
var _0x_js_1 = require("0x.js");
var bodyParser = require("body-parser");
var express = require("express");
var configs_1 = require("./configs");
var constants_1 = require("./constants");
var provider_engine_1 = require("./provider_engine");
var HTTP_OK_STATUS = 200;
var HTTP_BAD_REQUEST_STATUS = 400;
var HTTP_PORT = 3000;
var requestHelper = require("../src/utils/request-helper");
// Global state
var orders = [];
var offers = [];
var ordersByHash = {};
var requests = [];
var challenges = [
  { type: 'type', name: 'Free Coffee', owner: 'MilkMan', prize: 'Free Coffee', requiredTokens: [{ id: 1, tokenOwner: 'MilkMan', tokenType: 'Coffee', image: 'https://www.brian-coffee-spot.com/wp-content/uploads/2015/10/Thumbnail-The-Milkman-DSC_1913t-150x200.jpg', qty: 5 }] },
  { type: 'type', name: 'Tea Genie', owner: 'MilkMan', prize: 'Tea Genie', requiredTokens: [{ id: 2, tokenOwner: 'MilkMan', tokenType: 'Tea', image: 'https://proxy.duckduckgo.com/iu/?u=http%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fb%2Fb8%2FMug_of_Tea.JPG&f=1', qty: 1 }, { id: 3, tokenOwner: 'MilkMan', tokenType: 'Milk', image: 'https://proxy.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.telegraph.co.uk%2Fcontent%2Fdam%2Fexpat%2F2016%2F03%2F03%2F89992402_D6EEPE_Milk_Bottle-xlarge.jpg&f=1', qty: 1 }, { id: 4, tokenOwner: 'MilkMan', tokenType: 'Biscuit', image: 'https://proxy.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.7zi3pUhUNEqLMT3p3xygxQHaE8%26pid%3D15.1&f=1',  qty: 1 }] },
  { type: 'type', name: 'Big Fizz', owner: 'Barrs', prize: 'Bawbag', requiredTokens: [{ id: 5, tokenOwner: 'IrnBru', tokenType: 'IrnBruSpecial', image: 'https://proxy.duckduckgo.com/iu/?u=https%3A%2F%2Fs-media-cache-ak0.pinimg.com%2F736x%2F77%2F4e%2F3a%2F774e3a9e032eba60ff1cce1f8db1fa16.jpg&f=1', qty: 1 }, { id: 6, tokenOwner: 'IrnBru', tokenType: 'Girders', image: 'https://proxy.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.agbarr.co.uk%2Fmedia%2F288335%2FIRN-BRU-Regular-750ml-16.jpg&f=1', qty: 1 }] }
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
    console.log('HTTP: POST request');
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
      res.status(HTTP_OK_STATUS).send({id: id});
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

    console.log('HTTP: POST offer: ' + requestId);
    if (networkId !== configs_1.NETWORK_CONFIGS.networkId) {
        console.log("Incorrect Network ID: " + networkId);
        res.status(HTTP_BAD_REQUEST_STATUS).send({});
    }
    else {
      // console.log(req.body);
      // var signedOrder = parseHTTPOrder(req.body);
      await requestHelper.addOffer(offers, order, signedOrder, requestId);

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



app.listen(HTTP_PORT, function () { return console.log('Standard relayer API (HTTP) listening on port 3000!'); });
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
