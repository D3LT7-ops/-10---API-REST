
const API_CONFIG = {
    KEY: '99a15dbcafb7db271f431e7751086382', 
    BASE_URL: 'http://api.weatherstack.com/current',
    FORECAST_URL: 'http://api.weatherstack.com/forecast',
    HISTORY_URL: 'http://api.weatherstack.com/historical'
};


const DEMO_MODE = false;

// ===========================================
// ESTADO GLOBAL DA APLICAÇÃO
// ===========================================

let currentWeatherData = null;
let forecastData = [];
let historicalData = [];
let currentCity = 'São Paulo';
let currentPage = 1;
const itemsPerPage = 10;

// ===========================================
// ELEMENTOS DO DOM
// ===========================================

// Navigation
const navLinks = document.querySelectorAll('.nav-link');
const pageSections = document.querySelectorAll('.page-section');

// Home section elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherLoading = document.getElementById('weather-loading');
const weatherContent = document.getElementById('weather-content');
const weatherError = document.getElementById('weather-error');

// Weather display elements
const locationName = document.getElementById('location-name');
const locationDetails = document.getElementById('location-details');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const weatherDesc = document.getElementById('weather-desc');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const visibility = document.getElementById('visibility');
const pressure = document.getElementById('pressure');
const precipitation = document.getElementById('precipitation');
const precipGauge = document.getElementById('precip-gauge');
const precipStatus = document.getElementById('precip-status');
const uvIndex = document.getElementById('uv-index');
const uvStatus = document.getElementById('uv-status');
const uvFill = document.getElementById('uv-fill');

// Forecast section elements
const forecastCityInput = document.getElementById('forecast-city-input');
const forecastSearchBtn = document.getElementById('forecast-search-btn');
const forecastLocation = document.getElementById('forecast-location');
const lastUpdate = document.getElementById('last-update');
const forecastLoading = document.getElementById('forecast-loading');
const forecastGrid = document.getElementById('forecast-grid');
const precipChart = document.getElementById('precipitation-chart');
const forecastError = document.getElementById('forecast-error');

// History section elements
const historyCity = document.getElementById('history-city');
const startDate = document.getElementById('start-date');
const endDate = document.getElementById('end-date');
const historySearchBtn = document.getElementById('history-search-btn');
const avgTemp = document.getElementById('avg-temp');
const totalPrecip = document.getElementById('total-precip');
const avgHumidity = document.getElementById('avg-humidity');
const rainyDays = document.getElementById('rainy-days');
const historyLoading = document.getElementById('history-loading');
const historyTableContainer = document.getElementById('history-table-container');
const historyTbody = document.getElementById('history-tbody');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const exportCsvBtn = document.getElementById('export-csv');
const exportJsonBtn = document.getElementById('export-json');
const printReportBtn = document.getElementById('print-report');

// ===========================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupEventListeners();
    initializeDates();
    loadWeatherData(currentCity);
    populateHistoricalData();
}

// ===========================================
// NAVEGAÇÃO ENTRE SEÇÕES
// ===========================================

function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('href').substring(1);
            showSection(targetSection);
            
            // Update active nav link
            navLinks.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function showSection(sectionId) {
    // Hide all sections
    pageSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load section-specific data
        if (sectionId === 'forecast') {
            loadForecast(currentCity);
        } else if (sectionId === 'history') {
            loadHistoricalData();
        }
    }
}

// ===========================================
// EVENT LISTENERS
// ===========================================

function setupEventListeners() {
    // Home section
    searchBtn.addEventListener('click', handleSearch);
    cityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleSearch();
    });

    // Quick city buttons
    document.querySelectorAll('.city-tag').forEach(button => {
        button.addEventListener('click', function() {
            const city = this.dataset.city;
            cityInput.value = city;
            currentCity = city;
            loadWeatherData(city);
        });
    });

    // Forecast section
    forecastSearchBtn.addEventListener('click', handleForecastSearch);
    forecastCityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleForecastSearch();
    });

    // History section
    historySearchBtn.addEventListener('click', loadHistoricalData);
    
    // Pagination
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateHistoryTable();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(historicalData.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            updateHistoryTable();
        }
    });

    // Export buttons
    exportCsvBtn.addEventListener('click', exportToCSV);
    exportJsonBtn.addEventListener('click', exportToJSON);
    printReportBtn.addEventListener('click', printReport);
}

function initializeDates() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    endDate.value = today.toISOString().split('T')[0];
    startDate.value = thirtyDaysAgo.toISOString().split('T')[0];
}

