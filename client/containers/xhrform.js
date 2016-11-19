import React, { Component, PropTypes } from 'react'
import { reduxForm, propTypes } from 'redux-form'
import { Button } from 'components/button'
import style from './style'

const fields = [ 'method', 'headers', 'contenttype', 'credentials', 'resource' ]

class CheckList extends Component {
  static propTypes = {
    value: PropTypes.array,
    list: PropTypes.array,
    onChange: PropTypes.func
  }

  handleChange = (c) => {
    const { value = [], onChange } = this.props
    let newValue = []
    // console.log(c, value)
    if ( value.indexOf(c) === -1) {
      newValue = value.concat(c)
    } else {
      newValue = value.filter((v) => v !== c)
    }
    onChange(newValue)
  }

  render() {
    const { value = [], list = [] } = this.props
    // console.log(value, list)    
    
    return (
    <ul className={style.checklist}>
      {(list).map((c, idx) => <li key={idx}>
        <input 
          type="checkbox" 
          checked={value.some((v) => c === v)}
          onChange={this.handleChange.bind(this, c)}/>
        <span> {c}</span>
      </li>)}
    </ul>
    )
  }
}

function fieldsValue(fields) {
  const values = {}
  for (const k in fields) {
    values[k] = fields[k].value
  }
  return values
}

class XHRForm extends Component {
  static propTypes = {
    doXHR: PropTypes.func,
    ...propTypes
  }

  static requestType(method, headers, contenttype) {
    const notsimple = 'not simple request'
    const simple = 'simple request'

    if ('HEAD GET POST'.split(' ').indexOf(method) === -1) {
      return notsimple
    }
    if (headers.some(
      (h) => 'Accept Accept-Language Content-Language Content-Type'.split(' ').indexOf(h) === -1
    )) {
      return notsimple
    }
    if (contenttype !== 'NONE' &&
      'multipart/form-data application/x-www-form-urlencoded text/plain'.split(' ').indexOf(contenttype) === -1
    ) {
      return notsimple
    }
    return simple
  }

  render() {
    const { fields, doXHR } = this.props
    const { method, headers, contenttype, credentials, resource } = fields
    const requestType = XHRForm.requestType(method.value, headers.value, contenttype.value)

    return (
      <form className={style.form}>
        <header>
          <a 
            style={ { border: 'none', lineHeight: 2 } }
            target="_blank"
            href="https://developer.mozilla.org/en/docs/Web/HTTP/Access_control_CORS#Simple_requests">
            Requests Type         
          </a>
          <strong>: {requestType}</strong>
        </header>
        <label htmlFor="">
          method: 
          <select {...{ value: method.value, onChange: method.onChange }}>
            {'HEAD GET POST DELETE PUT'.split(' ').map((m, idx) => <option key={idx} value={m}>{m}</option>)}
          </select>
        </label>
        <label htmlFor="">
          resources: 
          <select {...{ value: resource.value, onChange: resource.onChange }}>
            {
              '/private/resource /public/resource /public/credentials-resource'
              .split(' ')
              .map((m, idx) => <option key={idx} value={m}>{m}</option>)
            }
          </select>
          <ul>
            <li>/private/resource deny all cross-orgin access.</li>
            <li>/public/resource enable CORS.</li>
            <li>/public/credentials-resource enable CORS with credentials(cookies).</li>
          </ul>
        </label>
        <label htmlFor="">
          headers:
          <CheckList 
            list={'Accept Accept-Language Content-Language Content-Type X-XXX-HEADER'.split(' ')}
            {...{ value: headers.value, onChange: headers.onChange }}/>
        </label>
        <label htmlFor="">
          credentials:
          <CheckList 
            list={[ 'true' ]}
            {...{ value: credentials.value, onChange: credentials.onChange }}/>
            <span>You should <a href="http://127.0.0.1:3001" target="_blank">log in</a>first to get cookies set.</span>
        </label>
        <label htmlFor="">
          content-type: 
          <select {...{ value: contenttype.value, onChange: contenttype.onChange }}>
            {'NONE multipart/form-data application/x-www-form-urlencoded text/plain application/json application/xml'
            .split(' ').map((m, idx) => <option key={idx} value={m}>{m}</option>)}
          </select>
        </label>
        <Button
          label="START"
          onClick={(e) => {
            e.preventDefault() 
            doXHR({ type: requestType, values: fieldsValue(fields) })
          }}/>
      </form>
    )
  }
}

export default reduxForm({
  form: 'xhrForm',
  fields,
  initialValues: {
    method: 'GET',
    headers: [],
    credentials: [],
    contenttype: 'NONE',
    resource: '/private/resource'
  }
})(XHRForm)
