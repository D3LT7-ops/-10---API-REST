// ===========================================
// WEATHER MONITOR - VERSÃO SIMPLES E COMPLETA
// ===========================================

// CONFIGURAÇÕES
const CONFIG = {
    API_KEY: '99a15dbcafb7db271f431e7751086382',
    BASE_URL: 'https://api.weatherstack.com/current',
    DEMO_MODE: false, // Mude para true para usar a api fake
    DEFAULT_CITY: 'São Paulo'
};

// ESTADO GLOBAL
let currentWeather = null;
let favorites = JSON.parse(localStorage.getItem('weather-favorites') || '[]');

// ===========================================
// INICIALIZAÇÃO
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    const page = getCurrentPage();
    console.log('Inicializando:', page);
    
    if (page === 'home') {
        initHome();
    } else if (page === 'forecast') {
        initForecast();
    } else if (page === 'manage') {
        initManage();
    }
    
    checkUrlParams();
});

function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('forecast')) return 'forecast';
    if (path.includes('manage')) return 'manage';
    return 'home';
}

// ===========================================
// PÁGINA INICIAL
// ===========================================

function initHome() {
    // Botão de busca
    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');
    const addFavoriteBtn = document.getElementById('add-favorite-btn');

    if (searchBtn) {
        searchBtn.onclick = () => searchWeather();
    }
    
    if (cityInput) {
        cityInput.onkeypress = (e) => {
            if (e.key === 'Enter') searchWeather();
        };
    }
    
    if (addFavoriteBtn) {
        addFavoriteBtn.onclick = () => {
            const city = cityInput?.value.trim() || CONFIG.DEFAULT_CITY;
            addFavorite(city);
        };
    }
    
    // Botões de cidade rápida
    document.querySelectorAll('.city-tag').forEach(btn => {
        btn.onclick = () => {
            const city = btn.dataset.city;
            if (cityInput) cityInput.value = city;
            loadWeather(city);
        };
    });
    
    // Carregar cidade padrão
    loadWeather(CONFIG.DEFAULT_CITY);
}

function searchWeather() {
    const cityInput = document.getElementById('city-input');
    const city = cityInput?.value.trim();
    
    if (city) {
        loadWeather(city);
    } else {
        showMessage('Digite o nome de uma cidade', 'error');
    }
}

// ===========================================
// PÁGINA DE PREVISÃO
// ===========================================

function initForecast() {
    const searchBtn = document.getElementById('forecast-search-btn');
    const cityInput = document.getElementById('forecast-city-input');

    if (searchBtn) {
        searchBtn.onclick = () => {
            const city = cityInput?.value.trim();
            if (city) loadForecast(city);
        };
    }
    
    if (cityInput) {
        cityInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                const city = cityInput.value.trim();
                if (city) loadForecast(city);
            }
        };
    }
    
    loadForecast(CONFIG.DEFAULT_CITY);
}

// ===========================================
// PÁGINA DE GERENCIAMENTO
// ===========================================

function initManage() {
    const addBtn = document.getElementById('add-city-btn');
    const clearBtn = document.getElementById('clear-all-btn');
    const newCityInput = document.getElementById('new-city-input');
    
    if (addBtn) {
        addBtn.onclick = () => handleAddFavorite();
    }
    
    if (clearBtn) {
        clearBtn.onclick = () => handleClearAll();
    }
    
    if (newCityInput) {
        newCityInput.onkeypress = (e) => {
            if (e.key === 'Enter') handleAddFavorite();
        };
    }
    
    // Botões de adição rápida
    document.querySelectorAll('.quick-add').forEach(btn => {
        btn.onclick = () => {
            const city = btn.dataset.city;
            addFavorite(city);
        };
    });
    
    loadFavoritesList();
}

function handleAddFavorite() {
    const input = document.getElementById('new-city-input');
    const city = input?.value.trim();
    
    if (city) {
        addFavorite(city);
        input.value = '';
    } else {
        showMessage('Digite o nome da cidade', 'error');
    }
}

function handleClearAll() {
    if (favorites.length === 0) {
        showMessage('Nenhum favorito para remover', 'info');
        return;
    }
    
    if (confirm('Remover todas as cidades favoritas?')) {
        favorites = [];
        saveFavorites();
        loadFavoritesList();
        showMessage('Favoritos removidos!', 'success');
    }
}

// ===========================================
// CARREGAMENTO DE DADOS
// ===========================================

async function loadWeather(city) {
    showLoading();
    
    try {
        const data = CONFIG.DEMO_MODE ? 
            await getDemoWeather(city) : 
            await getApiWeather(city);
        
        currentWeather = data;
        displayWeather(data);
        showMessage(`Dados carregados: ${city}`, 'success');
        
    } catch (error) {
        console.error('Erro:', error);
        showMessage('Erro ao carregar dados', 'error');
    } finally {
        hideLoading();
    }
}