// ===========================================
// MANIPULADORES DE EVENTOS
// ===========================================

function handleSearch() {
    const city = cityInput.value.trim();
    if (city) {
        currentCity = city;
        loadWeatherData(city);
    }
}

function handleForecastSearch() {
    const city = forecastCityInput.value.trim();
    if (city) {
        currentCity = city;
        loadForecast(city);
    }
}

// ===========================================
// FUNÇÕES DA API - DADOS ATUAIS
// ===========================================

async function loadWeatherData(city) {
    showLoading('weather');
    
    try {
        let data;
        
        if (DEMO_MODE) {
            data = await simulateCurrentWeatherData(city);
        } else {
            const response = await fetch(
                `${API_CONFIG.BASE_URL}?access_key=${API_CONFIG.KEY}&query=${encodeURIComponent(city)}&units=m`
            );
            
            if (!response.ok) {
                throw new Error('Erro na requisição da API');
            }
            
            data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.info || 'Erro desconhecido da API');
            }
        }

        currentWeatherData = data;
        displayWeatherData(data);
        
    } catch (error) {
        console.error('Erro ao carregar dados climáticos:', error);
        showError('weather', error.message);
    }
}

async function simulateCurrentWeatherData(city) {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));

    const cityData = {
        'São Paulo': {
            temperature: 23, weather_descriptions: ['Parcialmente nublado'],
            feelslike: 25, humidity: 65, wind_speed: 12, visibility: 8,
            pressure: 1013, precip: 2.5, uv_index: 6,
            weather_icons: ['https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0002_sunny_intervals.png']
        },
        'Rio de Janeiro': {
            temperature: 28, weather_descriptions: ['Ensolarado'],
            feelslike: 32, humidity: 75, wind_speed: 8, visibility: 10,
            pressure: 1015, precip: 0, uv_index: 9,
            weather_icons: ['https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0001_sunny.png']
        },
        'Belo Horizonte': {
            temperature: 21, weather_descriptions: ['Nublado'],
            feelslike: 23, humidity: 70, wind_speed: 15, visibility: 6,
            pressure: 1010, precip: 5.2, uv_index: 4,
            weather_icons: ['https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0003_white_cloud.png']
        },
        'Salvador': {
            temperature: 30, weather_descriptions: ['Parcialmente nublado'],
            feelslike: 35, humidity: 80, wind_speed: 18, visibility: 12,
            pressure: 1012, precip: 1.8, uv_index: 8,
            weather_icons: ['https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0002_sunny_intervals.png']
        },
        'Brasília': {
            temperature: 24, weather_descriptions: ['Claro'],
            feelslike: 26, humidity: 45, wind_speed: 10, visibility: 15,
            pressure: 1018, precip: 0, uv_index: 7,
            weather_icons: ['https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0001_sunny.png']
        }
    };

    const defaultData = {
        temperature: 20, weather_descriptions: ['Moderado'],
        feelslike: 22, humidity: 60, wind_speed: 10, visibility: 10,
        pressure: 1013, precip: 0, uv_index: 5,
        weather_icons: ['https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0001_sunny.png']
    };

    const current = cityData[city] || defaultData;
    
    return {
        location: {
            name: city,
            country: 'Brasil',
            region: getRegionByCity(city)
        },
        current: current
    };
}

function getRegionByCity(city) {
    const regions = {
        'São Paulo': 'São Paulo',
        'Rio de Janeiro': 'Rio de Janeiro',
        'Belo Horizonte': 'Minas Gerais',
        'Salvador': 'Bahia',
        'Brasília': 'Distrito Federal'
    };
    return regions[city] || 'Brasil';
}

// ===========================================
// EXIBIÇÃO DE DADOS CLIMÁTICOS
// ===========================================

function displayWeatherData(data) {
    const { location, current } = data;

    // Update location
    locationName.textContent = location.name;
    locationDetails.textContent = `${location.region}, ${location.country}`;

    // Update weather icon and temperature
    weatherIcon.src = current.weather_icons[0];
    weatherIcon.alt = current.weather_descriptions[0];
    temperature.textContent = `${current.temperature}°C`;

    // Update weather description
    weatherDesc.textContent = current.weather_descriptions[0];
    feelsLike.textContent = `${current.feelslike}°C`;

    // Update weather details
    humidity.textContent = `${current.humidity}%`;
    windSpeed.textContent = `${current.wind_speed} km/h`;
    visibility.textContent = `${current.visibility} km`;
    pressure.textContent = `${current.pressure} mb`;

    // Update precipitation
    precipitation.textContent = `${current.precip} mm`;
    updatePrecipitationGauge(current.precip);
    updatePrecipitationStatus(current.precip);

    // Update UV index
    uvIndex.textContent = current.uv_index;
    updateUVStatus(current.uv_index);
    updateUVBar(current.uv_index);

    // Update additional info
    updateAdditionalInfo(current);

    // Show content
    hideLoading('weather');
    weatherContent.style.display = 'block';
    weatherContent.classList.add('fade-in');
}

