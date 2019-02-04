import {
    assetDataUtils,
    BigNumber,
    ContractWrappers,
    generatePseudoRandomSalt,
    Order,
    orderHashUtils,
    signatureUtils,
    RPCSubprovider,
    Web3ProviderEngine
} from '0x.js';

let axios = require('axios');

import { Web3Wrapper } from '@0x/web3-wrapper';
import { MnemonicWalletSubprovider } from '@0x/subproviders';
import { getContractAddressesForNetworkOrThrow } from '@0x/contract-addresses';

import { addRequest, getRequest, getFilteredRequestBook, addOffer, getFilteredOffersBook, getRequestByName, getFilteredRequestBookByName,
  parseHTTPOrder} from "../client/src/utils/request-helper";
import { getTokens } from "../client/src/utils/contract-helper";

const Card = artifacts.require("./Card.sol");

const MNEMONIC = 'concert load couple harbor equip island argue ramp clarify fence smart topic';
const BASE_DERIVATION_PATH = `44'/60'/0'/0`;
const DECIMALS = 18;
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const ZERO = new BigNumber(0);

const contractAddresses = getContractAddressesForNetworkOrThrow(50);

const mnemonicWallet = new MnemonicWalletSubprovider({
    mnemonic: MNEMONIC,
    baseDerivationPath: BASE_DERIVATION_PATH,
});

const pe = new Web3ProviderEngine();
pe.addProvider(mnemonicWallet);
pe.addProvider(new RPCSubprovider('http://127.0.0.1:8545'));
pe.start();

const contractWrappers = new ContractWrappers(pe, { networkId: 50 });

const web3Wrapper = new Web3Wrapper(pe);


