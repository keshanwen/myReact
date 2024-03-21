/*

  函数组件接收一个单一的props对象并返回了一个React元素
  组件名称必须以大写字母开头
  组件必须在使用的时候定义或引用它
  组件的返回值只能有一个根元素
  React元素不但可以是DOM标签，还可以是用户自定义的组件
  当 React 元素为用户自定义组件时，它会将 JSX 所接收的属性（attributes）转换为单个对象传递给组件，这个对象被称之为props

  类组件的渲染是根据属性创建类的实例，并调用实例的render方法返回一个React元素

  组件的数据来源有两个地方，分别是属性对象和状态对象
  属性是父组件传递过来的
  状态是自己内部的,改变状态唯一的方式就是setState
  属性和状态的变化都会影响视图更新
  不要直接修改 State，构造函数是唯一可以给 this.state 赋值的地方


  State 的更新会被合并 当你调用 setState() 的时候，React 会把你提供的对象合并到当前的 state
  State 的更新可能是异步的
  出于性能考虑，React 可能会把多个 setState() 调用合并成一个调用
  因为 this.props 和 this.state 可能会异步更新，所以你不要依赖他们的值来更新下一个状态
  可以让 setState() 接收一个函数而不是一个对象。这个函数用上一个 state 作为第一个参数
  事件处理
  React 事件的命名采用小驼峰式(camelCase),而不是纯小写
  使用 JSX 语法时你需要传入一个函数作为事件处理函数，而不是一个字符串
  你不能通过返回 false 的方式阻止默认行为。你必须显式的使用preventDefault


  Refs 提供了一种方式，允许我们访问 DOM 节点或在 render 方法中创建的 React 元素

   为 DOM 元素添加 ref
   可以使用 ref 去存储 DOM 节点的引用
   当 ref 属性用于 HTML 元素时，构造函数中使用 React.createRef() 创建的 ref 接收底层 DOM 元素作为其 current 属性


   为 class 组件添加 Ref
   当 ref 属性用于自定义 class 组件时，ref 对象接收组件的挂载实例作为其 current 属性

   Ref转发

  你不能在函数组件上使用 ref 属性，因为他们没有实例
  Ref 转发是一项将 ref 自动地通过组件传递到其一子组件的技巧
  Ref 转发允许某些组件接收 ref，并将其向下传递给子组件

*/

/* import React from './react';
import ReactDOM from './react-dom';
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
        {this.state.number === 4 ? null : <ChildCounter count={this.state.number} />}
        <button onClick={this.handleClick}>+</button>
      </div>
    )
  }
}
class ChildCounter extends React.Component {
  componentWillUnmount() {
    console.log(' ChildCounter 6.componentWillUnmount')
  }
  componentWillMount() {
    console.log('ChildCounter 1.componentWillMount')
  }
  render() {
    console.log('ChildCounter 2.render')
    return (<div>
      {this.props.count}
    </div>)
  }
  componentDidMount() {
    console.log('ChildCounter 3.componentDidMount')
  }
  componentWillReceiveProps(newProps) { // 第一次不会执行，之后属性更新时才会执行
    console.log('ChildCounter 4.componentWillReceiveProps')
  }
  shouldComponentUpdate(nextProps, nextState) {
    console.log('ChildCounter 5.shouldComponentUpdate')
    return nextProps.count % 3 === 0; //子组件判断接收的属性 是否满足更新条件 为true则更新
  }
}
ReactDOM.render(<Counter />, document.getElementById('root')); */


/**
click 1
Counter 1.constructor
Counter 2.componentWillMount
Counter 3.render
ChildCounter 1.componentWillMount
ChildCounter 2.render
ChildCounter 3.componentDidMount
Counter 4.componentDidMount

click 2
Counter 5.shouldComponentUpdate
click 3
Counter 5.shouldComponentUpdate
Counter 6.componentWillUpdate
Counter 3.render
ChildCounter 4.componentWillReceiveProps
Counter 5.shouldComponentUpdate
Counter 7.componentDidUpdate

click3
Counter 5.shouldComponentUpdate

click4
Counter 5.shouldComponentUpdate
Counter 6.componentWillUpdate
Counter 3.render
ChildCounter 6.componentWillUnmount
Counter 7.componentDidUpdate

click5
Counter 5.shouldComponentUpdate

click6
Counter 5.shouldComponentUpdate
Counter 6.componentWillUpdate
Counter 3.render
ChildCounter 1.componentWillMount
ChildCounter 2.render
ChildCounter 3.componentDidMount
Counter 7.componentDidUpdate

click7
Counter 5.shouldComponentUpdate

click8
Counter 5.shouldComponentUpdate
Counter 6.componentWillUpdate
Counter 3.render
ChildCounter 4.componentWillReceiveProps
Counter 5.shouldComponentUpdate
Counter 7.componentDidUpdate
 */

+import { REACT_TEXT, REACT_FORWARD_REF_TYPE } from "./constants";
+import { addEvent } from "./event";

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