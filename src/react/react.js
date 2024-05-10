import { wrapToVdom, shallowEqual } from './utils'
import { REACT_ELEMENT, REACT_FORWARD_REF_TYPE, REACT_FRAGMENT, REACT_CONTEXT, REACT_PROVIDER, REACT_MEMO } from './constants'
import { Component } from './component'
import { useState } from './react-dom'

function createElement(type, config, children) {
  let ref;
  let key;
  if (config) {
    delete config.__source
    delete config.__self
    ref = config.ref
    delete config.ref
    key = config.key
    delete config.key
  }
  let props = { ...config }
  if (arguments.length > 3) {
    props.children = Array.prototype.slice.call(arguments, 2).map(wrapToVdom)
  } else {
    props.children = wrapToVdom(children)
  }

  return {
    $$typeof: REACT_ELEMENT,
    type,
    ref,
    key,
    props
  }
}

function createRef() {
  return {
    current: null
  }
}

function forwardRef(render) {
  const elementType = {
    $$typeof: REACT_FORWARD_REF_TYPE,
    render: render
  }

  return elementType
}


function createContext() {
  let context = { _currentValue: undefined };
  context.Provider = {
    $$typeof: REACT_PROVIDER,
    _context: context
  }
  context.Consumer = {
    $$typeof: REACT_CONTEXT,
    _context: context
  }

  return context
}

function cloneElement(element, newProps, ...newChildren) {
  let oldChildren = element.props && element.props.children;
  let children = [...(Array.isArray(oldChildren) ? oldChildren : [oldChildren]), ...newChildren].filter(item => item !== undefined).map(wrapToVdom)
  // let children = [...newChildren].filter(item => item !== undefined).map(wrapToVdom)
  if (children.length === 1) children = children[0]
  let props = {
    ...element.props,
    ...newProps,
    children
  }
  return {
    ...element,
    props
  }
}

class PureComponent extends Component {
  shouldComponentUpdate(newProps, nextState) {
    return !shallowEqual(this.props, newProps) || !shallowEqual(this.state, nextState)
  }
}

function memo(type, compare = shallowEqual) {
  return {
    $$typeof: REACT_MEMO,
    type,
    compare
  }
}

const React = {
  createElement,
  Component,
  createRef,
  forwardRef,
  Fragment: REACT_FRAGMENT,
  createContext,
  cloneElement,
  PureComponent,
  memo,
  useState
}

export default React

