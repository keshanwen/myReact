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

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
+import { REACT_TEXT, REACT_FORWARD_REF_TYPE } from "./constants";
+import { addEvent } from "./event";

function render(vdom, parentDOM) {
  let newDOM = createDOM(vdom)
  if (newDOM) {
    parentDOM.appendChild(newDOM);
    if (newDOM._componentDidMount) newDOM._componentDidMount();
  }
}

function mountClassComponent(vdom) {
  let { type, props, ref } = vdom;
  let classInstance = new type(props);
  + vdom.classInstance = classInstance;
  if (ref) ref.current = classInstance;
  if (classInstance.componentWillMount) classInstance.componentWillMount();
  let renderVdom = classInstance.render();
  classInstance.oldRenderVdom = renderVdom;
  let dom = createDOM(renderVdom);
  if (classInstance.componentDidMount)
    dom.componentDidMount = classInstance.componentDidMount.bind(classInstance);
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
  if (!vdom) return null;
  if (vdom.dom) {//vdom={type:'h1'}
    return vdom.dom;
  } else {
    let renderVdom = vdom.classInstance ? vdom.classInstance.oldRenderVdom : vdom.oldRenderVdom;
    return findDOM(renderVdom);
  }
}
+function unMountVdom(vdom) {
  +    let { type, props, ref } = vdom;
  +    let currentDOM = findDOM(vdom);//获取此虚拟DOM对应的真实DOM
  +    //vdom可能是原生组件span 类组件 classComponent 也可能是函数组件Function
    +    if (vdom.classInstance && vdom.classInstance.componentWillUnmount) {
      +        vdom.classInstance.componentWillUnmount();
      +    }
  +    if (ref) {
    +        ref.current = null;
    +    }
  +    //如果此虚拟DOM有子节点的话，递归全部删除
    +    if (props.children) {
      +        //得到儿子的数组
        +        let children = Array.isArray(props.children) ? props.children : [props.children];
      +        children.forEach(unMountVdom);
      +    }
  +    //把自己这个虚拟DOM对应的真实DOM从界面删除
    +    if (currentDOM) currentDOM.remove();
  +}
  +export function compareTwoVdom(parentDOM, oldVdom, newVdom, nextDOM) {
    +  if (!oldVdom && !newVdom) {
      +    //老和新都是没有
        +    return;
      +  } else if (!!oldVdom && !newVdom) {
        +    //老有新没有
          +    unMountVdom(oldVdom);
        +  } else if (!oldVdom && !!newVdom) {
          +    //老没有新的有
            +    let newDOM = createDOM(newVdom);
          +    if (nextDOM) parentDOM.insertBefore(newDOM, nextDOM);
          +    else parentDOM.appendChild(newDOM);
          +    if (newDOM.componentDidMount) newDOM.componentDidMount();
          +    return;
          +  } else if (!!oldVdom && !!newVdom && oldVdom.type !== newVdom.type) {
            +    //新老都有，但类型不同
              +    let newDOM = createDOM(newVdom);
            +    unMountVdom(oldVdom);
            +    if (newDOM.componentDidMount) newDOM.componentDidMount();
            +  } else {
      +    updateElement(oldVdom, newVdom);
      +  }
    +}
