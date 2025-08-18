// ===========================================
// API GLOBAL PARA USO EM OUTRAS PÁGINAS (ATUALIZADA)
// ===========================================

window.weatherMonitor = {
    // Funções principais
    loadWeatherData,
    loadWeatherAlerts,
    addToFavorites,
    removeFavorite,
    getCurrentPage,
    showNotification,
    
    // Funções de API e debugging
    testAPIConnection,
    enableDebugMode,
    displayAPIStatus,
    getAPIStatus,
    clearWeatherCache,
    getCacheSize,
    
    // Configurações
    config: API_CONFIG,
    demoMode: DEMO_MODE,
    rateLimit: RATE_LIMIT_CONFIG,
    
    // Estado atual
    getCurrentWeather: () => currentWeatherData,
    getCurrentCity: () => currentCity,
    getFavorites: () => favoriteLocations,
    
    // Utilitários para controle de rate limit
    canMakeRequest: () => checkRateLimit(),
    getRemainingRequests: () => RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_HOUR - RATE_LIMIT_CONFIG.REQUESTS_MADE,
    
// ===========================================
// API GLOBAL PARA USO EM OUTRAS PÁGINAS (ATUALIZADA)
// ===========================================

window.weatherMonitor = {
    // Funções principais
    loadWeatherData,
    loadWeatherAlerts,
    addToFavorites,
    removeFavorite,
    getCurrentPage,
    showNotification,
    
    // Funções de API e debugging
    testAPIConnection,
    enableDebugMode,
    displayAPIStatus,
    getAPIStatus,
    clearWeatherCache,
    getCacheSize,
    
    // Configurações
    config: API_CONFIG,
    demoMode: DEMO_MODE,
    rateLimit: RATE_LIMIT_CONFIG,
    
    // Estado atual
    getCurrentWeather: () => currentWeatherData,
    getCurrentCity: () => currentCity,
    getFavorites: () => favoriteLocations,
    
    // Utilitários para controle de rate limit
    canMakeRequest: () => checkRateLimit(),
    getRemainingRequests: () => RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_HOUR - RATE_LIMIT_CONFIG.REQUESTS_MADE,
    
    // Função para mostrar aviso sobre rate limit
    showRateLimitWarning: function() {
        const status = getAPIStatus();
        if (status.requestsRemaining <= 10) {
            showNotification(
                `⚠️ Atenção: Restam apenas ${status.requestsRemaining} requisições para a API. ` +
                `Reset em: ${status.resetTime.toLocaleTimeString()}`,
                'error'
            );
        } else if (status.requestsRemaining <= 25) {
            showNotification(
                `🔔 Aviso: ${status.requestsRemaining} requisições restantes para a API`,
                'info'
            );
        }
    }
};

console.log('🔌 Weather Monitor API disponível via window.weatherMonitor');

// Log de inicialização final
console.group('🌤️ Weather Monitor - Inicialização Completa');
console.log('📄 Página atual:', getCurrentPage());
console.log('🎭 Modo demonstração:', DEMO_MODE ? 'ATIVO' : 'INATIVO');
console.log('🔑 Chave API:', API_CONFIG.KEY ? 'CONFIGURADA' : 'NÃO CONFIGURADA');

const apiStatus = getAPIStatus();
console.log('📊 Status da API:');
console.log(`   - Requisições usadas: ${apiStatus.requestsUsed}/${apiStatus.maxRequests}`);
console.log(`   - Requisições restantes: ${apiStatus.requestsRemaining}`);
console.log(`   - Pode fazer requisições: ${apiStatus.canMakeRequest ? 'Sim' : 'Não'}`);
console.log(`   - Cache atual: ${getCacheSize()}`);

if (apiStatus.requestsRemaining <= 10 && !DEMO_MODE) {
    console.warn('⚠️ ATENÇÃO: Poucas requisições restantes! Considere ativar DEMO_MODE = true');
}

console.groupEnd();

// Auto-mostrar aviso se poucas requisições restantes
if (!DEMO_MODE) {
    setTimeout(() => {
        const status = getAPIStatus();
        if (status.requestsRemaining <= 20) {
            showNotification(
                `⚠️ Aviso: Restam ${status.requestsRemaining} requisições da API. ` +
                `Considere ativar o modo demo para economizar requisições.`,
                'info'
            );
        }
    }, 2000);
}

// Ativar debug mode automaticamente se há poucos requests ou está em desenvolvimento
if (!DEMO_MODE && (getAPIStatus().requestsRemaining <= 5 || window.location.hostname === 'localhost')) {
    console.log('🔧 Ativando debug mode automaticamente...');
    setTimeout(() => enableDebugMode(), 1000);
}// ===========================================
// WEATHER MONITOR - JAVASCRIPT CORRIGIDO
// ===========================================

const API_CONFIG = {
    KEY: '99a15dbcafb7db271f431e7751086382', 
    BASE_URL: 'https://api.weatherstack.com/current',
    FORECAST_URL: 'https://api.weatherstack.com/forecast',
    HISTORY_URL: 'https://api.weatherstack.com/historical'
};

// Para demonstração - simula uma API fake para favoritos
const FAVORITES_API = {
    BASE_URL: 'https://jsonplaceholder.typicode.com/posts',
};

const DEMO_MODE = false;

// ===========================================
// CONTROLE DE RATE LIMITING
// ===========================================

const RATE_LIMIT_CONFIG = {
    MAX_REQUESTS_PER_HOUR: 100, // Limite da API gratuita
    REQUESTS_MADE: parseInt(localStorage.getItem('weatherstack_requests') || '0'),
    LAST_RESET: parseInt(localStorage.getItem('weatherstack_last_reset') || Date.now()),
    RETRY_DELAY: 60000, // 1 minuto
    MAX_RETRIES: 3
};

// Cache para evitar requisições desnecessárias
const CACHE_CONFIG = {
    EXPIRY_TIME: 10 * 60 * 1000, // 10 minutos
    STORAGE_KEY: 'weatherstack_cache'
};

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
    console.log('Iniciando aplicação...');
    initializeApp();
});

