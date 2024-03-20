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


class Counter extends React.Component { // 他会比较两个状态相等就不会刷新视图 PureComponent是浅比较
  static defaultProps = {
    name: '珠峰架构'
  };
  constructor(props) {
    super(props);
    this.state = { number: 0 }
    console.log('Counter 1.constructor')
  }
  componentWillMount() { // 取本地的数据 同步的方式：采用渲染之前获取数据，只渲染一次
    console.log('Counter 2.componentWillMount');
  }
  componentDidMount() {
    console.log('Counter 4.componentDidMount');
  }
  handleClick = () => {
    this.setState({ number: this.state.number + 1 });
  };
  // react可以shouldComponentUpdate方法中优化 PureComponent 可以帮我们做这件事
  shouldComponentUpdate(nextProps, nextState) { // 代表的是下一次的属性 和 下一次的状态
    console.log('Counter 5.shouldComponentUpdate');
    return nextState.number % 2 === 0;
    // return nextState.number!==this.state.number; //如果此函数种返回了false 就不会调用render方法了
  } //不要随便用setState 可能会死循环
  componentWillUpdate() {
    console.log('Counter 6.componentWillUpdate');
  }
  componentDidUpdate() {
    console.log('Counter 7.componentDidUpdate');
  }
  render() {
    console.log('Counter 3.render');
    return (
      <div>
        <p>{this.state.number}</p>
        <button onClick={this.handleClick}>+</button>
      </div>
    )
  }
}
ReactDOM.render(<Counter />, document.getElementById('root'));

/**
Counter 1.constructor
Counter 2.componentWillMount
Counter 3.render
Counter 4.componentDidMount
2 Counter 5.shouldComponentUpdate
Counter 6.componentWillUpdate
Counter 3.render
Counter 7.componentDidUpdate
2 Counter 5.shouldComponentUpdate
Counter 6.componentWillUpdate
Counter 3.render
Counter 7.componentDidUpdate
*/


import { findDOM, compareTwoVdom } from './react-dom';
export let updateQueue = {
  isBatchingUpdate: false,
  updaters: [],
  batchUpdate() {//批量更新
    updateQueue.isBatchingUpdate = false;
    for (let updater of updateQueue.updaters) {
      updater.updateComponent();
    }
    updateQueue.updaters.length = 0;
  }
}
class Updater {
  constructor(classInstance) {
    this.classInstance = classInstance;
    this.pendingStates = [];
    this.callbacks = [];
  }
  addState(partialState, callback) {
    this.pendingStates.push(partialState);///等待更新的或者说等待生效的状态
    if (typeof callback === 'function')
      this.callbacks.push(callback);//状态更新后的回调
    this.emitUpdate();
  }
  emitUpdate(nextProps) {
    this.nextProps = nextProps;
    if (updateQueue.isBatchingUpdate) {
      updateQueue.updaters.push(this);
    } else {
      this.updateComponent();
    }
  }
  updateComponent() {
    let { classInstance, pendingStates } = this;
    if (this.nextProps || pendingStates.length > 0) {
      shouldUpdate(classInstance, this.nextProps, this.getState());
    }
  }
  getState() {
    let { classInstance, pendingStates } = this;
    let { state } = classInstance;
    pendingStates.forEach((nextState) => {
      if (typeof nextState === 'function') {
        nextState = nextState(state);
      }
      state = { ...state, ...nextState };
    });
    pendingStates.length = 0;
    return state;
  }
}
function shouldUpdate(classInstance, nextProps, nextState) {
  +    let willUpdate = true;
  +    if (classInstance.shouldComponentUpdate
    +        && !classInstance.shouldComponentUpdate(nextProps, nextState)) {
    +            willUpdate = false;
    +    }
  +    if (willUpdate && classInstance.componentWillUpdate) {
    +        classInstance.componentWillUpdate();
    +    }
  +    if (nextProps) {
    +        classInstance.props = nextProps;
    +    }
  +    classInstance.state = nextState;
  +    if (willUpdate) classInstance.forceUpdate();
}
export class Component {
  static isReactComponent = true;
  constructor(props) {
    this.props = props;
    this.state = {};
    this.updater = new Updater(this);
  }
  setState(partialState, callback) {
    this.updater.addState(partialState, callback);
  }
  forceUpdate() {
    let oldRenderVdom = this.oldRenderVdom;
    let oldDOM = findDOM(oldRenderVdom);
    let newRenderVdom = this.render();
    compareTwoVdom(oldDOM.parentNode, oldRenderVdom, newRenderVdom);
    this.oldRenderVdom = newRenderVdom;
    +       if (this.componentDidUpdate) {
      +           this.componentDidUpdate(this.props, this.state);
      +       }
  }
}


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