async function loadForecast(city) {
    showLoading();
    
    try {
        const data = await getDemoForecast(city);
        displayForecast(data);
        showMessage(`Previsão: ${city}`, 'success');
        
    } catch (error) {
        console.error('Erro:', error);
        showMessage('Erro ao carregar previsão', 'error');
    } finally {
        hideLoading();
    }
}

// ===========================================
// API E DADOS DEMO
// ===========================================

async function getApiWeather(city) {
    const url = `${CONFIG.BASE_URL}?access_key=${CONFIG.API_KEY}&query=${city}&units=m`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Erro na API');
    
    const data = await response.json();
    if (data.error) throw new Error(data.error.info);
    
    return data;
}

async function getDemoWeather(city) {
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const cities = {
        'São Paulo': { temp: 23, desc: 'Parcialmente nublado', humidity: 65, wind: 12 },
        'Rio de Janeiro': { temp: 28, desc: 'Ensolarado', humidity: 75, wind: 8 },
        'Belo Horizonte': { temp: 21, desc: 'Nublado', humidity: 70, wind: 15 },
        'Salvador': { temp: 30, desc: 'Ensolarado', humidity: 80, wind: 18 },
        'Brasília': { temp: 24, desc: 'Claro', humidity: 45, wind: 10 }
    };
    
    const cityData = cities[city] || {
        temp: 15 + Math.random() * 15,
        desc: 'Moderado',
        humidity: 50 + Math.random() * 30,
        wind: 5 + Math.random() * 15
    };
    
    return {
        location: {
            name: city,
            country: 'Brasil',
            region: getRegion(city)
        },
        current: {
            temperature: Math.round(cityData.temp),
            weather_descriptions: [cityData.desc],
            weather_icons: ['https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0002_sunny_intervals.png'],
            feelslike: Math.round(cityData.temp + 2),
            humidity: Math.round(cityData.humidity),
            wind_speed: Math.round(cityData.wind),
            pressure: Math.round(1000 + Math.random() * 30),
            precip: Math.round(Math.random() * 10 * 10) / 10,
            uv_index: Math.floor(Math.random() * 11),
            visibility: Math.round(5 + Math.random() * 10)
        }
    };
}

async function getDemoForecast(city) {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const days = ['Hoje', 'Amanhã', 'Quinta', 'Sexta', 'Sábado', 'Domingo', 'Segunda'];
    const conditions = ['Ensolarado', 'Parcialmente nublado', 'Nublado', 'Chuva leve'];
    
    return {
        location: { name: city, country: 'Brasil' },
        forecast: days.map((day, i) => {
            const temp = 18 + Math.random() * 12;
            return {
                day,
                maxtemp: Math.round(temp + 5),
                mintemp: Math.round(temp - 3),
                condition: conditions[Math.floor(Math.random() * conditions.length)],
                precip: Math.round(Math.random() * 8 * 10) / 10,
                icon: 'https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0002_sunny_intervals.png'
            };
        })
    };
}

function getRegion(city) {
    const regions = {
        'São Paulo': 'SP', 'Rio de Janeiro': 'RJ', 'Belo Horizonte': 'MG',
        'Salvador': 'BA', 'Brasília': 'DF', 'Fortaleza': 'CE',
        'Curitiba': 'PR', 'Recife': 'PE', 'Porto Alegre': 'RS'
    };
    return regions[city] || 'BR';
}

// ===========================================
// EXIBIÇÃO DOS DADOS
// ===========================================

function displayWeather(data) {
    const { location, current } = data;
    
    // Localização
    setText('location-name', location.name);
    setText('location-details', `${location.region}, ${location.country}`);
    
    // Temperatura
    setText('temperature', `${current.temperature}°C`);
    setText('feels-like', `${current.feelslike}°C`);
    setText('weather-desc', current.weather_descriptions[0]);
    
    // Ícone
    const icon = document.getElementById('weather-icon');
    if (icon) {
        icon.src = current.weather_icons[0];
        icon.alt = current.weather_descriptions[0];
    }
    
    // Detalhes
    setText('humidity', `${current.humidity}%`);
    setText('wind-speed', `${current.wind_speed} km/h`);
    setText('pressure', `${current.pressure} mb`);
    setText('precipitation', `${current.precip} mm`);
    setText('uv-index', current.uv_index);
    setText('visibility', `${current.visibility} km`);
    
    // Mostrar conteúdo
    showContent();
}