function updatePrecipitationGauge(precip) {
    const percentage = Math.min((precip / 100) * 100, 100);
    precipGauge.style.width = `${percentage}%`;
}

function updatePrecipitationStatus(precip) {
    let icon, text, color;
    
    if (precip === 0) {
        icon = 'fa-sun';
        text = 'Sem chuva';
        color = '#ffd32a';
    } else if (precip < 2.5) {
        icon = 'fa-cloud-sun';
        text = 'Chuva leve';
        color = '#74b9ff';
    } else if (precip < 7.5) {
        icon = 'fa-cloud-rain';
        text = 'Chuva moderada';
        color = '#0984e3';
    } else {
        icon = 'fa-cloud-showers-heavy';
        text = 'Chuva intensa';
        color = '#2d3436';
    }
    
    precipStatus.innerHTML = `<i class="fas ${icon}"></i><span>${text}</span>`;
    precipStatus.style.color = color;
}

function updateUVStatus(uvIndex) {
    let status, color;
    
    if (uvIndex <= 2) {
        status = 'Baixo';
        color = '#00b894';
    } else if (uvIndex <= 5) {
        status = 'Moderado';
        color = '#fdcb6e';
    } else if (uvIndex <= 7) {
        status = 'Alto';
        color = '#e17055';
    } else if (uvIndex <= 10) {
        status = 'Muito Alto';
        color = '#d63031';
    } else {
        status = 'Extremo';
        color = '#6c5ce7';
    }
    
    uvStatus.textContent = status;
    uvStatus.style.color = color;
}

function updateUVBar(uvIndex) {
    const percentage = Math.min((uvIndex / 12) * 100, 100);
    uvFill.style.width = `${percentage}%`;
}

function updateAdditionalInfo(current) {
    // Temperature range (simulated)
    const tempRange = document.getElementById('temp-range');
    const minTemp = current.temperature - 3;
    const maxTemp = current.temperature + 5;
    if (tempRange) {
        tempRange.textContent = `${minTemp}°C / ${maxTemp}°C`;
    }

    // Rain alert
    const rainAlert = document.getElementById('rain-alert');
    if (rainAlert) {
        if (current.precip > 5) {
            rainAlert.innerHTML = `<i class="fas fa-exclamation-triangle"></i><span>Alerta de chuva forte</span>`;
            rainAlert.style.color = '#e74c3c';
        } else {
            rainAlert.innerHTML = `<i class="fas fa-info-circle"></i><span>Sem alertas de chuva</span>`;
            rainAlert.style.color = '#00b894';
        }
    }

    // Wind info
    const windDirection = document.getElementById('wind-direction');
    const windGust = document.getElementById('wind-gust');
    if (windDirection) windDirection.textContent = 'NE';
    if (windGust) windGust.textContent = `${Math.round(current.wind_speed * 1.5)} km/h`;
}

// ===========================================
// FUNÇÕES DA PREVISÃO DO TEMPO
// ===========================================

async function loadForecast(city) {
    const forecastLoading = document.getElementById('forecast-loading');
    const forecastGrid = document.getElementById('forecast-grid');
    const forecastError = document.getElementById('forecast-error');
    
    showLoading('forecast');
    
    try {
        let data;
        
        if (DEMO_MODE) {
            data = await simulateForecastData(city);
        } else {
            const response = await fetch(
                `${API_CONFIG.FORECAST_URL}?access_key=${API_CONFIG.KEY}&query=${encodeURIComponent(city)}&forecast_days=7&units=m`
            );
            
            if (!response.ok) {
                throw new Error('Erro na requisição da API');
            }
            
            data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.info || 'Erro desconhecido da API');
            }
        }

        forecastData = data.forecast;
        displayForecastData(data);
        createPrecipitationChart(data.forecast);
        
    } catch (error) {
        console.error('Erro ao carregar previsão:', error);
        showError('forecast', error.message);
    }
}

