import React, { Component } from "react";
import getWeb3 from "./utils/getWeb3";
import { Panel } from 'react-bootstrap';
import Token from './token';
import Challenge from './challenge';
import Offer from './Offer';
import uuid from 'uuid';
import {Col, Row, Button, Modal } from 'react-bootstrap';

// import { Web3Wrapper } from '@0x/web3-wrapper';
import "./App.css";

import { getAccountInfo } from './utils/contract-helper';

let axios = require('axios');


class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    userTokens: []
  };

  componentDidMount = async () => {
    try {
      // <div key={item.id}>ID: {item.id} Balance: {item.balance} Meta: {item.name}</div>
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Load user tokens
      // Load available challenges
      // Check for offers/requests

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();

      var tokenInfo = await getAccountInfo(web3, networkId, accounts);
      var userTokens = tokenInfo[0];
      var tokenCounts = tokenInfo[1];
      //console.log('userTokens:');
      //console.log(userTokens);

      var tokenFilter = [];
      for(var i = 0;i < userTokens.length;i++){
        // console.log(userTokens[i]);
        tokenFilter.push({tokenOwner: userTokens[i].tokenOwner, tokenType: userTokens[i].tokenType})
      }

      console.log('tokenFilters: ')
      console.log(tokenFilter)

      var challenges = await axios.get('http://localhost:3000/challenges', { params: { networkId: networkId}});

      var filteredRequests = await axios.get('http://localhost:3000/filteredrequestsbynames', {
        params: {
          networkId: 50,
          tokens: tokenFilter
        }
      });

      console.log('filteredRequests: ');
      console.log(filteredRequests.data);

      var offers = await axios.get('http://localhost:3000/alloffers', { params: { networkId: networkId}});

      console.log('Offers: ');
      console.log(offers.data)

      this.setState({
        userTokens: userTokens,
        challenges: challenges.data,
        tokenCounts: tokenCounts,
        web3,
        accounts,
        filteredRequests: filteredRequests.data,
        offers: offers.data
      });

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  render() {
    const userTokens = this.state.userTokens;
    const accounts = this.state.accounts;
    const challenges = this.state.challenges;
    const tokenCounts = this.state.tokenCounts;
    const filteredRequests = this.state.filteredRequests;
    const offers = this.state.offers;

    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">

        <div>
          <Panel>
            <Panel.Heading>
              <Panel.Title componentClass="h3">YOUR TOKENS {accounts[0]}</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              <div>
                {userTokens.map(token =>
                  <Token key={ token.id } token={ token } />
                )}
              </div>
            </Panel.Body>
          </Panel>

          <Panel>
            <Panel.Heading>
              <Panel.Title componentClass="h3">AVAILABLE CHALLENGES</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              <div>
                {challenges.map(challenge =>
                  <Challenge key={challenge.name} challenge={challenge} tokenCounts={tokenCounts} userTokens={userTokens} web3={this.state.web3}/>
                )}
              </div>
            </Panel.Body>
          </Panel>

          <Panel>
            <Panel.Heading>
              <Panel.Title componentClass="h3">OPEN REQUESTS</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              {filteredRequests.map(request =>
                <Offer key={request.id} request={request} userTokens={userTokens} web3={this.state.web3} account={accounts[0]}/>
              )}
            </Panel.Body>
          </Panel>

          <Panel>
            <Panel.Heading>
              <Panel.Title componentClass="h3">OPEN OFFERS</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              {offers.map(offer =>
                <Row key={uuid.v4()}>
                  <Col sm={1} md={1} lg={1}>
                    <h1>GET: </h1>
                  </Col>
                  <Col sm={2} md={2} lg={2}>
                    <img role="presentation" style={{"width" : "100%"}} src={offer.Request.image}/>
                    <strong>{offer.Request.tokenOwner}</strong>
                    <br/>
                    <span>{offer.Request.tokenType}</span><br/>
                  </Col>
                  <Col sm={1} md={1} lg={1}>
                    <h1>FOR: </h1>
                  </Col>

                  {offer.Offer.map(offerToken =>
                    <Col sm={2} md={2} lg={2}>
                      <img role="presentation" style={{"width" : "100%"}} src={offerToken.image}/>
                      <strong>{offerToken.tokenOwner}</strong>
                      <br/>
                      <span>{offerToken.tokenType}</span><br/>
                    </Col>
                  )}
                  <Col sm={2} md={2} lg={2}>
                    <Button bsStyle="primary"  onClick={this.acceptOffer}>ACCEPT OFFER</Button>
                  </Col>
                </Row>
              )}
            </Panel.Body>
          </Panel>
        </div>

      </div>
    );
  }
}

export default App;
