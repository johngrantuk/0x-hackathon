const Web3 = require('web3');
const Card = require("../contracts/Card.json");

/*
Helper to load example tokens on Ganache test network.
*/

const load = async() => {
  const provider = new Web3.providers.HttpProvider(
    "http://127.0.0.1:8545"
  );

  const web3 = new Web3(provider);

  // resolve(web3);

  const accounts = await web3.eth.getAccounts();

  console.log(accounts[0]);

  const deployedNetwork = Card.networks[50];

  const instance = new web3.eth.Contract(
    Card.abi,
    deployedNetwork && deployedNetwork.address,
  );

  var contractSupply = await instance.methods.totalSupply().call();                             // Total number of token types for contract
  var account0tokens = await getTokens(instance, accounts[0]);

  console.log('Contract Supply: ' + contractSupply);
  console.log('Account 0 tokens: ' + account0tokens['length']);

  var tokenMeta;
  var tokenId = 10;
  for(var key in account0tokens){
    if(key != 'length'){
      tokenMeta = await instance.methods.getTokenMeta(parseInt(key)).call();
      console.log('ID: ' + key + ', Balance:' + account0tokens[key] + ' ' + tokenMeta.owner + ' ' + tokenMeta.tokenType + ' ' + tokenMeta.tokenName)
      tokenId = parseInt(key) + 1;
    }
  }

  console.log('Minting...')
  await instance.methods.mint(tokenId, accounts[0], 'MilkMan', 'Coffee', 'Coffee' + tokenId, 'https://www.brian-coffee-spot.com/wp-content/uploads/2015/10/Thumbnail-The-Milkman-DSC_1913t-150x200.jpg').send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });;
  //var mintTxHash = await instance.methods.mint(1, accounts[0]).send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });                 // Mint NFT token with ID = 1 for account 0

  var contractSupply = await instance.methods.totalSupply().call();                             // Total number of token types for contract
  var account0tokens = await getTokens(instance, accounts[0]);

  console.log('Contract Supply: ' + contractSupply);
  console.log('Account 0 tokens: ' + account0tokens['length']);

  var tokenMeta;
  for(var key in account0tokens){
    if(key != 'length'){
      console.log('ok' + parseInt(key))
      tokenMeta = await instance.methods.getTokenMeta(parseInt(key)).call();
      console.log('ID: ' + key + ', Balance:' + account0tokens[key] + ' ' + tokenMeta.owner + ' ' + tokenMeta.tokenType + ' ' + tokenMeta.tokenName)
    }
  }

}

const loadAccount1 = async() => {
  const provider = new Web3.providers.HttpProvider(
    "http://127.0.0.1:8545"
  );

  const web3 = new Web3(provider);
  const accounts = await web3.eth.getAccounts();

  console.log('Loading Account1: ' + accounts[1]);

  const deployedNetwork = Card.networks[50];

  const instance = new web3.eth.Contract(
    Card.abi,
    deployedNetwork && deployedNetwork.address,
  );

  console.log('Minting...')
  await instance.methods.mint(101, accounts[1], 'MilkMan', 'Coffee', 'Coffee101', 'https://www.brian-coffee-spot.com/wp-content/uploads/2015/10/Thumbnail-The-Milkman-DSC_1913t-150x200.jpg').send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });;
  await instance.methods.mint(102, accounts[1], 'MilkMan', 'Milk', 'Milk102', 'https://proxy.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.telegraph.co.uk%2Fcontent%2Fdam%2Fexpat%2F2016%2F03%2F03%2F89992402_D6EEPE_Milk_Bottle-xlarge.jpg&f=1').send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });;
  await instance.methods.mint(103, accounts[1], 'MilkMan', 'Tea', 'Tea103', 'https://proxy.duckduckgo.com/iu/?u=http%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fb%2Fb8%2FMug_of_Tea.JPG&f=1').send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });;
}


const getTokens = async(ContractInstance, Address) => {
  var tokens = {};

  var tokensOwnedAdd = await ContractInstance.methods.tokensOwned(Address).call();

  var indexes = tokensOwnedAdd[0];
  var balances = tokensOwnedAdd[1];

  tokens['length'] = indexes.length;
  // console.log('Requester: ')
  for(var i = 0;i < indexes.length;i++){
    tokens[indexes[i]] = balances[i];
    // console.log('ID: ' + indexes[i] + ' Balance: ' + balances[i])
  }

  return tokens;

}

loadAccount1();
