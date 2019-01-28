import Card from "../contracts/Card.json";

const getAccountInfo = async(web3, networkId, accounts) => {

  //console.log('getAccount: ' + accounts[0])

  const deployedNetwork = Card.networks[networkId];

  const instance = new web3.eth.Contract(
    Card.abi,
    deployedNetwork && deployedNetwork.address,
  );

  // const name = await instance.methods.name().call()

  //console.log(name);

  var tokensOwned = await instance.methods.tokensOwned(accounts[0]).call();             // Returns arrays of indexes: [], balances: []

  var indexes = tokensOwned[0];
  var balances = tokensOwned[1];

  var tokens = [];
  var tokenCounts = {};

  if(indexes.length < 1){
    console.log('No Tokens For Account');
  }else{
    for(var i = 0;i < indexes.length;i++){
      var tokenId = indexes[i];
      //console.log('Get Token Metadata');
      var tokenMeta = await instance.methods.getTokenMeta(tokenId).call();
      console.log('ID: ' + tokenId + ', Balance:' + balances[i] + ' ' + tokenMeta.owner + ' ' + tokenMeta.tokenType + ' ' + tokenMeta.tokenName)

      tokens.push({
        name: tokenMeta.tokenName,
        id: tokenId,
        balance: balances[i],
        tokenOwner: tokenMeta.owner,
        tokenType: tokenMeta.tokenType,
        image: tokenMeta.image
      })

      if(tokenCounts[tokenMeta.tokenType] == undefined){
        tokenCounts[tokenMeta.tokenType] = 1;
      }else{
        tokenCounts[tokenMeta.tokenType]++;
      }
    }
  }

  //console.log(tokens)

  return [tokens, tokenCounts];
}

const getTokens = async(ContractInstance, Address) => {
  var tokens = {};

  var tokensOwned = await ContractInstance.tokensOwned.call(Address);

  var indexes = tokensOwned[0];
  var balances = tokensOwned[1];

  tokens['length'] = indexes.length;
  // console.log('Requester: ')
  for(var i = 0;i < indexes.length;i++){
    tokens[indexes[i]] = balances[i];
    // console.log('ID: ' + indexes[i] + ' Balance: ' + balances[i])
  }

  return tokens;

}

export {getAccountInfo, getTokens}
