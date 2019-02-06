var uuid = require('uuid');

String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

// Adds a new Request to the reqest array. This would be implemented in a db in the future.
const addRequest = async(RequestsArray, Request) => {

  // var id = (Request.requestTokenAddress + Request.requestTokenId + Request.requestAmount + Date.now()).hashCode();
  var id = uuid.v4();

  var newRequest = {
    id: id,
    requestTokenAddress: Request.requestTokenAddress,
    requestTokenId: Request.requestTokenId,
    requestAmount: Request.requestAmount,
    requestSwaps: Request.swaps,
    tokenOwner: Request.tokenOwner,
    tokenType: Request.tokenType
  }

  console.log('Adding New Request To Relayer: ');
  console.log(newRequest);

  RequestsArray.push(newRequest);

  return id;
}

// Retrieves all matching tokenTypes from RequestsArray.
const getFilteredRequestBookByTypes = async(RequestsArray, Tokens) => {

  var requests = RequestsArray.filter(request => {
    var i;
    for(i = 0;i < Tokens.length;i++){
      if(Tokens[i].tokenOwner === request.tokenOwner && Tokens[i].tokenType === request.tokenType)
        return true;
    }
  });

  return requests;
}

// Adds new offer to Offers array. This would be db in the future.
const addOffer = async(OffersArray, Order, SignedOrder, RequestId, Request, TakerTokens, MakerTokens) => {

  OffersArray.push({
    requestId: RequestId,
    order: Order,
    signedOrder: SignedOrder,
    Request,
    TakerTokens,
    MakerTokens
  });
}

const getRequest = async(RequestsArray, Id) => {

  var request = RequestsArray.filter(request => {
    return request.id === Id;
  });

  if(request.length !== 1){
    request = null;
  }else {
    request = request[0];
  }

  return request;
}

const getRequestByType = async(RequestsArray, Owner, TokenType) => {

  var requestResults = RequestsArray.filter(request => {
    return request.tokenOwner === Owner && request.tokenType === TokenType;
  });

  if(requestResults.length < 1){
    requestResults = null;
  }

  return requestResults;
}



const getFilteredRequestBook = async(RequestsArray, Tokens) => {
  var request = RequestsArray.filter(request => {
    var i;
    for(i = 0;i < Tokens.length;i++){
      if(Tokens[i].address === request.requestTokenAddress && Tokens[i].id === request.requestTokenId)
        return true;
    }
  });

  return request;
}


// For /offers which is currently not used.
const getFilteredOffersBook = async(OffersArray, RequestId) => {

  var offersArray = OffersArray.filter(offer => {
    return offer.requestId === RequestId;
  });

  return offersArray;
}

// As the orders come in as JSON they need to be turned into the correct types such as BigNumber
function parseHTTPOrder(signedOrder) {
    signedOrder.salt = new web3.BigNumber(signedOrder.salt);
    signedOrder.makerAssetAmount = new web3.BigNumber(signedOrder.makerAssetAmount);
    signedOrder.takerAssetAmount = new web3.BigNumber(signedOrder.takerAssetAmount);
    signedOrder.makerFee = new web3.BigNumber(signedOrder.makerFee);
    signedOrder.takerFee = new web3.BigNumber(signedOrder.takerFee);
    signedOrder.expirationTimeSeconds = new web3.BigNumber(signedOrder.expirationTimeSeconds);
    return signedOrder;
}

module.exports = {
  addRequest,
  getRequest,
  getRequestByType,
  getFilteredRequestBook,
  addOffer,
  getFilteredOffersBook,
  getFilteredRequestBookByTypes,
  parseHTTPOrder
}
//export addRequest;
//export getOrder;
