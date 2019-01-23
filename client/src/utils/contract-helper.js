import Card from "../contracts/Card.json";

const getAccountInfo = async(web3, networkId, accounts) => {

  console.log('getAccount: ' + accounts[0])

  const deployedNetwork = Card.networks[networkId];

  const instance = new web3.eth.Contract(
    Card.abi,
    deployedNetwork && deployedNetwork.address,
  );

  const name = await instance.methods.name().call()

  console.log(name);

  var tokensOwned = await instance.methods.tokensOwned(accounts[0]).call();             // Returns arrays of indexes: [], balances: []

  var indexes = tokensOwned[0];
  var balances = tokensOwned[1];

  var tokens = [];

  if(indexes.length < 1){
    console.log('No Tokens For Account');
  }else{
    var balance = 0;
    for(var i = 0;i < indexes.length;i++){
      console.log('Get Token Metadata');
      var tokenId = indexes[i];
      var balance = balances[i];
      console.log('Token ID: ' + tokenId)
      console.log('Token Balance: ' + balance);

      tokens.push({
        name: 'testName',
        id: tokenId,
        balance: balance
      })
    }
  }

  console.log(tokens)

  return tokens;
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

module.exports = {
  getAccountInfo,
  getTokens
}
