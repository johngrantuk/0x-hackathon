const Web3 = require('web3');
const Card = require("../contracts/Card.json");

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

  var supply = await instance.methods.totalSupply().call();                             // Total number of token types for contract
  var accountBalance = await instance.methods.balanceOf(accounts[0]).call();            // This is the number of token types for account
  var tokensOwned = await instance.methods.tokensOwned(accounts[0]).call();             // Returns arrays of indexes: [], balances: []

  var indexes = tokensOwned[0];
  var balances = tokensOwned[1];

  console.log(supply);
  console.log(accountBalance);

  //var mintTxHash = await instance.methods.mint(1, accounts[0]).send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });                 // Mint NFT token with ID = 1 for account 0

  var supply = await instance.methods.totalSupply().call();                             // Total number of token types for contract
  var accountBalance = await instance.methods.balanceOf(accounts[0]).call();            // This is the number of token types for account
  var tokensOwned = await instance.methods.tokensOwned(accounts[0]).call();             // Returns arrays of indexes: [], balances: []

  var indexes = tokensOwned[0];
  var balances = tokensOwned[1];

  console.log(supply);
  console.log(accountBalance);

  var mintTxHash = await instance.methods.mint(7, accounts[0]).send({ from: accounts[0], gas: 4712388, gasPrice: 100000000000 });                 // Mint NFT token with ID = 1 for account 0

  var supply = await instance.methods.totalSupply().call();                             // Total number of token types for contract
  var accountBalance = await instance.methods.balanceOf(accounts[0]).call();            // This is the number of token types for account
  var tokensOwned = await instance.methods.tokensOwned(accounts[0]).call();             // Returns arrays of indexes: [], balances: []

  var indexes = tokensOwned[0];
  var balances = tokensOwned[1];

  console.log(supply);
  console.log(accountBalance);
}

load();
