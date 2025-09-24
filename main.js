const cityname = document.getElementById('cityname');
const loading = document.getElementById('loading');
const weatherData = document.getElementById('weatherData');
const currentWeather = document.getElementById('currentWeather');
const weatherDetails = document.getElementById('weatherDetails');
const forecastSection = document.getElementById('forecastSection');
const forecastCtx = document.getElementById('forecastChart').getContext('2d');

let forecastChart = null;

function loadingState() {
    loading.style.display = 'block';
    weatherData.style.display = 'none';
    forecastSection.style.display = 'none';
    loading.innerHTML = `<p>Hold on, checking the weather... </p>`;
}

function showError(message) {
    console.warn("Error:", message);
    loading.style.display = 'block';
    weatherData.style.display = 'none';
    forecastSection.style.display = 'none';
    loading.innerHTML = `<p style="color: red;">Oops: ${message}</p>`;
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function showWeather(currentData, forecastData) {
    loading.style.display = 'none';
    weatherData.style.display = 'block';
    forecastSection.style.display = 'block';

    function formatTime(unixTimestamp) {
        return new Date(unixTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Current Weather Display
    
    currentWeather.innerHTML = `
        <img 
        src="https://openweathermap.org/img/wn/${currentData.icon}@2x.png" 
        alt="${currentData.description}" 
        style="width: 150px; height: 150px;">
        <div>
        <h2>${currentData.city}</h2>
        <p style="font-size: 2.5rem; font-weight: bold;">${currentData.temperature}°C</p>
        <p>${capitalizeFirstLetter(currentData.description)}</p>
    </div>
    `;

    weatherDetails.innerHTML = `
    <div class="weather-detail-item"><strong>Feels like:</strong> ${currentData.feels_like}°C</div>
    <div class="weather-detail-item"><strong>Humidity:</strong> ${currentData.humidity}%</div>
    <div class="weather-detail-item"><strong>Wind:</strong> ${currentData.wind_speed} m/s, ${currentData.wind_deg}°</div>
    <div class="weather-detail-item"><strong>Sunrise:</strong> ${formatTime(currentData.sunrise)}</div>
    <div class="weather-detail-item"><strong>Sunset:</strong> ${formatTime(currentData.sunset)}</div>
    `;
    
    // Forecast Chart

    // Delete old forecast chart
    if (forecastChart) {
        forecastChart.destroy();
    }

    // Change date format to DD-MM-YYYY
    const formattedLabels = forecastData.map(f => {
        if (!f.date) return '';
        const parts = f.date.split('-');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    });

    forecastChart = new Chart(forecastCtx, {
        type: 'line',
        data: {
            labels: formattedLabels,
            datasets: [{
                label: 'Average Temperature (°C)',
                data: forecastData.map(f => f.avgTemp),
                borderColor: '#3498db',
                backgroundColor: '#3498db33',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                }
            },

            plugins: {
                tooltip: {
                    callbacks: {
                        title: (tooltipItem) => {
                            const labelParts = tooltipItem[0].label.split('-');
                            const originalDateStr = `${labelParts[2]}-${labelParts[1]}-${labelParts[0]}`;
                            const date = new Date(originalDateStr);
                            return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', weekday: 'long' });
                        }
                    }
                }
            }
        }
    });
}

async function getWeather() {
    const city = cityname.value.trim();

    if (!city) {
        showError("Please enter a city name!");
        return;
    }
    
    loadingState();
    
    try {
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(`/current/current_weather?city=${city}`),
            fetch(`/current/forecast?city=${city}`)
        ]);

        if (!currentResponse.ok) {
            throw new Error("City not found or data not available.");
        }

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        showWeather(currentData, forecastData);
        } catch (error) {
        showError(error.message);
    }
}