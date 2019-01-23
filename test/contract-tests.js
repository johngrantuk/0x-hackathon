import BigNumber from '0x.js';
const Card = artifacts.require("./Card.sol");

import { getTokens } from "../client/src/utils/contract-helper";

contract("Card", accounts => {

  it("...should test ERC721X card", async () => {
    const cardInstance = await Card.deployed();

    const name = await cardInstance.name.call()
    assert.equal(name, 'Card');

    const symbol = await cardInstance.symbol.call()
    assert.equal(symbol, 'CRD');

    console.log(cardInstance.address);
  });

  it("...should test ERC721X Balances, etc", async () => {
    const cardInstance = await Card.deployed();

    var supply = await cardInstance.totalSupply.call();                             // Total number of token types for contract
    var accountBalance = await cardInstance.balanceOf.call(accounts[0]);            // This is the number of token types for account
    var tokensOwned = await getTokens(cardInstance, accounts[0]);
    /*
    console.log('Tokens Owned: ')
    for(var key in tokensOwned){
      console.log(key + ':' + tokensOwned[key])
    }
    */

    assert.equal(supply, 0, 'Token Supply Should be 0.');
    assert.equal(accountBalance, 0, 'Number of Account Token Types Should be 0.');
    assert.equal(tokensOwned['length'], 0, 'Tokens Owned Should be 0.');

    await cardInstance.mint(1, accounts[0], 'MilkMan', 'Coffee', 'Coffee1','https://www.brian-coffee-spot.com/wp-content/uploads/2015/10/Thumbnail-The-Milkman-DSC_1913t-150x200.jpg');                 // Mint NFT token with ID = 1 for account 0

    supply = await cardInstance.totalSupply.call();
    accountBalance = await cardInstance.balanceOf.call(accounts[0]);
    tokensOwned = await getTokens(cardInstance, accounts[0]);

    assert.equal(supply, 1, 'Token Supply Should be 1.');
    assert.equal(accountBalance, 1, 'Number of Account Token Types Should be 1.');
    assert.equal(tokensOwned['length'], 1, 'Tokens Owned Should be 1.');
    assert.equal(tokensOwned[1], 1, 'Tokens should be ID 1 with Balance 1.');

    var tokenMeta = await cardInstance.getTokenMeta(1);

    assert.equal(tokenMeta.owner, 'MilkMan');
    assert.equal(tokenMeta.tokenType, 'Coffee');
    assert.equal(tokenMeta.tokenName, 'Coffee1');
    assert.equal(tokenMeta.image, 'https://www.brian-coffee-spot.com/wp-content/uploads/2015/10/Thumbnail-The-Milkman-DSC_1913t-150x200.jpg');

    await cardInstance.mint(2, accounts[0], 'MilkMan', 'Coffee', 'Coffee2','https://www.brian-coffee-spot.com/wp-content/uploads/2015/10/Thumbnail-The-Milkman-DSC_1913t-150x200.jpg');

    supply = await cardInstance.totalSupply.call();
    accountBalance = await cardInstance.balanceOf.call(accounts[0]);
    tokensOwned = await getTokens(cardInstance, accounts[0]);

    assert.equal(supply, 2, 'Token Supply Should be 2.');
    assert.equal(accountBalance, 2, 'Number of Account Token Types Should be 2.');
    assert.equal(tokensOwned['length'], 2, 'Tokens Owned Should be 2.');
    assert.equal(tokensOwned[1], 1, 'Token should be ID 1 with Balance 1.');
    assert.equal(tokensOwned[2], 1, 'Token should be ID 2 with Balance 1.');
    /*
    await cardInstance.mint(3, accounts[1], new BigNumber(100));                   // Mint 100 token ID:3 for account 1

    supply = await cardInstance.totalSupply.call();
    accountBalance = await cardInstance.balanceOf.call(accounts[0]);
    tokensOwned = await cardInstance.tokensOwned.call(accounts[0]);

    indexes = tokensOwned[0];
    balances = tokensOwned[1];

    assert.equal(supply, 3, 'Token Supply Should be 2.');
    assert.equal(accountBalance, 2, 'Number of Account Token Types Should be 2.');
    assert.equal(indexes.length, 2, 'Tokens Owned Should be 2.');
    assert.equal(indexes[0], 1, 'Token 1s ID Should be 1.');
    assert.equal(balances[0], 1, 'Tokens ID 1 Balance Should Be 1.');
    assert.equal(indexes[1], 2, 'Token 2s ID Should be 2.');
    assert.equal(balances[1].toString(), '1', 'Token ID 2 Balance Should Be 1.');

    accountBalance = await cardInstance.balanceOf.call(accounts[1]);
    tokensOwned = await cardInstance.tokensOwned.call(accounts[1]);

    indexes = tokensOwned[0];
    balances = tokensOwned[1];

    assert.equal(accountBalance, 1, 'Number of Account[1] Token Types Should be 1.');
    assert.equal(indexes.length, 1, 'Tokens Owned Should be 1.');
    assert.equal(indexes[0], 3, 'Token 3s ID Should be 3.');
    assert.equal(balances[0].toString(), '100', 'Tokens ID 1 Balance Should Be 100.');
    */
  });
});
