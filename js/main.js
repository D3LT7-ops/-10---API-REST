// js/main.js

// Configuração da API WeatherStack
const API_KEY = '99a15dbcafb7db271f431e7751086382'; // Substitua pela sua chave da API
const BASE_URL = 'http://api.weatherstack.com/current';

// Simulação de armazenamento local (como não podemos usar localStorage)
let favorites = [];
let searchHistory = [];

// Elementos DOM
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const weatherCard = document.getElementById('weatherCard');
const addFavoriteBtn = document.getElementById('addFavoriteBtn');

let currentWeatherData = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    if (searchBtn) {
        searchBtn.addEventListener('click', searchWeather);
    }
    
    if (cityInput) {
        cityInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchWeather();
            }
        });
    }
    
    if (addFavoriteBtn) {
        addFavoriteBtn.addEventListener('click', addToFavorites);
    }

    // Carregar dados iniciais das páginas
    loadPageContent();
});

// Função principal para buscar dados do tempo
async function searchWeather() {
    const city = cityInput?.value.trim();
    
    if (!city) {
        showError('Por favor, digite o nome de uma cidade.');
        return;
    }

    showLoading();
    hideError();
    hideWeatherCard();

    try {
        // Simulação de requisição GET para WeatherStack API
        const weatherData = await fetchWeatherData(city);
        
        if (weatherData) {
            displayWeatherData(weatherData);
            addToHistory(weatherData);
            currentWeatherData = weatherData;
        }
    } catch (err) {
        showError('Erro ao buscar dados meteorológicos. Tente novamente.');
        console.error('Erro na API:', err);
    } finally {
        hideLoading();
    }
}

async function fetchWeatherData(city) {
    const response = await fetch(`${BASE_URL}?access_key=${API_KEY}&query=${city}&units=m`);
     const data = await response.json();
    
    // Simulação com dados fictícios para demonstração
    const mockData = {
        location: {
            name: city.charAt(0).toUpperCase() + city.slice(1).toLowerCase(),
            country: 'Brasil',
            localtime: new Date().toLocaleString('pt-BR')
        },
        current: {
            temperature: Math.floor(Math.random() * 30) + 5, // 5-35°C
            weather_descriptions: ['Ensolarado', 'Parcialmente nublado', 'Nublado', 'Chuva leve'][Math.floor(Math.random() * 4)],
            weather_icons: ['https://cdn.weatherapi.com/weather/64x64/day/113.png'],
            feelslike: Math.floor(Math.random() * 30) + 8,
            humidity: Math.floor(Math.random() * 70) + 30,
            wind_speed: Math.floor(Math.random() * 25) + 5,
            wind_dir: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
            pressure: Math.floor(Math.random() * 100) + 1000,
            visibility: Math.floor(Math.random() * 15) + 5
        }
    };

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return mockData;
}

// Exibir dados meteorológicos
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
    if (currentTime) currentTime.textContent = `Última atualização: ${data.location.localtime}`;
    if (weatherIcon) {
        weatherIcon.src = data.current.weather_icons[0];
        weatherIcon.alt = data.current.weather_descriptions[0];
    }
    if (temperature) temperature.textContent = data.current.temperature;
    if (description) description.textContent = data.current.weather_descriptions[0];
    if (feelsLike) feelsLike.textContent = data.current.feelslike;
    if (humidity) humidity.textContent = data.current.humidity;
    if (windSpeed) windSpeed.textContent = data.current.wind_speed;
    if (windDir) windDir.textContent = data.current.wind_dir;
    if (pressure) pressure.textContent = data.current.pressure;
    if (visibility) visibility.textContent = data.current.visibility;

    showWeatherCard();
}

// Adicionar aos favoritos (POST simulation)
function addToFavorites() {
    if (!currentWeatherData) return;

    const favoriteData = {
        id: Date.now(),
        city: currentWeatherData.location.name,
        country: currentWeatherData.location.country,
        temperature: currentWeatherData.current.temperature,
        description: currentWeatherData.current.weather_descriptions[0],
        icon: currentWeatherData.current.weather_icons[0],
        addedAt: new Date().toLocaleString('pt-BR')
    };

    // Simular POST request
    const existingIndex = favorites.findIndex(fav => 
        fav.city.toLowerCase() === favoriteData.city.toLowerCase()
    );

    if (existingIndex === -1) {
        favorites.push(favoriteData);
        alert('Cidade adicionada aos favoritos!');
        
        // Atualizar página de favoritos se estiver carregada
        displayFavorites();
    } else {
        alert('Esta cidade já está nos seus favoritos!');
    }
}

// Remover dos favoritos (DELETE simulation)
function removeFromFavorites(id) {
    favorites = favorites.filter(fav => fav.id !== id);
    displayFavorites();
}

// Adicionar ao histórico
function addToHistory(data) {
    const historyItem = {
        id: Date.now(),
        city: data.location.name,
        country: data.location.country,
        temperature: data.current.temperature,
        description: data.current.weather_descriptions[0],
        searchedAt: new Date().toLocaleString('pt-BR')
    };

    // Manter apenas os últimos 10 itens
    searchHistory.unshift(historyItem);
    if (searchHistory.length > 10) {
        searchHistory = searchHistory.slice(0, 10);
    }

    displayHistory();
}

// Exibir favoritos (para favorites.html)
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
                <button class="delete-btn" onclick="removeFromFavorites(${fav.id})"> Remover</button>
            </div>
            <div class="favorite-temp">${fav.temperature}°C</div>
            <div class="favorite-desc">${fav.description}</div>
            <div class="favorite-added">Adicionado em: ${fav.addedAt}</div>
        </div>
    `).join('');
}

// Exibir histórico (para history.html)
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

// Carregar conteúdo específico da página
function loadPageContent() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(currentPage) {
        case 'favorites.html':
            displayFavorites();
            break;
        case 'history.html':
            displayHistory();
            break;
        default:
            // Página inicial - nada específico a carregar
            break;
    }
}

// Funções de utilidade para mostrar/esconder elementos
function showLoading() {
    if (loading) loading.classList.remove('hidden');
}

function hideLoading() {
    if (loading) loading.classList.add('hidden');
}

function showError(message) {
    if (error) {
        error.textContent = message;
        error.classList.remove('hidden');
    }
}

function hideError() {
    if (error) error.classList.add('hidden');
}

function showWeatherCard() {
    if (weatherCard) weatherCard.classList.remove('hidden');
}

function hideWeatherCard() {
    if (weatherCard) weatherCard.classList.add('hidden');
}


async function fetchRealWeatherData(city) {
    try {
        const response = await fetch(`${BASE_URL}?access_key=${API_KEY}&query=${city}&units=m`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.info);
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao buscar dados da API:', error);
        throw error;
    }
}
