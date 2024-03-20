import React from 'react';
import ReactDOM from 'react-dom';
/* class Sum extends React.Component {
  a
  b
  result
  constructor(props) {
    super(props);
    this.a = React.createRef();
    this.b = React.createRef();
    this.result = React.createRef();
  }
  handleAdd = () => {
    let a = this.a.current.value;
    let b = this.b.current.value;
    this.result.current.value = a + b;
  }
  render() {
    return (
      <>
        <input ref={this.a} />+<input ref={this.b} /><button onClick={this.handleAdd}>=</button><input ref={this.result} />
      </>
    );
  }
}
ReactDOM.render(
  <Sum />,
  document.getElementById('root')
); */

/* class Form extends React.Component {
  input
  constructor(props) {
    super(props);
    this.input = React.createRef();
  }
  getFocus = () => {
    this.input.current.getFocus();
  }
  render() {
    return (
      <>
        <TextInput ref={this.input} />
        <button onClick={this.getFocus}>获得焦点</button>
      </>
    );
  }
}
class TextInput extends React.Component {
  input
  constructor(props) {
    super(props);
    this.input = React.createRef();
  }
  getFocus = () => {
    this.input.current.focus();
  }
  render() {
    return <input ref={this.input} />
  }
}
ReactDOM.render(
  <Form />,
  document.getElementById('root')
); */


/* const TextInput = React.forwardRef((props, ref) => (
  <input ref={ref} />
));
class Form extends React.Component {
  input
  constructor(props) {
    super(props);
    this.input = React.createRef();
  }
  getFocus = () => {
    console.log(this.input.current);

    this.input.current.focus();
  }
  render() {
    return (
      <>
        <TextInput ref={this.input} />
        <button onClick={this.getFocus}>获得焦点</button>
      </>
    );
  }
}

ReactDOM.render(
  <Form />,
  document.getElementById('root')
); */

