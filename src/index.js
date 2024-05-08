import React from './react/react';
import ReactDOM from './react/react-dom';


/* import React from 'react';
import ReactDOM from 'react-dom'; */

class MouseTracker extends React.Component {
  constructor(props) {
    super(props);
    this.state = { x: 0, y: 0 };
  }

  handleMouseMove = (event) => {
    this.setState({
      x: event.clientX,
      y: event.clientY
    });
  }

  render() {
    return (
      <div onMouseMove={this.handleMouseMove}>
        {this.props.render(this.state)}
      </div>
    );
  }
}

ReactDOM.render(< MouseTracker render={params => (
  <>
    <h1>移动鼠标!</h1>
    <p>当前的鼠标位置是 ({params.x}, {params.y})</p>
  </>
)} />, document.getElementById('root'));