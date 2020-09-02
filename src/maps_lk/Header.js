import React, {Component} from 'react';

export default class Header extends Component {
  render() {
    return (
      <div className='div-header'>
        <h1>Maps of <Logo/></h1>
      </div>
    )
  }
}

class Logo extends Component {
  render() {
    return (
      <span>
        <span>S</span>
        <span>r</span>
        <span>i</span>
        <span>{' '}</span>
        <span className='span-logo-maroon'>L</span>
        <span className='span-logo-orange'>a</span>
        <span className='span-logo-yellow'>n</span>
        <span className='span-logo-green'>k</span>
        <span className='span-logo-black'>a</span>
      </span>
    );
  }
}
