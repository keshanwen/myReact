import React from './react';
import ReactDOM from './react-dom';
/**
 * 处理
 * @param {*} state 老状态 默认值是{number:0}
 * @param {*} action  动作对象，动作对象必须有一个type属性表示你想干啥
 * @returns 
 */
function reducer(state = { number: 0 }, action) {
  switch (action.type) {
    case 'ADD':
      return { number: state.number + 1 };
    case 'MINUS':
      return { number: state.number - 1 }
    default:
      return state;
  }
}
function Counter() {
  const [state, dispatch] = React.useReducer(reducer, { number: 0 });
  return (
    <div>
      <p>{state.number}</p>
      <button onClick={() => dispatch({ type: 'ADD' })}>+</button>
      <button onClick={() => dispatch({ type: 'MINUS' })}>-</button>
    </div>
  )
}
ReactDOM.render(<Counter />, document.getElementById('root'));
