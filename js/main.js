// ===========================================
// WEATHER MONITOR - JAVASCRIPT PRINCIPAL
// ===========================================

const API_CONFIG = {
    KEY: '99a15dbcafb7db271f431e7751086382', 
    BASE_URL: 'http://api.weatherstack.com/current',
    FORECAST_URL: 'http://api.weatherstack.com/forecast',
    HISTORY_URL: 'http://api.weatherstack.com/historical'
};

// Para demonstração - simula uma API fake para favoritos
const FAVORITES_API = {
    BASE_URL: 'https://jsonplaceholder.typicode.com/posts',
    // Em um projeto real, usaria uma API específica para favoritos
};

const DEMO_MODE = false; // desativado para demonstração

// ===========================================
// ESTADO GLOBAL DA APLICAÇÃO
// ===========================================

let currentWeatherData = null;
let forecastData = [];
let favoriteLocations = [];
let currentCity = 'São Paulo';

// ===========================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Detectar página atual
    const currentPage = getCurrentPage();
    
    // Inicializar baseado na página
    switch(currentPage) {
        case 'index':
            initializeHomePage();
            break;
        case 'forecast':
            initializeForecastPage();
            break;
        case 'manage':
            initializeManagePage();
            break;
    }
    
    // Carregar favoritos (usado em todas as páginas)
    loadFavoriteLocations();
}

function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('forecast.html')) return 'forecast';
    if (path.includes('manage.html')) return 'manage';
    return 'index'; // default
}

// ===========================================
// INICIALIZAÇÃO - PÁGINA INICIAL (INDEX)
// ===========================================

function initializeHomePage() {
    setupHomeEventListeners();
    loadWeatherData(currentCity);
}

function setupHomeEventListeners() {
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const addFavoriteBtn = document.getElementById('add-favorite-btn');

    if (searchBtn) {
        searchBtn.addEventListener('click', handleHomeSearch);
    }
    
    if (cityInput) {
        cityInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleHomeSearch();
        });
    }

    // Quick city buttons
    document.querySelectorAll('.city-tag').forEach(button => {
        button.addEventListener('click', function() {
            const city = this.dataset.city;
            if (cityInput) cityInput.value = city;
            currentCity = city;
            loadWeatherData(city);
        });
    });
    
    // Add to favorites button
    if (addFavoriteBtn) {
        addFavoriteBtn.addEventListener('click', function() {
            addToFavorites(currentCity);
        });
    }
}

function handleHomeSearch() {
    const cityInput = document.getElementById('city-input');
    const city = cityInput ? cityInput.value.trim() : '';
    if (city) {
        currentCity = city;
        loadWeatherData(city);
    }
}

// ===========================================
// INICIALIZAÇÃO - PÁGINA DE PREVISÃO
// ===========================================

function initializeForecastPage() {
    setupForecastEventListeners();
    loadForecast(currentCity);
}

function setupForecastEventListeners() {
    const forecastCityInput = document.getElementById('forecast-city-input');
    const forecastSearchBtn = document.getElementById('forecast-search-btn');

    if (forecastSearchBtn) {
        forecastSearchBtn.addEventListener('click', handleForecastSearch);
    }
    
    if (forecastCityInput) {
        forecastCityInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleForecastSearch();
        });
    }
}

function handleForecastSearch() {
    const forecastCityInput = document.getElementById('forecast-city-input');
    const city = forecastCityInput ? forecastCityInput.value.trim() : '';
    if (city) {
        currentCity = city;
        loadForecast(city);
    }
}

// ===========================================
// INICIALIZAÇÃO - PÁGINA DE GERENCIAMENTO
// ===========================================

function initializeManagePage() {
    setupManageEventListeners();
    loadFavoritesList();
    updateFavoritesStats();
}

