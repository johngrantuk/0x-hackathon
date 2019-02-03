import React from 'react';
import {Col, Row, Button, Modal } from 'react-bootstrap';
import ChallengeToken from './ChallengeToken';
import NumericInput from 'react-numeric-input';
import uuid from 'uuid';
import { getContractAddress, getTokenMeta } from './utils/contract-helper';
import {
    assetDataUtils,
    BigNumber,
    generatePseudoRandomSalt,
    orderHashUtils,
    signatureUtils,
    RPCSubprovider,
    Web3ProviderEngine
} from '0x.js';
import { getContractAddressesForNetworkOrThrow } from '@0x/contract-addresses';
import { MnemonicWalletSubprovider } from '@0x/subproviders';

let axios = require('axios');

export default class Offer extends React.Component {

  state = {
    show: false,
  }

  constructor(props, context) {
      super(props, context);
      this.createOffer = this.createOffer.bind(this);
      this.handleClose = this.handleClose.bind(this);
      this.makeOffer = this.makeOffer.bind(this);

      this.offerTokens = {};
  }

  createOffer() {
    this.setState({ show: true });
  }

  handleClose() {
    this.setState({ show: false });
  }

  test(qty, token){
    token.offerAmount = qty;
    console.log(token)
    console.log(qty)
    this.offerTokens[token.id] = token;
  }

  makeOffer(){
    this.SendOffer();
  }

  async SendOffer(){
    var request = this.props.request;
    console.log('Make Offer');
    // console.log('Request:')
    // console.log(request)
    /*
    id: 58946834
    requestAmount: 1
    requestSwaps: (3) [{…}, {…}, {…}]
    requestTokenAddress: "0xC5aF76ed6EE0Ed215dB249cc485031cc62e58694"
    requestTokenId: 2
    tokenOwner: "MilkMan"
    tokenType: "Tea"
    */
    // console.log('OfferTokens:')
    // console.log(this.offerTokens);
    /*
    101: {name: "Coffee101", id: "101", balance: "1", tokenOwner: "MilkMan", tokenType: "Coffee", …}
    address: "0xC5aF76ed6EE0Ed215dB249cc485031cc62e58694"
    balance: "1"
    id: "101"
    image: "https://www.brian-coffee-spot.com/wp-content/uploads/2015/10/Thumbnail-The-Milkman-DSC_1913t-150x200.jpg"
    name: "Coffee101"
    offerAmount: 1
    tokenOwner: "MilkMan"
    tokenType: "Coffee"
    102: {name: "Milk102", id: "102", balance: "1", tokenOwner: "MilkMan", tokenType: "Milk", …}
    */
    var contractAddress = await getContractAddress();
    const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
    const ZERO = new BigNumber(0);
    var takeQtys = [];
    var assetDatas = [];
    for(var tokenId in this.offerTokens){
      var token = this.offerTokens[tokenId];
      var assetData = assetDataUtils.encodeERC721AssetData(contractAddress, token.id);
      takeQtys.push(new BigNumber(token.offerAmount));
      assetDatas.push(assetData);
    }

    const makerAssetData = assetDataUtils.encodeERC721AssetData(contractAddress, request.requestTokenId);
    const takerAssetData = assetDataUtils.encodeMultiAssetData(takeQtys, assetDatas);

    const randomExpiration = new BigNumber(Date.now() + 1000*60*10).div(1000).ceil();

    const contractAddresses = getContractAddressesForNetworkOrThrow(50);
    const exchangeAddress = contractAddresses.exchange;

    const accounts = await this.props.web3.eth.getAccounts();
    console.log(this.props.web3.utils.toChecksumAddress(accounts[0]))

    // Create the order
    const order = {
        exchangeAddress,
        makerAddress: this.props.account.toLowerCase(),
        takerAddress: NULL_ADDRESS,
        senderAddress: NULL_ADDRESS,
        feeRecipientAddress: NULL_ADDRESS,
        expirationTimeSeconds: randomExpiration,
        salt: generatePseudoRandomSalt(),
        makerAssetAmount: new BigNumber(request.requestAmount),
        takerAssetAmount: new BigNumber(1),
        makerAssetData: makerAssetData,
        takerAssetData: takerAssetData,
        makerFee: ZERO,
        takerFee: ZERO,
    };

    const pe = new Web3ProviderEngine();
    pe.addProvider(new RPCSubprovider('http://127.0.0.1:8545'));
    pe.start();

    // Generate the order hash and sign it
    const orderHashHex = orderHashUtils.getOrderHashHex(order);
    const signature = await signatureUtils.ecSignHashAsync(pe, orderHashHex, this.props.account.toLowerCase());
    const signedOrder = { ...order, signature: signature };
    //console.log(signedOrder);

    var offers = [];
    for(var tokenId in this.offerTokens){
      var token = this.offerTokens[tokenId];
      offers.push(token);
    }

    var offer = {
      networkId: 50,
      requestId: request.id,
      order: order,
      signedOrder: signedOrder,
      request: request,
      offer: offers
    }

    var response = await axios.post('http://localhost:3000/offer', offer);
    console.log(response.status);

    this.setState({show: false});
    // this.SendRequests(swapTokens);
  }

  render() {

    var request = this.props.request;
    var userTokens = this.props.userTokens;

    return(
      <div>
        <Row className="show-grid">
          <Col sm={1} md={1} lg={1}>
            { request.tokenOwner }
          </Col>
          <Col sm={1} md={1} lg={1}>
            { request.tokenType }
          </Col>
          <Col sm={1} md={1} lg={1}>
            { request.requestAmount }
          </Col>
          <Col sm={1} md={1} lg={1}>
            <Button bsStyle="primary"  onClick={this.createOffer}>MAKE AN OFFER</Button>
          </Col>
        </Row>

        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Make Your Offer</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {request.requestSwaps.map(token =>
              <Row key={uuid.v4()}>
                <Col sm={1} md={1} lg={1}>
                  <img role="presentation" style={{"width" : "100%"}} src={token.image}/>
                  <strong>{token.tokenOwner} </strong> <span>{token.tokenType}</span><br/>
                </Col>
                <Col sm={1} md={1} lg={1}>
                  Qty
                  <NumericInput className={token.id.toString()} min={0} max={3} value={0} onChange={(e) => this.test(e, token)}/>
                </Col>
              </Row>
            )}

            <h2>Your Offer Will Be Submitted - Wait For Someone To Accept It :)</h2>
            <Button bsStyle="primary"  onClick={this.makeOffer}>MAKE OFFER</Button>
          </Modal.Body>
        </Modal>
      </div>
    );

  }
}
