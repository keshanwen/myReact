import { updateQueue } from './component'

export function addEvent(dom, eventType, handler) {
  let store = dom.store || (dom.store = {}) // 增加一个属性,存储事件处理函数
  store[eventType] = handler
  // 事件委托，将事件委托到 document 上，注意这里只需要委托一次
  if (!document[eventType]) {
    document[eventType] = dispatchEvent
  }
}

function dispatchEvent(event) {
  let { target, type } = event
  let eventType = `on${type}`
  let syntheticEvent = createSyntheticEvent(event)
  updateQueue.isBatchingUpdate = true
  // 模拟冒泡的过程, 不断的往上找
  while (target) {
    let { store } = target
    let handler = store && store[eventType]
    handler && handler(syntheticEvent)
    // 在执行handler 的过程中有可能会阻止冒泡
    if (syntheticEvent.isPropagationStopped) {
      break
    }
    target = target.parentNode
  }
  updateQueue.batchUpdate()
}

// 包装 合成事件的 event
function createSyntheticEvent(nativeEvent) {
  let syntheticEvent = {}
  for (let key in nativeEvent) { // 把原生事件上的属性拷贝到合成事件对象上去
    let value = nativeEvent[key]
    if (typeof value === 'function') value = value.bind(nativeEvent)
    syntheticEvent[key] = nativeEvent[key]
  }
  syntheticEvent.nativeEvent = nativeEvent
  syntheticEvent.isDefaultPrevented = false
  syntheticEvent.isPropagationStopped = false
  syntheticEvent.preventDefault = preventDefault
  syntheticEvent.stopPropagation = stopPropagation
  return syntheticEvent
}

// 模拟 preventDefault,兼容处理
function preventDefault() {
  this.defaultPrevented = true
  const event = this.nativeEvent
  if (event.preventDefault) {
    event.preventDefault()
  } else { // IE
    event.returnValue = false
  }
  this.isDefaultPrevented = true
 }

// 模拟stopPropagation,兼容处理
function stopPropagation() {
  const event = this.nativeEvent
  if (event.stopPropagation) {
    event.stopPropagation()
  } else { // IE
    event.cancelBubble = true
  }
  this.isPropagationStopped = true
}


