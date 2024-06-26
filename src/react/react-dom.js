import { REACT_TEXT, REACT_FORWARD_REF_TYPE, PLACEMENT, MOVE, REACT_FRAGMENT, REACT_PROVIDER, REACT_CONTEXT, REACT_MEMO } from "./constants";
import { addEvent } from './event'
import React from "./react";

let hookStates = [] // 这是一个数组，用来记录状态
let hookIndex = 0 // 索引当前 hook 的索引
let scheduleUpdate // 调度更新的方法

function render(vdom, container) {
  mount(vdom, container)
  scheduleUpdate = () => {
    hookIndex = 0 // ??????????????????????????
    // 每次更新都要从根节点开始进行 DOM DIFF
    compareTwoVdom(container,vdom, vdom)
  }
}


// useState 的替代方案。它接收一个形如(state, action) => newState 的 reducer，并返回当前的 state 以及与其配套的 dispatch 方法
// 在某些场景下，useReducer 会比 useState 更适用，例如 state 逻辑较复杂且包含多个子值，或者下一个 state 依赖于之前的 state 等

export function useReducer(reducer, initialState) {
  hookStates[hookIndex] = hookStates[hookIndex] || initialState;
  let currentIndex = hookIndex;
  function dispatch(action) {
    if (typeof action === 'function') {
      action = action(hookStates[currentIndex]);
    }
    hookStates[currentIndex] = reducer ? reducer(hookStates[currentIndex], action) : action;
    scheduleUpdate();
  }
  return [hookStates[hookIndex++], dispatch];
}


export function useState(initialState) {
 /*  hookStates[hookIndex] = hookStates[hookIndex] || initialState
  let currentIndex = hookIndex
  function setState(newState) {
    if (typeof newState === 'function') {
      newState = newState(hookStates[currentIndex])
    }
    hookStates[currentIndex] = newState
    scheduleUpdate()
  }
  return [hookStates[hookIndex++], setState] */
  return useReducer(null, initialState)
}

export function useMemo(factory, deps) {
  if (hookStates[hookIndex]) { // 判断一下是否是首次渲染
    // 如果是更新的时候， 也就是说不是首次渲染
    let [lastMemo, lastDeps] = hookStates[hookIndex]
    // 如果老的依赖数组和新的依赖数组且完全一样 true 否则 false
    let allTheSame = deps.every((item, index) => item === lastDeps[index])
    if (allTheSame) {
      hookIndex++
      return lastMemo
    } else {
      let newMemo = factory()
      hookStates[hookIndex++] = [newMemo, deps]
      return newMemo
    }
  } else { // 说明是首次渲染
    let newMemo = factory()
    hookStates[hookIndex++] = [newMemo, deps]
    return newMemo
  }
}
export function useCallback(callback, deps) {
  if (hookStates[hookIndex]) {//判断一下是否是首次渲染
    //如果是更新的时候 ，也就是说不是初次渲染
    let [lastCallback, lastDeps] = hookStates[hookIndex];
    //如果老的依赖数组和新的依赖数且完全一样，true 否则 返回false
    let allTheSame = deps.every((item, index) => item === lastDeps[index]);
    if (allTheSame) {
      hookIndex++;
      return lastCallback;
    } else {
      hookStates[hookIndex++] = [callback, deps];
      return callback;
    }
  } else {//说明是首次渲染
    hookStates[hookIndex++] = [callback, deps];
    return callback;
  }
}


export function useContext(context) {
  return context._currentValue
}


export function useEffect(callback, dependencies) {
  let currentIndex = hookIndex
  if (hookStates[hookIndex]) {
    let [destory, lastDeps] = hookStates[hookIndex]
    let same = dependencies && dependencies.every((item, index) => item === lastDeps[index])
    if (same) {
      hookIndex++
    } else {
      destory && destory()
      setTimeout(() => {
        hookStates[currentIndex] = [callback(), dependencies]
      })
      hookIndex++
    }
  } else {
    setTimeout(() => {
      hookStates[currentIndex] = [callback(),dependencies]
    })
    hookIndex++
  }
}

