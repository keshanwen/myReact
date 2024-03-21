/*
import React from './react/react';
import ReactDOM from './react/react-dom'; */

import React from 'react';
import ReactDOM from 'react-dom';




class ChildCounter extends React.Component {
  componentWillMount() {
    console.log('  ChildCounter 1.componentWillMount')
  }

  render() {
    console.log('  ChildCounter 2.render')
    return (
      <div>
        { this.props.count }
      </div>
    )
  }

  componentDidMount() {
    console.log('  ChildCounter 3.componentDidMount')
  }

  componentWillReceiveProps(newProps) { // 第一次不会执行，之后属性更新时才会执行
    console.log('  ChildCounter 4.componentWillReceiveProps', newProps)
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('  ChildCounter 5.shouldComponentUpdate', nextProps.count % 3 === 0)
    return nextProps.count % 3 === 0 // 子组件判断接收的属性 是否满足更新条件（这里的更新是指调用 render 页面显示的更新）为true 则更新
  }

  componentWillUnmount() {
    console.log('  ChildCounter 6.componentWillUnmount')
  }
}

class Counter extends React.Component {
  static defaltProps = {
    name: '珠峰前端'
  }

  constructor(props) {
    super(props)
    this.state = { number: 0 }
    console.log('Counter 1.constructor')
  }

  componentWillMount() { // 取本地的数据 同步的方式： 采用渲染之前获取的数据，只渲染一次
    console.log('Counter 2.componentWillMount');
  }

  handleClick = () => {
    this.setState({ number: this.state.number + 1 })
  }

  render() {
    console.log('Counter 3.render');
    return (
      <div>
        <p>{this.state.number}</p>
        {this.state.number === 4 ? null : <ChildCounter count={this.state.number}></ChildCounter>}
        <button onClick={this.handleClick}>+</button>
      </div>
    )
  }

  componentDidMount() {
    console.log('Counter 4.componentDidMount');
  }

  // react 可以 shouldComponentUpdate 方法中优化 PureComponent 可以帮我们做这件事
  shouldComponentUpdate(nextProps,nextState) {
    console.log('Counter 5.shouldComponentUpdate', nextState.number % 2 === 0);
    // 如果此函数中返回了 false 就不会调用 render 方法了， 不要随便在这里调用 setState 可能会死循环
    return nextState.number % 2 === 0
  }

  componentWillUpdate() {
    console.log('Counter 6.componentWillUpdate');
  }

  componentDidUpdate() {
    console.log('Counter 7.componentDidUpdate');
  }
}

ReactDOM.render(<Counter></Counter>, document.getElementById('root'))

/* class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      number: 0
    }
    console.log('Counter 1.constructor')
  }

  componentWillMount() { // 取本地的数据 同步的方式：采用渲染之前获取数据，只渲染一次
    console.log('Counter 2.componentWillMount');
  }

  componentDidMount() {
    console.log('Counter 4.componentDidMount');
  }

  handleClick = () => {
    this.setState({
      number: this.state.number + 1
    })
  }

  // react可以shouldComponentUpdate方法中优化 PureComponent 可以帮我们做这件事
  shouldComponentUpdate(nextProps, nextState) { // 代表的是下一次的属性 和 下一次的状态
    console.log('Counter 5.shouldComponentUpdate', nextState.number % 2 === 0);
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
      <>
        <div>{this.state.number}</div>
        <button onClick={this.handleClick}>+</button>
      </>
    )
  }
}


ReactDOM.render(<Counter></Counter>, document.getElementById('root')) */