function displayForecast(data) {
    const { location, forecast } = data;
    
    setText('forecast-location', `${location.name}, ${location.country}`);
    setText('last-update', new Date().toLocaleString('pt-BR'));
    
    const grid = document.getElementById('forecast-grid');
    if (grid) {
        grid.innerHTML = forecast.map(day => `
            <div class="forecast-card">
                <div class="forecast-day">${day.day}</div>
                <img src="${day.icon}" alt="${day.condition}" style="width: 50px; height: 50px;">
                <div class="forecast-temps">
                    <span style="color: #e74c3c; font-weight: bold;">${day.maxtemp}°</span>
                    <span style="color: #3498db; margin-left: 8px;">${day.mintemp}°</span>
                </div>
                <div style="font-size: 0.9rem; color: #666; margin: 5px 0;">${day.condition}</div>
                <div style="font-size: 0.8rem; color: #3498db;">
                    <i class="fas fa-tint"></i> ${day.precip}mm
                </div>
            </div>
        `).join('');
        
        grid.style.display = 'grid';
    }
}

// ===========================================
// GERENCIAMENTO DE FAVORITOS
// ===========================================

function addFavorite(city) {
    if (favorites.find(f => f.name.toLowerCase() === city.toLowerCase())) {
        showMessage('Cidade já está nos favoritos', 'info');
        return;
    }
    
    favorites.push({
        id: Date.now(),
        name: city,
        addedDate: new Date().toISOString()
    });
    
    saveFavorites();
    
    if (getCurrentPage() === 'manage') {
        loadFavoritesList();
    }
    
    showMessage(`${city} adicionada!`, 'success');
}

function removeFavorite(id) {
    favorites = favorites.filter(f => f.id !== id);
    saveFavorites();
    loadFavoritesList();
    showMessage('Cidade removida!', 'success');
}

function loadFavoritesList() {
    const grid = document.getElementById('favorites-grid');
    if (!grid) return;
    
    if (favorites.length === 0) {
        grid.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <i class="fas fa-heart" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                <h3>Nenhuma cidade favorita</h3>
                <p>Adicione cidades usando o formulário acima</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = favorites.map(fav => `
        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h4 style="margin: 0; color: #333;">${fav.name}</h4>
                <small style="color: #666;">Adicionada em ${new Date(fav.addedDate).toLocaleDateString('pt-BR')}</small>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button onclick="viewWeather('${fav.name}')" style="background: #3498db; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer;">
                    Ver Clima
                </button>
                <button onclick="removeFavorite(${fav.id})" style="background: #e74c3c; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer;">
                    Remover
                </button>
            </div>
        </div>
    `).join('');
}

function viewWeather(city) {
    window.location.href = `index.html?city=${encodeURIComponent(city)}`;
}

function saveFavorites() {
    localStorage.setItem('weather-favorites', JSON.stringify(favorites));
}

// ===========================================
// FUNÇÕES UTILITÁRIAS
// ===========================================

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function showLoading() {
    const loader = document.getElementById('weather-loading') || 
                  document.getElementById('forecast-loading') ||
                  document.getElementById('alerts-loading');
    
    if (loader) {
        loader.style.display = 'block';
        loader.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                <p>Carregando...</p>
            </div>
        `;
    }
    
    hideContent();
}

function hideLoading() {
    const loaders = ['weather-loading', 'forecast-loading', 'alerts-loading'];
    loaders.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function showContent() {
    const content = document.getElementById('weather-content');
    if (content) {
        content.style.display = 'block';
        content.style.animation = 'fadeIn 0.5s ease';
    }
}

function hideContent() {
    const contents = ['weather-content', 'forecast-grid'];
    contents.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function showMessage(message, type = 'info') {
    // Remove mensagens anteriores
    document.querySelectorAll('.weather-notification').forEach(n => n.remove());
    
    const colors = {
        success: '#27ae60',
        error: '#e74c3c', 
        info: '#3498db',
        warning: '#f39c12'
    };
    
    const notification = document.createElement('div');
    notification.className = 'weather-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    
    notification.innerHTML = `
        ${message}
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; margin-left: 10px; cursor: pointer; font-size: 16px;">×</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 4000);
}

function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const city = params.get('city');
    
    if (city) {
        const input = document.getElementById('city-input') || 
                     document.getElementById('forecast-city-input');
        if (input) input.value = city;
        
        if (getCurrentPage() === 'home') {
            loadWeather(city);
        } else if (getCurrentPage() === 'forecast') {
            loadForecast(city);
        }
    }
}

// ===========================================
// ESTILOS CSS
// ===========================================

const styles = document.createElement('style');
styles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .forecast-card {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
        transition: transform 0.2s ease;
    }
    
    .forecast-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    button:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        transition: all 0.2s ease;
    }
`;
document.head.appendChild(styles);

// ===========================================
// API GLOBAL
// ===========================================

window.WeatherMonitor = {
    loadWeather,
    loadForecast,
    addFavorite,
    removeFavorite,
    showMessage,
    getFavorites: () => favorites,
    config: CONFIG
};

console.log('🌤️ Weather Monitor carregado!');
console.log('Demo Mode:', CONFIG.DEMO_MODE ? 'ON' : 'OFF');