contract("MultiAsset Via Relayer", accounts => {

  it("...should request one coffee and gets 1 milk and irn bru", async () => {
    /*
    Client1(Requester) has: 2 Coffee, 3 Water & 1 IrnBruSpecial.
Client2 has: 1 Coke.
Client3 has: 3 Tea, 3 Milk.
Client4 has: 3 Irn Bru, 1 Milk, 1 Coffee.
Created MilkRequest that returns ID: -97049368
Client2 Get Filter Requests Should Return None.
Client3 Get Filter Requests Should See The Milk Request with ID: -97049368
Client4 Get Filter Requests Should See The Milk Request with ID: -97049368
Requester Tokens:
ID10 Balance: 1
ID11 Balance: 1
ID40 Balance: 1
ID41 Balance: 1
ID42 Balance: 1
ID70 Balance: 1
IDlength Balance: 6
Client4 Tokens:
ID30 Balance: 1
ID50 Balance: 1
ID51 Balance: 1
ID52 Balance: 1
ID71 Balance: 1
IDlength Balance: 5
ERC721 Are Approved For Clients
Client3 makes and signs an order for 1 milk token (MAKER)/1 coffee token(TAKER)
Client3 sends offer to relayer:
{ networkId: 50,
  requestId: -97049368,
  order:
   { exchangeAddress: '0x48bacb9266a570d521063ef5dd96e61686dbe788',
     makerAddress: '0xe36ea790bc9d7ab70c55260c66d52b1eca985f84',
     takerAddress: '0x0000000000000000000000000000000000000000',
     senderAddress: '0x0000000000000000000000000000000000000000',
     feeRecipientAddress: '0x0000000000000000000000000000000000000000',
     expirationTimeSeconds: 1548784522,
     salt:
      43351603187498337898652792747817135439302053213798794944610145269692844657079,
     makerAssetAmount: 1,
     takerAssetAmount: 1,
     makerAssetData:
      '0x02571792000000000000000000000000134a5b42e07c8b169ebe7aa900aa5db04c97a884000000000000000000000000000000000000000000000000000000000000001f',
     takerAssetData:
      '0x02571792000000000000000000000000134a5b42e07c8b169ebe7aa900aa5db04c97a884000000000000000000000000000000000000000000000000000000000000000a',
     makerFee: 0,
     takerFee: 0 },
  signedOrder:
   { exchangeAddress: '0x48bacb9266a570d521063ef5dd96e61686dbe788',
     makerAddress: '0xe36ea790bc9d7ab70c55260c66d52b1eca985f84',
     takerAddress: '0x0000000000000000000000000000000000000000',
     senderAddress: '0x0000000000000000000000000000000000000000',
     feeRecipientAddress: '0x0000000000000000000000000000000000000000',
     expirationTimeSeconds: 1548784522,
     salt:
      43351603187498337898652792747817135439302053213798794944610145269692844657079,
     makerAssetAmount: 1,
     takerAssetAmount: 1,
     makerAssetData:
      '0x02571792000000000000000000000000134a5b42e07c8b169ebe7aa900aa5db04c97a884000000000000000000000000000000000000000000000000000000000000001f',
     takerAssetData:
      '0x02571792000000000000000000000000134a5b42e07c8b169ebe7aa900aa5db04c97a884000000000000000000000000000000000000000000000000000000000000000a',
     makerFee: 0,
     takerFee: 0,
     signature:
      '0x1b70c79fe059fd2eb63fd70a58bd99b41cac27ad8d06242ce8825d8aa859c6eba87029ab5c1f6f906a00fe5ea1cfe2b38b3aac6c4d1b7779e3c1246f8327b4299303' } }
Offers received from relayer filtered by ID: -97049368 Now Has One Offer:
{ requestId: -97049368,
  order:
   { exchangeAddress: '0x48bacb9266a570d521063ef5dd96e61686dbe788',
     makerAddress: '0xe36ea790bc9d7ab70c55260c66d52b1eca985f84',
     takerAddress: '0x0000000000000000000000000000000000000000',
     senderAddress: '0x0000000000000000000000000000000000000000',
     feeRecipientAddress: '0x0000000000000000000000000000000000000000',
     expirationTimeSeconds: '1548784522',
     salt:
      '43351603187498337898652792747817135439302053213798794944610145269692844657079',
     makerAssetAmount: '1',
     takerAssetAmount: '1',
     makerAssetData:
      '0x02571792000000000000000000000000134a5b42e07c8b169ebe7aa900aa5db04c97a884000000000000000000000000000000000000000000000000000000000000001f',
     takerAssetData:
      '0x02571792000000000000000000000000134a5b42e07c8b169ebe7aa900aa5db04c97a884000000000000000000000000000000000000000000000000000000000000000a',
     makerFee: '0',
     takerFee: '0' },
  signedOrder:
   { exchangeAddress: '0x48bacb9266a570d521063ef5dd96e61686dbe788',
     makerAddress: '0xe36ea790bc9d7ab70c55260c66d52b1eca985f84',
     takerAddress: '0x0000000000000000000000000000000000000000',
     senderAddress: '0x0000000000000000000000000000000000000000',
     feeRecipientAddress: '0x0000000000000000000000000000000000000000',
     expirationTimeSeconds: '1548784522',
     salt:
      '43351603187498337898652792747817135439302053213798794944610145269692844657079',
     makerAssetAmount: '1',
     takerAssetAmount: '1',
     makerAssetData:
      '0x02571792000000000000000000000000134a5b42e07c8b169ebe7aa900aa5db04c97a884000000000000000000000000000000000000000000000000000000000000001f',
     takerAssetData:
      '0x02571792000000000000000000000000134a5b42e07c8b169ebe7aa900aa5db04c97a884000000000000000000000000000000000000000000000000000000000000000a',
     makerFee: '0',
     takerFee: '0',
     signature:
      '0x1b70c79fe059fd2eb63fd70a58bd99b41cac27ad8d06242ce8825d8aa859c6eba87029ab5c1f6f906a00fe5ea1cfe2b38b3aac6c4d1b7779e3c1246f8327b4299303' } }
Client4 makes and signs a MultiAsset order for 1 milk token & 1 coffee token (MAKER)/1 Special Irn Bru token(TAKER)
Client4 sends offer to relayer:
{ networkId: 50,
  requestId: -97049368,
  order:
   { exchangeAddress: '0x48bacb9266a570d521063ef5dd96e61686dbe788',
     makerAddress: '0xe834ec434daba538cd1b9fe1582052b880bd7e63',
     takerAddress: '0x0000000000000000000000000000000000000000',
     senderAddress: '0x0000000000000000000000000000000000000000',
     feeRecipientAddress: '0x0000000000000000000000000000000000000000',
     expirationTimeSeconds: 1548784522,
     salt:
      55334472251816689817458182106008656205243207247118783386255956436274725258835,
     makerAssetAmount: 1,
     takerAssetAmount: 1,
     makerAssetData:
      '0x94cfcdd7000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000004402571792000000000000000000000000134a5b42e07c8b169ebe7aa900aa5db04c97a884000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004402571792000000000000000000000000134a5b42e07c8b169ebe7aa900aa5db04c97a884000000000000000000000000000000000000000000000000000000000000004700000000000000000000000000000000000000000000000000000000',
     takerAssetData:
      '0x02571792000000000000000000000000134a5b42e07c8b169ebe7aa900aa5db04c97a8840000000000000000000000000000000000000000000000000000000000000046',
     makerFee: 0,
     takerFee: 0 },
  signedOrder:
   { exchangeAddress: '0x48bacb9266a570d521063ef5dd96e61686dbe788',
     makerAddress: '0xe834ec434daba538cd1b9fe1582052b880bd7e63',
     takerAddress: '0x0000000000000000000000000000000000000000',
     senderAddress: '0x0000000000000000000000000000000000000000',
     feeRecipientAddress: '0x0000000000000000000000000000000000000000',
     expirationTimeSeconds: 1548784522,
     salt:
      55334472251816689817458182106008656205243207247118783386255956436274725258835,
     makerAssetAmount: 1,
     takerAssetAmount: 1,
     makerAssetData:
      '0x94cfcdd7000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000004402571792000000000000000000000000134a5b42e07c8b169ebe7aa900aa5db04c97a884000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004402571792000000000000000000000000134a5b42e07c8b169ebe7aa900aa5db04c97a884000000000000000000000000000000000000000000000000000000000000004700000000000000000000000000000000000000000000000000000000',
     takerAssetData:
      '0x02571792000000000000000000000000134a5b42e07c8b169ebe7aa900aa5db04c97a8840000000000000000000000000000000000000000000000000000000000000046',
     makerFee: 0,
     takerFee: 0,
     signature:
      '0x1b3d1edbe67e50a51a38b64d857938bb00f6410f8146d19742349d4a64e1586d456760016341a2b1b3ebc5be06d90838ba8a0271a31dd39fdccb19e3c4f155472303' } }
Offers received from relayer filtered by ID: -97049368 Now Has Two Offers:
{ requestId: -97049368,
  order:
   { exchangeAddress: '0x48bacb9266a570d521063ef5dd96e61686dbe788',
     makerAddress: '0xe834ec434daba538cd1b9fe1582052b880bd7e63',
     takerAddress: '0x0000000000000000000000000000000000000000',
     senderAddress: '0x0000000000000000000000000000000000000000',
     feeRecipientAddress: '0x0000000000000000000000000000000000000000',
     expirationTimeSeconds: '1548784522',
     salt:
      '55334472251816689817458182106008656205243207247118783386255956436274725258835',
     makerAssetAmount: '1',
     takerAssetAmount: '1',
     makerAssetData:
      '0x94cfcdd7000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000004402571792000000000000000000000000134a5b42e07c8b169ebe7aa900aa5db04c97a884000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004402571792000000000000000000000000134a5b42e07c8b169ebe7aa900aa5db04c97a884000000000000000000000000000000000000000000000000000000000000004700000000000000000000000000000000000000000000000000000000',
     takerAssetData:
      '0x02571792000000000000000000000000134a5b42e07c8b169ebe7aa900aa5db04c97a8840000000000000000000000000000000000000000000000000000000000000046',
     makerFee: '0',
     takerFee: '0' },
  signedOrder:
   { exchangeAddress: '0x48bacb9266a570d521063ef5dd96e61686dbe788',
     makerAddress: '0xe834ec434daba538cd1b9fe1582052b880bd7e63',
     takerAddress: '0x0000000000000000000000000000000000000000',
     senderAddress: '0x0000000000000000000000000000000000000000',
     feeRecipientAddress: '0x0000000000000000000000000000000000000000',
     expirationTimeSeconds: '1548784522',
     salt:
      '55334472251816689817458182106008656205243207247118783386255956436274725258835',
     makerAssetAmount: '1',
     takerAssetAmount: '1',
     makerAssetData:
      '0x94cfcdd7000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000004402571792000000000000000000000000134a5b42e07c8b169ebe7aa900aa5db04c97a884000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004402571792000000000000000000000000134a5b42e07c8b169ebe7aa900aa5db04c97a884000000000000000000000000000000000000000000000000000000000000004700000000000000000000000000000000000000000000000000000000',
     takerAssetData:
      '0x02571792000000000000000000000000134a5b42e07c8b169ebe7aa900aa5db04c97a8840000000000000000000000000000000000000000000000000000000000000046',
     makerFee: '0',
     takerFee: '0',
     signature:
      '0x1b3d1edbe67e50a51a38b64d857938bb00f6410f8146d19742349d4a64e1586d456760016341a2b1b3ebc5be06d90838ba8a0271a31dd39fdccb19e3c4f155472303' } }
    Requester fills offer 2. Tokens are exchanged...
    Requester Tokens:
    ID: 10 Balance: 1
    ID: 11 Balance: 1
    ID: 30 Balance: 1
    ID: 40 Balance: 1
    ID: 41 Balance: 1
    ID: 42 Balance: 1
    ID: 71 Balance: 1
    ID: length Balance: 7
    Client4 Tokens:
    ID: 50 Balance: 1
    ID: 51 Balance: 1
    ID: 52 Balance: 1
    ID: 70 Balance: 1
    ID: length Balance: 4
    */

    const cardInstance = await Card.deployed();
    // SET UP
    const [requester, client2, client3, client4] = await web3Wrapper.getAvailableAddressesAsync();

    const coffeeTokenId = 10;
    const teaTokenId = 20;
    const client4milkId = 30;
    const client3milkId = 31;
    const waterTokenId = 40;
    const irnBruTokenId = 50;
    const cokeTokenId = 60;
    const specialIrnBruTokenId = 70;
    const client4coffeId = 71;

    // 2 coffee & 3 water & 1 specialIrnBruTokenId
    await cardInstance.mint(10, requester, 'MilkMan', 'Coffee', 'Coffee10', 'https://www.brian-coffee-spot.com/wp-content/uploads/2015/10/Thumbnail-The-Milkman-DSC_1913t-150x200.jpg');
    await cardInstance.mint(11, requester, 'MilkMan', 'Coffee', 'Coffee11','https://www.brian-coffee-spot.com/wp-content/uploads/2015/10/Thumbnail-The-Milkman-DSC_1913t-150x200.jpg');
    await cardInstance.mint(40, requester, 'MilkMan', 'Water', 'Water40', 'image');
    await cardInstance.mint(41, requester, 'MilkMan', 'Water', 'Water41', 'image');
    await cardInstance.mint(42, requester, 'MilkMan', 'Water', 'Water42', 'image');
    await cardInstance.mint(specialIrnBruTokenId, requester, 'IrnBru', 'IrnBruSpecial', 'Orange','image');

    console.log('Client1(Requester) has: 2 Coffee, 3 Water & 1 IrnBruSpecial.');

    // 1 coke
    await cardInstance.mint(cokeTokenId, client2, 'Coca Cola', 'Coke', 'Coke60','Image');

    console.log('Client2 has: 1 Coke.');

    // 3 tea & 3 milk
    await cardInstance.mint(20, client3, 'Costa', 'Tea', 'Tea20', 'teaImage');
    await cardInstance.mint(21, client3, 'Costa', 'Tea', 'Tea21', 'teaImage');
    await cardInstance.mint(22, client3, 'Costa', 'Tea', 'Tea22', 'teaImage');
    await cardInstance.mint(client3milkId, client3, 'MilkMan', 'Milk', 'Milk31', 'milkImage');
    await cardInstance.mint(32, client3, 'MilkMan', 'Milk', 'Milk32', 'milkImage');
    await cardInstance.mint(33, client3, 'MilkMan', 'Milk', 'Milk33', 'milkImage');

    console.log('Client3 has: 3 Tea, 3 Milk.');

    // 3 irn bru & 1 milk
    await cardInstance.mint(50, client4, 'IrnBru', 'IrnBru', 'IrnBru50','image');
    await cardInstance.mint(51, client4, 'IrnBru', 'IrnBru', 'IrnBru51','image');
    await cardInstance.mint(52, client4, 'IrnBru', 'IrnBru', 'IrnBru52','image');
    await cardInstance.mint(client4milkId, client4, 'MilkMan', 'Milk', 'Milk30', 'milkImage');
    await cardInstance.mint(client4coffeId, client4, 'MilkMan', 'Coffee', 'Coffee71', 'coffeeImage');

    console.log('Client4 has: 3 Irn Bru, 1 Milk, 1 Coffee.');

    const milkRequestAmount = 1;
    // SET UP COMPLETE

    // Post request
    var request = {                       // DO WE NEED TO ADD CLIENT??
      requestTokenAddress: cardInstance.address,
      requestTokenId: client4milkId,
      tokenOwner: 'MilkMan',
      tokenType: 'Milk',
      requestAmount: milkRequestAmount,
      swaps: [{address: cardInstance.address, id: specialIrnBruTokenId}, {address: cardInstance.address, id: waterTokenId}, {address: cardInstance.address, id: coffeeTokenId}]
    }

    var response = await axios.post('http://localhost:3000/request?networkId=50', request);
    assert.equal(response.status, 200);

    var relayRequestId = response.data.id;

    console.log('Created MilkRequest that returns ID: ' + relayRequestId);

    // client 2 without tokens matching doesn't see request
    // need to get list of tokenAdrresses and ids
    response = await axios.get('http://localhost:3000/filteredrequestsbynames', {
      params: {
        networkId: 50,
        tokens: [{tokenOwner: 'CocaCola', tokenType: 'Coke'}]
      }
    });

    assert.equal(response.data.length, 0, 'Client2 Should See No Requests');
    console.log('Client2 Get Filter Requests Should Return None.');

    var client3filteredRequests = await axios.get('http://localhost:3000/filteredrequestsbynames', {
      params: {
        networkId: 50,
        tokens: [{tokenOwner: 'MilkMan', tokenType: 'Milk'}, {tokenOwner: 'Costa', tokenType: 'Tea'}]
      }
    });

    console.log('Client3 Get Filter Requests Should See The Milk Request with ID: ' + client3filteredRequests.data[0].id);
    // console.log('Client3 filtered requests: ');
    // console.log(client3filteredRequests.data);
    assert.equal(client3filteredRequests.data.length, 1, 'Client3 Should See 1 Request');
    assert.equal(client3filteredRequests.data[0].id, relayRequestId, 'Request ID should match');

    var client4filteredRequests = await axios.get('http://localhost:3000/filteredrequestsbynames', {
      params: {
        networkId: 50,
        tokens: [{tokenOwner: 'MilkMan', tokenType: 'Milk'}, {tokenOwner: 'MilkMan', tokenType: 'Coffee'}, {tokenOwner: 'IrnBru', tokenType: 'IrnBru'}]
      }
    });

    console.log('Client4 Get Filter Requests Should See The Milk Request with ID: ' + client4filteredRequests.data[0].id);
    // console.log('Client4 filtered requests: ');
    // console.log(client4filteredRequests.data);
    assert.equal(client4filteredRequests.data.length, 1, 'Client4 Should See 1 Request');
    assert.equal(client4filteredRequests.data[0].id, relayRequestId, 'Request ID should match');

    var requesterTokens = await getTokens(cardInstance, requester);
    console.log('Requester Tokens: ')
    for(var key in requesterTokens){
      console.log('ID' + key + ' Balance: ' + requesterTokens[key]);
    }

    assert.equal(requesterTokens['length'], 6, 'Requester should have 6 tokens');
    assert.equal(requesterTokens[specialIrnBruTokenId], 1, 'Requester should have the Special Irn Bru token');
    assert.equal(requesterTokens[client4milkId], undefined, 'Requester should not have the Milk token');

    var client4Tokens = await getTokens(cardInstance, client4);
    console.log('Client4 Tokens: ')
    for(var key in client4Tokens){
      console.log('ID' + key + ' Balance: ' + client4Tokens[key]);
    }

    assert.equal(client4Tokens['length'], 5, 'Client 4 should have 5 tokens');
    assert.equal(client4Tokens[client4milkId], 1, 'Client 4 should have the Milk token');
    assert.equal(client4Tokens[specialIrnBruTokenId], undefined, 'Client 4 should not have the Special Irn Bru token');

    const exchangeAddress = contractAddresses.exchange;

    // Allow the 0x ERC721 Proxy to move ERC721 tokens on behalf of requester
    const requesterERC721ApprovalTxHash = await contractWrappers.erc721Token.setProxyApprovalForAllAsync(
        cardInstance.address,
        requester,
        true,
    );

    const client3ERC721ApprovalTxHash = await contractWrappers.erc721Token.setProxyApprovalForAllAsync(
        cardInstance.address,
        client3,
        true,
    );

    const client4ERC721ApprovalTxHash = await contractWrappers.erc721Token.setProxyApprovalForAllAsync(
        cardInstance.address,
        client4,
        true,
    );

    console.log('ERC721 Are Approved For Clients')

    // client 3 sends an offer - signed order

    // the client3 will give of milk token
    const client1milkAmount = new BigNumber(1);
    // the amount the requester wants of coffee token

    const client3milkOfferAmount = new BigNumber(1);
    const client3coffeeAmount = new BigNumber(1);

    const client3milkMakerAssetData = assetDataUtils.encodeERC721AssetData(cardInstance.address, client3milkId);   // 31, MAKER ASSET
    const client3coffeeTakerAssetData = assetDataUtils.encodeERC721AssetData(cardInstance.address, coffeeTokenId); // 10, TAKER

    const randomExpiration = new BigNumber(Date.now() + 1000*60*10).div(1000).ceil();

    // Create the order
    const client3order = {
        exchangeAddress,
        makerAddress: client3,
        takerAddress: NULL_ADDRESS,
        senderAddress: NULL_ADDRESS,
        feeRecipientAddress: NULL_ADDRESS,
        expirationTimeSeconds: randomExpiration,
        salt: generatePseudoRandomSalt(),
        makerAssetAmount: client3milkOfferAmount,      // Makes 1 milk token
        takerAssetAmount: client3coffeeAmount,        // Takes 1 coffee token
        makerAssetData: client3milkMakerAssetData,
        takerAssetData: client3coffeeTakerAssetData,
        makerFee: ZERO,
        takerFee: ZERO,
    };

    // Generate the order hash and sign it
    const orderHashHex = orderHashUtils.getOrderHashHex(client3order);
    const signature = await signatureUtils.ecSignHashAsync(pe, orderHashHex, client3);
    const client3signedOrder = { ...client3order, signature };
    //console.log(signedOrder);

    console.log('Client3 makes and signs an order for 1 milk token (MAKER)/1 coffee token(TAKER)');

    var offer = {
      networkId: 50,
      requestId: relayRequestId,
      order: client3order,
      signedOrder: client3signedOrder
    }

    response = await axios.post('http://localhost:3000/offer', offer);
    assert.equal(response.status, 200);

    console.log('Client3 sends offer to relayer: ');
    //console.log(offer);

    var filteredOffers = await axios.get('http://localhost:3000/offers', {
      params: {
        networkId: 50,
        requestId: relayRequestId
      }
    });

    console.log('Offers received from relayer filtered by ID: ' + relayRequestId + ' Now Has One Offer: ')
    //console.log(filteredOffers.data[0]);
    assert.equal(filteredOffers.data.length, 1, 'Should have 1 offer');
    assert.equal(filteredOffers.data[0].order.makerAddress, client3, 'Offer should have client3 address');
    assert.equal(filteredOffers.data[0].order.takerAssetAmount, client3coffeeAmount, 'Offer should have same taker amount');

    // client 4 sends an offer - signed order
    const client4milkOfferAmount = new BigNumber(1);
    const client4irnBruAmount = new BigNumber(1);

    const client4milkMakerAssetData = assetDataUtils.encodeERC721AssetData(cardInstance.address, client4milkId);   // 30, MAKER ASSET
    const client4coffeeMakerAssetData = assetDataUtils.encodeERC721AssetData(cardInstance.address, client4coffeId);   // 71, MAKER ASSET
    const client4irnBruTakerAssetData = assetDataUtils.encodeERC721AssetData(cardInstance.address, specialIrnBruTokenId); // 40, TAKER


    const makerAssetData = assetDataUtils.encodeMultiAssetData(
        [new BigNumber(1), new BigNumber(1)],
        [client4milkMakerAssetData, client4coffeeMakerAssetData],
    );

    const randomExpiration4 = new BigNumber(Date.now() + 1000*60*10).div(1000).ceil();

    // Create the order
    const client4order = {
        exchangeAddress,
        makerAddress: client4,
        takerAddress: NULL_ADDRESS,
        senderAddress: NULL_ADDRESS,
        feeRecipientAddress: NULL_ADDRESS,
        expirationTimeSeconds: randomExpiration4,
        salt: generatePseudoRandomSalt(),
        makerAssetAmount: new BigNumber(1),      // Makes 1 milk token & 1 coffee
        takerAssetAmount: client4irnBruAmount,    // Takes 1 special irn bru
        makerAssetData: makerAssetData,
        takerAssetData: client4irnBruTakerAssetData,
        makerFee: ZERO,
        takerFee: ZERO,
    };

    // Generate the order hash and sign it
    const orderHashHex4 = orderHashUtils.getOrderHashHex(client4order);
    const signature4 = await signatureUtils.ecSignHashAsync(pe, orderHashHex4, client4);
    const client4signedOrder = { ...client4order, signature: signature4 };
    //console.log(signedOrder);

    console.log('Client4 makes and signs a MultiAsset order for 1 milk token & 1 coffee token (MAKER)/1 Special Irn Bru token(TAKER)');

    var offer = {
      networkId: 50,
      requestId: relayRequestId,                // User will get this when they click on request to fill
      order: client4order,
      signedOrder: client4signedOrder
    }

    response = await axios.post('http://localhost:3000/offer', offer);
    assert.equal(response.status, 200);

    console.log('Client4 sends offer to relayer: ');
    //console.log(offer);

    var filteredOffers = await axios.get('http://localhost:3000/offers', {
      params: {
        networkId: 50,
        requestId: relayRequestId
      }
    });

    assert.equal(filteredOffers.data.length, 2, 'Should have 2 offer');
    assert.equal(filteredOffers.data[1].order.makerAddress, client4, 'Offer should have client3 address');
    assert.equal(filteredOffers.data[1].order.takerAssetAmount, client4irnBruAmount, 'Offer should have same taker amount');
    console.log('Offers received from relayer filtered by ID: ' + relayRequestId + ' Now Has Two Offers: ')
    //console.log(filteredOffers.data[1]);

    // client 1 gets offerbook with offers above

    // client 1 accepts an offer - fills

    // var acceptedSignedOrder = parseHTTPOrder(filteredOffers.data[1].signedOrder);
    var acceptedSignedOrder = {
      exchangeAddress: filteredOffers.data[1].signedOrder.exchangeAddress,
      makerAddress: filteredOffers.data[1].signedOrder.makerAddress,
      takerAddress: filteredOffers.data[1].signedOrder.takerAddress,
      senderAddress: filteredOffers.data[1].signedOrder.senderAddress,
      feeRecipientAddress: filteredOffers.data[1].signedOrder.feeRecipientAddress,
      expirationTimeSeconds: new BigNumber(filteredOffers.data[1].signedOrder.expirationTimeSeconds),
      salt: new BigNumber(filteredOffers.data[1].signedOrder.salt),
      makerAssetAmount: new BigNumber(filteredOffers.data[1].signedOrder.makerAssetAmount),
      takerAssetAmount: new BigNumber(filteredOffers.data[1].signedOrder.takerAssetAmount),
      makerAssetData: filteredOffers.data[1].signedOrder.makerAssetData,
      takerAssetData: filteredOffers.data[1].signedOrder.takerAssetData,
      makerFee: new BigNumber(filteredOffers.data[1].signedOrder.makerFee),
      takerFee: new BigNumber(filteredOffers.data[1].signedOrder.takerFee),
      signature: filteredOffers.data[1].signedOrder.signature
    }

    // Fill the Order via 0x.js Exchange contract
    var txHash = await contractWrappers.exchange.fillOrderAsync(acceptedSignedOrder, acceptedSignedOrder.takerAssetAmount, requester, {
        gasLimit: 400000,
    });

    // confirm tokens have swapped
    var requesterTokens = await getTokens(cardInstance, requester);

    console.log('Requester fills offer 2. Tokens are exchanged...')

    console.log('Requester Tokens: ')
    for(var key in requesterTokens){
      console.log('ID: ' + key + ' Balance: ' + requesterTokens[key])
    }

    assert.equal(requesterTokens['length'], 7, 'Requester should have 7 tokens');
    assert.equal(requesterTokens[specialIrnBruTokenId], undefined, 'Requester should not have the Special Irn Bru token');
    assert.equal(requesterTokens[client4milkId], 1, 'Requester should have the Milk token');
    assert.equal(requesterTokens[client4coffeId], 1, 'Requester should have the Coffee token');

    var client4Tokens = await getTokens(cardInstance, client4);
    console.log('Client4 Tokens: ')
    for(var key in client4Tokens){
      console.log('ID: ' + key + ' Balance: ' + client4Tokens[key])
    }
    assert.equal(client4Tokens['length'], 4, 'Client 4 should have 4 tokens');
    assert.equal(client4Tokens[client4milkId], undefined, 'Client 4 should not have the Milk token');
    assert.equal(client4Tokens[client4coffeId], undefined, 'Client 4 should not have the Coffee token');
    assert.equal(client4Tokens[specialIrnBruTokenId], 1, 'Client 4 should have the Special Irn Bru token');

    // Stop the Provider Engine
    pe.stop();

  });

  it("...should carry out double MultiAsset exchange", async () => {

    const cardInstance = await Card.deployed();
    // SET UP
    const [requester1, client21, client31, client41, requester, client2, client3, client4] = await web3Wrapper.getAvailableAddressesAsync();

    const coffeeTokenId = 200;

    const waterTokenId = 400;     // These will be the 'TAKE'
    const specialIrnBruTokenId = 90;

    const client4milkId = 300;    // These will be the 'MAKE'
    const client4coffeId = 777;

    // 2 coffee & 3 water & 1 specialIrnBruTokenId
    await cardInstance.mint(coffeeTokenId, requester, 'MilkMan', 'Coffee', 'Coffee10', 'https://www.brian-coffee-spot.com/wp-content/uploads/2015/10/Thumbnail-The-Milkman-DSC_1913t-150x200.jpg');
    await cardInstance.mint(201, requester, 'MilkMan', 'Coffee', 'Coffee11','https://www.brian-coffee-spot.com/wp-content/uploads/2015/10/Thumbnail-The-Milkman-DSC_1913t-150x200.jpg');
    await cardInstance.mint(waterTokenId, requester, 'MilkMan', 'Water', 'Water40', 'image');
    await cardInstance.mint(401, requester, 'MilkMan', 'Water', 'Water41', 'image');
    await cardInstance.mint(402, requester, 'MilkMan', 'Water', 'Water42', 'image');
    await cardInstance.mint(specialIrnBruTokenId, requester, 'IrnBru', 'IrnBruSpecial', 'Orange','image');

    console.log('Client1(Requester) has: 2 Coffee, 3 Water & 1 IrnBruSpecial.');

    // 3 irn bru & 1 milk
    await cardInstance.mint(700, client4, 'IrnBru', 'IrnBru', 'IrnBru50','image');
    await cardInstance.mint(701, client4, 'IrnBru', 'IrnBru', 'IrnBru51','image');
    await cardInstance.mint(702, client4, 'IrnBru', 'IrnBru', 'IrnBru52','image');
    await cardInstance.mint(client4milkId, client4, 'MilkMan', 'Milk', 'Milk30', 'milkImage');
    await cardInstance.mint(client4coffeId, client4, 'MilkMan', 'Coffee', 'Coffee71', 'coffeeImage');

    console.log('Client4 has: 3 Irn Bru, 1 Milk, 1 Coffee.');

    const milkRequestAmount = 1;            // This is minimum what Requester needs
    // SET UP COMPLETE

    // Post request
    var request = {
      requestTokenAddress: cardInstance.address,
      requestTokenId: client4milkId,
      tokenOwner: 'MilkMan',
      tokenType: 'Milk',
      requestAmount: milkRequestAmount,
      swaps: [{address: cardInstance.address, id: specialIrnBruTokenId}, {address: cardInstance.address, id: waterTokenId}, {address: cardInstance.address, id: coffeeTokenId}]
    }

    var response = await axios.post('http://localhost:3000/request?networkId=50', request);
    assert.equal(response.status, 200);

    var relayRequestId = response.data.id;

    console.log('Created MilkRequest that returns ID: ' + relayRequestId);


    var requesterTokens = await getTokens(cardInstance, requester);
    console.log('Requester Tokens: ')
    for(var key in requesterTokens){
      console.log('ID' + key + ' Balance: ' + requesterTokens[key]);
    }

    assert.equal(requesterTokens['length'], 6, 'Requester should have 6 tokens');
    assert.equal(requesterTokens[specialIrnBruTokenId], 1, 'Requester should have the Special Irn Bru token');
    assert.equal(requesterTokens[client4milkId], undefined, 'Requester should not have the Milk token');

    var client4Tokens = await getTokens(cardInstance, client4);
    console.log('Client4 Tokens: ')
    for(var key in client4Tokens){
      console.log('ID' + key + ' Balance: ' + client4Tokens[key]);
    }

    assert.equal(client4Tokens['length'], 5, 'Client 4 should have 5 tokens');
    assert.equal(client4Tokens[client4milkId], 1, 'Client 4 should have the Milk token');
    assert.equal(client4Tokens[specialIrnBruTokenId], undefined, 'Client 4 should not have the Special Irn Bru token');

    const exchangeAddress = contractAddresses.exchange;

    // Allow the 0x ERC721 Proxy to move ERC721 tokens on behalf of requester
    const requesterERC721ApprovalTxHash = await contractWrappers.erc721Token.setProxyApprovalForAllAsync(
        cardInstance.address,
        requester,
        true,
    );

    const client3ERC721ApprovalTxHash = await contractWrappers.erc721Token.setProxyApprovalForAllAsync(
        cardInstance.address,
        client3,
        true,
    );

    const client4ERC721ApprovalTxHash = await contractWrappers.erc721Token.setProxyApprovalForAllAsync(
        cardInstance.address,
        client4,
        true,
    );

    console.log('ERC721 Are Approved For Clients')

    const client4milkMakerAssetData = assetDataUtils.encodeERC721AssetData(cardInstance.address, client4milkId);   //  MAKER ASSET
    const client4coffeeMakerAssetData = assetDataUtils.encodeERC721AssetData(cardInstance.address, client4coffeId);   //  MAKER ASSET

    const makerAssetData = assetDataUtils.encodeMultiAssetData(
        [new BigNumber(1), new BigNumber(1)],
        [client4milkMakerAssetData, client4coffeeMakerAssetData],
    );

    const client4irnBruTakerAssetData = assetDataUtils.encodeERC721AssetData(cardInstance.address, specialIrnBruTokenId); // TAKER
    const client4WaterTakerAssetData = assetDataUtils.encodeERC721AssetData(cardInstance.address, waterTokenId); // TAKER

    const takerAssetData = assetDataUtils.encodeMultiAssetData(
        [new BigNumber(1), new BigNumber(1)],
        [client4irnBruTakerAssetData, client4WaterTakerAssetData],
    );

    const randomExpiration4 = new BigNumber(Date.now() + 1000*60*10).div(1000).ceil();

    // Create the order
    const client4order = {
        exchangeAddress,
        makerAddress: client4,
        takerAddress: NULL_ADDRESS,
        senderAddress: NULL_ADDRESS,
        feeRecipientAddress: NULL_ADDRESS,
        expirationTimeSeconds: randomExpiration4,
        salt: generatePseudoRandomSalt(),
        makerAssetAmount: new BigNumber(1),      // Makes 1 milk token & 1 coffee
        takerAssetAmount: new BigNumber(1),    // Takes 1 special irn bru & 1 water
        makerAssetData: makerAssetData,
        takerAssetData: takerAssetData,
        makerFee: ZERO,
        takerFee: ZERO,
    };

    // Generate the order hash and sign it
    const orderHashHex4 = orderHashUtils.getOrderHashHex(client4order);
    const signature4 = await signatureUtils.ecSignHashAsync(pe, orderHashHex4, client4);
    const client4signedOrder = { ...client4order, signature: signature4 };
    //console.log(signedOrder);

    console.log('Client4 makes and signs a MultiAsset order for 1 milk token & 1 coffee token (MAKER)/1 Special Irn Bru token & 1 water token (TAKER)');

    var offer = {
      networkId: 50,
      requestId: relayRequestId,                // User will get this when they click on request to fill
      order: client4order,
      signedOrder: client4signedOrder
    }

    response = await axios.post('http://localhost:3000/offer', offer);
    assert.equal(response.status, 200);

    console.log('Client4 sends offer to relayer: ');
    console.log(offer);

    var filteredOffers = await axios.get('http://localhost:3000/offers', {
      params: {
        networkId: 50,
        requestId: relayRequestId
      }
    });

    assert.equal(filteredOffers.data.length, 1, 'Should have 1 offer');
    assert.equal(filteredOffers.data[0].order.makerAddress, client4, 'Offer should have client4 address');
    console.log('Offers received from relayer filtered by ID: ' + relayRequestId + ' Now Has An Offer: ')
    console.log(filteredOffers.data[0]);

    // client 1 gets offerbook with offers above

    // client 1 accepts an offer - fills

    // var acceptedSignedOrder = parseHTTPOrder(filteredOffers.data[1].signedOrder);
    var acceptedSignedOrder = {
      exchangeAddress: filteredOffers.data[0].signedOrder.exchangeAddress,
      makerAddress: filteredOffers.data[0].signedOrder.makerAddress,
      takerAddress: filteredOffers.data[0].signedOrder.takerAddress,
      senderAddress: filteredOffers.data[0].signedOrder.senderAddress,
      feeRecipientAddress: filteredOffers.data[0].signedOrder.feeRecipientAddress,
      expirationTimeSeconds: new BigNumber(filteredOffers.data[0].signedOrder.expirationTimeSeconds),
      salt: new BigNumber(filteredOffers.data[0].signedOrder.salt),
      makerAssetAmount: new BigNumber(filteredOffers.data[0].signedOrder.makerAssetAmount),
      takerAssetAmount: new BigNumber(filteredOffers.data[0].signedOrder.takerAssetAmount),
      makerAssetData: filteredOffers.data[0].signedOrder.makerAssetData,
      takerAssetData: filteredOffers.data[0].signedOrder.takerAssetData,
      makerFee: new BigNumber(filteredOffers.data[0].signedOrder.makerFee),
      takerFee: new BigNumber(filteredOffers.data[0].signedOrder.takerFee),
      signature: filteredOffers.data[0].signedOrder.signature
    }

    console.log('!!!!!!!!!');
    // const testData = assetDataUtils.decodeMultiAssetData(acceptedSignedOrder.makerAssetData);
    // console.log(testData)

    const testData2 = assetDataUtils.decodeMultiAssetDataRecursively(acceptedSignedOrder.makerAssetData);   // Gives original asset data, should be used by Requester to see what offer looks like
    console.log(testData2)

    // Fill the Order via 0x.js Exchange contract
    var txHash = await contractWrappers.exchange.fillOrderAsync(acceptedSignedOrder, acceptedSignedOrder.takerAssetAmount, requester, {
        gasLimit: 400000,
    });

    // confirm tokens have swapped
    var requesterTokens = await getTokens(cardInstance, requester);

    console.log('Requester fills offer. Tokens are exchanged...')

    console.log('Requester Tokens: ')
    for(var key in requesterTokens){
      console.log('ID: ' + key + ' Balance: ' + requesterTokens[key])
    }

    assert.equal(requesterTokens['length'], 6, 'Requester should have 6 tokens');
    assert.equal(requesterTokens[specialIrnBruTokenId], undefined, 'Requester should not have the Special Irn Bru token');
    assert.equal(client4Tokens[waterTokenId], undefined, 'Client 4 should not have the Water token');
    assert.equal(requesterTokens[client4milkId], 1, 'Requester should have the Milk token');
    assert.equal(requesterTokens[client4coffeId], 1, 'Requester should have the Coffee token');

    var client4Tokens = await getTokens(cardInstance, client4);
    console.log('Client4 Tokens: ')
    for(var key in client4Tokens){
      console.log('ID: ' + key + ' Balance: ' + client4Tokens[key])
    }
    assert.equal(client4Tokens['length'], 5, 'Client 4 should have 5 tokens');
    assert.equal(client4Tokens[client4milkId], undefined, 'Client 4 should not have the Milk token');
    assert.equal(client4Tokens[client4coffeId], undefined, 'Client 4 should not have the Coffee token');
    assert.equal(client4Tokens[specialIrnBruTokenId], 1, 'Client 4 should have the Special Irn Bru token');
    assert.equal(client4Tokens[waterTokenId], 1, 'Client 4 should have the Water token');

    // Stop the Provider Engine
    pe.stop();

  });

});