function initializeApp() {
    const currentPage = getCurrentPage();
    console.log('Página atual:', currentPage);
    
    // Inicializar baseado na página atual
    switch(currentPage) {
        case 'index':
            initializeHomePage();
            break;
        case 'alerts':
            initializeAlertsPage();
            break;
        case 'forecast':
            initializeForecastPage();
            break;
        case 'manage':
            initializeManagePage();
            break;
        default:
            initializeHomePage();
    }
    
    // Carregar favoritos (usado em todas as páginas)
    loadFavoriteLocations();
    
    console.log('Aplicação inicializada com sucesso!');
}

function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('alerts.html')) return 'alerts';
    if (path.includes('forecast.html')) return 'forecast';
    if (path.includes('manage.html')) return 'manage';
    return 'index'; // default
}

// ===========================================
// INICIALIZAÇÃO - PÁGINA DE ALERTAS
// ===========================================

function initializeAlertsPage() {
    console.log('Inicializando página de alertas...');
    setupAlertsEventListeners();
    loadWeatherAlerts();
}

function setupAlertsEventListeners() {
    console.log('Configurando event listeners da página de alertas');
}

function loadWeatherAlerts() {
    console.log('Carregando alertas meteorológicos...');
    showLoading('alerts');
    
    setTimeout(() => {
        hideLoading('alerts');
        console.log('Alertas carregados (simulado)');
    }, 1000);
}

// ===========================================
// INICIALIZAÇÃO - PÁGINA INICIAL (INDEX)
// ===========================================

function initializeHomePage() {
    console.log('Inicializando página inicial...');
    setupHomeEventListeners();
    loadWeatherData(currentCity);
}

function setupHomeEventListeners() {
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const addFavoriteBtn = document.getElementById('add-favorite-btn');

    if (searchBtn) {
        searchBtn.addEventListener('click', handleHomeSearch);
        console.log('Event listener do botão de busca configurado');
    }
    
    if (cityInput) {
        cityInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleHomeSearch();
        });
        console.log('Event listener do input de cidade configurado');
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
        console.log('Pesquisando cidade:', city);
        currentCity = city;
        loadWeatherData(city);
    }
}

// ===========================================
// INICIALIZAÇÃO - PÁGINA DE PREVISÃO
// ===========================================

