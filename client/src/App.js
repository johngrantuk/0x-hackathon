import React, { Component } from "react";
import getWeb3 from "./utils/getWeb3";
import { Panel } from 'react-bootstrap';
import Token from './token';
import Challenge from './challenge';

// import { Web3Wrapper } from '@0x/web3-wrapper';
import "./App.css";

import { getAccountInfo } from './utils/contract-helper';

let axios = require('axios');


class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    tokens: []
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
      var tokens = tokenInfo[0];
      var tokenCounts = tokenInfo[1];
      console.log('tokens:')
      console.log(tokens)

      var challenges = await axios.get('http://localhost:3000/challenges', { params: { networkId: networkId}});

      var response = await axios.get('http://localhost:3000/filteredrequestsbynames', {
        params: {
          networkId: 50,
          tokens: [{tokenOwner: 'CocaCola', tokenType: 'Coke'}]
        }
      });

      this.setState({
        tokens: tokens,
        challenges: challenges.data,
        tokenCounts: tokenCounts
      });

      this.setState({ web3, accounts });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  render() {
    const tokens = this.state.tokens;
    const accounts = this.state.accounts;
    const challenges = this.state.challenges;
    const tokenCounts = this.state.tokenCounts;

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
                {tokens.map(token =>
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
                  <Challenge key={challenge.name} challenge={ challenge} tokenCounts={tokenCounts} />
                )}
              </div>
            </Panel.Body>
          </Panel>

          <Panel>
            <Panel.Heading>
              <Panel.Title componentClass="h3">TRADE</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              Panel content
            </Panel.Body>
          </Panel>
        </div>

      </div>
    );
  }
}

export default App;