function setupManageEventListeners() {
    const addCityBtn = document.getElementById('add-city-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const exportFavoritesBtn = document.getElementById('export-favorites-btn');
    const importFavoritesBtn = document.getElementById('import-favorites-btn');
    const importFile = document.getElementById('import-file');

    if (addCityBtn) {
        addCityBtn.addEventListener('click', handleAddFavorite);
    }
    
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', handleClearAllFavorites);
    }
    
    if (exportFavoritesBtn) {
        exportFavoritesBtn.addEventListener('click', exportFavorites);
    }
    
    if (importFavoritesBtn) {
        importFavoritesBtn.addEventListener('click', () => importFile.click());
    }
    
    if (importFile) {
        importFile.addEventListener('change', handleImportFavorites);
    }

    // Quick add buttons
    document.querySelectorAll('.quick-add').forEach(button => {
        button.addEventListener('click', function() {
            const city = this.dataset.city;
            const country = this.dataset.country;
            addToFavoritesWithDetails(city, country);
        });
    });

    // Enter key support for form inputs
    const newCityInput = document.getElementById('new-city-input');
    if (newCityInput) {
        newCityInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleAddFavorite();
        });
    }
}

// ===========================================
// FUNÇÕES DA API - DADOS CLIMÁTICOS (GET)
// ===========================================

