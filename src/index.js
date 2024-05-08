/*  import React from './react/react';
import ReactDOM from './react/react-dom'; */

import React from 'react';
import ReactDOM from 'react-dom';

const loading = message => OldComponent => {
  return class extends React.Component {
    render() {
      const state = {
        show: () => {
          console.log('show', message)
        },
        hide: () => {
          console.log('hide', message)
        }
      }

      return (
        <OldComponent {...this.props} {...state} {...{...this.props, ...state }}></OldComponent>
      )
    }
  }
}

@loading('消息')
class Hello extends React.Component {
  render() {
    return <div>hello <button onClick={this.props.show}>show</button><button onClick={this.props.hide}>hide</button></div>
  }
}

let LoadingHello = loading('消息')(Hello)


ReactDOM.render(
  <LoadingHello></LoadingHello>, document.getElementById('root')
)