async function simulateForecastData(city) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const days = ['Hoje', 'Amanhã', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const conditions = ['Ensolarado', 'Parcialmente nublado', 'Nublado', 'Chuva leve', 'Chuva'];
    const icons = [
        'https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0001_sunny.png',
        'https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0002_sunny_intervals.png',
        'https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0003_white_cloud.png',
        'https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0009_light_rain_showers.png',
        'https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0006_light_rain.png'
    ];
    
    const forecast = days.map((day, index) => {
        const baseTemp = 20 + Math.random() * 15;
        const condition = Math.floor(Math.random() * conditions.length);
        
        return {
            date: new Date(Date.now() + (index * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            day: day,
            maxtemp: Math.round(baseTemp + Math.random() * 8),
            mintemp: Math.round(baseTemp - Math.random() * 5),
            avgtemp: Math.round(baseTemp),
            condition: conditions[condition],
            icon: icons[condition],
            precip: Math.random() * 10,
            humidity: 50 + Math.random() * 40,
            wind: 5 + Math.random() * 15
        };
    });
    
    return {
        location: { name: city, country: 'Brasil' },
        forecast: forecast
    };
}

function displayForecastData(data) {
    const { location, forecast } = data;
    
    // Update location
    if (forecastLocation) {
        forecastLocation.textContent = `${location.name}, ${location.country}`;
    }
    
    if (lastUpdate) {
        lastUpdate.textContent = new Date().toLocaleString('pt-BR');
    }
    
    // Create forecast cards
    if (forecastGrid) {
        forecastGrid.innerHTML = forecast.map((day, index) => 
            createForecastCard(day, index === 0)
        ).join('');
        
        forecastGrid.style.display = 'grid';
        forecastGrid.classList.add('fade-in');
    }
    
    hideLoading('forecast');
}

function createForecastCard(dayData, isToday) {
    return `
        <div class="forecast-card ${isToday ? 'today' : ''}">
            <div class="forecast-day">${dayData.day}</div>
            <div class="forecast-icon">
                <img src="${dayData.icon}" alt="${dayData.condition}">
            </div>
            <div class="forecast-temps">
                <span class="temp-high">${dayData.maxtemp}°</span>
                <span class="temp-low">${dayData.mintemp}°</span>
            </div>
            <div class="forecast-condition">${dayData.condition}</div>
            <div class="forecast-precip">
                <i class="fas fa-tint"></i> ${dayData.precip.toFixed(1)}mm
            </div>
        </div>
    `;
}

function createPrecipitationChart(forecastData) {
    const chartContainer = document.getElementById('precipitation-chart');
    const canvas = document.getElementById('precip-chart');
    
    if (!canvas || !forecastData) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Chart data
    const data = forecastData.map(day => day.precip);
    const labels = forecastData.map(day => day.day);
    const maxValue = Math.max(...data, 10);
    
    // Chart dimensions
    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Draw background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(padding, padding, chartWidth, chartHeight);
    
    // Draw grid lines
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
    }
    
    // Draw bars
    const barWidth = chartWidth / data.length * 0.6;
    const barSpacing = chartWidth / data.length;
    
    data.forEach((value, index) => {
        const barHeight = (value / maxValue) * chartHeight;
        const x = padding + barSpacing * index + (barSpacing - barWidth) / 2;
        const y = padding + chartHeight - barHeight;
        
        // Bar gradient
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#74b9ff');
        gradient.addColorStop(1, '#0984e3');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Value label
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${value.toFixed(1)}mm`, x + barWidth / 2, y - 5);
        
        // Day label
        ctx.fillText(labels[index], x + barWidth / 2, padding + chartHeight + 20);
    });
    
    // Chart title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Precipitação por Dia (mm)', width / 2, 30);
    
    // Y-axis labels
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const value = (maxValue / 5) * (5 - i);
        const y = padding + (chartHeight / 5) * i;
        ctx.fillText(value.toFixed(1), padding - 10, y + 4);
    }
    
    chartContainer.style.display = 'block';
}

// ===========================================
// FUNÇÕES DO HISTÓRICO CLIMÁTICO
// ===========================================

function populateHistoricalData() {
    // Generate 90 days of historical data for demonstration
    historicalData = [];
    const today = new Date();
    
    for (let i = 89; i >= 0; i--) {
        const date = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
        const baseTemp = 20 + Math.sin((i / 365) * 2 * Math.PI) * 8; // Seasonal variation
        
        historicalData.push({
            date: date.toLocaleDateString('pt-BR'),
            temperature: Math.round(baseTemp + (Math.random() - 0.5) * 6),
            precipitation: Math.random() * 15,
            humidity: Math.round(50 + Math.random() * 40),
            windSpeed: Math.round(5 + Math.random() * 20),
            condition: ['Ensolarado', 'Nublado', 'Chuva leve', 'Parcialmente nublado'][Math.floor(Math.random() * 4)]
        });
    }
}

async function loadHistoricalData() {
    const city = historyCity.value.trim() || currentCity;
    const startDateValue = startDate.value;
    const endDateValue = endDate.value;
    
    if (!startDateValue || !endDateValue) {
        alert('Por favor, selecione as datas de início e fim.');
        return;
    }
    
    showLoading('history');
    
    try {
        // In demo mode, we use the pre-generated data
        // In production, you would make API calls here
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        updateHistorySummary();
        updateHistoryTable();
        
        hideLoading('history');
        
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        showError('history', error.message);
    }
}

function updateHistorySummary() {
    const temps = historicalData.map(d => d.temperature);
    const precips = historicalData.map(d => d.precipitation);
    const humidities = historicalData.map(d => d.humidity);
    
    const avgTempValue = temps.reduce((a, b) => a + b, 0) / temps.length;
    const totalPrecipValue = precips.reduce((a, b) => a + b, 0);
    const avgHumidityValue = humidities.reduce((a, b) => a + b, 0) / humidities.length;
    const rainyDaysValue = precips.filter(p => p > 1).length;
    
    if (avgTemp) avgTemp.textContent = `${Math.round(avgTempValue)}°C`;
    if (totalPrecip) totalPrecip.textContent = `${Math.round(totalPrecipValue)} mm`;
    if (avgHumidity) avgHumidity.textContent = `${Math.round(avgHumidityValue)}%`;
    if (rainyDays) rainyDays.textContent = `${rainyDaysValue} dias`;
}

function updateHistoryTable() {
    if (!historyTbody) return;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = historicalData.slice(startIndex, endIndex);
    
    historyTbody.innerHTML = pageData.map(day => `
        <tr>
            <td>${day.date}</td>
            <td>${day.temperature}°C</td>
            <td>${day.precipitation.toFixed(1)} mm</td>
            <td>${day.humidity}%</td>
            <td>${day.windSpeed} km/h</td>
            <td>${day.condition}</td>
        </tr>
    `).join('');
    
    // Update pagination
    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(historicalData.length / itemsPerPage);
    
    if (prevPageBtn) {
        prevPageBtn.disabled = currentPage <= 1;
    }
    
    if (nextPageBtn) {
        nextPageBtn.disabled = currentPage >= totalPages;
    }
    
    if (pageInfo) {
        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    }
}

// ===========================================
// FUNÇÕES DE EXPORTAÇÃO
// ===========================================

function exportToCSV() {
    const headers = ['Data', 'Temperatura (°C)', 'Precipitação (mm)', 'Umidade (%)', 'Vento (km/h)', 'Condição'];
    const csvContent = [
        headers.join(','),
        ...historicalData.map(row => [
            row.date,
            row.temperature,
            row.precipitation.toFixed(1),
            row.humidity,
            row.windSpeed,
            `"${row.condition}"`
        ].join(','))
    ].join('\n');
    
    downloadFile(`historico_climatico_${currentCity}.csv`, csvContent, 'text/csv');
}

function exportToJSON() {
    const jsonContent = JSON.stringify({
        city: currentCity,
        period: {
            start: startDate.value,
            end: endDate.value
        },
        data: historicalData
    }, null, 2);
    
    downloadFile(`historico_climatico_${currentCity}.json`, jsonContent, 'application/json');
}

function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function printReport() {
    window.print();
}

// ===========================================
// FUNÇÕES UTILITÁRIAS
// ===========================================

function showLoading(section) {
    const loadingElement = document.getElementById(`${section}-loading`);
    const contentElement = document.getElementById(`${section}-content`) || 
                          document.getElementById(`${section}-grid`) ||
                          document.getElementById(`${section}-table-container`);
    const errorElement = document.getElementById(`${section}-error`);
    
    if (loadingElement) loadingElement.style.display = 'block';
    if (contentElement) contentElement.style.display = 'none';
    if (errorElement) errorElement.style.display = 'none';
}

function hideLoading(section) {
    const loadingElement = document.getElementById(`${section}-loading`);
    if (loadingElement) loadingElement.style.display = 'none';
}

function showError(section, message) {
    const loadingElement = document.getElementById(`${section}-loading`);
    const contentElement = document.getElementById(`${section}-content`) || 
                          document.getElementById(`${section}-grid`) ||
                          document.getElementById(`${section}-table-container`);
    const errorElement = document.getElementById(`${section}-error`);
    
    if (loadingElement) loadingElement.style.display = 'none';
    if (contentElement) contentElement.style.display = 'none';
    if (errorElement) {
        errorElement.style.display = 'block';
        
        // Update error message if needed
        const errorText = errorElement.querySelector('p');
        if (errorText && message) {
            errorText.textContent = message;
        }
    }
    
    // Show notification
    showNotification(`Erro: ${message}`, 'error');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#00b894' : type === 'error' ? '#e74c3c' : '#74b9ff'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        z-index: 3000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-triangle' : 
                 'info-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}" style="margin-right: 0.5rem;"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// ===========================================
// FUNÇÕES DE SUPORTE À API REAL
// ===========================================

// Função para fazer requisições GET à API
async function makeAPIRequest(endpoint, params = {}) {
    const url = new URL(endpoint);
    url.searchParams.append('access_key', API_CONFIG.KEY);
    
    Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
    });
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
        throw new Error(data.error.info || 'Erro da API');
    }
    
    return data;
}

// Função para requisição de dados históricos (API real)
async function fetchHistoricalData(city, startDate, endDate) {
    try {
        const response = await makeAPIRequest(API_CONFIG.HISTORY_URL, {
            query: city,
            historical_date_start: startDate,
            historical_date_end: endDate,
            units: 'm'
        });
        
        return response;
    } catch (error) {
        console.error('Erro ao buscar dados históricos:', error);
        throw error;
    }
}

// ===========================================
// ESTILOS DINÂMICOS PARA NOTIFICAÇÕES
// ===========================================

// Add notification animations to document
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 0.9rem;
        line-height: 1.4;
    }
`;
document.head.appendChild(notificationStyles);

// ===========================================
// FUNÇÕES DE DEBUG E DESENVOLVIMENTO
// ===========================================

// Função para testar todas as funcionalidades (apenas para desenvolvimento)
function runTests() {
    console.log('=== WEATHER MONITOR - TESTE DE FUNCIONALIDADES ===');
    
    // Teste 1: Carregar dados de São Paulo
    console.log('Teste 1: Carregando dados de São Paulo...');
    loadWeatherData('São Paulo');
    
    // Teste 2: Navegar para seção de previsão
    setTimeout(() => {
        console.log('Teste 2: Navegando para previsão...');
        showSection('forecast');
    }, 2000);
    
    // Teste 3: Navegar para histórico
    setTimeout(() => {
        console.log('Teste 3: Navegando para histórico...');
        showSection('history');
    }, 4000);
    
    console.log('Testes iniciados. Verifique o console para resultados.');
}

// Disponibilizar função de teste globalmente (apenas em desenvolvimento)
if (typeof window !== 'undefined') {
    window.weatherMonitorTests = runTests;
}

// ===========================================
// INICIALIZAÇÃO E CONFIGURAÇÕES FINAIS
// ===========================================

// Log de inicialização
console.log('Weather Monitor carregado com sucesso!');
console.log('Modo demonstração:', DEMO_MODE ? 'ATIVO' : 'INATIVO');

if (DEMO_MODE) { 
    console.log('99a15dbcafb7db271f431e7751086382');
}

// Adicionar event listener para detectar mudanças online/offline
window.addEventListener('online', () => {
    showNotification('Conexão com a internet restaurada', 'success');
});

window.addEventListener('offline', () => {
    showNotification('Conexão com a internet perdida', 'error');
});

// Adicionar funcionalidade de atualização automática (opcional)
let autoUpdateInterval;

function startAutoUpdate(intervalMinutes = 10) {
    stopAutoUpdate();
    autoUpdateInterval = setInterval(() => {
        if (currentCity) {
            loadWeatherData(currentCity);
            showNotification('Dados atualizados automaticamente', 'info');
        }
    }, intervalMinutes * 60 * 1000);
}

function stopAutoUpdate() {
    if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
        autoUpdateInterval = null;
    }
}

// Iniciar atualização automática após 5 segundos
setTimeout(() => {
    startAutoUpdate(15); // Atualizar a cada 15 minutos
}, 5000);