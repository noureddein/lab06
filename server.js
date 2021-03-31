// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');

const cors = require('cors');
const superAgent = require('superagent');
// const superagent = require('superagent');

// Application Setup
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

//KEYS
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const PARK_KEY = process.env.PARK_KEY;

//Route Definitions
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/parks', parksHandler);
app.get('*', errorHandler);

//Location Handler
async function locationHandler(req, res) {
  try {
    let getCity = req.query.city;
    let url = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${getCity}&format=json&limit=1`;
    const locationData = await superAgent.get(url);
    const apiData = JSON.parse(locationData.text);
    res.status(200).send(new City(getCity, apiData[0].display_name, apiData[0].lat, apiData[0].lon));

  } catch (error) {
    res.status(404).send('Something went wrong in LOCATION route')
  }

}

//Constructor function for location
function City(search_query, formatted_query, latitude, longitude) {
  this.search_query = search_query;
  this.formatted_query = formatted_query;
  this.latitude = latitude;
  this.longitude = longitude;
}

async function parksHandler(req, res) {
  try {
    url = `https://developer.nps.gov/api/v1/parks?api_key=${PARK_KEY}&q=${req.query.search_query}`;
    const getData = await superAgent.get(url);
    const apiData = (getData.body.data);
    const objArray = apiData.map(item => new Parks(item.fullName, item.addresses[0].line1, item.description, item.url));
    res.status(200).send(objArray);
  } catch (error) {
    res.status(505).send('Something went wrong in PARKS route')
  }
}

// Parks constructor
function Parks(name, address, description, url) {
  this.name = name;
  this.address = address;
  this.fee = '0.00';
  this.description = description;
  this.url = url;
}

//-------------------------------------------------

async function weatherHandler(req, res) {
  try {
    // let getCity = req.query.search_query;
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=amman&key=${WEATHER_API_KEY}`;
    const weatherData = await superAgent.get(url);
    let apiData = JSON.parse(weatherData.text).data;
    const forecast = apiData.map(item => {
      let date = new Date(apiData[0]['datetime']).toString();
      let reqDate = date.match(/[A-Za-z].+[0-9].(2021)/g).join();
      return new CityWeather(item.weather['description'], reqDate)
    });
    res.status(200).send(forecast);
  } catch (error) {
    res.status(404).send('Something went wrong in weather route!')
  }
}


//Constructor function for weather
function CityWeather(description, time) {
  // this.search_qeury = search_qeury;
  this.forecast = description;
  this.time = time;
}
=======
const PORT = process.env.PORT || 3000;
require('dotenv').config();
const app = express();
const cors = require('cors');
app.use(cors());
//Route
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
// app.get('/location', errorHandler);

//Location Handler
function locationHandler(req, res) {
  res.status(200).send(getLocationData('Amman'));
}

//Constructor function for location
function City(search_query, formatted_query, latitude, longitude) {
  this.search_query = search_query;
  this.formatted_query = formatted_query;
  this.latitude = latitude;
  this.longitude = longitude;
}

// Prepare location data and make it Object
function getLocationData(cityName) {
  //Get the data from the JSON file
  const locationData = require('./data/location.json');
  const exact_City_Name = locationData[0].display_name;
  const latitude = locationData[0].lat;
  const longitude = locationData[0].lat;
  //Make the date and return it as object
  const reqLocationData = new City(cityName, exact_City_Name, latitude, longitude);
  return reqLocationData;
}

//-------------------------------------------------

//Weather handler
function weatherHandler(req, res) {
  res.status(200).send(getWeatherData('Amman'));
}


//Constructor function for weather
function CityWeather(search_qury, forecast, time) {
  this.search_qury = search_qury;
  this.forecast = forecast;
  this.time = time;
}

function getWeatherData(cityName) {
  const locationData = require('./data/weather.json');
  let weatherObjects = [];
  for (let i = 0; i < 5; i++) {
    let date = new Date(locationData.data[i].datetime).toString();
    let weatherData = locationData.data[i].weather['description'];
    weatherObjects.push(
      new CityWeather(cityName, weatherData, date.slice(date.indexOf(' ', 11) + 1)));
  }
  return weatherObjects;
}



//Error Handler function
function errorHandler(req, res) {
  res.status(500).send('Sorry, something went wrong');
}


app.listen(PORT, () => {
  console.log(`Open Port ${PORT}`);
});
