// ===========================================
// WEATHER MONITOR - VERSÃO CORRIGIDA
// ===========================================

// CONFIGURAÇÕES
const CONFIG = {
    API_KEY: '99a15dbcafb7db271f431e7751086382',
    BASE_URL: 'https://api.weatherstack.com/current',
    DEMO_MODE: false, // API real ativada
    DEFAULT_CITY: 'São Paulo'
};

// ESTADO GLOBAL - REMOVIDO localStorage para compatibilidade
let currentWeather = null;
let favorites = []; // Inicializado como array vazio

// ===========================================
// INICIALIZAÇÃO
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    const page = getCurrentPage();
    console.log('Inicializando:', page);
    
    // Carregar favoritos do armazenamento local se disponível
    loadFavoritesFromStorage();
    
    if (page === 'home') {
        initHome();
    } else if (page === 'alerts') { // Corrigido: era 'forecast', agora é 'alerts'
        initAlerts();
    } else if (page === 'manage') {
        initManage();
    }
    
    checkUrlParams();
});

function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop().toLowerCase();
    
    if (filename.includes('alerts') || filename === 'alerts.html') return 'alerts';
    if (filename.includes('manage') || filename === 'manage.html') return 'manage';
    return 'home';
}

// ===========================================
// GERENCIAMENTO DE ARMAZENAMENTO
// ===========================================

function loadFavoritesFromStorage() {
    try {
        if (typeof(Storage) !== "undefined" && localStorage) {
            const stored = localStorage.getItem('weather-favorites');
            if (stored) {
                favorites = JSON.parse(stored);
            }
        }
    } catch (e) {
        console.warn('localStorage não disponível, usando armazenamento em memória');
        favorites = [];
    }
}

function saveFavorites() {
    try {
        if (typeof(Storage) !== "undefined" && localStorage) {
            localStorage.setItem('weather-favorites', JSON.stringify(favorites));
        }
    } catch (e) {
        console.warn('Não foi possível salvar no localStorage');
    }
}

// ===========================================
// PÁGINA INICIAL (index.html)
// ===========================================

function initHome() {
    console.log('Inicializando página inicial');
    
    // Botão de busca
    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');
    const addFavoriteBtn = document.getElementById('add-favorite-btn');

    if (searchBtn) {
        searchBtn.onclick = () => searchWeather();
        console.log('Botão de busca configurado');
    }
    
    if (cityInput) {
        cityInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchWeather();
            }
        };
        console.log('Campo de entrada configurado');
    }
    
    if (addFavoriteBtn) {
        addFavoriteBtn.onclick = () => {
            const city = cityInput?.value.trim() || CONFIG.DEFAULT_CITY;
            addFavorite(city);
        };
        console.log('Botão de favoritos configurado');
    }
    
    // Botões de cidade rápida
    const cityTags = document.querySelectorAll('.city-tag');
    cityTags.forEach(btn => {
        btn.onclick = () => {
            const city = btn.dataset.city || btn.textContent.trim();
            if (cityInput) cityInput.value = city;
            loadWeather(city);
        };
    });
    console.log(`${cityTags.length} botões de cidade rápida configurados`);
    
    // Carregar cidade padrão
    setTimeout(() => {
        loadWeather(CONFIG.DEFAULT_CITY);
    }, 500);
}

function searchWeather() {
    const cityInput = document.getElementById('city-input');
    const city = cityInput?.value.trim();
    
    console.log('Buscando clima para:', city);
    
    if (city && city.length > 0) {
        loadWeather(city);
    } else {
        showMessage('Por favor, digite o nome de uma cidade', 'warning');
    }
}

// ===========================================
// PÁGINA DE ALERTAS (alerts.html)
// ===========================================

function initAlerts() {
    console.log('Inicializando página de alertas');
    
    const searchBtn = document.getElementById('alerts-search-btn') || 
                     document.getElementById('forecast-search-btn');
    const cityInput = document.getElementById('alerts-city-input') || 
                     document.getElementById('forecast-city-input');

    if (searchBtn) {
        searchBtn.onclick = () => {
            const city = cityInput?.value.trim();
            if (city) {
                loadForecast(city);
            } else {
                showMessage('Digite o nome de uma cidade', 'warning');
            }
        };
    }
    
    if (cityInput) {
        cityInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const city = cityInput.value.trim();
                if (city) loadForecast(city);
            }
        };
    }
    
    // Carregar previsão padrão
    setTimeout(() => {
        loadForecast(CONFIG.DEFAULT_CITY);
    }, 500);
}