function initializeForecastPage() {
    console.log('Inicializando página de previsão...');
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
    console.log('Inicializando página de gerenciamento...');
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
// FUNÇÕES DE CACHE E RATE LIMITING
// ===========================================

function checkRateLimit() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    // Reset contador se passou mais de 1 hora
    if (now - RATE_LIMIT_CONFIG.LAST_RESET > oneHour) {
        RATE_LIMIT_CONFIG.REQUESTS_MADE = 0;
        RATE_LIMIT_CONFIG.LAST_RESET = now;
        localStorage.setItem('weatherstack_requests', '0');
        localStorage.setItem('weatherstack_last_reset', now.toString());
    }
    
    return RATE_LIMIT_CONFIG.REQUESTS_MADE < RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_HOUR;
}

function incrementRequestCount() {
    RATE_LIMIT_CONFIG.REQUESTS_MADE++;
    localStorage.setItem('weatherstack_requests', RATE_LIMIT_CONFIG.REQUESTS_MADE.toString());
}

function getCachedData(cacheKey) {
    try {
        const cache = JSON.parse(localStorage.getItem(CACHE_CONFIG.STORAGE_KEY) || '{}');
        const cachedItem = cache[cacheKey];
        
        if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_CONFIG.EXPIRY_TIME) {
            console.log('📦 Usando dados em cache para:', cacheKey);
            return cachedItem.data;
        }
        
        return null;
    } catch (error) {
        console.error('Erro ao ler cache:', error);
        return null;
    }
}

function setCachedData(cacheKey, data) {
    try {
        const cache = JSON.parse(localStorage.getItem(CACHE_CONFIG.STORAGE_KEY) || '{}');
        cache[cacheKey] = {
            data: data,
            timestamp: Date.now()
        };
        
        localStorage.setItem(CACHE_CONFIG.STORAGE_KEY, JSON.stringify(cache));
        console.log('💾 Dados salvos em cache para:', cacheKey);
    } catch (error) {
        console.error('Erro ao salvar cache:', error);
    }
}

async function makeAPIRequest(url, cacheKey, retryCount = 0) {
    // Verificar cache primeiro
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
        return cachedData;
    }
    
    // Verificar rate limit
    if (!checkRateLimit()) {
        console.warn('⚠️ Rate limit excedido, usando dados simulados');
        throw new Error('RATE_LIMIT_EXCEEDED');
    }
    
    try {
        incrementRequestCount();
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'WeatherMonitor/1.0'
            },
            signal: AbortSignal.timeout(10000)
        });
        
        // Tratamento específico para erro 429
        if (response.status === 429) {
            console.error('❌ Rate limit da API excedido (429)');
            
            // Aguardar antes de retry se não excedeu max retries
            if (retryCount < RATE_LIMIT_CONFIG.MAX_RETRIES) {
                showNotification(
                    `Rate limit excedido. Tentando novamente em ${RATE_LIMIT_CONFIG.RETRY_DELAY / 1000}s...`,
                    'info'
                );
                
                await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_CONFIG.RETRY_DELAY));
                return makeAPIRequest(url, cacheKey, retryCount + 1);
            }
            
            throw new Error('RATE_LIMIT_EXCEEDED');
        }
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            // Tratar diferentes tipos de erro da API
            if (data.error.code === 104) { // Monthly usage limit
                throw new Error('MONTHLY_LIMIT_EXCEEDED');
            } else if (data.error.code === 105) { // Invalid API key
                throw new Error('INVALID_API_KEY');
            } else {
                throw new Error(`API Error: ${data.error.info || 'Erro desconhecido da API'}`);
            }
        }
        
        if (!data.current && !data.forecast) {
            throw new Error('Dados inválidos retornados pela API');
        }
        
        // Salvar no cache
        setCachedData(cacheKey, data);
        
        return data;
        
    } catch (error) {
        if (error.message === 'RATE_LIMIT_EXCEEDED' || error.message === 'MONTHLY_LIMIT_EXCEEDED') {
            throw error;
        }
        
        // Outros erros, tentar retry se disponível
        if (retryCount < RATE_LIMIT_CONFIG.MAX_RETRIES && 
            (error.name === 'AbortError' || error.message.includes('NetworkError'))) {
            
            console.log(`🔄 Tentativa ${retryCount + 1}/${RATE_LIMIT_CONFIG.MAX_RETRIES}`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            return makeAPIRequest(url, cacheKey, retryCount + 1);
        }
        
        throw error;
    }
}

