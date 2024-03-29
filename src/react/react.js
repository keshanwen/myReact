import { wrapToVdom } from './utils'
import { REACT_ELEMENT, REACT_FORWARD_REF_TYPE, REACT_FRAGMENT } from './constants'
import { Component } from './component'

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

const React = {
  createElement,
  Component,
  createRef,
  forwardRef,
  Fragment: REACT_FRAGMENT
}

export default React