+function updateElement(oldVdom, newVdom) {
  +    if (oldVdom.type === REACT_TEXT) {
    +       let currentDOM = newVdom.dom = findDOM(oldVdom);
    +       if (oldVdom.props !== newVdom.props) {
      +           currentDOM.textContent = newVdom.props;
      +       }
    +       return;
    +    } else if (typeof oldVdom.type === 'string') {
      +        let currentDOM = newVdom.dom = findDOM(oldVdom);
      +        updateProps(currentDOM, oldVdom.props, newVdom.props);
      +        updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children);
      +    } else if (typeof oldVdom.type === 'function') {
        +        if (oldVdom.type.isReactComponent) {
          +            updateClassComponent(oldVdom, newVdom);
          +        } else {
          +            updateFunctionComponent(oldVdom, newVdom);
          +        }
        +    }
  +}
  + function updateFunctionComponent(oldVdom, newVdom) {
    +    let currentDOM = findDOM(oldVdom);
    +    if (!currentDOM) return;
    +    let parentDOM = currentDOM.parentNode;
    +    let { type, props } = newVdom;
    +    let newRenderVdom = type(props);
    +    compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, newRenderVdom);
    +    newVdom.oldRenderVdom = newRenderVdom;
    +}
  + function updateClassComponent(oldVdom, newVdom) {
    +    let classInstance = newVdom.classInstance = oldVdom.classInstance;
    +    if (classInstance.componentWillReceiveProps) {
      +        classInstance.componentWillReceiveProps(newVdom.props);
      +    }
    +    classInstance.updater.emitUpdate(newVdom.props);
    +}
  + function updateChildren(parentDOM, oldVChildren, newVChildren) {
    +    oldVChildren = (Array.isArray(oldVChildren) ? oldVChildren : oldVChildren ? [oldVChildren]).filter(item => item) : [];
    +    newVChildren = (Array.isArray(newVChildren) ? newVChildren : newVChildren ? [newVChildren]).filter(item => item) : [];
    +    let maxLength = Math.max(oldVChildren.length, newVChildren.length);
    +    for (let i = 0; i < maxLength; i++) {
      +       let nextVdom = oldVChildren.find((item, index) => index > i && item && findDOM(item));
      +       compareTwoVdom(parentDOM, oldVChildren[i], newVChildren[i], nextVdom && findDOM(nextVdom));
      +    }
    +}
function reconcileChildren(childrenVdom, parentDOM) {
  for (let i = 0; i < childrenVdom.length; i++) {
    mount(childrenVdom[i], parentDOM);
  }
}
const ReactDOM = {
  render,
};
export default ReactDOM;




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
    console.log('Counter 5.shouldComponentUpdate', nextState.number % 2 === 0);
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
        {/* <ChildCounter count={this.state.number} ></ChildCounter> */}
        {this.state.number === 4 ? null : <ChildCounter count={this.state.number} />}
        <button onClick={this.handleClick}>+</button>
      </div>
    )
  }
}
class ChildCounter extends React.Component {
  componentWillUnmount() {
    console.log('   ChildCounter 6.componentWillUnmount')
  }
  componentWillMount() {
    console.log('  ChildCounter 1.componentWillMount')
  }
  render() {
    console.log('  ChildCounter 2.render')
    return (<div>
      {this.props.count}
    </div>)
  }
  componentDidMount() {
    console.log('  ChildCounter 3.componentDidMount')
  }
  componentWillReceiveProps(newProps) { // 第一次不会执行，之后属性更新时才会执行
    console.log('  ChildCounter 4.componentWillReceiveProps')
  }
  shouldComponentUpdate(nextProps, nextState) {
    console.log('  ChildCounter 5.shouldComponentUpdate', nextProps.count % 3 === 0)
    return nextProps.count % 3 === 0; //子组件判断接收的属性 是否满足更新条件 为true则更新
  }
}
ReactDOM.render(<Counter />, document.getElementById('root'));

/*  class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      number: 0
    }
    console.log('Counter 1.constructor')
  }

  componentWillMount() { // 取本地的数据 同步的方式：采用渲染之前获取数据，只渲染一次
    console.log('Counter 2.componentWillMount');
  }

  componentDidMount() {
    console.log('Counter 4.componentDidMount');
  }

  handleClick = () => {
    this.setState({
      number: this.state.number + 1
    })
  }

  // react可以shouldComponentUpdate方法中优化 PureComponent 可以帮我们做这件事
  shouldComponentUpdate(nextProps, nextState) { // 代表的是下一次的属性 和 下一次的状态
    console.log('Counter 5.shouldComponentUpdate', nextState.number % 2 === 0);
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
      <>
        <div>{this.state.number}</div>
        <button onClick={this.handleClick}>+</button>
      </>
    )
  }
}


ReactDOM.render(<Counter></Counter>, document.getElementById('root')) */

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