// ===========================================
// FUNÇÕES DA API - DADOS CLIMÁTICOS (COM TRATAMENTO 429)
// ===========================================

async function loadWeatherData(city) {
    console.log('🌤️ Carregando dados climáticos para:', city);
    showLoading('weather');
    
    try {
        let data;
        
        if (DEMO_MODE) {
            console.log('🎭 Usando modo demo');
            data = await simulateCurrentWeatherData(city);
        } else {
            console.log('🌐 Tentando API real');
            
            const url = new URL(API_CONFIG.BASE_URL);
            url.searchParams.append('access_key', API_CONFIG.KEY);
            url.searchParams.append('query', city);
            url.searchParams.append('units', 'm');
            
            const cacheKey = `current_${city.toLowerCase()}`;
            
            try {
                data = await makeAPIRequest(url.toString(), cacheKey);
                showNotification('✅ Dados carregados da API', 'success');
            } catch (apiError) {
                console.warn('⚠️ Erro na API, usando dados simulados:', apiError.message);
                
                if (apiError.message === 'RATE_LIMIT_EXCEEDED') {
                    showNotification(
                        '⏰ Limite de requisições excedido. Usando dados simulados. ' +
                        `Restam ${RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_HOUR - RATE_LIMIT_CONFIG.REQUESTS_MADE} requisições`,
                        'error'
                    );
                } else if (apiError.message === 'MONTHLY_LIMIT_EXCEEDED') {
                    showNotification('📅 Limite mensal da API excedido. Usando dados simulados', 'error');
                } else if (apiError.message === 'INVALID_API_KEY') {
                    showNotification('🔑 Chave da API inválida. Usando dados simulados', 'error');
                } else {
                    showNotification('🌐 Erro na API. Usando dados simulados', 'info');
                }
                
                data = await simulateCurrentWeatherData(city);
            }
        }

        currentWeatherData = data;
        displayWeatherData(data);
        console.log('✅ Dados climáticos carregados com sucesso');
        
    } catch (error) {
        console.error('❌ Erro crítico ao carregar dados climáticos:', error);
        showError('weather', `Erro inesperado: ${error.message}`);
    }
}

async function loadForecast(city) {
    console.log('📅 Carregando previsão para:', city);
    showLoading('forecast');
    
    try {
        let data;
        
        if (DEMO_MODE) {
            console.log('🎭 Usando modo demo para previsão');
            data = await simulateForecastData(city);
        } else {
            console.log('🌐 Tentando API real para previsão');
            
            const url = new URL(API_CONFIG.FORECAST_URL);
            url.searchParams.append('access_key', API_CONFIG.KEY);
            url.searchParams.append('query', city);
            url.searchParams.append('forecast_days', '7');
            url.searchParams.append('units', 'm');
            
            const cacheKey = `forecast_${city.toLowerCase()}`;
            
            try {
                data = await makeAPIRequest(url.toString(), cacheKey);
                showNotification('✅ Previsão carregada da API', 'success');
            } catch (apiError) {
                console.warn('⚠️ Erro na API de previsão, usando dados simulados:', apiError.message);
                
                if (apiError.message === 'RATE_LIMIT_EXCEEDED') {
                    showNotification('⏰ Limite de requisições excedido para previsão', 'error');
                } else {
                    showNotification('🌐 Erro na API de previsão. Usando dados simulados', 'info');
                }
                
                data = await simulateForecastData(city);
            }
        }

        forecastData = data.forecast;
        displayForecastData(data);
        createPrecipitationChart(data.forecast);
        displayWeeklySummary(data.forecast);
        
    } catch (error) {
        console.error('❌ Erro crítico ao carregar previsão:', error);
        showError('forecast', `Erro inesperado: ${error.message}`);
    }
}

// ===========================================
// FUNÇÃO PARA TESTAR CONECTIVIDADE DA API (ATUALIZADA)
// ===========================================

