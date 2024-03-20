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
  for (let i = 0; i < childrenVdom.length;i++) {
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
  let { type: ClassComponent, props, ref } = vdom
  let classInstance = new ClassComponent(props)
  if (ref) ref.current = classInstance
  if (classInstance.componentWillMount) classInstance.componentWillMount();
  let renderVdom = classInstance.render()
  classInstance.oldRenderVdom = renderVdom // 将 vdom 属性记录下来
  let dom = createDOM(renderVdom)
  if (classInstance.componentDidMount) {
    dom.componentDidMount = classInstance.componentDidMount.bind(classInstance);
  }
  return dom
}

export function findDOM(vdom) {
  if (!vdom) return null
  if (vdom.dom) {
    return vdom.dom
  } else {
    let renderVdom = vdom.oldRenderVdom
    return findDOM(renderVdom)
  }
}

export function compareTwoVdom(parentDOM, oldVdom, newVdom) {
    // 这里先全部替换
    let oldDOM = findDOM(oldVdom);
    let newDOM = createDOM(newVdom);
    parentDOM.replaceChild(newDOM, oldDOM);
}

const ReactDOM = {
  render
}

export default ReactDOM