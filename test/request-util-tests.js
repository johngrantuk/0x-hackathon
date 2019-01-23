import { addRequest, getRequest, getFilteredRequestBook, addOffer, getFilteredOffersBook, getRequestByName, getFilteredRequestBookByName} from "../client/src/utils/request-helper";

const Card = artifacts.require("./Card.sol");

var requests = [];
var offers = [];
var id1;
var id2;
var id3;
var requestTokenAddress;

const requestTokenId = 1;
const requestAmount = 2;
const requestSwaps = [{requestTokenAddress: 1}, {requestTokenAddress: 2}]; // TokenAddress, TokenId

contract("Requests Util Tests...", accounts => {

  it("...should create requests", async () => {

    const cardInstance = await Card.deployed();

    var request = {
      requestTokenAddress: cardInstance.address,
      requestTokenId: requestTokenId,
      tokenOwner: 'Milk Man',
      tokenType: 'Coffee',
      requestAmount: requestAmount,
      requestSwaps: requestSwaps
    }

    id1 = await addRequest(requests, request);

    request = {
      requestTokenAddress: cardInstance.address,
      requestTokenId: 2,
      tokenOwner: 'Milk Man',
      tokenType: 'Coffee',
      requestAmount: 3,
      requestSwaps: [{requestTokenAddress: 1}]
    }

    id2 = await addRequest(requests, request);

    request = {
      requestTokenAddress: cardInstance.address,
      requestTokenId: 3,
      tokenOwner: 'Greyfriars',
      tokenType: 'Bobby',
      requestAmount: 1,
      requestSwaps: [{requestTokenAddress: 1}]
    }

    id3 = await addRequest(requests, request);

    assert.equal(requests.length, 3);
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

  it("...should return null for non order name", async () => {
    const cardInstance = await Card.deployed();

    var retrievedRequest = await getRequestByName(requests, 'Nope', 'Nope');

    assert.equal(retrievedRequest, null);
  });

  it("...should return requests matching name", async () => {
    const cardInstance = await Card.deployed();

    var requestResults = await getRequestByName(requests, 'Milk Man', 'Coffee');
    
    assert.equal(requestResults.length, 2, 'Should have 2 requests.');
    assert.equal(requestResults[0].tokenOwner, 'Milk Man');
    assert.equal(requestResults[1].tokenOwner, 'Milk Man');

  });

  it("...should test getting filtered request book", async () => {
    const cardInstance = await Card.deployed();

    var filteredRequests = await getFilteredRequestBook(requests, [{address: cardInstance.address, id: 1}]);

    assert.equal(filteredRequests.length, 1);
    assert.equal(filteredRequests[0].id, id1);
  })

  it("...should test getting filtered request book by name", async () => {
    const cardInstance = await Card.deployed();

    var filteredRequests = await getFilteredRequestBookByName(requests, [{tokenOwner: 'Milk Man', tokenType: 'Coffee'}]);

    assert.equal(filteredRequests.length, 2);
    assert.equal(filteredRequests[0].tokenOwner, 'Milk Man');
    assert.equal(filteredRequests[1].tokenOwner, 'Milk Man');
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
});