async function testAPIConnection() {
    try {
        if (!checkRateLimit()) {
            console.warn('⚠️ Rate limit excedido - não testando API');
            return false;
        }

        const url = new URL(API_CONFIG.BASE_URL);
        url.searchParams.append('access_key', API_CONFIG.KEY);
        url.searchParams.append('query', 'London');
        
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(5000)
        });
        
        if (response.status === 429) {
            console.warn('⚠️ API com rate limit (429)');
            return false;
        }
        
        const data = await response.json();
        
        if (data.error) {
            console.error('❌ Erro na API:', data.error);
            return false;
        }
        
        console.log('✅ API funcionando corretamente');
        incrementRequestCount();
        return true;
        
    } catch (error) {
        console.error('❌ Teste de API falhou:', error);
        return false;
    }
}

// ===========================================
// FUNÇÃO PARA MONITORAR STATUS DA API
// ===========================================

function getAPIStatus() {
    const remainingRequests = RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_HOUR - RATE_LIMIT_CONFIG.REQUESTS_MADE;
    const resetTime = new Date(RATE_LIMIT_CONFIG.LAST_RESET + 60 * 60 * 1000);
    
    return {
        requestsUsed: RATE_LIMIT_CONFIG.REQUESTS_MADE,
        requestsRemaining: remainingRequests,
        maxRequests: RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_HOUR,
        resetTime: resetTime,
        canMakeRequest: remainingRequests > 0,
        demoMode: DEMO_MODE
    };
}

function displayAPIStatus() {
    const status = getAPIStatus();
    
    console.group('📊 Status da API Weatherstack');
    console.log(`🔢 Requisições usadas: ${status.requestsUsed}/${status.maxRequests}`);
    console.log(`⏳ Requisições restantes: ${status.requestsRemaining}`);
    console.log(`🔄 Reset em: ${status.resetTime.toLocaleTimeString()}`);
    console.log(`✅ Pode fazer requisição: ${status.canMakeRequest ? 'Sim' : 'Não'}`);
    console.log(`🎭 Modo demo: ${status.demoMode ? 'Ativo' : 'Inativo'}`);
    console.groupEnd();
    
    return status;
}

// ===========================================
// FUNÇÃO PARA LIMPAR CACHE
// ===========================================

function clearWeatherCache() {
    try {
        localStorage.removeItem(CACHE_CONFIG.STORAGE_KEY);
        console.log('🗑️ Cache limpo com sucesso');
        showNotification('Cache de dados meteorológicos limpo!', 'success');
    } catch (error) {
        console.error('❌ Erro ao limpar cache:', error);
        showNotification('Erro ao limpar cache', 'error');
    }
}

function getCacheSize() {
    try {
        const cache = localStorage.getItem(CACHE_CONFIG.STORAGE_KEY);
        if (cache) {
            const sizeInBytes = new Blob([cache]).size;
            const sizeInKB = (sizeInBytes / 1024).toFixed(2);
            return `${sizeInKB} KB`;
        }
        return '0 KB';
    } catch (error) {
        return 'Erro';
    }
}

// ===========================================
// FUNÇÕES DE FAVORITOS - POST/DELETE (CORRIGIDAS)
// ===========================================

async function addToFavorites(city) {
    try {
        // Verificar se já existe
        if (favoriteLocations.some(loc => loc.name.toLowerCase() === city.toLowerCase())) {
            showNotification('Esta cidade já está nos seus favoritos!', 'info');
            return;
        }

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
    // Sempre usar simulação para favoritos (mais confiável)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
        id: Date.now(),
        name: city,
        country: country,
        nickname: nickname || city,
        addedDate: new Date().toISOString(),
        viewCount: 0
    };
}

async function removeFavorite(favoriteId) {
    try {
        await deleteFavoriteFromAPI(favoriteId);
        
        favoriteLocations = favoriteLocations.filter(loc => loc.id !== favoriteId);
        saveFavoritesToStorage();
        
        showNotification('Cidade removida dos favoritos!', 'success');
        
        loadFavoritesList();
        updateFavoritesStats();
        
    } catch (error) {
        console.error('Erro ao remover favorito:', error);
        showNotification('Erro ao remover cidade dos favoritos', 'error');
    }
}

async function deleteFavoriteFromAPI(favoriteId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
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
        if (favoriteLocations.some(loc => loc.name.toLowerCase() === city.toLowerCase())) {
            showNotification('Esta cidade já está nos seus favoritos!', 'info');
            return;
        }

        const newFavorite = await addFavoriteToAPI(city, country, nickname);
        
        favoriteLocations.push(newFavorite);
        saveFavoritesToStorage();
        
        showNotification(`${city} foi adicionada aos favoritos!`, 'success');
        
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
// INTERFACE DOS FAVORITOS (MANTIDA)
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
    
    setupFavoriteItemListeners();
}

