import React from 'react'
import RouterContext from './RouterContext';

class Route extends React.Component {
  static contextType = RouterContext
  render() {
    const { history, location } = this.context;
    const { path, component: RouteComponent } = this.props;
    const match = location.pathname === path;
    let routeProps = { history, location };
    let element = null;
    if (match) {
      element = <RouteComponent {...routeProps} />
    }
    return element;
  }
}
export default Route;