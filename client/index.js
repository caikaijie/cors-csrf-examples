import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import React from 'react'

import configure from './store'
import App from './containers/App'
import './style'

const store = configure()

ReactDOM.render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('root')
)