function setupFavoriteItemListeners() {
    document.querySelectorAll('.view-weather').forEach(button => {
        button.addEventListener('click', function() {
            const city = this.dataset.city;
            
            const favorite = favoriteLocations.find(loc => loc.name === city);
            if (favorite) {
                favorite.viewCount++;
                saveFavoritesToStorage();
            }
            
            window.location.href = `index.html?city=${encodeURIComponent(city)}`;
        });
    });
    
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
// ARMAZENAMENTO LOCAL (MANTIDO)
// ===========================================

function loadFavoriteLocations() {
    try {
        const stored = localStorage.getItem('weatherMonitorFavorites');
        if (stored) {
            favoriteLocations = JSON.parse(stored);
        } else {
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
        console.log('Favoritos carregados:', favoriteLocations.length, 'itens');
    } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
        favoriteLocations = [];
    }
}

function saveFavoritesToStorage() {
    try {
        localStorage.setItem('weatherMonitorFavorites', JSON.stringify(favoriteLocations));
        console.log('Favoritos salvos no localStorage');
    } catch (error) {
        console.error('Erro ao salvar favoritos:', error);
    }
}

// ===========================================
// EXPORT/IMPORT DE FAVORITOS (MANTIDO)
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
                importedFavorites.forEach(imported => {
                    if (!favoriteLocations.some(existing => 
                        existing.name.toLowerCase() === imported.name.toLowerCase()
                    )) {
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
    event.target.value = '';
}

// ===========================================
// DADOS SIMULADOS (MELHORADOS)
// ===========================================

async function simulateCurrentWeatherData(city) {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

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
        temperature: 18 + Math.random() * 15,
        weather_descriptions: ['Moderado'],
        feelslike: 20 + Math.random() * 15,
        humidity: 40 + Math.random() * 40,
        wind_speed: 5 + Math.random() * 20,
        visibility: 5 + Math.random() * 10,
        pressure: 1000 + Math.random() * 30,
        precip: Math.random() * 8,
        uv_index: Math.floor(Math.random() * 11),
        weather_icons: ['https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0001_sunny.png']
    };

    const current = cityData[city] || {
        ...defaultData,
        temperature: Math.round(defaultData.temperature),
        feelslike: Math.round(defaultData.feelslike),
        humidity: Math.round(defaultData.humidity),
        wind_speed: Math.round(defaultData.wind_speed),
        visibility: Math.round(defaultData.visibility),
        pressure: Math.round(defaultData.pressure),
        precip: Math.round(defaultData.precip * 10) / 10
    };
    
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
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 300));
    
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
        const baseTemp = 15 + Math.random() * 20;
        const condition = Math.floor(Math.random() * conditions.length);
        
        return {
            date: new Date(Date.now() + (index * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            day: day,
            maxtemp: Math.round(baseTemp + Math.random() * 8),
            mintemp: Math.round(baseTemp - Math.random() * 5),
            avgtemp: Math.round(baseTemp),
            condition: conditions[condition],
            icon: icons[condition],
            precip: Math.round(Math.random() * 10 * 10) / 10,
            humidity: Math.round(40 + Math.random() * 50),
            wind: Math.round(5 + Math.random() * 20)
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
        'Brasília': 'Distrito Federal',
        'Porto Alegre': 'Rio Grande do Sul',
        'Fortaleza': 'Ceará',
        'Recife': 'Pernambuco',
        'Curitiba': 'Paraná',
        'Manaus': 'Amazonas'
    };
    return regions[city] || 'Brasil';
}

// ===========================================
// EXIBIÇÃO DE DADOS (MANTIDAS)
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
    if (weatherIcon && current.weather_icons && current.weather_icons[0]) {
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
    if (forecastGrid && forecast) {
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
                <i class="fas fa-tint"></i> ${dayData.precip}mm
            </div>
        </div>
    `;
}

function displayWeeklySummary(forecastData) {
    if (!forecastData || !Array.isArray(forecastData)) return;
    
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
    
    if (!canvas || !forecastData || !Array.isArray(forecastData)) return;
    
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
        ctx.fillText(`${value}mm`, x + barWidth / 2, y - 5);
        
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
// FUNÇÕES UTILITÁRIAS (MELHORADAS)
// ===========================================

function showLoading(section) {
    const loadingElement = document.getElementById(`${section}-loading`);
    const contentElement = document.getElementById(`${section}-content`) || 
                          document.getElementById(`${section}-grid`) ||
                          document.getElementById(`${section}-table-container`);
    const errorElement = document.getElementById(`${section}-error`);
    
    if (loadingElement) {
        loadingElement.style.display = 'block';
        loadingElement.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Carregando dados...</p>
            </div>
        `;
    }
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
        errorElement.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Erro ao carregar dados</h3>
                <p>${message}</p>
                <button class="btn btn-primary retry-btn" onclick="location.reload()">
                    <i class="fas fa-redo"></i> Tentar Novamente
                </button>
            </div>
        `;
    }
    
    showNotification(`Erro: ${message}`, 'error');
}

function showNotification(message, type = 'info') {
    // Remove notifications anteriores do mesmo tipo
    document.querySelectorAll(`.notification.${type}`).forEach(notification => {
        notification.remove();
    });

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#00b894' : type === 'error' ? '#e74c3c' : '#74b9ff'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 3000;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease;
        max-width: 320px;
        word-wrap: break-word;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 0.9rem;
        line-height: 1.4;
        cursor: pointer;
        transition: transform 0.2s ease;
    `;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-triangle' : 
                 'info-circle';
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
            <i class="fas fa-times" style="margin-left: auto; cursor: pointer; opacity: 0.7;" onclick="this.parentElement.parentElement.remove()"></i>
        </div>
    `;
    
    // Hover effect
    notification.addEventListener('mouseenter', () => {
        notification.style.transform = 'translateX(-5px)';
    });
    
    notification.addEventListener('mouseleave', () => {
        notification.style.transform = 'translateX(0)';
    });
    
    document.body.appendChild(notification);
    
    // Auto-remove após 5 segundos
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// ===========================================
// ESTILOS DINÂMICOS PARA NOTIFICAÇÕES E LOADING
// ===========================================

const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .loading-spinner {
        text-align: center;
        padding: 2rem;
    }
    
    .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem auto;
    }
    
    .error-content {
        text-align: center;
        padding: 2rem;
        color: #e74c3c;
    }
    
    .error-content i {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.7;
    }
    
    .error-content h3 {
        margin-bottom: 0.5rem;
        font-size: 1.2rem;
    }
    
    .error-content p {
        margin-bottom: 1.5rem;
        color: #666;
        font-size: 0.9rem;
    }
    
    .retry-btn {
        background: #3498db !important;
        border: none !important;
        padding: 0.5rem 1rem !important;
        border-radius: 5px !important;
        color: white !important;
        cursor: pointer !important;
        transition: background 0.2s ease !important;
    }
    
    .retry-btn:hover {
        background: #2980b9 !important;
    }
    
    .fade-in {
        animation: fadeIn 0.5s ease-in;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(dynamicStyles);

// ===========================================
// INICIALIZAÇÃO E CONFIGURAÇÕES FINAIS
// ===========================================

function checkURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const cityParam = urlParams.get('city');
    
    if (cityParam) {
        currentCity = cityParam;
        
        const cityInput = document.getElementById('city-input');
        if (cityInput) cityInput.value = cityParam;
        
        if (getCurrentPage() === 'index') {
            loadWeatherData(cityParam);
        } else if (getCurrentPage() === 'forecast') {
            const forecastInput = document.getElementById('forecast-city-input');
            if (forecastInput) forecastInput.value = cityParam;
            loadForecast(cityParam);
        }
    }
}

// ===========================================
// FUNÇÕES DE DEBUG E MONITORAMENTO (ATUALIZADAS)
// ===========================================

function enableDebugMode() {
    console.log('🔧 Debug Mode Ativado');
    
    // Mostrar status da API
    displayAPIStatus();
    
    // Log todas as requisições
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        console.log('🌐 Fetch Request:', args[0]);
        
        // Detectar se é para Weatherstack
        if (args[0].includes('weatherstack.com')) {
            const status = getAPIStatus();
            if (!status.canMakeRequest) {
                console.warn('⚠️ AVISO: Rate limit pode ter sido excedido!');
            }
        }
        
        return originalFetch.apply(this, args)
            .then(response => {
                if (response.status === 429) {
                    console.error('❌ Rate Limit (429) detectado!');
                } else {
                    console.log('✅ Fetch Response:', response.status, response.statusText);
                }
                return response;
            })
            .catch(error => {
                console.log('❌ Fetch Error:', error);
                throw error;
            });
    };
    
    // Adicionar botões de debug ao DOM
    addDebugButtons();
    
    // Monitorar mudanças no DOM
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                console.log('🔄 DOM Changed:', mutation.target.tagName || mutation.target);
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Testar conectividade da API
    testAPIConnection().then(isWorking => {
        console.log(`🌡️ API Status: ${isWorking ? 'FUNCIONANDO' : 'COM PROBLEMAS'}`);
    });
}

function addDebugButtons() {
    // Criar painel de debug
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 15px;
        border-radius: 8px;
        z-index: 9999;
        font-family: monospace;
        font-size: 12px;
        min-width: 250px;
        max-height: 300px;
        overflow-y: auto;
    `;
    
    const status = getAPIStatus();
    
    debugPanel.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong>🔧 Debug Panel</strong>
            <button onclick="this.parentElement.parentElement.remove()" style="float: right; background: red; border: none; color: white; padding: 2px 8px; border-radius: 3px; cursor: pointer;">✕</button>
        </div>
        <div>📊 Requisições: ${status.requestsUsed}/${status.maxRequests}</div>
        <div>⏳ Restantes: ${status.requestsRemaining}</div>
        <div>🎭 Demo Mode: ${DEMO_MODE ? 'ON' : 'OFF'}</div>
        <div>💾 Cache: ${getCacheSize()}</div>
        <div style="margin-top: 10px;">
            <button onclick="displayAPIStatus()" style="background: #3498db; border: none; color: white; padding: 5px 10px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">Status</button>
            <button onclick="clearWeatherCache()" style="background: #e74c3c; border: none; color: white; padding: 5px 10px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">Clear Cache</button>
            <button onclick="testAPIConnection().then(r => console.log('API Test:', r))" style="background: #27ae60; border: none; color: white; padding: 5px 10px; margin: 2px; border-radius: 3px; cursor: pointer; font-size: 11px;">Test API</button>
        </div>
        <div style="margin-top: 10px; font-size: 10px; opacity: 0.7;">
            Reset: ${status.resetTime.toLocaleTimeString()}
        </div>
    `;
    
    document.body.appendChild(debugPanel);
}

// Executar checagem de parâmetros após inicialização
setTimeout(checkURLParams, 100);

// Monitoramento de conectividade
window.addEventListener('online', () => {
    showNotification('🌐 Conexão restaurada', 'success');
    console.log('📶 Online');
});

window.addEventListener('offline', () => {
    showNotification('📶 Sem conexão com a internet', 'error');
    console.log('📶 Offline');
});

// Log de inicialização
console.log('🌤️ Weather Monitor carregado com sucesso!');
console.log('📄 Página atual:', getCurrentPage());
console.log('🎭 Modo demonstração:', DEMO_MODE ? 'ATIVO' : 'INATIVO');
console.log('🔑 Chave API:', API_CONFIG.KEY ? 'CONFIGURADA' : 'NÃO CONFIGURADA');

// Ativar debug mode se necessário (descomente a linha abaixo para debug)
// enableDebugMode();

// ===========================================
// API GLOBAL PARA USO EM OUTRAS PÁGINAS
// ===========================================

window.weatherMonitor = {
    loadWeatherData,
    loadWeatherAlerts,
    addToFavorites,
    removeFavorite,
    getCurrentPage,
    showNotification,
    testAPIConnection,
    enableDebugMode,
    // Configurações
    config: API_CONFIG,
    demoMode: DEMO_MODE,
    // Estado atual
    getCurrentWeather: () => currentWeatherData,
    getCurrentCity: () => currentCity,
    getFavorites: () => favoriteLocations
};

console.log('🔌 Weather Monitor API disponível via window.weatherMonitor');
