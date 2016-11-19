import { eventChannel } from 'redux-saga'
import { call, put, take } from 'redux-saga/effects'
import io from 'socket.io-client'
import * as actions from './actions'
import * as t from './actionTypes'
import * as c from './constants'

function* socketio() {
  console.log('socketio saga started.')
  const socket = yield call(io.connect, 'http://localhost:3001')
  const ch = eventChannel((emit) => {
    socket.on('serverinfo', function (msg) {
      emit(actions.addLog({ type: c.TYPE_SERVER_LOG, msg }))
    })
    return ()=>{
      // unsubscribe
    }
  })
  
  // eslint-disable-next-line no-constant-condition
  while(true) {
    const action = yield take(ch)
    yield put(action)
  }
}

function* xhrsaga() {
  function info(msg) {
    return actions.addLog({ type: c.TYPE_CLIENT_LOG, msg })
  }

  function* doXHR({ type, values }) {
    yield put(info(`starting a ${type}.`))
    // TODO: XDomainRequest
    const { method, headers = [], credentials = [], contenttype, resource } = values
    if (contenttype !== 'NONE' && headers.indexOf('Content-Type') === -1) {
      headers.push('Content-Type')
    }
    const xhr = new XMLHttpRequest()
    xhr.open(method, `http://127.0.0.1:3001${resource}`, true)
    xhr.withCredentials = credentials.length === 1
    headers.map((h) => {
      switch(h) {
        case 'Accept':
          return [ h, '*/*' ]
        case 'Accept-Language':
          return [ h, '*/*' ]
        case 'Content-Language':
          return [ h, '*/*' ]
        case 'Content-Type':
          return [ h, contenttype === 'multipart/form-data' ? undefined : contenttype ]
        case 'X-XXX-HEADER':
          return [ h, 'XXX' ]
        default:
      }
    }).forEach((h) => {
      if (h[1])
        xhr.setRequestHeader(h[0], h[1])
    })

    let emit
    const onChangeChannel = eventChannel(e => {
      emit = e
      return ()=>{}
    })
    xhr.onreadystatechange = function () {
      if(xhr.readyState === XMLHttpRequest.DONE) {
        emit(`READING response
\tstatus:${xhr.status}
\tresponseText:${xhr.responseText || 'nothing'}
\tresponseHeaders:${xhr.getAllResponseHeaders() || 'nothing'}`)
      }
    }
    let body = undefined
    if (method !== 'GET') {
      //multipart/form-data application/x-www-form-urlencoded text/plain application/json application/xml
      switch (contenttype) {
        case 'text/plain':
          body = 'body'; break
        case 'application/json':
          body = '{"name": "body"}'; break
        case 'application/xml':
          body = '<T>body</T>'; break
        case 'application/x-www-form-urlencoded':
          body = 'name=body'; break
        case 'multipart/form-data': {
          body = new FormData()
          body.append('name', 'value')
          break
        }
        default:
      }
    }
    xhr.send(body)
    const msg = yield take(onChangeChannel)
    yield put(info(msg))
  }

  // eslint-disable-next-line no-constant-condition
  while(true) {
    const action = yield take(t.DO_XHR)
    yield call(doXHR, action.payload)
  }  
}

export default function* rootSaga() {
  yield [
    call(socketio),
    call(xhrsaga)
  ]
}