import { wrapToVdom } from "./utils";
import { Component } from './Component';
+import { REACT_FORWARD_REF_TYPE, REACT_FRAGMENT } from './constants';
function createElement(type, config, children) {
  let ref;
  let key;
  if (config) {
    delete config.__source;
    delete config.__self;
    ref = config.ref;
    delete config.ref;
    key = config.key;
    delete config.key;
  }
  let props = { ...config };
  if (arguments.length > 3) {
    props.children = Array.prototype.slice.call(arguments, 2).map(wrapToVdom);
  } else {
    props.children = wrapToVdom(children);
  }
  return {
    type,
    ref,
    key,
    props,
  };
}
function createRef() {
  return { current: null };
}
function forwardRef(render) {
  var elementType = {
    $$typeof: REACT_FORWARD_REF_TYPE,
    render: render
  };
  return elementType;
}
const React = {
  createElement,
  Component,
  createRef,
  forwardRef,
  Fragment: REACT_FRAGMENT
};
export default React;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
+import { REACT_TEXT, REACT_FORWARD_REF_TYPE, PLACEMENT, MOVE, REACT_FRAGMENT } from "./constants";
import { addEvent } from "./event";
+import React from './react';
function render(vdom, parentDOM) {
  let newDOM = createDOM(vdom)
  if (newDOM) {
    parentDOM.appendChild(newDOM);
    if (newDOM._componentDidMount) newDOM._componentDidMount();
  }
}
export function createDOM(vdom) {
  let { type, props, ref } = vdom;
  let dom;
  if (type && type.$$typeof === REACT_FORWARD_REF_TYPE) {
    return mountForwardComponent(vdom);
  } else if (type === REACT_TEXT) {
    dom = document.createTextNode(props);
    + } else if (oldVdom.type === REACT_FRAGMENT) {
      +  dom = document.createDocumentFragment();
      + } else if (typeof type === "function") {
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
      +     props.children.mountIndex = 0;
      mount(props.children, dom);
    } else if (Array.isArray(props.children)) {
      reconcileChildren(props.children, dom);
    }
  }
  vdom.dom = dom;
  if (ref) ref.current = dom;
  return dom;
}











function updateChildren(parentDOM, oldVChildren, newVChildren) {
  +  oldVChildren = (Array.isArray(oldVChildren) ? oldVChildren : oldVChildren ? [oldVChildren]).filter(item => item) : [];
  +  newVChildren = (Array.isArray(newVChildren) ? newVChildren : newVChildren ? [newVChildren]).filter(item => item) : [];
  +  let keyedOldMap = {};
  +  let lastPlacedIndex = 0;
  +  oldVChildren.forEach((oldVChild, index) => {
    +    let oldKey = oldVChild.key ? oldVChild.key : index;
    +    keyedOldMap[oldKey] = oldVChild;
    +  });
  +  let patch = [];
  +  newVChildren.forEach((newVChild, index) => {
    +    newVChild.mountIndex = index;
    +    let newKey = newVChild.key ? newVChild.key : index;
    +    let oldVChild = keyedOldMap[newKey];
    +    if (oldVChild) {
      +      updateElement(oldVChild, newVChild);
      +      if (oldVChild.mountIndex < lastPlacedIndex) {
        +        patch.push({
+ type: MOVE,
          +          oldVChild,
          +          newVChild,
          +          mountIndex: index
        +        });
  +      }
+      delete keyedOldMap[newKey];
+      lastPlacedIndex = Math.max(lastPlacedIndex, oldVChild.mountIndex);
+    } else {
  +      patch.push({
+ type: PLACEMENT,
    +        newVChild,
    +        mountIndex: index
  +      });
+    }
+  });
+  let moveVChild = patch.filter(action => action.type === MOVE).map(action => action.oldVChild);
+  Object.values(keyedOldMap).concat(moveVChild).forEach((oldVChild) => {
  +    let currentDOM = findDOM(oldVChild);
  +    parentDOM.removeChild(currentDOM);
  +  });
+  patch.forEach(action => {
  +    let { type, oldVChild, newVChild, mountIndex } = action;
  +    let childNodes = parentDOM.childNodes;
  +    if (type === PLACEMENT) {
    +      let newDOM = createDOM(newVChild);
    +      let childNode = childNodes[mountIndex];
    +      if (childNode) {
      +        parentDOM.insertBefore(newDOM, childNode);
      +      } else {
      +        parentDOM.appendChild(newDOM);
      +      }
    +    } else if (type === MOVE) {
      +      let oldDOM = findDOM(oldVChild);
      +      let childNode = childNodes[mountIndex];
      +      if (childNode) {
        +        parentDOM.insertBefore(oldDOM, childNode);
        +      } else {
        +        parentDOM.appendChild(oldDOM);
        +      }
      +    }
  +  });
}
function reconcileChildren(childrenVdom, parentDOM) {
  for (let i = 0; i < childrenVdom.length; i++) {
    +   childrenVdom[i].mountIndex = i;
    mount(childrenVdom[i], parentDOM);
  }
}
const ReactDOM = {
  render,
};
export default ReactDOM;


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~``