export function useLayoutEffect(callback, dependencies) {
  let currentIndex = hookIndex
  if (hookStates[currentIndex]) {
    let [destory, lastDeps] = hookStates[currentIndex]
    let same = dependencies && dependencies.every((item, index) => item === lastDeps[index])
    if (same) {
      hookIndex++
    } else {
      destory && destory()
      queueMicrotask(() => {
        hookStates[currentIndex] = [callback(), dependencies]
      })
      hookIndex++
    }
  } else {
    queueMicrotask(() => {
      hookStates[currentIndex] = [callback(), dependencies]
    })
    hookIndex++
  }
}

export function useRef(initialState) {
  hookStates[hookIndex] = hookStates[hookIndex] || { current: initialState }
  return hookStates[hookIndex++]
}

export function useImperativeHandle(ref, handler) {
  ref.current = handler()
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
  if (type && type.$$typeof === REACT_MEMO) {
    return mountMemoComponent(vdom)
  } else if (type && type.$$typeof === REACT_PROVIDER) {
    return mountProviderComponent(vdom)
  } else if (type && type.$$typeof === REACT_CONTEXT) {
    return mountContextComponent(vdom)
  } else if (type && type.$$typeof === REACT_FORWARD_REF_TYPE) {
    return mountForwardComponent(vdom)
  } else if (type === REACT_TEXT) {
    dom = document.createTextNode(props)
  } else if (type === REACT_FRAGMENT) {
    dom = document.createDocumentFragment()
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
      props.children.mountIndex = 0;
      mount(props.children, dom)
    } else if (Array.isArray(props.children)) {
      reconcileChildren(props.children, dom)
    }
  }
  vdom.dom = dom
  if (ref) ref.current = dom
  return dom
}

function mountMemoComponent(vdom) {
  let { type, props } = vdom;
  let renderVdom = type.type(props);
  vdom.oldRenderVdom = renderVdom;
  if (!renderVdom) return null
  return createDOM(renderVdom);
}

function mountProviderComponent(vdom) {
  let { type, props } = vdom
  let context = type._context
  context._currentValue = props.value
  let renderVdom = props.children
  vdom.oldRenderVdom = renderVdom
  if (!renderVdom) return null;
  return createDOM(renderVdom)
}

function mountContextComponent(vdom) {
  let { type, props } = vdom
  let context = type._context
  let renderVdom = props.children(context._currentValue)
  vdom.oldRenderVdom = renderVdom
  if (!renderVdom) return null;
  return createDOM(renderVdom)
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
    childrenVdom[i].mountIndex = i;
    mount(childrenVdom[i], parentDOM)
  }
}

function mountForwardComponent(vdom) {
  let { type, props, ref } = vdom
  let renderVdom = type.render(props, ref)
  vdom.oldRenderVdom = renderVdom
  if (!renderVdom) return null;
  return createDOM(renderVdom)
}

function mountFunctionComponent(vdom) {
  let { type: functionComponent, props } = vdom
  let renderVdom = functionComponent(props)
  vdom.oldRenderVdom = renderVdom // 将 vdom 属性记录下来
  if (!renderVdom) return null;
  return createDOM(renderVdom)
}

function mountClassComponent(vdom) {
  let { type, props, ref } = vdom
  let classInstance = new type(props)
  if (type.contextType) {
    classInstance.context = type.contextType._currentValue
  }
  vdom.classInstance = classInstance
  if (ref) {
    ref.current = classInstance
    classInstance.ref = ref
  }
  if (classInstance.componentWillMount) classInstance.componentWillMount()
  let renderVdom = classInstance.render()
  classInstance.oldRenderVdom = renderVdom
  if (!renderVdom) return null;
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
  if (oldVdom.type && oldVdom.type.$$typeof === REACT_MEMO) {
    updateMemoComponent(oldVdom, newVdom)
  } else if (oldVdom.type.$$typeof === REACT_CONTEXT) {
    updateContextComponent(oldVdom, newVdom)
  } else if (oldVdom.type.$$typeof === REACT_PROVIDER) {
    updateProviderComponent(oldVdom, newVdom)
  } else if (oldVdom.type === REACT_TEXT) {
    let currentDOM = newVdom.dom = findDOM(oldVdom);
    if (oldVdom.props !== newVdom.props) {
      currentDOM.textContent = newVdom.props;
    }
    return;
  } else if (typeof oldVdom.type === 'string') {
    let currentDOM = newVdom.dom = findDOM(oldVdom);
    updateProps(currentDOM, oldVdom.props, newVdom.props);
    updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children);
  } else if (oldVdom.type === REACT_FRAGMENT) {
    let currentDOM = newVdom.dom = findDOM(oldVdom)
    updateChildren(currentDOM,oldVdom.props.children, newVdom.props.children)
  } else if (typeof oldVdom.type === 'function') {
    if (oldVdom.type.isReactComponent) {
      updateClassComponent(oldVdom, newVdom);
    } else {
      updateFunctionComponent(oldVdom, newVdom);
    }
  }
}

