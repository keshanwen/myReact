// import React from 'react';
import React from './react/react';
// import ReactDOM from 'react-dom';
import ReactDOM from './react/react-dom';



// console.log(JSON.stringify(element1, null, 2));

class ClassComponent extends React.Component {
  render() {
    return <div className='title' style={{ color: 'red' }}><span>{this.props.name}</span>{ this.props.children }</div>
  }
}

let element = <ClassComponent name="hello">world i am classComponent</ClassComponent>


ReactDOM.render(element, document.getElementById('root'));