async function loadWeatherData(city) {
    showLoading('weather');
    
    try {
        let data;
        
        if (DEMO_MODE) {
            data = await simulateCurrentWeatherData(city);
        } else {
            // Requisição GET real para API
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

async function loadForecast(city) {
    showLoading('forecast');
    
    try {
        let data;
        
        if (DEMO_MODE) {
            data = await simulateForecastData(city);
        } else {
            // Requisição GET real para previsão
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
        displayWeeklySummary(data.forecast);
        
    } catch (error) {
        console.error('Erro ao carregar previsão:', error);
        showError('forecast', error.message);
    }
}

// ===========================================
// FUNÇÕES DE FAVORITOS - POST/DELETE
// ===========================================

async function addToFavorites(city) {
    try {
        // Verificar se já existe
        if (favoriteLocations.some(loc => loc.name.toLowerCase() === city.toLowerCase())) {
            showNotification('Esta cidade já está nos seus favoritos!', 'info');
            return;
        }

        // Simular requisição POST
        const newFavorite = await addFavoriteToAPI(city);
        
        favoriteLocations.push(newFavorite);
        saveFavoritesToStorage();
        
        showNotification(`${city} foi adicionada aos favoritos!`, 'success');
        
        // Atualizar UI se estiver na página de gerenciamento
        if (getCurrentPage() === 'manage') {
            loadFavoritesList();
            updateFavoritesStats();
        }
        
    } catch (error) {
        console.error('Erro ao adicionar favorito:', error);
        showNotification('Erro ao adicionar cidade aos favoritos', 'error');
    }
}

async function addFavoriteToAPI(city, country = 'Brasil', nickname = '') {
    if (DEMO_MODE) {
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
            id: Date.now(),
            name: city,
            country: country,
            nickname: nickname || city,
            addedDate: new Date().toISOString(),
            viewCount: 0
        };
    } else {
        // Requisição POST real (exemplo com JSONPlaceholder)
        const response = await fetch(FAVORITES_API.BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: city,
                body: `Cidade favorita: ${city}, ${country}`,
                userId: 1,
                city: city,
                country: country,
                nickname: nickname
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao adicionar favorito');
        }

        const data = await response.json();
        
        return {
            id: data.id,
            name: city,
            country: country,
            nickname: nickname || city,
            addedDate: new Date().toISOString(),
            viewCount: 0
        };
    }
}

async function removeFavorite(favoriteId) {
    try {
        // Simular requisição DELETE
        await deleteFavoriteFromAPI(favoriteId);
        
        favoriteLocations = favoriteLocations.filter(loc => loc.id !== favoriteId);
        saveFavoritesToStorage();
        
        showNotification('Cidade removida dos favoritos!', 'success');
        
        // Atualizar UI
        loadFavoritesList();
        updateFavoritesStats();
        
    } catch (error) {
        console.error('Erro ao remover favorito:', error);
        showNotification('Erro ao remover cidade dos favoritos', 'error');
    }
}

async function deleteFavoriteFromAPI(favoriteId) {
    if (DEMO_MODE) {
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 300));
        return { success: true };
    } else {
        // Requisição DELETE real
        const response = await fetch(`${FAVORITES_API.BASE_URL}/${favoriteId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Erro ao deletar favorito');
        }

        return await response.json();
    }
}

function handleAddFavorite() {
    const newCityInput = document.getElementById('new-city-input');
    const cityCountry = document.getElementById('city-country');
    const cityNickname = document.getElementById('city-nickname');
    
    const city = newCityInput ? newCityInput.value.trim() : '';
    const country = cityCountry ? cityCountry.value.trim() : 'Brasil';
    const nickname = cityNickname ? cityNickname.value.trim() : '';
    
    if (!city) {
        showNotification('Por favor, digite o nome da cidade!', 'error');
        return;
    }
    
    addToFavoritesWithDetails(city, country, nickname);
    
    // Limpar formulário
    if (newCityInput) newCityInput.value = '';
    if (cityNickname) cityNickname.value = '';
}

async function addToFavoritesWithDetails(city, country = 'Brasil', nickname = '') {
    try {
        // Verificar se já existe
        if (favoriteLocations.some(loc => loc.name.toLowerCase() === city.toLowerCase())) {
            showNotification('Esta cidade já está nos seus favoritos!', 'info');
            return;
        }

        const newFavorite = await addFavoriteToAPI(city, country, nickname);
        
        favoriteLocations.push(newFavorite);
        saveFavoritesToStorage();
        
        showNotification(`${city} foi adicionada aos favoritos!`, 'success');
        
        // Atualizar UI se estiver na página de gerenciamento
        if (getCurrentPage() === 'manage') {
            loadFavoritesList();
            updateFavoritesStats();
        }
        
    } catch (error) {
        console.error('Erro ao adicionar favorito:', error);
        showNotification('Erro ao adicionar cidade aos favoritos', 'error');
    }
}

function handleClearAllFavorites() {
    if (favoriteLocations.length === 0) {
        showNotification('Não há favoritos para remover!', 'info');
        return;
    }

    if (confirm('Tem certeza que deseja remover todas as cidades favoritas?')) {
        favoriteLocations = [];
        saveFavoritesToStorage();
        
        showNotification('Todos os favoritos foram removidos!', 'success');
        
        loadFavoritesList();
        updateFavoritesStats();
    }
}

// ===========================================
// INTERFACE DOS FAVORITOS
// ===========================================

function loadFavoritesList() {
    const favoritesGrid = document.getElementById('favorites-grid');
    const emptyFavorites = document.getElementById('empty-favorites');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const bulkActionsSection = document.querySelector('.bulk-actions-section');
    
    if (!favoritesGrid) return;
    
    if (favoriteLocations.length === 0) {
        if (emptyFavorites) emptyFavorites.style.display = 'block';
        if (clearAllBtn) clearAllBtn.style.display = 'none';
        if (bulkActionsSection) bulkActionsSection.style.display = 'none';
        
        favoritesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart-broken"></i>
                <h4>Nenhuma cidade favorita</h4>
                <p>Adicione suas primeiras cidades favoritas usando o formulário acima!</p>
            </div>
        `;
        return;
    }
    
    if (emptyFavorites) emptyFavorites.style.display = 'none';
    if (clearAllBtn) clearAllBtn.style.display = 'inline-flex';
    if (bulkActionsSection) bulkActionsSection.style.display = 'block';
    
    favoritesGrid.innerHTML = favoriteLocations.map(favorite => `
        <div class="favorite-item" data-id="${favorite.id}">
            <div class="favorite-header">
                <div class="favorite-info">
                    <div class="favorite-name">${favorite.nickname || favorite.name}</div>
                    <div class="favorite-country">${favorite.name}, ${favorite.country}</div>
                    <small class="favorite-date">Adicionada em ${new Date(favorite.addedDate).toLocaleDateString('pt-BR')}</small>
                </div>
                <div class="favorite-actions">
                    <button class="btn btn-info btn-sm view-weather" data-city="${favorite.name}">
                        <i class="fas fa-eye"></i>
                        Ver Clima
                    </button>
                    <button class="btn btn-danger btn-sm remove-favorite" data-id="${favorite.id}">
                        <i class="fas fa-trash"></i>
                        Remover
                    </button>
                </div>
            </div>
            <div class="favorite-stats">
                <small><i class="fas fa-eye"></i> Visualizada ${favorite.viewCount} vezes</small>
            </div>
        </div>
    `).join('');
    
    // Adicionar event listeners
    setupFavoriteItemListeners();
}

function setupFavoriteItemListeners() {
    // View weather buttons
    document.querySelectorAll('.view-weather').forEach(button => {
        button.addEventListener('click', function() {
            const city = this.dataset.city;
            
            // Incrementar contador de visualizações
            const favorite = favoriteLocations.find(loc => loc.name === city);
            if (favorite) {
                favorite.viewCount++;
                saveFavoritesToStorage();
            }
            
            // Redirecionar para página inicial com a cidade
            window.location.href = `index.html?city=${encodeURIComponent(city)}`;
        });
    });
    
    // Remove buttons
    document.querySelectorAll('.remove-favorite').forEach(button => {
        button.addEventListener('click', function() {
            const favoriteId = parseInt(this.dataset.id);
            const favorite = favoriteLocations.find(loc => loc.id === favoriteId);
            
            if (favorite && confirm(`Remover ${favorite.name} dos favoritos?`)) {
                removeFavorite(favoriteId);
            }
        });
    });
}

function updateFavoritesStats() {
    const favoritesCount = document.getElementById('favorites-count');
    const totalCities = document.getElementById('total-cities');
    const totalCountries = document.getElementById('total-countries');
    const addedToday = document.getElementById('added-today');
    const mostViewed = document.getElementById('most-viewed');
    
    if (favoritesCount) {
        favoritesCount.textContent = `${favoriteLocations.length} cidades`;
    }
    
    if (totalCities) {
        totalCities.textContent = favoriteLocations.length;
    }
    
    if (totalCountries) {
        const countries = [...new Set(favoriteLocations.map(loc => loc.country))];
        totalCountries.textContent = countries.length;
    }
    
    if (addedToday) {
        const today = new Date().toDateString();
        const todayCount = favoriteLocations.filter(loc => 
            new Date(loc.addedDate).toDateString() === today
        ).length;
        addedToday.textContent = todayCount;
    }
    
    if (mostViewed) {
        if (favoriteLocations.length > 0) {
            const mostViewedCity = favoriteLocations.reduce((prev, current) => 
                (prev.viewCount > current.viewCount) ? prev : current
            );
            mostViewed.textContent = mostViewedCity.name;
        } else {
            mostViewed.textContent = '--';
        }
    }
}

// ===========================================
// ARMAZENAMENTO LOCAL
// ===========================================

function loadFavoriteLocations() {
    try {
        const stored = localStorage.getItem('weatherMonitorFavorites');
        if (stored) {
            favoriteLocations = JSON.parse(stored);
        } else {
            // Dados iniciais de demonstração
            favoriteLocations = [
                {
                    id: 1,
                    name: 'São Paulo',
                    country: 'Brasil',
                    nickname: 'Sampa',
                    addedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    viewCount: 5
                },
                {
                    id: 2,
                    name: 'Rio de Janeiro',
                    country: 'Brasil',
                    nickname: 'Cidade Maravilhosa',
                    addedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    viewCount: 3
                }
            ];
            saveFavoritesToStorage();
        }
    } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
        favoriteLocations = [];
    }
}

function saveFavoritesToStorage() {
    try {
        localStorage.setItem('weatherMonitorFavorites', JSON.stringify(favoriteLocations));
    } catch (error) {
        console.error('Erro ao salvar favoritos:', error);
    }
}

// ===========================================
// EXPORT/IMPORT DE FAVORITOS
// ===========================================

function exportFavorites() {
    const dataStr = JSON.stringify(favoriteLocations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `favoritos_weather_monitor_${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Favoritos exportados com sucesso!', 'success');
}

function handleImportFavorites(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedFavorites = JSON.parse(e.target.result);
            
            if (Array.isArray(importedFavorites)) {
                // Mesclar com favoritos existentes (evitar duplicatas)
                importedFavorites.forEach(imported => {
                    if (!favoriteLocations.some(existing => 
                        existing.name.toLowerCase() === imported.name.toLowerCase()
                    )) {
                        // Gerar novo ID para evitar conflitos
                        imported.id = Date.now() + Math.random();
                        favoriteLocations.push(imported);
                    }
                });
                
                saveFavoritesToStorage();
                loadFavoritesList();
                updateFavoritesStats();
                
                showNotification('Favoritos importados com sucesso!', 'success');
            } else {
                throw new Error('Formato de arquivo inválido');
            }
        } catch (error) {
            console.error('Erro ao importar favoritos:', error);
            showNotification('Erro ao importar favoritos. Verifique o formato do arquivo.', 'error');
        }
    };
    
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
}

// ===========================================
// DADOS SIMULADOS (DEMO MODE)
// ===========================================

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
// EXIBIÇÃO DE DADOS
// ===========================================

function displayWeatherData(data) {
    const { location, current } = data;

    // Update location
    const locationName = document.getElementById('location-name');
    const locationDetails = document.getElementById('location-details');
    if (locationName) locationName.textContent = location.name;
    if (locationDetails) locationDetails.textContent = `${location.region}, ${location.country}`;

    // Update weather icon and temperature
    const weatherIcon = document.getElementById('weather-icon');
    const temperature = document.getElementById('temperature');
    if (weatherIcon) {
        weatherIcon.src = current.weather_icons[0];
        weatherIcon.alt = current.weather_descriptions[0];
    }
    if (temperature) temperature.textContent = `${current.temperature}°C`;

    // Update weather description
    const weatherDesc = document.getElementById('weather-desc');
    const feelsLike = document.getElementById('feels-like');
    if (weatherDesc) weatherDesc.textContent = current.weather_descriptions[0];
    if (feelsLike) feelsLike.textContent = `${current.feelslike}°C`;

    // Update weather details
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('wind-speed');
    const visibility = document.getElementById('visibility');
    const pressure = document.getElementById('pressure');
    
    if (humidity) humidity.textContent = `${current.humidity}%`;
    if (windSpeed) windSpeed.textContent = `${current.wind_speed} km/h`;
    if (visibility) visibility.textContent = `${current.visibility} km`;
    if (pressure) pressure.textContent = `${current.pressure} mb`;

    // Update precipitation
    const precipitation = document.getElementById('precipitation');
    if (precipitation) precipitation.textContent = `${current.precip} mm`;
    updatePrecipitationGauge(current.precip);
    updatePrecipitationStatus(current.precip);

    // Update UV index
    const uvIndex = document.getElementById('uv-index');
    if (uvIndex) uvIndex.textContent = current.uv_index;
    updateUVStatus(current.uv_index);
    updateUVBar(current.uv_index);

    // Update additional info
    updateAdditionalInfo(current);

    // Show content
    hideLoading('weather');
    const weatherContent = document.getElementById('weather-content');
    if (weatherContent) {
        weatherContent.style.display = 'block';
        weatherContent.classList.add('fade-in');
    }
}

function displayForecastData(data) {
    const { location, forecast } = data;
    
    // Update location
    const forecastLocation = document.getElementById('forecast-location');
    if (forecastLocation) {
        forecastLocation.textContent = `${location.name}, ${location.country}`;
    }
    
    const lastUpdate = document.getElementById('last-update');
    if (lastUpdate) {
        lastUpdate.textContent = new Date().toLocaleString('pt-BR');
    }
    
    // Create forecast cards
    const forecastGrid = document.getElementById('forecast-grid');
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

function displayWeeklySummary(forecastData) {
    if (!forecastData) return;
    
    const temps = forecastData.map(day => day.avgtemp);
    const precips = forecastData.map(day => day.precip);
    const winds = forecastData.map(day => day.wind);
    
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const totalPrecip = precips.reduce((a, b) => a + b, 0);
    const avgWind = winds.reduce((a, b) => a + b, 0) / winds.length;
    const rainyDays = precips.filter(p => p > 1).length;
    
    const avgWeekTemp = document.getElementById('avg-week-temp');
    const totalWeekPrecip = document.getElementById('total-week-precip');
    const rainyDaysCount = document.getElementById('rainy-days-count');
    const avgWeekWind = document.getElementById('avg-week-wind');
    
    if (avgWeekTemp) avgWeekTemp.textContent = `${Math.round(avgTemp)}°C`;
    if (totalWeekPrecip) totalWeekPrecip.textContent = `${totalPrecip.toFixed(1)} mm`;
    if (rainyDaysCount) rainyDaysCount.textContent = `${rainyDays} dias`;
    if (avgWeekWind) avgWeekWind.textContent = `${Math.round(avgWind)} km/h`;
    
    const weeklySummary = document.getElementById('weekly-summary');
    if (weeklySummary) weeklySummary.style.display = 'block';
}

function createPrecipitationChart(forecastData) {
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
    
    const chartContainer = document.getElementById('precipitation-chart');
    if (chartContainer) chartContainer.style.display = 'block';
}

function updatePrecipitationGauge(precip) {
    const precipGauge = document.getElementById('precip-gauge');
    if (precipGauge) {
        const percentage = Math.min((precip / 100) * 100, 100);
        precipGauge.style.width = `${percentage}%`;
    }
}

function updatePrecipitationStatus(precip) {
    const precipStatus = document.getElementById('precip-status');
    if (!precipStatus) return;
    
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
    const uvStatus = document.getElementById('uv-status');
    if (!uvStatus) return;
    
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
    const uvFill = document.getElementById('uv-fill');
    if (uvFill) {
        const percentage = Math.min((uvIndex / 12) * 100, 100);
        uvFill.style.width = `${percentage}%`;
    }
}

function updateAdditionalInfo(current) {
    // Temperature range (simulated)
    const tempRange = document.getElementById('temp-range');
    if (tempRange) {
        const minTemp = current.temperature - 3;
        const maxTemp = current.temperature + 5;
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
// INICIALIZAÇÃO E CONFIGURAÇÕES FINAIS
// ===========================================

// Detectar parâmetros da URL (para navegação entre páginas)
function checkURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const cityParam = urlParams.get('city');
    
    if (cityParam) {
        currentCity = cityParam;
        
        // Atualizar input se existir
        const cityInput = document.getElementById('city-input');
        if (cityInput) cityInput.value = cityParam;
        
        // Carregar dados da cidade
        if (getCurrentPage() === 'index') {
            loadWeatherData(cityParam);
        } else if (getCurrentPage() === 'forecast') {
            const forecastInput = document.getElementById('forecast-city-input');
            if (forecastInput) forecastInput.value = cityParam;
            loadForecast(cityParam);
        }
    }
}

// Executar checagem de parâmetros após inicialização
setTimeout(checkURLParams, 100);

// Log de inicialização
console.log('Weather Monitor carregado com sucesso!');
console.log('Página atual:', getCurrentPage());
console.log('Modo demonstração:', DEMO_MODE ? 'ATIVO' : 'INATIVO');

// Adicionar event listener para detectar mudanças online/offline
window.addEventListener('online', () => {
    showNotification('Conexão com a internet restaurada', 'success');
});

window.addEventListener('offline', () => {
    showNotification('Conexão com a internet perdida', 'error');
});

// ===========================================
// FUNÇÕES GLOBAIS PARA USO EM OUTRAS PÁGINAS
// ===========================================

// Disponibilizar funções globalmente
window.weatherMonitor = {
    loadWeatherData,
    loadForecast,
    addToFavorites,
    removeFavorite,
    getCurrentPage,
    showNotification
};

console.log('Weather Monitor API disponível globalmente via window.weatherMonitor');