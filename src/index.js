import React from './react/react';
import ReactDOM from './react/react-dom';


/* import React from 'react';
import ReactDOM from 'react-dom'; */

class Button extends React.Component {
  state = { name: '张三' }

  componentWillMount() {
    console.log('Button componentWillMount');
  }

  componentDidMount() {
    console.log('Button componentDidMount');
  }

  render() {
    console.log('Button render');
    return <button name={this.state.name}>{this.props.title}</button>
  }
}

const wrapper = OldComponent => {
  return class NewComponent extends OldComponent {
    state = { number: 0 }
    componentWillMount() {
      console.log('WrapperButton componentWillMount');
      super.componentWillMount()
    }
    componentDidMount() {
      console.log('WrapperButton componentDidMount');
      super.componentDidMount()
    }
    handleClick = () => {
      this.setState({
        number: this.state.number + 1
      })
    }
    render() {
      console.log('WrapperButton render');
      let renderElement = super.render()
      let newProps = {
        ...renderElement.props,
        ...this.state,
        onClick: this.handleClick
      }
      return React.cloneElement(
        renderElement,
        newProps,
        this.state.number
      )
    }
  }
}

let WrappedButton = wrapper(Button)


ReactDOM.render(<WrappedButton title='标题'></WrappedButton>, document.getElementById('root'))