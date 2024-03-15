// import React from 'react';
import React from './react/react';
// import ReactDOM from 'react-dom';
import ReactDOM from './react/react-dom';



// console.log(JSON.stringify(element1, null, 2));


function FunctionComponent2() {
  return <div>i am Component2</div>
}

function FunctionComponent(props) {
  return <FunctionComponent2></FunctionComponent2>
  // return <div className="title" style={{ color: 'red' }}><span>{props.name}</span>{props.children} i like { props.like }</div>;
}
let element = <FunctionComponent name="hello" like="basketball">world</FunctionComponent>


ReactDOM.render(element, document.getElementById('root'));
