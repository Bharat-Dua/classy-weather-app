import React from "react";
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 1 };
    // this.handleDecrement = this.handleDecrement.bind(this);
    // this.handleIncrement = this.handleIncrement.bind(this);
  }
  // state = { count: 5 };
  handleDecrement = () => {
    this.setState((curState) => {
      return {
        count: curState.count - 1,
      };
    });
  };
  handleIncrement = () => {
    this.setState((curState) => {
      return {
        count: curState.count + 1,
      };
    });
  };
  render() {
    let date = new Date("August 15 2024");
    date.setDate(date.getDate() + this.state.count);
    return (
      <div>
        <button onClick={this.handleDecrement}>-</button>
        <span>
          {date.toDateString()}[{this.state.count}]
        </span>
        <button onClick={this.handleIncrement}>+</button>
      </div>
    );
  }
}
export default Counter;