// ===========================================
// PÁGINA DE GERENCIAMENTO (manage.html)
// ===========================================

function initManage() {
    console.log('Inicializando página de gerenciamento');
    
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
            if (e.key === 'Enter') {
                e.preventDefault();
                handleAddFavorite();
            }
        };
    }
    
    // Botões de adição rápida
    document.querySelectorAll('.quick-add').forEach(btn => {
        btn.onclick = () => {
            const city = btn.dataset.city || btn.textContent.trim();
            addFavorite(city);
        };
    });
    
    // Carregar lista de favoritos
    loadFavoritesList();
}

function handleAddFavorite() {
    const input = document.getElementById('new-city-input');
    const city = input?.value.trim();
    
    if (city && city.length > 0) {
        addFavorite(city);
        input.value = '';
    } else {
        showMessage('Digite o nome da cidade', 'warning');
    }
}

function handleClearAll() {
    if (favorites.length === 0) {
        showMessage('Nenhum favorito para remover', 'info');
        return;
    }
    
    if (confirm('Deseja remover todas as cidades favoritas?')) {
        favorites = [];
        saveFavorites();
        loadFavoritesList();
        showMessage('Todos os favoritos foram removidos!', 'success');
    }
}

// ===========================================
// CARREGAMENTO DE DADOS
// ===========================================

