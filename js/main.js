// js/main.js

// Configuração da API WeatherStack
const API_KEY = '99a15dbcafb7db271f431e7751086382'; // Substitua pela sua chave da API
const BASE_URL = 'https://api.weatherstack.com/current';

// Simulação de armazenamento local
let favorites = [];
let searchHistory = [];

// Cache de resultados
let weatherCache = {};

// Debounce
let debounceTimeout;
const DEBOUNCE_DELAY = 1500;

// Elementos DOM
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const weatherCard = document.getElementById('weatherCard');
const addFavoriteBtn = document.getElementById('addFavoriteBtn');

let currentWeatherData = null;

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    if (searchBtn) searchBtn.addEventListener('click', searchWeatherDebounced);

    if (cityInput) {
        cityInput.addEventListener('input', searchWeatherDebounced);
    }

    if (addFavoriteBtn) addFavoriteBtn.addEventListener('click', addToFavorites);

    loadPageContent();
});

// Função debounce
function searchWeatherDebounced() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        searchWeather();
    }, DEBOUNCE_DELAY);
}

// Função principal de busca
async function searchWeather() {
    const city = cityInput?.value.trim();
    if (!city) {
        showError('Por favor, digite o nome de uma cidade.');
        return;
    }

    if (!validateApiKey()) return;

    showLoading();
    hideError();
    hideWeatherCard();

    try {
        const weatherData = await fetchWeatherData(city);
        if (weatherData) {
            displayWeatherData(weatherData);
            addToHistory(weatherData);
            currentWeatherData = weatherData;
        }
    } catch (err) {
        showError(err.message || 'Erro ao buscar dados meteorológicos.');
        console.error('Erro na API:', err);
    } finally {
        hideLoading();
    }
}

// Função para buscar dados da API ou usar mock/cache
async function fetchWeatherData(city) {
    // Retorna do cache se disponível
    if (weatherCache[city]) return weatherCache[city];

    // Tenta buscar da API real
    if (API_KEY && API_KEY !== 'YOUR_API_KEY_HERE') {
        try {
            const response = await fetch(`${BASE_URL}?access_key=${API_KEY}&query=${encodeURIComponent(city)}&units=m`);
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            const data = await response.json();
            if (data.error) throw new Error(data.error.info);

            weatherCache[city] = data;
            return data;
        } catch (err) {
            console.warn('Falha na API, usando dados simulados:', err.message);
        }
    }

    // Se falhar ou limite da API, retorna mock
    const mockData = {
        location: {
            name: city,
            country: 'País Desconhecido',
            localtime: new Date().toLocaleString()
        },
        current: {
            temperature: Math.floor(Math.random() * 30) + 10,
            weather_descriptions: ['Parcialmente nublado'],
            weather_icons: ['https://via.placeholder.com/64'],
            feelslike: Math.floor(Math.random() * 30) + 10,
            humidity: Math.floor(Math.random() * 100),
            wind_speed: Math.floor(Math.random() * 20),
            wind_dir: 'N',
            pressure: 1013,
            visibility: 10
        }
    };

    weatherCache[city] = mockData;
    return mockData;
}

// Exibir dados
function displayWeatherData(data) {
    if (!weatherCard) return;

    const cityName = document.getElementById('cityName');
    const currentTime = document.getElementById('currentTime');
    const weatherIcon = document.getElementById('weatherIcon');
    const temperature = document.getElementById('temperature');
    const description = document.getElementById('description');
    const feelsLike = document.getElementById('feelsLike');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('windSpeed');
    const windDir = document.getElementById('windDir');
    const pressure = document.getElementById('pressure');
    const visibility = document.getElementById('visibility');

    if (cityName) cityName.textContent = `${data.location.name}, ${data.location.country}`;
    if (currentTime) currentTime.textContent = `Atualizado: ${data.location.localtime}`;
    if (weatherIcon && data.current.weather_icons) {
        weatherIcon.src = data.current.weather_icons[0];
        weatherIcon.alt = data.current.weather_descriptions[0] || 'Ícone do tempo';
    }
    if (temperature) temperature.textContent = data.current.temperature || 'N/A';
    if (description) description.textContent = data.current.weather_descriptions[0] || 'Não disponível';
    if (feelsLike) feelsLike.textContent = data.current.feelslike || 'N/A';
    if (humidity) humidity.textContent = data.current.humidity || 'N/A';
    if (windSpeed) windSpeed.textContent = data.current.wind_speed || 'N/A';
    if (windDir) windDir.textContent = data.current.wind_dir || 'N/A';
    if (pressure) pressure.textContent = data.current.pressure || 'N/A';
    if (visibility) visibility.textContent = data.current.visibility || 'N/A';

    showWeatherCard();
}

