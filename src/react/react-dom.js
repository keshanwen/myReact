import { REACT_TEXT } from "./constants";

function render(vdom, container) {
  mount(vdom, container)
}


export function mount(vdom, container) {
  let newDom = createDOM(vdom)
  container.appendChild(newDom)
}

export function createDOM(vdom) {
  let { type, props } = vdom
  let dom
  if (type === REACT_TEXT) {
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

function mountFunctionComponent(vdom) {
  let { type: functionComponent, props } = vdom
  let renderVdom = functionComponent(props)
  return createDOM(renderVdom)
}

function mountClassComponent(vdom) {
  let { type: ClassComponent, props } = vdom
  let classInstance = new ClassComponent(props)
  let renderVdom = classInstance.render()
  let dom = createDOM(renderVdom)
  return dom
}

const ReactDOM = {
  render
}

export default ReactDOM