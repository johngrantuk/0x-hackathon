import { addRequest, getRequest, getFilteredRequestBook, addOffer, getFilteredOffersBook, getRequestByType, getFilteredRequestBookByName} from "../client/src/utils/request-helper";
let axios = require('axios');
const Card = artifacts.require("./Card.sol");

var requests = [];
var offers = [];
var id1;
var id2;
var id3;
var requestTokenAddress;
var cardInstance;

const requestTokenId = 1;
const requestAmount = 2;
const requestSwaps = [{requestTokenAddress: 1}, {requestTokenAddress: 2}]; // TokenAddress, TokenId

contract("Server Tests...", accounts => {

  it("...should POST a request", async () => {

    var response;

    try{
      cardInstance = await Card.deployed();

      var request = {
        requestTokenAddress: cardInstance.address,
        requestTokenId: requestTokenId,
        tokenOwner: 'MilkMan',
        tokenType: 'Coffee',
        requestAmount: requestAmount,
        requestSwaps: requestSwaps
      }

      response = await axios.post('http://localhost:3000/request?networkId=50', request);

      id1 = response.data.id;

      console.log(response.data);
      // console.log(response)

    }
    catch (e){
      console.log(e);
      console.log('Make Sure Local Relay Server Is Running')
    }

    assert.equal(response.status, 200);
  });

  it("...should retrieve requests by type", async () => {
    var response;

    try{
      response = await axios.get('http://localhost:3000/requestsbyname', {
        params: {
          networkId: 50,
          tokenOwner: 'MilkMan',
          tokenType: 'Coffee'}
      });

      console.log(response.data);
    }
    catch (e){
      console.log(e);
      console.log('Make Sure Local Relay Server Is Running')
    }

    assert.equal(response.status, 200);
  });

  it("...should retrieve request by ID", async () => {
    var response;

    try{
      response = await axios.get('http://localhost:3000/requestbyid', {
        params: {
          networkId: 50,
          requestId: id1}
        });

      console.log(response.data);
    }
    catch (e){
      console.log(e);
      console.log('Make Sure Local Relay Server Is Running')
    }

    assert.equal(response.status, 200);
  });

  it("...should retrieve filtered request book by token names", async () => {
    var response;

    try{
      response = await axios.get('http://localhost:3000/filteredrequestsbynames', {
        params: {
          networkId: 50,
          tokens: [{tokenOwner: 'MilkMan', tokenType: 'Coffee'}, {tokenOwner: 'GreyFriars', tokenType: 'Bobby'}]
        }
      });

      console.log(response.data);

      var request = {
        requestTokenAddress: cardInstance.address,
        requestTokenId: 7,
        tokenOwner: 'GreyFriars',
        tokenType: 'Bobby',
        requestAmount: requestAmount,
        requestSwaps: requestSwaps
      }

      response = await axios.post('http://localhost:3000/request?networkId=50', request);

      response = await axios.get('http://localhost:3000/filteredrequestsbynames', {
        params: {
          networkId: 50,
          tokens: [{tokenOwner: 'MilkMan', tokenType: 'Coffee'}, {tokenOwner: 'GreyFriars', tokenType: 'Bobby'}]
        }
      });

      console.log(response.data);
    }
    catch (e){
      console.log(e);
      console.log('Make Sure Local Relay Server Is Running')
    }

    assert.equal(response.status, 200);
  });

  it("...should POST and retrieve an offer", async () => {

    var response;

    try{
      var Order = { this: 'has', lots: 'more'};
      var SignedOrder = { this: 'has', lots: 'more'};

      var request = {
        networkId: 50,
        requestId: id1,
        order: Order,
        signedOrder: SignedOrder
      }

      response = await axios.post('http://localhost:3000/offer', request);

      Order = { this: 'second', lots: 'order'};

      request = {
        networkId: 50,
        requestId: id1,
        order: Order,
        signedOrder: SignedOrder
      }

      response = await axios.post('http://localhost:3000/offer', request);

      response = await axios.get('http://localhost:3000/offers', {
        params: {
          networkId: 50,
          requestId: id1
        }
      });

      console.log('Offers:')
      console.log(response.data)

    }
    catch (e){
      console.log(e);
      console.log('Make Sure Local Relay Server Is Running')
    }

    assert.equal(response.status, 200);
  });

});
