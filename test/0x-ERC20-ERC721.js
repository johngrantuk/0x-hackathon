/*
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

import { Web3Wrapper } from '@0x/web3-wrapper';
import { MnemonicWalletSubprovider } from '@0x/subproviders';
import { getContractAddressesForNetworkOrThrow } from '@0x/contract-addresses';

const SimpleStorage = artifacts.require("./SimpleStorage.sol");
const Card = artifacts.require("./Card.sol");

const MNEMONIC = 'concert load couple harbor equip island argue ramp clarify fence smart topic';
const BASE_DERIVATION_PATH = `44'/60'/0'/0`;
const DECIMALS = 18;
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const ZERO = new BigNumber(0);

const contractAddresses = getContractAddressesForNetworkOrThrow(50);

contract("0x Trading - ERC20 <-> ERC721", accounts => {

  const mnemonicWallet = new MnemonicWalletSubprovider({
      mnemonic: MNEMONIC,
      baseDerivationPath: BASE_DERIVATION_PATH,
  });

  const pe = new Web3ProviderEngine();
  pe.addProvider(mnemonicWallet);
  pe.addProvider(new RPCSubprovider('http://127.0.0.1:8545'));
  //console.log('Provider Engine');
  //console.log(pe)
  pe.start();

  const contractWrappers = new ContractWrappers(pe, { networkId: 50 });

  const web3Wrapper = new Web3Wrapper(pe);

  //console.log(web3.providers);
  //console.log('Current Provider:')
  //console.log(web3.currentProvider);

  it("should test ERC20 <-> ERC721 trade...", async () => {
    const cardInstance = await Card.deployed();
    console.log('Card Address: ' + cardInstance.address);

    const [maker, taker] = await web3Wrapper.getAvailableAddressesAsync();

    console.log('Maker address: ' + maker);
    console.log('Taker address: ' + taker)

    // the amount the maker is selling of maker asset (1 ERC721 Token)
    const makerAssetAmount = new BigNumber(1);
    // the amount the maker wants of taker asset
    const takerAssetAmount = new BigNumber(1);

    // Generate a random token id
    const coffeeTokenId = generatePseudoRandomSalt();
    const teaTokenId = generatePseudoRandomSalt();

    var makerCoffeeTokenBalance = await cardInstance.balanceOf.call(maker, coffeeTokenId);
    var makerTeaTokenBalance = await cardInstance.balanceOf.call(maker, teaTokenId);
    var takerCoffeeTokenBalance = await cardInstance.balanceOf.call(taker, coffeeTokenId);
    var takerTeaTokenBalance = await cardInstance.balanceOf.call(taker, teaTokenId);

    assert.equal(makerCoffeeTokenBalance, 0, "Maker Should Have 0 Coffee Tokens");
    assert.equal(makerTeaTokenBalance, 0, "Maker Should Have 0 Tea Tokens");
    assert.equal(takerCoffeeTokenBalance, 0, "Taker Should Have 0 Coffee Tokens");
    assert.equal(takerTeaTokenBalance, 0, "Taker Should Have 0 Tea Tokens");

    // Mint a new ERC721 token for the maker
    const mintCoffeeTxHash = await cardInstance.mint(coffeeTokenId, maker);
    // Mint a new ERC721 token for the taker
    const mintTeaTxHash = await cardInstance.mint(teaTokenId, taker);

    makerCoffeeTokenBalance = await cardInstance.balanceOf.call(maker, coffeeTokenId);
    makerTeaTokenBalance = await cardInstance.balanceOf.call(maker, teaTokenId);
    takerCoffeeTokenBalance = await cardInstance.balanceOf.call(taker, coffeeTokenId);
    takerTeaTokenBalance = await cardInstance.balanceOf.call(taker, teaTokenId);

    assert.equal(makerCoffeeTokenBalance, 1, "Maker Should Have 1 Coffee Tokens");
    assert.equal(makerTeaTokenBalance, 0, "Maker Should Have 0 Tea Tokens");
    assert.equal(takerCoffeeTokenBalance, 0, "Taker Should Have 0 Coffee Tokens");
    assert.equal(takerTeaTokenBalance, 1, "Taker Should Have 1 Tea Tokens");

    // Allow the 0x ERC721 Proxy to move ERC721 tokens on behalf of maker
    const makerERC721ApprovalTxHash = await contractWrappers.erc721Token.setProxyApprovalForAllAsync(
        cardInstance.address,
        maker,
        true,
    );

    // Allow the 0x ERC721 Proxy to move ERC721 tokens on behalf of taker
    const takerERC721ApprovalTxHash = await contractWrappers.erc721Token.setProxyApprovalForAllAsync(
        cardInstance.address,
        taker,
        true,
    );


    const randomExpiration = new BigNumber(Date.now() + 1000*60*10).div(1000).ceil();
    const exchangeAddress = contractAddresses.exchange;

    const makerAssetData = assetDataUtils.encodeERC721AssetData(cardInstance.address, coffeeTokenId);
    const takerAssetData = assetDataUtils.encodeERC721AssetData(cardInstance.address, teaTokenId);

    // Create the order
    const order = {
        exchangeAddress,
        makerAddress: maker,
        takerAddress: NULL_ADDRESS,
        senderAddress: NULL_ADDRESS,
        feeRecipientAddress: NULL_ADDRESS,
        expirationTimeSeconds: randomExpiration,
        salt: generatePseudoRandomSalt(),
        makerAssetAmount,
        takerAssetAmount,
        makerAssetData,
        takerAssetData,
        makerFee: ZERO,
        takerFee: ZERO,
    };

    var ownerOfCoffeeToken = await cardInstance.ownerOf(coffeeTokenId);
    var ownerOfTeaToken = await cardInstance.ownerOf(teaTokenId);

    console.log('coffeeToken Owner: ' + ownerOfCoffeeToken);
    console.log('teaToken Owner: ' + ownerOfTeaToken);

    assert.equal(web3.utils.toChecksumAddress(ownerOfCoffeeToken), web3.utils.toChecksumAddress(maker), "Maker Should Own Coffee Token Before Trade");
    assert.equal(web3.utils.toChecksumAddress(ownerOfTeaToken), web3.utils.toChecksumAddress(taker), "Taker Should Own Tea Token Before Trade");

    // Generate the order hash and sign it
    const orderHashHex = orderHashUtils.getOrderHashHex(order);
    const signature = await signatureUtils.ecSignHashAsync(pe, orderHashHex, maker);
    const signedOrder = { ...order, signature };
    //console.log(signedOrder);

    // Fill the Order via 0x.js Exchange contract
    var txHash = await contractWrappers.exchange.fillOrderAsync(signedOrder, takerAssetAmount, taker, {
        gasLimit: 400000,
    });

    var ownerOfCoffeeToken = await cardInstance.ownerOf(coffeeTokenId);
    var ownerOfTeaToken = await cardInstance.ownerOf(teaTokenId);

    console.log('coffeeToken Owner: ' + ownerOfCoffeeToken);
    console.log('teaToken Owner: ' + ownerOfTeaToken);

    assert.equal(web3.utils.toChecksumAddress(ownerOfCoffeeToken), web3.utils.toChecksumAddress(taker), "Taker Should Own Coffee Token After Trade");
    assert.equal(web3.utils.toChecksumAddress(ownerOfTeaToken), web3.utils.toChecksumAddress(maker), "Maker Should Own Tea Token After Trade");

    // Stop the Provider Engine
    pe.stop();
  });
});
*/
