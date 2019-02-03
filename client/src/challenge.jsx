import React from 'react';
import {Col, Row, Button, Modal } from 'react-bootstrap';
import ChallengeToken from './ChallengeToken';
import NumericInput from 'react-numeric-input';
import uuid from 'uuid';
import { getContractAddress, getTokenMeta } from './utils/contract-helper';

let axios = require('axios');

export default class Challenge extends React.Component {

  state = {
    challengeComplete: true,
    show: false,
  }

  constructor(props, context) {
      super(props, context);
      this.handleBuy = this.handleBuy.bind(this);
      this.handleClaim = this.handleClaim.bind(this);
      this.handleClose = this.handleClose.bind(this);
      this.handleTradeQty = this.handleTradeQty.bind(this);
      this.handleWantQty = this.handleWantQty.bind(this);
      this.handleRequest = this.handleRequest.bind(this);

      this.wantTokens = {};
      this.tradeTokens = {};
  }

  challengeNotComplete = () => {
    this.setState({
      challengeComplete: false
    })
  }

  handleBuy() {
    console.log('Buying...')
    this.setState({ show: true });
  }

  handleClaim() {
    console.log('Claiming...')
  }

  handleClose() {
    this.setState({ show: false });
  }

  handleTradeQty(e, string, input) {
    var id = input.className;
    this.tradeTokens[id] = string;
    // console.log(this.tradeTokens);
  }

  handleWantQty(e, string, input) {
    var id = input.className;
    this.wantTokens[id] = string;
    console.log('test')
    // console.log(this.wantTokens);
  }

  test(qty, token){
    token.requestAmount = qty;
    console.log(token)
    console.log(qty)
    this.wantTokens[token.id] = token;
  }

  handleRequest(){
    var swapTokens = [];
    for(var i = 0;i < this.props.userTokens.length;i++){
      swapTokens.push(
        this.props.userTokens[i]
        //address: this.props.userTokens[i].address,
        //id: this.props.userTokens[i].id
      )
      //swapTokens.push({address: , id: })
    }

    this.SendRequests(swapTokens);
  }

  async SendRequests(SwapTokens){
    var contractAddress = await getContractAddress();
    console.log('Contract Address: ' + contractAddress);

    console.log('Want Tokens: ')
    console.log(this.wantTokens)

    for(var tokenId in this.wantTokens){
      var token = this.wantTokens[tokenId];

      var request = {
        requestTokenAddress: contractAddress,
        requestTokenId: token.id,
        tokenOwner: token.tokenOwner,
        tokenType: token.tokenType,
        requestAmount: token.requestAmount,
        swaps: SwapTokens
      }

      console.log('Posting Request: ')
      console.log(request)

      var response = await axios.post('http://localhost:3000/request?networkId=50', request);

      console.log('Response: ' + response.status);

      var relayRequestId = response.data.id;
    }

    this.setState({show: false});
  }

  render() {

    var challenge = this.props.challenge;
    var challengeTokens = this.props.challenge.requiredTokens;
    var tokenCounts = this.props.tokenCounts;
    var challengeComplete = this.state.challengeComplete;
    var userTokens = this.props.userTokens;

    var button = <Button bsStyle="primary"  onClick={this.handleClaim}>CLAIM</Button>;
    if(!challengeComplete){
      button = <Button bsStyle="primary"  onClick={this.handleBuy}>TRADE TOKENS</Button>;
    }

    return(
      <div>
        <Row className="show-grid">
          <Col sm={1} md={1} lg={1}>
            <h2>{ challenge.name }</h2>
          </Col>
          {challengeTokens.map(token =>
              <ChallengeToken key={ uuid.v4() } token={ token } tokenCount={tokenCounts[token.tokenType]} challengeComplete={challengeComplete} challengeNotComplete={this.challengeNotComplete}/>
          )}
          <Col sm={1} md={1} lg={1}>
              { button }
          </Col>
        </Row>

        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Make Your Offer</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Want:
            {challengeTokens.map(token =>
              <Row key={uuid.v4()}>
                <Col sm={1} md={1} lg={1}>
                  <img role="presentation" style={{"width" : "100%"}} src={token.image}/>
                  <strong>{token.tokenOwner} </strong> <span>{token.tokenType}</span><br/>
                </Col>
                <Col sm={1} md={1} lg={1}>
                  Qty

                  <NumericInput className={token.id.toString()} min={0} max={20} value={0} onChange={(e) => this.test(e, token)}/>

                </Col>
              </Row>
            )}
            {/*
            Trade:
            {userTokens.map(token =>
              <Row key={uuid.v4()}>
                <Col sm={1} md={1} lg={1}>
                  <img role="presentation" style={{"width" : "100%"}} src={token.image}/>
                  <strong>{token.tokenOwner} </strong> <span>{token.tokenType}</span><br/>
                </Col>
                <Col sm={1} md={1} lg={1}>
                  Qty
                  <NumericInput className={token.tokenType} min={0} max={1} value={0} onChange={this.handleTradeQty}/>

                </Col>
              </Row>
            )}
            */}

            <h2>Your Request Will Be Sent And Offers Returned</h2>

            <Button bsStyle="primary"  onClick={this.handleRequest}>REQUEST</Button>
          </Modal.Body>
        </Modal>
      </div>
    );

  }
}
