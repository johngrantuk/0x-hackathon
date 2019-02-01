import React from 'react';
import {Col, Row, Button, Modal } from 'react-bootstrap';
import ChallengeToken from './ChallengeToken';
import NumericInput from 'react-numeric-input';
import uuid from 'uuid';

export default class Challenge extends React.Component {

  state = {
    challengeComplete: true,
    show: false,
    wantTokens: {},
    tradeTokens: {},
    qty: 0
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
    console.log(this.tradeTokens);
  }

  handleWantQty(e, string, input) {
    var id = input.className;
    this.wantTokens[id] = string;
    console.log(this.wantTokens);

  }

  handleRequest(){
    var swapTokens = [];
    for(var i = 0;i < this.props.userTokens.length;i++){
      swapTokens.push({address: this.props.userTokens[i].address, id: this.props.userTokens[i].id})
      //swapTokens.push({address: , id: })
    }

    console.log('Swap Tokens: ');
    console.log(swapTokens);

    console.log('Want Tokens:')
    console.log(this.wantTokens)

    var takeQtys = [];
    var takeAssets = [];
    for(var id in this.wantTokens){
      takeQtys.push(this.wantTokens[id]);
      takeAssets.push(id); // This will be encode721...
    }

    console.log('take MultiAsset: ')
    console.log(takeQtys)
    console.log(takeAssets)

    var makeQtys = [];
    var makeAssets = [];
    for(var id in this.tradeTokens){
      makeQtys.push(this.tradeTokens[id]);
      makeAssets.push(id); // This will be encode721...
    }
    // assetDataUtils.encodeERC721AssetData(cardInstance.address, specialIrnBruTokenId)
    /*
    const takerAssetData = assetDataUtils.encodeMultiAssetData(
        [new BigNumber(1), new BigNumber(1)],
        [client4irnBruTakerAssetData, client4WaterTakerAssetData],
    );
    */
  }
  /*
  // Post request
  var request = {
    requestTokenAddress: cardInstance.address,
    requestTokenId: client4milkId,
    tokenOwner: 'MilkMan',
    tokenType: 'Milk',
    requestAmount: milkRequestAmount, // THIS WILL BE 1 FOR MultiAsset
    swaps: [{address: cardInstance.address, id: specialIrnBruTokenId}, {address: cardInstance.address, id: waterTokenId}, {address: cardInstance.address, id: coffeeTokenId}]
  }

  var response = await axios.post('http://localhost:3000/request?networkId=50', request);
  assert.equal(response.status, 200);

  var relayRequestId = response.data.id;
  */

  render() {

    var challenge = this.props.challenge;
    var challengeTokens = this.props.challenge.requiredTokens;
    var tokenCounts = this.props.tokenCounts;
    var challengeComplete = this.state.challengeComplete;
    var userTokens = this.props.userTokens;

    var challengeState = 'Complete';
    var button = <Button bsStyle="primary"  onClick={this.handleClaim}>CLAIM</Button>;
    if(!challengeComplete){
      challengeState = 'No Way';
      button = <Button bsStyle="primary"  onClick={this.handleBuy}>TRADE TOKENS</Button>;
    }

    return(
      <div>
        <Row className="show-grid">
          <Col sm={1} md={1} lg={1}>
            { challenge.name } {challengeState}
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

                  <NumericInput className={token.id.toString()} min={0} max={20} value={0} onChange={this.handleWantQty}/>

                </Col>
              </Row>
            )}
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

            <Button bsStyle="primary"  onClick={this.handleRequest}>REQUEST</Button>
          </Modal.Body>
        </Modal>
      </div>
    );

  }
}
