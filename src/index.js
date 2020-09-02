import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'

import App from './App.js';

const routing = (
  <Router>
    <Switch>
      <Route exact path="/:dataInfoKey" component={App} />
      <Route exact path="/" component={App} />
    </Switch>
  </Router>
)

ReactDOM.render(routing, document.getElementById('root'))
