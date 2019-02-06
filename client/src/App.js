import React, { Component } from "react";
import getWeb3 from "./utils/getWeb3";
import { Panel, Alert } from 'react-bootstrap';
import Token from './Token';
import Challenge from './Challenge';
import Offer from './Offer';
import uuid from 'uuid';
import {Col, Row, Button } from 'react-bootstrap';
import {ContractWrappers, RPCSubprovider, Web3ProviderEngine, BigNumber } from '0x.js';

import "./App.css";

import { getAccountInfo, getContractAddress } from './utils/contract-helper';

let axios = require('axios');

class App extends Component {
  state = {
    web3: null,
    accounts: null,
    userTokens: [],
    isProxyApproved: false,
    challenges: [],
    filteredRequests: [],
    offers: []
  };

  constructor(props, context) {
      super(props, context);
      this.acceptOffer = this.acceptOffer.bind(this);
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();

      this.setState({
        web3: web3,
        networkId: networkId,
        accounts: accounts
      });

      //setInterval(() => this.LoadAccountInfo(), 5000);
      await this.LoadAccountInfo();                                                                                             // Loads account token info, etc

      const pe = new Web3ProviderEngine();
      pe.addProvider(new RPCSubprovider('http://127.0.0.1:8545'));
      pe.start();

      const contractWrappers = new ContractWrappers(pe, { networkId: networkId });                                              // 0x contract wrappers

      var contractAddress = await getContractAddress();

      var isApproved = await contractWrappers.erc721Token.isProxyApprovedForAllAsync(contractAddress, accounts[0]);             // Check that current account has been approved

      this.setState({
        isProxyApproved: isApproved,
        contractWrappers: contractWrappers,
        contractAddress
      });

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  refreshPage = () => {
    this.LoadAccountInfo();
  }

  // Loads users tokens, challenges, available requests and offers
  async LoadAccountInfo (){
    var web3 = this.state.web3;
    var networkId = this.state.networkId;
    var accounts = this.state.accounts;

    var tokenInfo = await getAccountInfo(web3, networkId, accounts);                                            // Gets tokens for account
    var userTokens = tokenInfo[0];
    var tokenCounts = tokenInfo[1];

    this.setState({
      userTokens: userTokens,
      tokenCounts: tokenCounts,
    });

    var challenges = await axios.get('http://localhost:3000/challenges', { params: { networkId: networkId}});   // Gets all Challenges (instead of filtering decided to get all as it makes it more interesting to user?)
    this.setState({
      challenges: challenges.data,
    });

    var tokenFilter = [];
    for(var i = 0;i < userTokens.length;i++){
      tokenFilter.push({tokenOwner: userTokens[i].tokenOwner, tokenType: userTokens[i].tokenType})              // Creating token filter for pulling info from Relayer
    }

    var filteredRequests = await axios.get('http://localhost:3000/filteredrequestsbytypes', {                   // Get Requests for tokens matching users tokens
      params: {
        networkId: networkId,
        tokens: tokenFilter
      }
    });

    this.setState({
      filteredRequests: filteredRequests.data
    });

    var offers = await axios.get('http://localhost:3000/alloffers', { params: { networkId: networkId}});        // Gets all offers available

    this.setState({
      offers: offers.data
    });
  }

  // Account must be approved for 0x
  async activateTrading(){
    console.log('Enabling Trading...');
    this.SetProxy();
  }

  // Use 0x contract wrapper to approve erc721
  async SetProxy(){
    await this.state.contractWrappers.erc721Token.setProxyApprovalForAllAsync(
        this.state.contractAddress,
        this.state.accounts[0],
        true,
    );

    var isApproved = await this.state.contractWrappers.erc721Token.isProxyApprovedForAllAsync(this.state.contractAddress, this.state.accounts[0]);

    console.log(isApproved);

    this.setState({
      isProxyApproved: isApproved,
    });
  }

  // User has clicked to accept an offer
  acceptOffer(e, Offer){
    console.log('Accepting Offer: ');
    console.log(Offer)
    this.FillOrder(Offer);
  }

  // Fill order using 0x.js
  async FillOrder(Offer){

    console.log('Filling Order...');

    const pe = new Web3ProviderEngine();
    pe.addProvider(new RPCSubprovider('http://127.0.0.1:8545'));
    pe.start();

    const contractWrappers = new ContractWrappers(pe, { networkId: 50 });

    var acceptedSignedOrder = {                                                                 // Make sure offer received via API is in correct format for 0x
      exchangeAddress: Offer.signedOrder.exchangeAddress,
      makerAddress: Offer.signedOrder.makerAddress,
      takerAddress: Offer.signedOrder.takerAddress,
      senderAddress: Offer.signedOrder.senderAddress,
      feeRecipientAddress: Offer.signedOrder.feeRecipientAddress,
      expirationTimeSeconds: new BigNumber(Offer.signedOrder.expirationTimeSeconds),
      salt: new BigNumber(Offer.signedOrder.salt),
      makerAssetAmount: new BigNumber(Offer.signedOrder.makerAssetAmount),
      takerAssetAmount: new BigNumber(Offer.signedOrder.takerAssetAmount),
      makerAssetData: Offer.signedOrder.makerAssetData,
      takerAssetData: Offer.signedOrder.takerAssetData,
      makerFee: new BigNumber(Offer.signedOrder.makerFee),
      takerFee: new BigNumber(Offer.signedOrder.takerFee),
      signature: Offer.signedOrder.signature
    }

    // Fill the Order via 0x.js Exchange contract
    var txHash = await contractWrappers.exchange.fillOrderAsync(acceptedSignedOrder, acceptedSignedOrder.takerAssetAmount, this.state.accounts[0], {
        gasLimit: 400000,
    });

    console.log('Order Filled');
    pe.stop();

    await this.LoadAccountInfo();
  }

  render() {
    const userTokens = this.state.userTokens;
    const accounts = this.state.accounts;
    const challenges = this.state.challenges;
    const tokenCounts = this.state.tokenCounts;
    const filteredRequests = this.state.filteredRequests;
    const offers = this.state.offers;
    const isProxyApproved = this.state.isProxyApproved;

    var trade = (<Panel>
                  <Panel.Heading>
                    <Panel.Title componentClass="h3">ACTIVATE TRADING</Panel.Title>
                  </Panel.Heading>
                  <Panel.Body>
                    <Button bsStyle="primary"  onClick={() => this.activateTrading()}>ACTIVATE TRADING</Button>
                  </Panel.Body>
                </Panel>
              )

    if(isProxyApproved){
      trade = "";
    }

    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    var requests = <Alert variant='primary'>Activate Trading To See Token Requests - Someone Might Want Some of Yours!</Alert>
    if(isProxyApproved){
      requests = (filteredRequests.map(request =>
        <Offer key={request.id} request={request} userTokens={userTokens} web3={this.state.web3} account={accounts[0]} refreshPage={this.refreshPage}/>
      ))
    }

    return (
      <div className="App">

        <div>
          <Panel>
            <Panel.Heading>
              <Panel.Title componentClass="h3">YOUR TOKENS<br/> {accounts[0]}</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              <div>
                {userTokens.map(token =>
                  <Token key={ token.id } token={ token } />
                )}
              </div>
            </Panel.Body>
          </Panel>

          { trade }

          <Panel>
            <Panel.Heading>
              <Panel.Title componentClass="h3">AVAILABLE REWARDS</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              <div>
                {challenges.map(challenge =>
                  <Challenge key={challenge.name} challenge={challenge} tokenCounts={tokenCounts} userTokens={userTokens} web3={this.state.web3} account={accounts[0]} isProxyApproved={isProxyApproved} refreshPage={this.refreshPage}/>
                )}
              </div>
            </Panel.Body>
          </Panel>

          <Panel>
            <Panel.Heading>
              <Panel.Title componentClass="h3">OPEN REQUESTS</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              { requests }
            </Panel.Body>
          </Panel>

          <Panel>
            <Panel.Heading>
              <Panel.Title componentClass="h3">OPEN OFFERS</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              {offers.map(offer =>
              <div key={uuid.v4()}>
                <Row>
                  <h3>GET: </h3>
                </Row>
                <Row>
                  {offer.MakerTokens.map(offerToken =>
                    <Col key={uuid.v4()} sm={2} md={2} lg={2}>
                      <Panel>
                        <Panel.Body>
                          <div style={{"height" : "100px"}}>
                            <img role="presentation" style={{"width" : "100%", "height" : "100%"}} src={offerToken.image}/>
                          </div>
                          <strong>{offerToken.tokenOwner}</strong>
                          <br/>
                          <span>{offerToken.tokenType}</span>
                          <br/>
                          <span>{offerToken.id}</span>
                        </Panel.Body>
                      </Panel>
                    </Col>
                  )}
                </Row>
                <Row>
                  <h3>FOR: </h3>
                </Row>
                <Row>
                    {offer.TakerTokens.map(offerToken =>
                      <Col key={uuid.v4()} sm={2} md={2} lg={2}>
                        <Panel>
                          <Panel.Body>
                            <div style={{"height" : "100px"}}>
                              <img role="presentation" style={{"width" : "100%", "height" : "100%"}} src={offerToken.image}/>
                            </div>
                            <strong>{offerToken.tokenOwner}</strong>
                            <br/>
                            <span>{offerToken.tokenType}</span>
                            <br/>
                            <span>{offerToken.id}</span>
                          </Panel.Body>
                        </Panel>
                      </Col>
                    )}
                </Row>
                <Row>
                  <Button bsStyle="primary"  onClick={(e) => this.acceptOffer(e, offer)}>ACCEPT OFFER</Button>
                </Row>
              </div>
              )}
            </Panel.Body>
          </Panel>
        </div>

      </div>
    );
  }
}

export default App;
