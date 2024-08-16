import React from "react";
function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤️"],
    [[2], "⛅"],
    [[3], "☁️"],
    [[45, 48], "🌫️"],
    [[51, 56, 61, 66, 80], "🌦️"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧️"],
    [[71, 73, 75, 77, 85, 86], "🌨️"],
    [[95], "🌩️"],
    [[96, 99], "⛈️"],
  ]);

  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}

// function convertToFlag(countryCode) {
//   const codePoints = countryCode
//     .toUpperCase()
//     .split("")
//     .map((char) => 127397 + char.charCodeAt());
//   return String.fromCodePoint(...codePoints);
// }

function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(`${dateStr}T00:00:00`));
}
class App extends React.Component {
  state = {
    location: "rohtak",
    isLoading: false,
    weather: {},
    displayLocation: { city: "", flag: "" },
    locationNotFound: false,
    // error: "",
  };
  debounceTimeout = null;
  controller = null;
  fetchWeather = async () => {
    if (this.state.location.length < 2) return this.setState({ weather: {} });
    if (this.controller) {
      this.controller.abort();
    }
    this.controller = new AbortController();
    try {
      this.setState({ isLoading: true, locationNotFound: false });
      // 1) Getting location (geocoding)
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${this.state.location}`,
        { signal: this.controller.signal }
      );
      const geoData = await geoRes.json();
      console.log(geoData);

      if (!geoData.results) {
        this.setState({ locationNotFound: true, isLoading: false });
        throw new Error("Location not found");
      }

      const { latitude, longitude, timezone, name, country_code } =
        geoData.results.at(0);
      this.setState({
        // displayLocation: `${name} ${convertToFlag(country_code)}`,
        displayLocation: { city: name, flag: country_code.toLowerCase() },
      });

      // 2) Getting actual weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`,
        { signal: this.controller.signal }
      );
      const weatherData = await weatherRes.json();
      this.setState({ weather: weatherData.daily });
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(err);
        // this.setState({ error: err.message });
      }
    } finally {
      this.setState({ isLoading: false });
    }
  };
  setLocation = (e) => {
    let location = e.target.value;
    this.setState({ location });
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      this.fetchWeather();
    }, 500);
  };
  // useEffect []

  componentDidMount() {
    //fix the app start error
    // this.fetchWeather();
    let storedLocation = localStorage.getItem("location");
    //local storage not showing default value
    // const location =
    // this.setState({ location: localStorage.getItem("location") || "" });
    //   storedLocation !== null ? storedLocation : this.state.location;
    // this.setState({ location }, () => {
    //   if (location) {
    //     this.fetchWeather();
    //   }
    // });
    // now showing
    if (storedLocation) {
      this.setState({ location: storedLocation }, this.fetchWeather);
    } else {
      this.fetchWeather();
    }
  }

  // useEffect [location]

  componentDidUpdate(prevProps, prevState) {
    if (this.state.location !== prevState.location) {
      // this.fetchWeather();

      localStorage.setItem("location", this.state.location);
    }
  }
  render() {
    return (
      <div className="app">
        <h1>Classy Weather</h1>
        <Input
          location={this.state.location}
          onChangeLocation={this.setLocation}
        />
        {/* <button onClick={this.fetchWeather} className="btn">
          Get Weather
        </button> */}
        {this.state.isLoading && <p className="loader">Loading...</p>}
        {/* {this.state.error && <p className="error">{this.state.error}</p>} */}
        {!this.state.isLoading && this.state.locationNotFound && (
          <p>Location not found.Please try another search</p>
        )}
        {this.state.weather.weathercode && (
          <Weather
            weather={this.state.weather}
            // location={this.state.location}
            flag={this.state.displayLocation.flag}
            city={this.state.displayLocation.city}
          />
        )}
      </div>
    );
  }
}
export default App;
class Input extends React.Component {
  render() {
    return (
      <div>
        <input
          type="text"
          autoFocus
          placeholder="Search for Location"
          value={this.props.location}
          onChange={this.props.onChangeLocation}
        />
      </div>
    );
  }
}
class Weather extends React.Component {
  componentWillUnmount() {
    console.log("Weather will unmount");
  }
  render() {
    const {
      temperature_2m_max: max,
      temperature_2m_min: min,
      time: dates,
      weathercode: codes,
    } = this.props.weather;
    return (
      <>
        <h2>
          Weather {this.props.city}{" "}
          <img
            src={`https://flagcdn.com/24x18/${this.props.flag}.png`}
            alt="country flag"
          />
        </h2>
        <ul className="weather">
          {dates.map((date, i) => (
            <Day
              date={date}
              min={min.at(i)}
              max={max.at(i)}
              code={codes.at(i)}
              key={date}
              isToday={i === 0}
            />
          ))}
        </ul>
      </>
    );
  }
}

class Day extends React.Component {
  render() {
    const { min, max, code, date, isToday } = this.props;
    return (
      <li className="day">
        <span>{getWeatherIcon(code)}</span>
        <p>{isToday ? "Today" : formatDay(date)}</p>
        <p>
          {Math.floor(min)}&deg; &mdash; <strong>{Math.ceil(max)}&deg;</strong>
        </p>
      </li>
    );
  }
}