function updateMemoComponent(oldVdom, newVdom) {
   let { type } = oldVdom;
   if (!type.compare(oldVdom.props, newVdom.props)) {
       const oldDOM = findDOM(oldVdom);
       const parentDOM = oldDOM.parentNode;
       const { type } = newVdom;
       let renderVdom = type.type(newVdom.props);
       compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, renderVdom);
       newVdom.oldRenderVdom = renderVdom;
     } else {
       newVdom.oldRenderVdom = oldVdom.oldRenderVdom;
     }
}

function updateProviderComponent(oldVdom, newVdom) {
  let parentDOM = findDOM(oldVdom).parentNode
  let { type, props } = newVdom
  let context = type._context
  context._currentValue = props.value
  let renderVdom = props.children
  compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, renderVdom)
  newVdom.oldRenderVdom = renderVdom
}

function updateContextComponent(oldVdom, newVdom) {
  let parentDOM = findDOM(oldVdom).parentNode
  let { type, props } = newVdom
  let context = type._context
  let renderVdom = props.children(context._currentValue)
  compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, renderVdom)
  newVdom.oldRenderVdom = renderVdom
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
  oldVChildren = (Array.isArray(oldVChildren) ? oldVChildren : oldVChildren ? [oldVChildren] : []).filter(item => item) || [];
  newVChildren = (Array.isArray(newVChildren) ? newVChildren : newVChildren ? [newVChildren] : []).filter(item => item) || [];
  let keyedOldMap = {};
  let lastPlacedIndex = 0;
  oldVChildren.forEach((oldVChild, index) => {
    let oldKey = oldVChild.key ? oldVChild.key : index;
    keyedOldMap[oldKey] = oldVChild;
  });
  let patch = [];
  newVChildren.forEach((newVChild, index) => {
    newVChild.mountIndex = index;
    let newKey = newVChild.key ? newVChild.key : index;
    let oldVChild = keyedOldMap[newKey];
    if (oldVChild) {
      updateElement(oldVChild, newVChild);
      if (oldVChild.mountIndex < lastPlacedIndex) {
        patch.push({
          type: MOVE,
          oldVChild,
          newVChild,
          mountIndex: index
        });
      }
      delete keyedOldMap[newKey];
      lastPlacedIndex = Math.max(lastPlacedIndex, oldVChild.mountIndex);
    } else {
      patch.push({
        type: PLACEMENT,
        newVChild,
        mountIndex: index
      });
    }
  });
  let moveVChild = patch.filter(action => action.type === MOVE).map(action => action.oldVChild);
  Object.values(keyedOldMap).concat(moveVChild).forEach((oldVChild) => {
    let currentDOM = findDOM(oldVChild);
    parentDOM.removeChild(currentDOM);
  });
  patch.forEach(action => {
    let { type, oldVChild, newVChild, mountIndex } = action;
    let childNodes = parentDOM.childNodes;
    if (type === PLACEMENT) {
      let newDOM = createDOM(newVChild);
      let childNode = childNodes[mountIndex];
      if (childNode) {
        parentDOM.insertBefore(newDOM, childNode);
      } else {
        parentDOM.appendChild(newDOM);
      }
    } else if (type === MOVE) {
      let oldDOM = findDOM(oldVChild);
      let childNode = childNodes[mountIndex];
      if (childNode) {
        parentDOM.insertBefore(oldDOM, childNode);
      } else {
        parentDOM.appendChild(oldDOM);
      }
    }
  });
}


const ReactDOM = {
  render,
  createPortal: render
}

export default ReactDOM