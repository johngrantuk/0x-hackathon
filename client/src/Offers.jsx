import React from 'react';
import {Col, Panel } from 'react-bootstrap';

export default class Offers extends React.Component {

    render() {

      var token = this.props.token;

      return(
        <div>
          <Col sm={2} md={2} lg={2}>
            <Panel>
              <Panel.Body>
                <div style={{"height" : "100px"}}>
                  <img role="presentation" style={{"width" : "100%", "height" : "100%"}} src={token.image}/>
                </div>
                <strong>{token.tokenOwner}</strong>
                <br/>
                <span>{token.name}</span>
                <br/>
                <span>ID: {token.id}</span>
              </Panel.Body>
            </Panel>
          </Col>
        </div>
      );
    }
  }
