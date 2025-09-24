const axios = require('axios');
const API_KEY = process.env.OPENWEATHER_API_KEY;

// Current weather conditions

async function getCurrentWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
  const response = await axios.get(url);
  return {
    city: response.data.name,
    temperature: response.data.main.temp,
    description: response.data.weather[0].description,
    feels_like: response.data.main.feels_like,
    humidity: response.data.main.humidity,
    icon: response.data.weather[0].icon,
    wind_speed: response.data.wind.speed,
    wind_deg: response.data.wind.deg,
    sunrise: response.data.sys.sunrise,
    sunset: response.data.sys.sunset
  };
}

// 5 day forecast

async function getForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`;
  const response = await axios.get(url);

  // Group data by day

  const forecastData = {};
  response.data.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!forecastData[date]) {
      forecastData[date] = [];
    }
    forecastData[date].push(item.main.temp);
  });

  // Average temps per day
  
  const dailyForecast = Object.entries(forecastData).map(([date, temps]) => {
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    return { date, avgTemp: avgTemp.toFixed(1) };
  });

  return dailyForecast;
}

module.exports = { getCurrentWeather, getForecast };