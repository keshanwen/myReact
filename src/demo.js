function mountClassComponent(vdom) {
  +    const { type, props, ref } = vdom;
  const classInstance = new type(props);
  +   if (ref) {
    +       ref.current = classInstance;
    +       classInstance.ref = ref;
    +   }
  vdom.classInstance = classInstance;
  if (type.contextType) {
    classInstance.context = type.contextType.Provider._value;
  }
  if (classInstance.componentWillMount)
    classInstance.componentWillMount();
  classInstance.state = getDerivedStateFromProps(classInstance, classInstance.props, classInstance.state)
  const renderVdom = classInstance.render();
  classInstance.oldRenderVdom = vdom.oldRenderVdom = renderVdom;
  const dom = createDOM(renderVdom);
  if (classInstance.componentDidMount)
    dom.componentDidMount = classInstance.componentDidMount.bind(classInstance);
  return dom;
}

+export function useImperativeHandle(ref, handler) {
  +    ref.current = handler();
  +}
const ReactDOM = {
  render
};
export default ReactDOM;


// forwardRef将ref从父组件中转发到子组件中的dom元素上, 子组件接受props和ref作为参数
// useImperativeHandle 可以让你在使用 ref 时自定义暴露给父组件的实例值