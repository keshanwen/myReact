// import React from 'react';
import React from './react/react';
// import ReactDOM from 'react-dom';
import ReactDOM from './react/react-dom';

// console.log(JSON.stringify(element1, null, 2));

class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      number: 0
    }
  }

  handleClick = () => {
    this.setState({ number: this.state.number + 1 })
    console.log(this.state)
    this.setState({ number: this.state.number + 1 })
    console.log(this.state)
    setTimeout(() => {
      this.setState({ number: this.state.number + 1 })
      console.log(this.state)
      this.setState({ number: this.state.number + 1 })
      console.log(this.state)
    })
  }

  render() {
    return (
      <div>
        <p>{this.props.title}</p>
        <p>number: {this.state.number}</p>
        <button onClick={this.handleClick}>+</button>
      </div>
    )
  }

}


ReactDOM.render(<Counter title='计数器'></Counter>, document.getElementById('root'));
