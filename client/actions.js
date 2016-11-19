import { createAction } from 'redux-actions'

import * as t from './actionTypes'

export const addLog = createAction(t.ADD_LOG)

export const clearLogs = createAction(t.CLEAR_LOGS)

// saga actions
export const doXHR = createAction(t.DO_XHR)