import { REACT_TEXT, REACT_FORWARD_REF_TYPE } from './constants';
import { addEvent } from './event';

function render(vdom, parentDOM) {
  let newDOM = createDOM(vdom)
  if (newDOM) {
    parentDOM.appendChild(newDOM);
    +       if (newDOM._componentDidMount) newDOM._componentDidMount();
  }
}
export function createDOM(vdom) {
  let { type, props, ref } = vdom;
  let dom;
  if (type && type.$$typeof === REACT_FORWARD_REF_TYPE) {
    return mountForwardComponent(vdom);
  } else if (type === REACT_TEXT) {
    dom = document.createTextNode(props);
  } else if (typeof type === "function") {
    if (type.isReactComponent) {
      return mountClassComponent(vdom);
    } else {
      return mountFunctionComponent(vdom);
    }
  } else {
    dom = document.createElement(type);
  }
  if (props) {
    updateProps(dom, {}, props);
    if (typeof props.children == "object" && props.children.type) {
      mount(props.children, dom);
    } else if (Array.isArray(props.children)) {
      reconcileChildren(props.children, dom);
    }
  }
  vdom.dom = dom;
  if (ref) ref.current = dom;
  return dom;
}
function mountForwardComponent(vdom) {
  let { type, props, ref } = vdom;
  let renderVdom = type.render(props, ref);
  vdom.oldRenderVdom = renderVdom;
  return createDOM(renderVdom);
}
function mountClassComponent(vdom) {
  let { type, props, ref } = vdom;
  let classInstance = new type(props);
  + if (ref) ref.current = classInstance;
  + if (classInstance.componentWillMount) classInstance.componentWillMount();
  let renderVdom = classInstance.render();
  classInstance.oldRenderVdom = renderVdom;
  let dom = createDOM(renderVdom);
  + if (classInstance.componentDidMount)
    +   dom.componentDidMount = classInstance.componentDidMount.bind(classInstance);
  return dom;
}
function mountFunctionComponent(vdom) {
  let { type, props } = vdom;
  let renderVdom = type(props);
  vdom.oldRenderVdom = renderVdom;
  return createDOM(renderVdom);
}
function updateProps(dom, oldProps = {}, newProps = {}) {
  for (let key in newProps) {
    if (key === 'children') {
      continue;
    } else if (key === 'style') {
      let styleObj = newProps[key];
      for (let attr in styleObj) {
        dom.style[attr] = styleObj[attr];
      }
    } else if (key.startsWith('on')) {
      addEvent(dom, key.toLocaleLowerCase(), newProps[key]);
    } else {
      dom[key] = newProps[key];
    }
  }
  for (let key in oldProps) {
    if (!newProps.hasOwnProperty(key)) {
      dom[key] = null;
    }
  }
}
export function findDOM(vdom) {
  let { type } = vdom;
  let dom;
  if (typeof type === 'function') {
    dom = findDOM(vdom.oldRenderVdom);
  } else {
    dom = vdom.dom;
  }
  return dom;
}
export function compareTwoVdom(parentDOM, oldVdom, newVdom) {
  let oldDOM = findDOM(oldVdom);
  let newDOM = createDOM(newVdom);
  parentDOM.replaceChild(newDOM, oldDOM);
}
function reconcileChildren(childrenVdom, parentDOM) {
  for (let i = 0; i < childrenVdom.length; i++) {
    mount(childrenVdom[i], parentDOM);
  }
}
const ReactDOM = {
  render,
};
export default ReactDOM;