class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: ['A', 'B', 'C', 'D', 'E', 'F']
    }
  }
  handleClick = () => {
    this.setState({
      list: ['A', 'C', 'E', 'B', 'G']
    });
  };
  render() {
    return (
      <React.Fragment>
        <ul>
          {
            this.state.list.map(item => <li key={item}>{item}</li>)
          }

        </ul>
        <button onClick={this.handleClick}>+</button>
      </React.Fragment>
    )
  }
}
ReactDOM.render(<Counter />, document.getElementById('root'));


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
// static getDerivedStateFromProps(props, state) 这个生命周期的功能实际上就是将传入的props映射到state上面

class Counter extends React.Component {
  static defaultProps = {
    name: '珠峰架构'
  };
  constructor(props) {
    super(props);
    this.state = { number: 0 }
  }

  handleClick = () => {
    this.setState({ number: this.state.number + 1 });
  };

  render() {
    console.log('3.render');
    return (
      <div>
        <p>{this.state.number}</p>
        <ChildCounter number={this.state.number} />
        <button onClick={this.handleClick}>+</button>
      </div>
    )
  }
}
class ChildCounter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { number: 0 };
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    const { count } = nextProps;
    // 当传入的type发生变化的时候，更新state
    if (count % 2 === 0) {
      return { number: number * 2 };
    } else {
      return { number: number * 3 };
    }
  }
  render() {
    console.log('child-render', this.state)
    return (<div>
      {this.state.number}
    </div>)
  }

}

ReactDOM.render(
  <Counter />,
  document.getElementById('root')
);

// getSnapshotBeforeUpdate() 被调用于render之后，可以读取但无法使用DOM的时候。它使您的组件可以在可能更改之前从DOM捕获一些信息（例如滚动位置）。此生命周期返回的任何值都将作为参数传递给componentDidUpdate()
class ScrollingList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { messages: [] }
    this.wrapper = React.createRef();
  }

  addMessage() {
    this.setState(state => ({
      messages: [`${state.messages.length}`, ...state.messages],
    }))
  }
  componentDidMount() {
    this.timeID = window.setInterval(() => {//设置定时器
      this.addMessage();
    }, 1000)
  }
  componentWillUnmount() {//清除定时器
    window.clearInterval(this.timeID);
  }
  getSnapshotBeforeUpdate() {//很关键的，我们获取当前rootNode的scrollHeight，传到componentDidUpdate 的参数perScrollHeight
    return { prevScrollTop: this.wrapper.current.scrollTop, prevScrollHeight: this.wrapper.current.scrollHeight };
  }
  componentDidUpdate(pervProps, pervState, { prevScrollHeight, prevScrollTop }) {
    //当前向上卷去的高度加上增加的内容高度
    this.wrapper.current.scrollTop = prevScrollTop + (this.wrapper.current.scrollHeight - prevScrollHeight);
  }
  render() {
    let style = {
      height: '100px',
      width: '200px',
      border: '1px solid red',
      overflow: 'auto'
    }
    //<div key={index}>里不要加空格!
    return (
      <div style={style} ref={this.wrapper} >
        {this.state.messages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
    );
  }
}

ReactDOM.render(
  <ScrollingList />,
  document.getElementById('root')
);


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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
  let willUpdate = true;
  if (classInstance.shouldComponentUpdate
    && !classInstance.shouldComponentUpdate(nextProps, nextState)) {
    willUpdate = false;
  }
  if (willUpdate && classInstance.componentWillUpdate) {
    classInstance.componentWillUpdate();
  }
  if (nextProps) {
    classInstance.props = nextProps;
  }
  classInstance.state = nextState;
  if (willUpdate) classInstance.forceUpdate();
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
    +        if (this.constructor.getDerivedStateFromProps) {
      +            let newState = this.constructor.getDerivedStateFromProps(this.props, this.state);
      +            if (newState)
        +                this.state =  { ...this.state, ...newState };
      +        }
    +       let snapshot = this.getSnapshotBeforeUpdate && this.getSnapshotBeforeUpdate();
    let newRenderVdom = this.render();
    compareTwoVdom(oldDOM.parentNode, oldRenderVdom, newRenderVdom);
    this.oldRenderVdom = newRenderVdom;
    if (this.componentDidUpdate) {
      +            this.componentDidUpdate(this.props, this.state, snapshot);
    }
  }
}