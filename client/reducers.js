import { combineReducers } from 'redux'
import { handleActions } from 'redux-actions'
import { reducer as formReducer } from 'redux-form'

import * as t from './actionTypes'
import * as c from './constants'

const appInitialState = {
  serverlogs: [],
  clientlogs: []
}

const app = handleActions({
  [t.ADD_LOG](state, action) {
    const { type } = action.payload
    if (type === c.TYPE_CLIENT_LOG) {
      return {
        ...state, 
        clientlogs: state.clientlogs.concat(action.payload) }
    }
    if (type === c.TYPE_SERVER_LOG) {
      return {
        ...state,
        serverlogs: state.serverlogs.concat(action.payload)
      }
    }
    return {
      ...state,
      clientlogs: state.clientlogs.concat({ type, message: `add unknown type: ${type}` })
    }
  },
  [t.CLEAR_LOGS](state, action) {
    const type = action.payload
    if (type === c.TYPE_CLIENT_LOG) {
      return {
        ...state, 
        clientlogs: [] }
    }
    if (type === c.TYPE_SERVER_LOG) {
      return {
        ...state,
        serverlogs: []
      }
    }
    return state
  }
}, appInitialState)

export default combineReducers({
  app,
  form: formReducer
})
