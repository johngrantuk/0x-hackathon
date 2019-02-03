import React from 'react';
import {Col, Panel } from 'react-bootstrap';

export default class Token extends React.Component {

    render() {

      var token = this.props.token;

      return(
        <div>
          <Col sm={2} md={2} lg={2}>
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3"><img role="presentation" style={{"width" : "100%"}} src={token.image}/></Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <strong>{token.tokenOwner}</strong>
                <br/>
                <span>{token.name}</span>
                <br/>
                <span>{token.id}</span>
              </Panel.Body>
            </Panel>
          </Col>
        </div>
      );
    }
}
