

const addRequest = async(RequestsArray, Request) => {

  var id = web3.utils.sha3(Request.requestTokenAddress + Request.requestTokenId + Request.requestAmount + Date.now());

  RequestsArray.push({
    id: id,
    requestTokenAddress: Request.requestTokenAddress,
    requestTokenId: Request.requestTokenId,
    requestAmount: Request.requestAmount,
    requestSwaps: Request.swaps,
    tokenOwner: Request.tokenOwner,
    tokenType: Request.tokenType
  });

  return id;
}
/*
const getRequest = async(RequestsArray, Address, Id) => {

  var request = RequestsArray.filter(request => {
    console.log('Req ID: ' + request.id)
    console.log('ID: ' + Id)
    console.log(request.address)
    console.log(Address)
    console.log(request.id === Id && request.address === Address)
    return request.id === Id && request.address === Address;
  });

  if(request.length !== 1){
    request = null;
  }else {
    request = request[0];
  }

  return request;
}
*/
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

const getRequestByName = async(RequestsArray, Owner, TokenType) => {

  var requestResults = RequestsArray.filter(request => {
    return request.tokenOwner === Owner && request.tokenType === TokenType;
  });

  if(requestResults.length < 1){
    requestResults = null;
  }

  return requestResults;
}

const getFilteredRequestBookByName = async(RequestsArray, Tokens) => {
  var requests = RequestsArray.filter(request => {
    var i;
    for(i = 0;i < Tokens.length;i++){
      if(Tokens[i].tokenOwner === request.tokenOwner && Tokens[i].tokenType === request.tokenType)
        return true;
    }
  });

  return requests;
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

const addOffer = async(OffersArray, Order, SignedOrder, RequestId) => {

  OffersArray.push({
    requestId: RequestId,
    order: Order,
    signedOrder: SignedOrder
  });
}

const getFilteredOffersBook = async(OffersArray, RequestId) => {

  var offersArray = OffersArray.filter(offer => {
    return offer.requestId === RequestId;
  });

  return offersArray;
}

module.exports = {
  addRequest,
  getRequest,
  getRequestByName,
  getFilteredRequestBook,
  addOffer,
  getFilteredOffersBook,
  getFilteredRequestBookByName
}
//export addRequest;
//export getOrder;
