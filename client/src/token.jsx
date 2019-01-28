import React from 'react';
import {Col, Panel } from 'react-bootstrap';

export default class Token extends React.Component {

    render() {

      var token = this.props.token;

      return(
        <div>
          <Col sm={1} md={1} lg={1}>
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3"><img role="presentation" style={{"width" : "100%"}} src={token.image}/></Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <strong>{token.tokenOwner}</strong> <span>{token.name}</span><br/>
              </Panel.Body>
            </Panel>
          </Col>
        </div>
      );
    }
}
