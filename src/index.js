// import React from 'react';
import React from './react/react';
// import ReactDOM from 'react-dom';
import ReactDOM from './react/react-dom';


let element1 = (
  <div className="title" style={{ color: "red" }}>
    <span>hello</span>, i am kebi
  </div>
);
// console.log(JSON.stringify(element1, null, 2));


ReactDOM.render(element1, document.getElementById('root'));
