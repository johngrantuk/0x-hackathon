import React from 'react';
import {Col, Panel } from 'react-bootstrap';
import uuid from 'uuid';

export default class ChallengeToken extends React.Component {

    render() {
      var token = this.props.token;                   // Challenge token - there can be more than one of the same Owner/Type required
      var tokenCount = this.props.tokenCount;         // This is how many of the Owner/Type the current user has

      var tokens = [];                                // Holds UI

      for(var i = 0;i < token.qty;i++){               // Add a token UI for every token required for challenge

        var isOwned = 'Not Owned';
        var isOwnedStyle = {backgroundColor: '#cccccc'};

        if(tokenCount > 0){                           // Check that we haven't reached all the tokens the owner has
          isOwned = 'Owned';
          tokenCount--;
          isOwnedStyle = {}
        }else if(this.props.challengeComplete){
          this.props.challengeNotComplete();
        }

        tokens.push(
          <Col key={ uuid.v4() } sm={2} md={2} lg={2}>
            <Panel style={isOwnedStyle}>

              <Panel.Body>
                <div style={{"height" : "100px"}}>
                  <img role="presentation" style={{"width" : "100%", "height" : "100%"}} src={token.image}/>
                </div>
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
