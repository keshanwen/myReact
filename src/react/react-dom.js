import { REACT_TEXT, REACT_FORWARD_REF_TYPE } from "./constants";
import { addEvent } from './event'

function render(vdom, container) {
  mount(vdom, container)
}


export function mount(vdom, container) {
  let newDom = createDOM(vdom)
  if (newDom) {
    container.appendChild(newDom)
    if (newDom.componentDidMount) newDom.componentDidMount()
  }
}

export function createDOM(vdom) {
  let { type, props, ref } = vdom
  let dom
  if (type && type.$$typeof === REACT_FORWARD_REF_TYPE) {
    return mountForwardComponent(vdom)
  } else if (type === REACT_TEXT) {
    dom = document.createTextNode(props)
  } else if (typeof type === 'function') {
    if (type.isReactComponent) {
      return mountClassComponent(vdom)
    } else {
      return mountFunctionComponent(vdom)
    }
  } else {
    dom = document.createElement(type)
  }
  if (props) {
    updateProps(dom, {}, props)
    if (typeof props.children == 'object' && props.children.type) {
      mount(props.children, dom)
    } else if (Array.isArray(props.children)) {
      reconcileChildren(props.children, dom)
    }
  }
  vdom.dom = dom
  if (ref) ref.current = dom
  return dom
}

function updateProps(dom, oldProps = {}, newProps = {}) {
  for (let key in newProps) {
    if (key === 'children') {
      continue
    } else if (key === 'style') {
      let styleObj = newProps[key]
      for (let attr in styleObj) {
        dom.style[attr] = styleObj[attr]
      }
    } else if (/^on[A-Z].*/.test(key)) {
      // dom[key.toLocaleLowerCase()] = newProps[key]
      addEvent(dom, key.toLocaleLowerCase(), newProps[key])
    } else {
      dom[key] = newProps[key]
    }
  }
  for (let key in oldProps) {
    if (!newProps.hasOwnProperty(key)) {
      dom[key] = null
    }
  }
}

function reconcileChildren(childrenVdom, parentDOM) {
  for (let i = 0; i < childrenVdom.length; i++) {
    mount(childrenVdom[i], parentDOM)
  }
}

function mountForwardComponent(vdom) {
  let { type, props, ref } = vdom
  let renderVdom = type.render(props, ref)
  vdom.oldRenderVdom = renderVdom
  return createDOM(renderVdom)
}

function mountFunctionComponent(vdom) {
  let { type: functionComponent, props } = vdom
  let renderVdom = functionComponent(props)
  vdom.oldRenderVdom = renderVdom // 将 vdom 属性记录下来
  return createDOM(renderVdom)
}

function mountClassComponent(vdom) {
  let { type, props, ref } = vdom
  let classInstance = new type(props)
  vdom.classInstance = classInstance
  if (ref) ref.current = classInstance
  if (classInstance.componentWillMount) classInstance.componentWillMount()
  let renderVdom = classInstance.render()
  classInstance.oldRenderVdom = renderVdom
  let dom = createDOM(renderVdom)
  if (classInstance.componentDidMount) dom.componentDidMount = classInstance.componentDidMount.bind(classInstance)
  return dom
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

function unMountVdom(vdom) {
  let { type, props, ref } = vdom;
  let currentDOM = findDOM(vdom);//获取此虚拟DOM对应的真实DOM
  //vdom可能是原生组件span 类组件 classComponent 也可能是函数组件Function
  if (vdom.classInstance && vdom.classInstance.componentWillUnmount) {
    vdom.classInstance.componentWillUnmount();
  }
  if (ref) {
    ref.current = null;
  }
  //如果此虚拟DOM有子节点的话，递归全部删除
  if (props.children) {
    //得到儿子的数组
    let children = Array.isArray(props.children) ? props.children : [props.children];
    children.forEach(unMountVdom);
  }
  //把自己这个虚拟DOM对应的真实DOM从界面删除
  if (currentDOM) currentDOM.remove();
}
export function compareTwoVdom(parentDOM, oldVdom, newVdom, nextDOM) {
  if (!oldVdom && !newVdom) {
    //老和新都是没有
    return;
  } else if (!!oldVdom && !newVdom) {
    //老有新没有
    unMountVdom(oldVdom);
  } else if (!oldVdom && !!newVdom) {
    //老没有新的有
    let newDOM = createDOM(newVdom);
    if (nextDOM) parentDOM.insertBefore(newDOM, nextDOM);
    else parentDOM.appendChild(newDOM);
    if (newDOM.componentDidMount) newDOM.componentDidMount();
    return;
  } else if (!!oldVdom && !!newVdom && oldVdom.type !== newVdom.type) {
    //新老都有，但类型不同
    let newDOM = createDOM(newVdom);
    unMountVdom(oldVdom);
    if (newDOM.componentDidMount) newDOM.componentDidMount();
  } else {
    updateElement(oldVdom, newVdom);
  }
}

function updateElement(oldVdom, newVdom) {
  if (oldVdom.type === REACT_TEXT) {
    let currentDOM = newVdom.dom = findDOM(oldVdom);
    if (oldVdom.props !== newVdom.props) {
      currentDOM.textContent = newVdom.props;
    }
    return;
  } else if (typeof oldVdom.type === 'string') {
    let currentDOM = newVdom.dom = findDOM(oldVdom);
    updateProps(currentDOM, oldVdom.props, newVdom.props);
    updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children);
  } else if (typeof oldVdom.type === 'function') {
    if (oldVdom.type.isReactComponent) {
      updateClassComponent(oldVdom, newVdom);
    } else {
      updateFunctionComponent(oldVdom, newVdom);
    }
  }
}

function updateFunctionComponent(oldVdom, newVdom) {
  let currentDOM = findDOM(oldVdom);
  if (!currentDOM) return;
  let parentDOM = currentDOM.parentNode;
  let { type, props } = newVdom;
  let newRenderVdom = type(props);
  compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, newRenderVdom);
  newVdom.oldRenderVdom = newRenderVdom;
}
function updateClassComponent(oldVdom, newVdom) {
  let classInstance = newVdom.classInstance = oldVdom.classInstance;
  if (classInstance.componentWillReceiveProps) {
    classInstance.componentWillReceiveProps(newVdom.props);
  }
  classInstance.updater.emitUpdate(newVdom.props);
}

function updateChildren(parentDOM, oldVChildren, newVChildren) {
  oldVChildren = (Array.isArray(oldVChildren) ? oldVChildren : oldVChildren ? [oldVChildren] : []).filter(item => item);
  newVChildren = (Array.isArray(newVChildren) ? newVChildren : newVChildren ? [newVChildren] : []).filter(item => item);
  let maxLength = Math.max(oldVChildren.length, newVChildren.length);
  for (let i = 0; i < maxLength; i++) {
    let nextVdom = oldVChildren.find((item, index) => index > i && item && findDOM(item));
    compareTwoVdom(parentDOM, oldVChildren[i], newVChildren[i], nextVdom && findDOM(nextVdom));
  }
}

const ReactDOM = {
  render
}

export default ReactDOM