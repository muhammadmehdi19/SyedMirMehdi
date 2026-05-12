// Configuration
const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your API key from https://openweathermap.org/api
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const currentWeatherSection = document.getElementById('currentWeather');
const forecastContainer = document.getElementById('forecastContainer');
const detailsGrid = document.getElementById('detailsGrid');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

// Initialize with default city
window.addEventListener('load', () => {
    fetchWeatherData('London');
});

// Search handler
function handleSearch() {
    const city = searchInput.value.trim();
    if (city) {
        fetchWeatherData(city);
        searchInput.value = '';
    }
}

// Fetch weather data
async function fetchWeatherData(city) {
    try {
        showLoading();

        if (API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
            showError('Please set your OpenWeatherMap API key in the script.js file');
            return;
        }

        // Fetch current weather
        const currentResponse = await fetch(
            `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        if (!currentResponse.ok) {
            throw new Error('City not found');
        }

        const currentData = await currentResponse.json();

        // Fetch forecast data
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
        );

        const forecastData = await forecastResponse.json();

        // Display data
        displayCurrentWeather(currentData);
        displayForecast(forecastData);
        displayDetails(currentData);
    } catch (error) {
        showError(`Error: ${error.message}`);
    }
}

// Display current weather
function displayCurrentWeather(data) {
    const { name, sys, main, weather, wind, clouds } = data;
    const iconClass = getWeatherIconClass(weather[0].main);
    const weatherIcon = getWeatherIcon(weather[0].main);

    const html = `
        <div class="weather-card">
            <div class="weather-left">
                <h2>${name}, ${sys.country}</h2>
                <p class="description">${weather[0].description}</p>
                <div class="temp-info">
                    <div class="temp-item">
                        <span class="label">Temperature</span>
                        <span class="value">${Math.round(main.temp)}°C</span>
                    </div>
                    <div class="temp-item">
                        <span class="label">Feels Like</span>
                        <span class="value">${Math.round(main.feels_like)}°C</span>
                    </div>
                    <div class="temp-item">
                        <span class="label">Humidity</span>
                        <span class="value">${main.humidity}%</span>
                    </div>
                    <div class="temp-item">
                        <span class="label">Pressure</span>
                        <span class="value">${main.pressure} mb</span>
                    </div>
                </div>
            </div>
            <div class="weather-right">
                <i class="fas ${weatherIcon} weather-icon ${iconClass}"></i>
            </div>
        </div>
    `;

    currentWeatherSection.innerHTML = html;
}

// Display 5-day forecast
function displayForecast(data) {
    const forecastList = data.list;
    const dailyForecasts = {};

    // Group forecast by day (one forecast per day at noon)
    forecastList.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        if (!dailyForecasts[day]) {
            dailyForecasts[day] = forecast;
        }
    });

    // Display only first 5 days
    const forecastDays = Object.entries(dailyForecasts).slice(0, 5);

    let html = '';
    forecastDays.forEach(([day, forecast]) => {
        const weatherIcon = getWeatherIcon(forecast.weather[0].main);
        const iconClass = getWeatherIconClass(forecast.weather[0].main);

        html += `
            <div class="forecast-card">
                <p class="date">${day}</p>
                <i class="fas ${weatherIcon} icon ${iconClass}"></i>
                <p class="description">${forecast.weather[0].description}</p>
                <p class="temp">${Math.round(forecast.main.temp)}°C</p>
                <p class="temp-range">${Math.round(forecast.main.temp_min)}° - ${Math.round(forecast.main.temp_max)}°</p>
            </div>
        `;
    });

    forecastContainer.innerHTML = html;
}

// Display additional details
function displayDetails(data) {
    const { main, wind, clouds, visibility, sys } = data;

    const details = [
        {
            label: 'Wind Speed',
            value: `${(wind.speed * 3.6).toFixed(1)} km/h`,
            icon: 'fa-wind'
        },
        {
            label: 'Wind Direction',
            value: `${wind.deg}°`,
            icon: 'fa-compass'
        },
        {
            label: 'Cloudiness',
            value: `${clouds.all}%`,
            icon: 'fa-cloud'
        },
        {
            label: 'Visibility',
            value: `${(visibility / 1000).toFixed(1)} km`,
            icon: 'fa-eye'
        },
        {
            label: 'Max Temp',
            value: `${Math.round(main.temp_max)}°C`,
            icon: 'fa-thermometer-full'
        },
        {
            label: 'Min Temp',
            value: `${Math.round(main.temp_min)}°C`,
            icon: 'fa-thermometer-empty'
        },
        {
            label: 'Dew Point',
            value: `${Math.round(main.temp - (100 - main.humidity) / 5)}°C`,
            icon: 'fa-droplet'
        },
        {
            label: 'UV Index',
            value: 'N/A',
            icon: 'fa-sun'
        }
    ];

    let html = '';
    details.forEach(detail => {
        html += `
            <div class="detail-card">
                <i class="fas ${detail.icon} icon"></i>
                <p class="label">${detail.label}</p>
                <p class="value">${detail.value}</p>
            </div>
        `;
    });

    detailsGrid.innerHTML = html;
}

// Get weather icon
function getWeatherIcon(weatherMain) {
    const iconMap = {
        'Clear': 'fa-sun',
        'Clouds': 'fa-cloud',
        'Rain': 'fa-cloud-rain',
        'Drizzle': 'fa-cloud-rain',
        'Thunderstorm': 'fa-bolt',
        'Snow': 'fa-snowflake',
        'Mist': 'fa-smog',
        'Smoke': 'fa-smog',
        'Haze': 'fa-smog',
        'Dust': 'fa-smog',
        'Fog': 'fa-smog',
        'Sand': 'fa-smog',
        'Ash': 'fa-smog',
        'Squall': 'fa-wind',
        'Tornado': 'fa-tornado'
    };

    return iconMap[weatherMain] || 'fa-cloud';
}

// Get icon class for styling
function getWeatherIconClass(weatherMain) {
    const classMap = {
        'Clear': 'sunny',
        'Clouds': 'cloudy',
        'Rain': 'rainy',
        'Drizzle': 'rainy',
        'Thunderstorm': 'stormy',
        'Snow': 'snowy',
        'Mist': 'cloudy',
        'Smoke': 'cloudy',
        'Haze': 'cloudy',
        'Dust': 'cloudy',
        'Fog': 'cloudy',
        'Sand': 'cloudy',
        'Ash': 'cloudy',
        'Squall': 'windy',
        'Tornado': 'stormy'
    };

    return classMap[weatherMain] || 'cloudy';
}

// Show loading state
function showLoading() {
    currentWeatherSection.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading weather data...</p>
        </div>
    `;
    forecastContainer.innerHTML = '';
    detailsGrid.innerHTML = '';
}

// Show error state
function showError(message) {
    currentWeatherSection.innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
            <p>Please try again or check your API key configuration.</p>
        </div>
    `;
    forecastContainer.innerHTML = '';
    detailsGrid.innerHTML = '';
}
