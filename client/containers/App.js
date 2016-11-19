import React, { PropTypes, Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Console from 'components/console'
import Card from 'components/card'
import { clientlogsSelector, serverlogsSelector } from '../selectors'
import * as actions from '../actions'
import * as c from '../constants'
import XHRForm from './xhrform'
import style from './style.scss'

class Embedding extends Component {
  render() {
    return (
    <Card title="Embedding">
      <p>Cross-origin embedding is typically ALLOWED.</p>
      <hr className={style.solid}/>
      <p>
        <span className={window.CROSSDOMAIN ? (window.CROSSDOMAIN() ? 'crossdomain' : '') : ''}/>
        If red block appears, it means JavaScript(also JSONP) and CSS can be embedded cross-origin.
      </p>
    </Card>
    )
  }
}

class ReadWrite extends Component {
  static propTypes = {
    actions: PropTypes.object
  }

  componentDidMount() {
    // auto submit
    // this.refs.button.click()
  }

  render() {
    const { actions } = this.props

    return (
    <Card title="Read & Write">
      <p>Cross-origin reads(reads response) are typically NOT ALLOWED.</p>
      <p>Cross-origin writes(sends requests) are typically ALLOWED.</p>
      <hr className={style.solid}/>
      <p><a href="http://127.0.0.1:3001/private-api/link-action?any=query" target="_blank">/private-api/link-action</a>Links are ALLOWED.</p>
      <hr/>
      <p><a href="" onClick={(e)=>{e.preventDefault(); window.location='http://127.0.0.1:3001'}}>Redirects</a>are ALLOWED.</p>
      <hr/>      
      <p>(TODO)Cross-origin read info(such as pixels) from images and canvas are NOT ALLOWED.</p>
      <hr/>
      <form action="http://127.0.0.1:3001/private-api/form-action" method="POST" target="_blank">
        <input type="text" readOnly name="any" value="any input"/>
        <button ref="button">submit to another domain</button>
        <p>Submit forms(even automatically) are ALLOWED. Reading submit responses are NOT ALLOWED.</p>
      </form>
      <hr/>
      <div>
        <XHRForm doXHR={actions.doXHR}/>
      </div>
    </Card>
    )
  }
}

class App extends Component {
  static propTypes = {
    clientlogs: PropTypes.array,
    serverlogs: PropTypes.array,
    actions: PropTypes.object
  }

  render() {
    const { clientlogs, serverlogs, actions } = this.props
    return (
      <div className={style.root}>
        <div className={style.main}>
          <h3>
            Cross-origin network access
            <a
              target="_blank"
              href="https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy#Cross-origin_network_access">
              detail
            </a>
          </h3>
          <Embedding/>
          <br/>
          <ReadWrite actions={actions}/>
          <h3>
            Cross-origin script API access
            <a 
              target="_blank"            
              href="https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy#Cross-origin_script_API_access">
              detail
            </a>
          </h3>
          <p>TODO</p>
        </div>
        <div className={style.client}>
          <Console
            title="Client Logs"
            logs={clientlogs}
            onClear={actions.clearLogs.bind(null, c.TYPE_CLIENT_LOG)}/>        
        </div>
        <div className={style.server}>
          <Console 
            title="Server Logs"
            logs={serverlogs} 
            onClear={actions.clearLogs.bind(null, c.TYPE_SERVER_LOG)}/>        
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return { 
    clientlogs: clientlogsSelector(state),
    serverlogs: serverlogsSelector(state)
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...actions }, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