async function loadWeather(city) {
    console.log('Carregando clima para:', city);
    showLoading('weather-loading');
    
    try {
        console.log('Usando API real da WeatherStack');
        const data = await getApiWeather(city);
        
        currentWeather = data;
        displayWeather(data);
        showMessage(`Dados carregados para ${city}`, 'success');
        
    } catch (error) {
        console.error('Erro ao carregar clima:', error);
        showMessage(`Erro ao carregar dados de ${city}: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

async function loadForecast(city) {
    console.log('Carregando previsão para:', city);
    showLoading('forecast-loading');
    
    try {
        const data = await getDemoForecast(city);
        displayForecast(data);
        showMessage(`Previsão carregada para ${city}`, 'success');
        
    } catch (error) {
        console.error('Erro ao carregar previsão:', error);
        showMessage(`Erro ao carregar previsão: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// ===========================================
// API E DADOS DEMO
// ===========================================

async function getApiWeather(city) {
    const url = `${CONFIG.BASE_URL}?access_key=${CONFIG.API_KEY}&query=${encodeURIComponent(city)}&units=m`;
    console.log('Fazendo requisição para:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
        throw new Error(`Erro da API: ${data.error.info || data.error.type || 'Erro desconhecido'}`);
    }
    
    if (!data.current) {
        throw new Error('Dados de clima não encontrados');
    }
    
    return data;
}

async function getDemoWeather(city) {
    console.log('Gerando dados demo para:', city);
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    
    const cities = {
        'São Paulo': { temp: 23, desc: 'Parcialmente nublado', humidity: 65, wind: 12 },
        'Rio de Janeiro': { temp: 28, desc: 'Ensolarado', humidity: 75, wind: 8 },
        'Belo Horizonte': { temp: 21, desc: 'Nublado', humidity: 70, wind: 15 },
        'Salvador': { temp: 30, desc: 'Ensolarado', humidity: 80, wind: 18 },
        'Brasília': { temp: 24, desc: 'Claro', humidity: 45, wind: 10 },
        'Fortaleza': { temp: 32, desc: 'Ensolarado', humidity: 78, wind: 14 },
        'Curitiba': { temp: 18, desc: 'Nublado', humidity: 72, wind: 11 },
        'Recife': { temp: 29, desc: 'Parcialmente nublado', humidity: 82, wind: 16 },
        'Porto Alegre': { temp: 20, desc: 'Chuvoso', humidity: 85, wind: 13 }
    };
    
    const cityData = cities[city] || {
        temp: Math.round(15 + Math.random() * 15),
        desc: ['Ensolarado', 'Nublado', 'Parcialmente nublado', 'Claro'][Math.floor(Math.random() * 4)],
        humidity: Math.round(50 + Math.random() * 30),
        wind: Math.round(5 + Math.random() * 15)
    };
    
    return {
        location: {
            name: city,
            country: 'Brasil',
            region: getRegion(city)
        },
        current: {
            temperature: cityData.temp,
            weather_descriptions: [cityData.desc],
            weather_icons: ['https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0002_sunny_intervals.png'],
            feelslike: cityData.temp + Math.round(Math.random() * 4 - 2),
            humidity: cityData.humidity,
            wind_speed: cityData.wind,
            pressure: Math.round(1000 + Math.random() * 30),
            precip: Math.round(Math.random() * 10 * 10) / 10,
            uv_index: Math.floor(Math.random() * 11),
            visibility: Math.round(5 + Math.random() * 10)
        }
    };
}

async function getDemoForecast(city) {
    console.log('Gerando previsão demo para:', city);
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const days = ['Hoje', 'Amanhã', 'Quinta', 'Sexta', 'Sábado', 'Domingo', 'Segunda'];
    const conditions = ['Ensolarado', 'Parcialmente nublado', 'Nublado', 'Chuva leve', 'Claro'];
    
    return {
        location: { name: city, country: 'Brasil' },
        forecast: days.map((day, i) => {
            const baseTemp = 18 + Math.random() * 12;
            return {
                day,
                maxtemp: Math.round(baseTemp + 3 + Math.random() * 4),
                mintemp: Math.round(baseTemp - 2 - Math.random() * 3),
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
        'Curitiba': 'PR', 'Recife': 'PE', 'Porto Alegre': 'RS',
        'Manaus': 'AM', 'Belém': 'PA', 'Goiânia': 'GO'
    };
    return regions[city] || 'BR';
}

// ===========================================
// EXIBIÇÃO DOS DADOS
// ===========================================

function displayWeather(data) {
    console.log('Exibindo dados do clima:', data);
    
    if (!data || !data.location || !data.current) {
        console.error('Dados inválidos recebidos:', data);
        showMessage('Dados de clima inválidos', 'error');
        return;
    }
    
    const { location, current } = data;
    
    // Localização
    setText('location-name', location.name);
    setText('location-details', `${location.region || ''}, ${location.country || ''}`);
    
    // Temperatura principal
    setText('temperature', `${current.temperature}°C`);
    setText('feels-like', `Sensação: ${current.feelslike}°C`);
    setText('weather-desc', current.weather_descriptions?.[0] || 'N/A');
    
    // Ícone do clima
    const icon = document.getElementById('weather-icon');
    if (icon && current.weather_icons?.[0]) {
        icon.src = current.weather_icons[0];
        icon.alt = current.weather_descriptions?.[0] || 'Clima';
        icon.style.display = 'block';
    }
    
    // Detalhes do clima
    setText('humidity', `${current.humidity || 0}%`);
    setText('wind-speed', `${current.wind_speed || 0} km/h`);
    setText('pressure', `${current.pressure || 0} mb`);
    setText('precipitation', `${current.precip || 0} mm`);
    setText('uv-index', current.uv_index || 0);
    setText('visibility', `${current.visibility || 0} km`);
    
    // Mostrar conteúdo
    showContent();
    console.log('Dados exibidos com sucesso');
}

function displayForecast(data) {
    console.log('Exibindo previsão:', data);
    
    if (!data || !data.location || !data.forecast) {
        console.error('Dados de previsão inválidos:', data);
        showMessage('Dados de previsão inválidos', 'error');
        return;
    }
    
    const { location, forecast } = data;
    
    setText('forecast-location', `${location.name}, ${location.country}`);
    setText('last-update', new Date().toLocaleString('pt-BR'));
    
    const grid = document.getElementById('forecast-grid') || 
                 document.getElementById('alerts-grid');
                 
    if (grid && forecast && Array.isArray(forecast)) {
        grid.innerHTML = forecast.map(day => `
            <div class="forecast-card">
                <div class="forecast-day" style="font-weight: bold; margin-bottom: 0.5rem;">${day.day}</div>
                <img src="${day.icon}" alt="${day.condition}" style="width: 50px; height: 50px; margin: 0.5rem 0;">
                <div class="forecast-temps" style="margin: 0.5rem 0;">
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
        console.log('Previsão exibida com sucesso');
    } else {
        console.error('Grid de previsão não encontrado ou dados inválidos');
    }
}

// ===========================================
// GERENCIAMENTO DE FAVORITOS
// ===========================================

function addFavorite(city) {
    if (!city || city.trim().length === 0) {
        showMessage('Nome da cidade inválido', 'warning');
        return;
    }
    
    const cityName = city.trim();
    
    if (favorites.find(f => f.name.toLowerCase() === cityName.toLowerCase())) {
        showMessage('Esta cidade já está nos favoritos', 'info');
        return;
    }
    
    const newFavorite = {
        id: Date.now() + Math.random(),
        name: cityName,
        addedDate: new Date().toISOString()
    };
    
    favorites.push(newFavorite);
    saveFavorites();
    
    if (getCurrentPage() === 'manage') {
        loadFavoritesList();
    }
    
    showMessage(`${cityName} adicionada aos favoritos!`, 'success');
    console.log('Cidade adicionada aos favoritos:', cityName);
}

function removeFavorite(id) {
    const initialLength = favorites.length;
    favorites = favorites.filter(f => f.id !== id);
    
    if (favorites.length < initialLength) {
        saveFavorites();
        loadFavoritesList();
        showMessage('Cidade removida dos favoritos!', 'success');
        console.log('Cidade removida dos favoritos, ID:', id);
    } else {
        showMessage('Erro ao remover cidade', 'error');
    }
}

function loadFavoritesList() {
    const grid = document.getElementById('favorites-grid');
    if (!grid) {
        console.warn('Grid de favoritos não encontrado');
        return;
    }
    
    if (favorites.length === 0) {
        grid.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666; grid-column: 1 / -1;">
                <i class="fas fa-heart" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem; display: block;"></i>
                <h3 style="margin: 1rem 0;">Nenhuma cidade favorita</h3>
                <p>Adicione cidades usando o formulário acima</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = favorites.map(fav => `
        <div class="favorite-item" style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div>
                <h4 style="margin: 0 0 0.5rem 0; color: #333;">${fav.name}</h4>
                <small style="color: #666;">Adicionada em ${new Date(fav.addedDate).toLocaleDateString('pt-BR')}</small>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button onclick="viewWeather('${fav.name.replace(/'/g, "\\'")}')" 
                        style="background: #3498db; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">
                    Ver Clima
                </button>
                <button onclick="removeFavorite(${fav.id})" 
                        style="background: #e74c3c; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">
                    Remover
                </button>
            </div>
        </div>
    `).join('');
    
    console.log(`Lista de favoritos carregada: ${favorites.length} itens`);
}

function viewWeather(city) {
    console.log('Visualizando clima para:', city);
    window.location.href = `index.html?city=${encodeURIComponent(city)}`;
}

// ===========================================
// FUNÇÕES UTILITÁRIAS
// ===========================================

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = text || '';
        return true;
    }
    console.warn(`Elemento não encontrado: ${id}`);
    return false;
}

function showLoading(loaderId = null) {
    const loaders = loaderId ? [loaderId] : ['weather-loading', 'forecast-loading', 'alerts-loading'];
    
    loaders.forEach(id => {
        const loader = document.getElementById(id);
        if (loader) {
            loader.style.display = 'block';
            loader.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <div class="loading-spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                    <p style="margin: 0; color: #666;">Carregando dados...</p>
                </div>
            `;
        }
    });
    
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
    const contents = ['weather-content', 'forecast-grid', 'alerts-grid'];
    contents.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = el.tagName.toLowerCase() === 'div' && el.classList.contains('grid') ? 'grid' : 'block';
            el.style.animation = 'fadeIn 0.5s ease';
        }
    });
}

function hideContent() {
    const contents = ['weather-content', 'forecast-grid', 'alerts-grid'];
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
    
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
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
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
        font-weight: 500;
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    notification.innerHTML = `
        <span style="margin-right: 8px;">${icons[type]}</span>
        ${message}
        <button onclick="this.parentElement.remove()" 
                style="background: none; border: none; color: white; margin-left: 15px; cursor: pointer; font-size: 18px; padding: 0; float: right;">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    console.log(`Mensagem exibida [${type}]: ${message}`);
}

function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const city = params.get('city');
    
    if (city && city.trim().length > 0) {
        console.log('Cidade encontrada na URL:', city);
        
        const input = document.getElementById('city-input') || 
                     document.getElementById('forecast-city-input') ||
                     document.getElementById('alerts-city-input');
                     
        if (input) input.value = city;
        
        const page = getCurrentPage();
        if (page === 'home') {
            setTimeout(() => loadWeather(city), 100);
        } else if (page === 'alerts') {
            setTimeout(() => loadForecast(city), 100);
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
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
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
        transition: all 0.3s ease;
        border: 1px solid #e9ecef;
    }
    
    .forecast-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        background: #ffffff;
    }
    
    .favorite-item {
        transition: all 0.2s ease;
    }
    
    .favorite-item:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15) !important;
    }
    
    button {
        transition: all 0.2s ease;
    }
    
    button:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    
    button:active {
        transform: translateY(0);
    }
    
    .loading-spinner {
        animation: spin 1s linear infinite;
console.log('🌤️ Weather Monitor carregado com API REAL ativada!');
console.log('API Key configurada:', CONFIG.API_KEY ? 'SIM' : 'NÃO');