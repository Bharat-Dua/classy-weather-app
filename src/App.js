import React from "react";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { location: "rohtak" };
  }
  fetchWeather = () => {
    console.log("loading");
    console.log(this);
  };
  render() {
    return (
      <div className="app">
        <h1>Classy Weather</h1>
        <div>
          <input
            type="text"
            placeholder="Search for Location"
            value={this.state.location}
            onChange={(e) => this.setState({ location: e.target.value })}
          />
        </div>
        <button onClick={this.fetchWeather}>Get Weather</button>
      </div>
    );
  }
}
export default App;
