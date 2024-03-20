import { findDOM, compareTwoVdom } from './react-dom'

export let updateQueue = {
  isBatchingUpdate: false,
  updaters: new Set(),
  batchUpdate() { // 批量更新
    updateQueue.isBatchingUpdate = false
    for (let updater of updateQueue.updaters) {
      updater.updateComponent()
    }
    updateQueue.updaters.clear()
  }
}


class Updater {
  constructor(classInstance) {
    this.classInstance = classInstance
    this.pendingStates = []
    this.callbacks = []
  }
  addState(partialState, callback) {
    // 先写成同步。
    this.pendingStates.push(partialState) // 等待更新的或者说等待生效的状态
    if (typeof callback === 'function') {
      this.callbacks.push(callback) // 状态更新后的回调
    }
    this.emitUpdate()
  }
  emitUpdate(nextProps) {
    this.nextProps = nextProps
    if (updateQueue.isBatchingUpdate) {
      updateQueue.updaters.add(this)
    } else {
      this.updateComponent()
    }
  }
  updateComponent() {
    let { classInstance, pendingStates } = this
    if (pendingStates.length > 0 || this.nextProps) {
      shouldUpdate(classInstance,this.nextProps ,this.getState())
    }
  }
  getState() {
    let { classInstance, pendingStates } = this
    let { state } = classInstance
    pendingStates.forEach((nextState) => {
      if (typeof nextState === 'function') {
        nextState = nextState(state)
      }
      state = { ...state, ...nextState }
    })
    pendingStates.length = 0
    return state
  }

}

function shouldUpdate(classInstance, nextProps, nextState) {
 /*  if (nextProps) classInstance.props = nextProps
  classInstance.state = nextState
  classInstance.forceUpdate() */
  let willUpdate = true
  if (classInstance.shouldComponentUpdate && !classInstance.shouldComponentUpdate(nextProps, nextState)) {
    willUpdate = false
  }
  if (willUpdate && classInstance.componentWillUpdate) {
    classInstance.componentWillUpdate()
  }
  if (nextProps) {
    classInstance.props = nextProps
  }
  classInstance.state = nextState
  if (willUpdate) classInstance.forceUpdate()
}

export class Component {
  static isReactComponent = true
  constructor(props) {
    this.props = props;
    this.state = {}
    this.updater = new Updater(this)
  }

  setState(partialState, callback) {
    this.updater.addState(partialState, callback)
  }

  forceUpdate() {
    let oldRenderVdom = this.oldRenderVdom
    let oldDOM = findDOM(oldRenderVdom)
    let newRenderVdom = this.render()
    compareTwoVdom(oldDOM.parentNode, oldRenderVdom, newRenderVdom)
    this.oldRenderVdom = newRenderVdom
    if (this.componentDidUpdate) {
      this.componentDidUpdate(this.props, this.state);
    }
  }
}

