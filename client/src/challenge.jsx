import React from 'react';
import {Col, Row, Panel } from 'react-bootstrap';
import ChallengeToken from './ChallengeToken';

export default class Challenge extends React.Component {

  componentDidMount = async () => {
    console.log('Getting token meta...')
  };

  render() {

    var challenge = this.props.challenge;
    var tokens = this.props.challenge.requiredTokens;
    var tokenCounts = this.props.tokenCounts;


    return(
      <div>
        <Row className="show-grid">
          <Col sm={1} md={1} lg={1}>
            { challenge.name }
          </Col>
          {tokens.map(token =>
              <ChallengeToken key={ token.id } token={ token } tokenCount={tokenCounts[token.tokenType]}/>
          )}
        </Row>
      </div>
    );

  }
}
