import React from 'react'
import RouterContext from './RouterContext';
class Router extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: props.history.location
    }
    //当路径发生的变化的时候执行回调
    this.unlisten = props.history.listen((location) => {
      this.setState({ location });
    });
  }
  componentWillUnmount() {
    this.unlisten && this.unlisten();
  }
  render() {
    let value = {//通过value向下层传递数据
      location: this.state.location,
      history: this.props.history
    }
    return (
      <RouterContext.Provider value={value}>
        {this.props.children}
      </RouterContext.Provider>
    )
  }
}

export default Router;