// Favoritos
function addToFavorites() {
    if (!currentWeatherData) return;

    const favoriteData = {
        id: Date.now(),
        city: currentWeatherData.location.name,
        country: currentWeatherData.location.country,
        temperature: currentWeatherData.current.temperature,
        description: currentWeatherData.current.weather_descriptions[0],
        icon: currentWeatherData.current.weather_icons[0],
        addedAt: new Date().toLocaleString()
    };

    if (!favorites.find(fav => fav.city.toLowerCase() === favoriteData.city.toLowerCase())) {
        favorites.push(favoriteData);
        alert('Cidade adicionada aos favoritos!');
        displayFavorites();
    } else {
        alert('Esta cidade já está nos seus favoritos!');
    }
}

function removeFromFavorites(id) {
    favorites = favorites.filter(fav => fav.id !== id);
    displayFavorites();
}

// Histórico
function addToHistory(data) {
    const historyItem = {
        id: Date.now(),
        city: data.location.name,
        country: data.location.country,
        temperature: data.current.temperature,
        description: data.current.weather_descriptions[0],
        searchedAt: new Date().toLocaleString()
    };

    searchHistory.unshift(historyItem);
    if (searchHistory.length > 10) searchHistory = searchHistory.slice(0, 10);
    displayHistory();
}

function displayFavorites() {
    const favoritesList = document.getElementById('favoritesList');
    if (!favoritesList) return;

    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p class="no-data">Nenhuma cidade favorita adicionada ainda.</p>';
        return;
    }

    favoritesList.innerHTML = favorites.map(fav => `
        <div class="favorite-item">
            <div class="favorite-header">
                <h4>${fav.city}, ${fav.country}</h4>
                <button class="delete-btn" onclick="removeFromFavorites(${fav.id})">🗑️ Remover</button>
            </div>
            <div class="favorite-temp">${fav.temperature}°C</div>
            <div class="favorite-desc">${fav.description}</div>
            <div class="favorite-added">Adicionado em: ${fav.addedAt}</div>
        </div>
    `).join('');
}

function displayHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    if (searchHistory.length === 0) {
        historyList.innerHTML = '<p class="no-data">Nenhuma pesquisa realizada ainda.</p>';
        return;
    }

    historyList.innerHTML = searchHistory.map(item => `
        <div class="history-item">
            <div class="history-header">
                <h4>${item.city}, ${item.country}</h4>
                <span class="search-time">${item.searchedAt}</span>
            </div>
            <div class="history-temp">${item.temperature}°C</div>
            <div class="history-desc">${item.description}</div>
        </div>
    `).join('');
}

function loadPageContent() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage === 'favorites.html') displayFavorites();
    else if (currentPage === 'history.html') displayHistory();
}

// Utilitários
function showLoading() { if (loading) loading.classList.remove('hidden'); }
function hideLoading() { if (loading) loading.classList.add('hidden'); }
function showError(msg) { if (error) { error.textContent = msg; error.classList.remove('hidden'); } }
function hideError() { if (error) error.classList.add('hidden'); }
function showWeatherCard() { if (weatherCard) weatherCard.classList.remove('hidden'); }
function hideWeatherCard() { if (weatherCard) weatherCard.classList.add('hidden'); }
function validateApiKey() {
    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
        showError('⚠️ Configure sua chave da API WeatherStack no main.js para dados reais');
        return false;
    }
    return true;
}