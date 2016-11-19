import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import createLogger from 'redux-logger'

import rootReducer from './reducers'
import rootSaga from './sagas'

export default function configure(initialState) {

  const create = window.devToolsExtension
    ? window.devToolsExtension()(createStore)
    : createStore

  const sagaMiddleware = createSagaMiddleware()

  const createStoreWithMiddleware = applyMiddleware(
    createLogger(),      
    sagaMiddleware
  )(create)

  const store = createStoreWithMiddleware(rootReducer, initialState)

  if (module.hot) {
    console.log('you should not see this in production.')
    module.hot.accept('./reducers', () => {
      const nextReducer = require('./reducers')
      store.replaceReducer(nextReducer)
    })
  }

  sagaMiddleware.run(rootSaga)

  return store
}
