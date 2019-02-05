const Web3 = require('web3');
const Card = require("../contracts/Card.json");
var constants = require("../../relayer/constants");

/*
Helper to load example tokens on Ganache test network.
*/

const loadAccountOld = async() => {
  const provider = new Web3.providers.HttpProvider(
    "http://127.0.0.1:8545"
  );

  const web3 = new Web3(provider);

  // resolve(web3);

  const accounts = await web3.eth.getAccounts();

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

const loadAccount0 = async() => {
  const provider = new Web3.providers.HttpProvider(
    "http://127.0.0.1:8545"
  );

  const web3 = new Web3(provider);
  const accounts = await web3.eth.getAccounts();

  console.log('Loading MilkMan Account: ' + accounts[0]);

  const deployedNetwork = Card.networks[50];

  const instance = new web3.eth.Contract(
    Card.abi,
    deployedNetwork && deployedNetwork.address,
  );

  console.log('Minting...')
  await instance.methods.mint(1, accounts[0], 'MilkMan', 'Free Coffee', 'Free Coffee 1', constants.FREE_COFFEE).send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });
  await instance.methods.mint(2, accounts[0], 'IrnBru', 'IrnBru Hunter', 'IrnBru Hunter 1', constants.HUNTER).send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });
  await instance.methods.mint(2, accounts[0], 'MilkMan', 'Coffee King', 'Coffee King 1', constants.COFFEE_KING).send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });
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
  await instance.methods.mint(101, accounts[1], 'MilkMan', 'Coffee', 'Coffee101', constants.COFFEE).send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });
  await instance.methods.mint(102, accounts[1], 'MilkMan', 'Coffee', 'Coffee102', constants.COFFEE).send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });
  await instance.methods.mint(103, accounts[1], 'MilkMan', 'Coffee', 'Coffee103', constants.COFFEE).send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });
  await instance.methods.mint(104, accounts[1], 'MilkMan', 'Coffee', 'Coffee104', constants.COFFEE).send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });
  await instance.methods.mint(105, accounts[1], 'MilkMan', 'Coffee', 'Coffee105', constants.COFFEE).send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });

  await instance.methods.mint(111, accounts[1], 'MilkMan', 'Biscuit', 'Biscuit111', constants.BISCUIT).send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });
  await instance.methods.mint(112, accounts[1], 'MilkMan', 'Biscuit', 'Biscuit112', constants.BISCUIT).send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });
  await instance.methods.mint(113, accounts[1], 'MilkMan', 'Biscuit', 'Biscuit113', constants.BISCUIT).send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });
  await instance.methods.mint(114, accounts[1], 'MilkMan', 'Biscuit', 'Biscuit114', constants.BISCUIT).send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });
  await instance.methods.mint(115, accounts[1], 'MilkMan', 'Biscuit', 'Biscuit115', constants.BISCUIT).send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });

  await instance.methods.mint(121, accounts[1], 'IrnBru', 'Edinburgh', 'Edinburgh121', constants.EDINBURGH).send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });
}

const loadAccount2 = async() => {
  const provider = new Web3.providers.HttpProvider(
    "http://127.0.0.1:8545"
  );

  const web3 = new Web3(provider);
  const accounts = await web3.eth.getAccounts();

  console.log('Loading Account2: ' + accounts[2]);

  const deployedNetwork = Card.networks[50];

  const instance = new web3.eth.Contract(
    Card.abi,
    deployedNetwork && deployedNetwork.address,
  );

  console.log('Minting...')
  await instance.methods.mint(106, accounts[2], 'MilkMan', 'Coffee', 'Coffee106', constants.COFFEE).send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });

  await instance.methods.mint(116, accounts[2], 'MilkMan', 'Biscuit', 'Biscuit116', constants.BISCUIT).send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });

  await instance.methods.mint(122, accounts[2], 'IrnBru', 'Glasgow', 'Glasgow122', constants.GLASGOW).send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });
  await instance.methods.mint(123, accounts[2], 'IrnBru', 'Aberdeen', 'Aberdeen123', constants.ABERDEEN).send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });
  await instance.methods.mint(124, accounts[2], 'IrnBru', 'Dundee', 'Dundee124', constants.DUNDEE).send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });
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

console.log(constants.COFFEE)
loadAccount0();
loadAccount1();
loadAccount2();
