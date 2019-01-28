import React from 'react';
import {Col, Panel } from 'react-bootstrap';

export default class ChallengeToken extends React.Component {

    render() {
      var token = this.props.token;
      var tokenCount = this.props.tokenCount;

      var tokens = [];

      for(var i = 0;i < token.qty;i++){

        var isOwned = 'Nope';

        if(tokenCount > 0){
          isOwned = 'Owned';
          tokenCount--;
        }

        tokens.push(
          <Col key={token.key + i} sm={1} md={1} lg={1}>
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3"><img role="presentation" style={{"width" : "100%"}} src={token.image}/></Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <strong>{token.tokenOwner} </strong> <span>{token.tokenType}</span><br/>
                {isOwned}
              </Panel.Body>
            </Panel>
          </Col>
        )
      }

      return(
        <div>
          { tokens }
        </div>
      );
    }
}
