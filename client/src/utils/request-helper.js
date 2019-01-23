

const addRequest = async(RequestsArray, Request) => {

  var id = web3.utils.sha3(Request.requestTokenAddress + Request.requestTokenId + Request.requestAmount + Date.now());

  RequestsArray.push({
    id: id,
    requestTokenAddress: Request.requestTokenAddress,
    requestTokenId: Request.requestTokenId,
    requestAmount: Request.requestAmount,
    requestSwaps: Request.swaps
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
  getFilteredRequestBook,
  addOffer,
  getFilteredOffersBook
}
//export addRequest;
//export getOrder;
