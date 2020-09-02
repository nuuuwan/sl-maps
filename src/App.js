import React, {Component} from 'react';
import './App.css';

import HomePage from './maps_lk/HomePage.js';

class App extends Component {
  render() {
    return (
      <div className="App">
        <HomePage dataInfoKey={this.props.match.params.dataInfoKey}/>
      </div>
    );
  }
}

export default App;
