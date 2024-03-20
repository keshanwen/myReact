/*

  函数组件接收一个单一的props对象并返回了一个React元素
  组件名称必须以大写字母开头
  组件必须在使用的时候定义或引用它
  组件的返回值只能有一个根元素
  React元素不但可以是DOM标签，还可以是用户自定义的组件
  当 React 元素为用户自定义组件时，它会将 JSX 所接收的属性（attributes）转换为单个对象传递给组件，这个对象被称之为props

  类组件的渲染是根据属性创建类的实例，并调用实例的render方法返回一个React元素

  组件的数据来源有两个地方，分别是属性对象和状态对象
  属性是父组件传递过来的
  状态是自己内部的,改变状态唯一的方式就是setState
  属性和状态的变化都会影响视图更新
  不要直接修改 State，构造函数是唯一可以给 this.state 赋值的地方


  State 的更新会被合并 当你调用 setState() 的时候，React 会把你提供的对象合并到当前的 state
  State 的更新可能是异步的
  出于性能考虑，React 可能会把多个 setState() 调用合并成一个调用
  因为 this.props 和 this.state 可能会异步更新，所以你不要依赖他们的值来更新下一个状态
  可以让 setState() 接收一个函数而不是一个对象。这个函数用上一个 state 作为第一个参数
  事件处理
  React 事件的命名采用小驼峰式(camelCase),而不是纯小写
  使用 JSX 语法时你需要传入一个函数作为事件处理函数，而不是一个字符串
  你不能通过返回 false 的方式阻止默认行为。你必须显式的使用preventDefault


  Refs 提供了一种方式，允许我们访问 DOM 节点或在 render 方法中创建的 React 元素

   为 DOM 元素添加 ref
   可以使用 ref 去存储 DOM 节点的引用
   当 ref 属性用于 HTML 元素时，构造函数中使用 React.createRef() 创建的 ref 接收底层 DOM 元素作为其 current 属性


   为 class 组件添加 Ref
   当 ref 属性用于自定义 class 组件时，ref 对象接收组件的挂载实例作为其 current 属性

   Ref转发

  你不能在函数组件上使用 ref 属性，因为他们没有实例
  Ref 转发是一项将 ref 自动地通过组件传递到其一子组件的技巧
  Ref 转发允许某些组件接收 ref，并将其向下传递给子组件

*/