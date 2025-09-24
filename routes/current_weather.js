const express = require('express');
const router = express.Router();

const { getCurrentWeather, getForecast } = require('../services/openWeatherService');
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 300 }); // Cache the results for 5 minutes

// Current weather conditions

router.get('/current_weather', async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({ error: 'Please enter a City!' });
  }

  const cacheKey = `current_${city.toLowerCase()}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const data = await getCurrentWeather(city);
    cache.set(cacheKey, data); // Save to cache
    res.json(data);
  } catch (error) {
    console.error("Current Weather error", error.message)
    res.status(500).json({ error: 'Failed to fetch current weather data, please retry' });
  }
});

// 5 day forecast

router.get('/forecast', async (req, res) => {
  const city = req.query.city;
  if (!city) {
    return res.status(400).json({ error: 'Please enter a City!' });
  }

  const cacheKey = `forecast_${city.toLowerCase()}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const data = await getForecast(city);
    cache.set(cacheKey, data); // Save to cache
    res.json(data);
  } catch (error) {
    console.error("Forecast error:", error.message);
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

module.exports = router;