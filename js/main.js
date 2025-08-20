// js/main.js - Projeto Completo: Clima + Blog (Todas as funcionalidades)

// 🌤️ Configuração da API de Clima
const WEATHER_API_KEY = ''; 
const WEATHER_BASE_URL = 'https://wttr.in';
const WEATHER_BACKUP_URL = 'https://api.openweathermap.org/data/2.5/weather';

// 📝 Configuração da API JSONPlaceholder (Blog)
const BLOG_API_BASE = 'https://jsonplaceholder.typicode.com';

// Armazenamento local
let favorites = [];
let searchHistory = [];
let weatherCache = {};
let posts = [];
let users = [];
let currentPost = null;

// Debounce para clima
let debounceTimeout;
const DEBOUNCE_DELAY = 1500;

// Elementos DOM - Clima
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const weatherCard = document.getElementById('weatherCard');
const addFavoriteBtn = document.getElementById('addFavoriteBtn');

// Elementos DOM - Blog
const postsContainer = document.getElementById('postsContainer');
const usersContainer = document.getElementById('usersContainer');
const postForm = document.getElementById('postForm');
const editForm = document.getElementById('editForm');

let currentWeatherData = null;
let lastCity = '';

// 🚀 INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadPageContent();
});

function setupEventListeners() {
    // Event listeners - Clima
    if (searchBtn) searchBtn.addEventListener('click', searchWeatherDebounced);
    if (cityInput) cityInput.addEventListener('input', searchWeatherDebounced);
    if (addFavoriteBtn) addFavoriteBtn.addEventListener('click', addToFavorites);
    
    // Event listeners - Blog
    if (postForm) setupCreateForm();
    if (editForm) setupEditForm();
    
    // Busca em posts
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterPosts(e.target.value);
        });
    }
}

// 📄 CARREGAR CONTEÚDO BASEADO NA PÁGINA
function loadPageContent() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(currentPage) {
        case 'index.html':
        case '':
            // Página principal - Clima
            break;
        case 'favorites.html':
            displayFavorites();
            break;
        case 'history.html':
            displayHistory();
            break;
        case 'blog.html':
            loadPosts();
            break;
        case 'create.html':
            setupCreateForm();
            break;
        case 'edit.html':
            setupEditForm();
            break;
        case 'users.html':
            loadUsers();
            break;
    }
}

// ==========================================
// 🌤️ SEÇÃO: FUNCIONALIDADES DE CLIMA
// ==========================================

// Função debounce para clima
function searchWeatherDebounced() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => searchWeather(), DEBOUNCE_DELAY);
}

// Função principal de busca do clima
async function searchWeather() {
    const city = cityInput?.value.trim();
    if (!city) {
        showError('Por favor, digite o nome de uma cidade.');
        return;
    }

    if (city.toLowerCase() === lastCity.toLowerCase()) return;
    lastCity = city;

    showLoading();
    hideError();
    hideWeatherCard();

    try {
        const weatherData = await fetchWeatherData(city);
        displayWeatherData(weatherData);
        addToHistory(weatherData);
        currentWeatherData = weatherData;
    } catch (err) {
        showError(err.message || 'Erro ao buscar dados meteorológicos.');
        console.error('Erro na API:', err);
    } finally {
        hideLoading();
    }
}

// Buscar dados de clima
async function fetchWeatherData(city) {
    if (weatherCache[city]) return weatherCache[city];

    try {
        // Tentativa 1: API simples sem chave
        const response = await fetch(`${WEATHER_BASE_URL}/${encodeURIComponent(city)}?format=j1`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Dados do clima recebidos:', data);
            
            const transformedData = transformWttrData(data, city);
            weatherCache[city] = transformedData;
            return transformedData;
        }
        
        throw new Error('API principal falhou');
        
    } catch (err) {
        console.log('Criando dados de demonstração...');
        return createDemoWeatherData(city);
    }
}

// Transformar dados de clima
function transformWttrData(data, cityName) {
    const current = data.current_condition[0];
    const area = data.nearest_area[0];
    
    return {
        location: {
            name: area.areaName[0].value || cityName,
            country: area.country[0].value || 'N/A',
            localtime: new Date().toLocaleString('pt-BR')
        },
        current: {
            temperature: Math.round(current.temp_C) || 'N/A',
            weather_descriptions: [current.lang_pt ? current.lang_pt[0].value : current.weatherDesc[0].value],
            weather_icons: [`https://cdn.weatherapi.com/weather/64x64/day/113.png`],
            feelslike: Math.round(current.FeelsLikeC) || 'N/A',
            humidity: current.humidity || 'N/A',
            wind_speed: Math.round(current.windspeedKmph) || 'N/A',
            wind_dir: current.winddir16Point || 'N/A',
            pressure: current.pressure || 'N/A',
            visibility: current.visibility || 'N/A'
        }
    };
}

// Criar dados demo de clima
function createDemoWeatherData(city) {
    const demoData = {
        'sao paulo': { temp: 25, desc: 'Ensolarado', country: 'Brasil' },
        'rio de janeiro': { temp: 28, desc: 'Parcialmente nublado', country: 'Brasil' },
        'belo horizonte': { temp: 23, desc: 'Chuva leve', country: 'Brasil' },
        'salvador': { temp: 29, desc: 'Ensolarado', country: 'Brasil' },
        'recife': { temp: 30, desc: 'Parcialmente nublado', country: 'Brasil' }
    };
    
    const demo = demoData[city.toLowerCase()] || { temp: 22, desc: 'Tempo bom', country: 'Desconhecido' };
    
    return {
        location: {
            name: city,
            country: demo.country,
            localtime: new Date().toLocaleString('pt-BR')
        },
        current: {
            temperature: demo.temp,
            weather_descriptions: [demo.desc],
            weather_icons: ['https://cdn.weatherapi.com/weather/64x64/day/113.png'],
            feelslike: demo.temp + 2,
            humidity: 65,
            wind_speed: 15,
            wind_dir: 'NE',
            pressure: 1013,
            visibility: 10
        }
    };
}

// Exibir dados do clima
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
    if (weatherIcon && data.current.weather_icons && data.current.weather_icons.length > 0) {
        weatherIcon.src = data.current.weather_icons[0];
        weatherIcon.alt = data.current.weather_descriptions[0] || 'Ícone do tempo';
    }
    if (temperature) temperature.textContent = data.current.temperature || 'N/A';
    if (description) {
        const desc = data.current.weather_descriptions[0] || 'Não disponível';
        description.textContent = desc.charAt(0).toUpperCase() + desc.slice(1);
    }
    if (feelsLike) feelsLike.textContent = data.current.feelslike || 'N/A';
    if (humidity) humidity.textContent = data.current.humidity || 'N/A';
    if (windSpeed) windSpeed.textContent = data.current.wind_speed || 'N/A';
    if (windDir) windDir.textContent = data.current.wind_dir || 'N/A';
    if (pressure) pressure.textContent = data.current.pressure || 'N/A';
    if (visibility) visibility.textContent = data.current.visibility || 'N/A';

    showWeatherCard();
}

// Favoritos de clima
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

    if (!favorites.find(fav => fav.city.toLowerCase() === favoriteData.city.toLowerCase())) {
        favorites.push(favoriteData);
        alert('✅ Cidade adicionada aos favoritos!');
        displayFavorites();
    } else {
        alert('⚠️ Esta cidade já está nos seus favoritos!');
    }
}

function removeFromFavorites(id) {
    favorites = favorites.filter(fav => fav.id !== id);
    displayFavorites();
}

// Histórico de clima
function addToHistory(data) {
    const historyItem = {
        id: Date.now(),
        city: data.location.name,
        country: data.location.country,
        temperature: data.current.temperature,
        description: data.current.weather_descriptions[0],
        searchedAt: new Date().toLocaleString('pt-BR')
    };

    searchHistory.unshift(historyItem);
    if (searchHistory.length > 10) searchHistory = searchHistory.slice(0, 10);
    displayHistory();
}

// Exibir favoritos
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

// Exibir histórico
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

// ==========================================
// 📝 SEÇÃO: FUNCIONALIDADES DE BLOG
// ==========================================

// 📖 GET - Buscar todos os posts
async function loadPosts() {
    try {
        showLoading();
        
        const response = await fetch(`${BLOG_API_BASE}/posts`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        posts = await response.json();
        
        // Buscar usuários para relacionar com posts
        await loadUsers();
        
        displayPosts(posts.slice(0, 20)); // Mostrar apenas 20 posts
        
    } catch (err) {
        showError(`Erro ao carregar posts: ${err.message}`);
    } finally {
        hideLoading();
    }
}

// 👥 GET - Buscar usuários
async function loadUsers() {
    try {
        const response = await fetch(`${BLOG_API_BASE}/users`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        users = await response.json();
        
        // Se estamos na página de usuários, exibir
        if (usersContainer) {
            displayUsers(users);
        }
        
    } catch (err) {
        console.error('Erro ao carregar usuários:', err);
    }
}

// 🆕 POST - Criar novo post
async function createPost(postData) {
    try {
        showLoading();
        
        const response = await fetch(`${BLOG_API_BASE}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const newPost = await response.json();
        console.log('✅ Post criado via API:', newPost);
        
        alert('✅ Post criado com sucesso!');
        
        // Simular adição à lista local
        posts.unshift({...newPost, id: Date.now(), userId: 1});
        
        return newPost;
        
    } catch (err) {
        showError(`Erro ao criar post: ${err.message}`);
        throw err;
    } finally {
        hideLoading();
    }
}

// ✏️ PUT - Atualizar post
async function updatePost(id, postData) {
    try {
        showLoading();
        
        const response = await fetch(`${BLOG_API_BASE}/posts/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const updatedPost = await response.json();
        console.log('✅ Post atualizado via API:', updatedPost);
        
        alert('✅ Post atualizado com sucesso!');
        
        return updatedPost;
        
    } catch (err) {
        showError(`Erro ao atualizar post: ${err.message}`);
        throw err;
    } finally {
        hideLoading();
    }
}

// 🗑️ DELETE - Deletar post
async function deletePost(id) {
    if (!confirm('Tem certeza que deseja deletar este post?')) return;
    
    try {
        showLoading();
        
        const response = await fetch(`${BLOG_API_BASE}/posts/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        console.log('✅ Post deletado via API:', id);
        alert('✅ Post deletado com sucesso!');
        
        // Remover da lista local
        posts = posts.filter(post => post.id !== id);
        displayPosts(posts.slice(0, 20));
        
    } catch (err) {
        showError(`Erro ao deletar post: ${err.message}`);
    } finally {
        hideLoading();
    }
}

// 📝 GET - Buscar post específico
async function getPost(id) {
    try {
        const response = await fetch(`${BLOG_API_BASE}/posts/${id}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const post = await response.json();
        return post;
        
    } catch (err) {
        showError(`Erro ao carregar post: ${err.message}`);
        throw err;
    }
}

// 🖼️ Exibir posts na tela
function displayPosts(postsToShow) {
    if (!postsContainer) return;
    
    if (postsToShow.length === 0) {
        postsContainer.innerHTML = '<p class="no-data">Nenhum post encontrado.</p>';
        return;
    }
    
    postsContainer.innerHTML = postsToShow.map(post => {
        const user = users.find(u => u.id === post.userId);
        const userName = user ? user.name : 'Usuário Desconhecido';
        const userAvatar = user ? `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&size=50` : '';
        
        return `
            <article class="post-card">
                <div class="post-header">
                    <img src="${userAvatar}" alt="Avatar ${userName}" class="user-avatar">
                    <div class="post-meta">
                        <h3 class="user-name">${userName}</h3>
                        <span class="post-id">Post #${post.id}</span>
                    </div>
                </div>
                <h2 class="post-title">${post.title}</h2>
                <p class="post-body">${post.body}</p>
                <div class="post-actions">
                    <button onclick="editPost(${post.id})" class="btn btn-edit">✏️ Editar</button>
                    <button onclick="deletePost(${post.id})" class="btn btn-delete">🗑️ Deletar</button>
                </div>
            </article>
        `;
    }).join('');
}

// 📄 Exibir usuários
function displayUsers(usersToShow) {
    if (!usersContainer) return;
    
    usersContainer.innerHTML = usersToShow.map(user => `
        <div class="user-card">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=80" 
                 alt="Avatar ${user.name}" class="user-avatar-large">
            <h3>${user.name}</h3>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Website:</strong> <a href="http://${user.website}" target="_blank">${user.website}</a></p>
            <p><strong>Empresa:</strong> ${user.company.name}</p>
            <p><strong>Cidade:</strong> ${user.address.city}</p>
        </div>
    `).join('');
}

// 📝 Configurar formulário de criação
function setupCreateForm() {
    if (!postForm) return;
    
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(postForm);
        const postData = {
            title: formData.get('title'),
            body: formData.get('body'),
            userId: parseInt(formData.get('userId')) || 1
        };
        
        try {
            await createPost(postData);
            postForm.reset();
            // Redirecionar para blog após sucesso
            setTimeout(() => window.location.href = 'blog.html', 1500);
        } catch (err) {
            console.error('Erro ao criar post:', err);
        }
    });
}

// ✏️ Configurar formulário de edição
function setupEditForm() {
    if (!editForm) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const postId = parseInt(urlParams.get('id'));
    
    if (!postId) return;
    
    // Carregar dados do post
    loadPostForEdit(postId);
    
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(editForm);
        const postData = {
            id: postId,
            title: formData.get('title'),
            body: formData.get('body'),
            userId: parseInt(formData.get('userId')) || 1
        };
        
        try {
            await updatePost(postId, postData);
            setTimeout(() => window.location.href = 'blog.html', 1500);
        } catch (err) {
            console.error('Erro ao atualizar post:', err);
        }
    });
}

// 📖 Carregar post para edição
async function loadPostForEdit(id) {
    try {
        const post = await getPost(id);
        
        document.getElementById('title').value = post.title;
        document.getElementById('body').value = post.body;
        document.getElementById('userId').value = post.userId;
        
    } catch (err) {
        showError('Erro ao carregar post para edição');
    }
}

// Funções auxiliares do blog
function editPost(id) {
    window.location.href = `edit.html?id=${id}`;
}

function filterPosts(searchTerm) {
    const filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.body.toLowerCase().includes(searchTerm.toLowerCase())
    );
    displayPosts(filteredPosts);
}

// ==========================================
// 🔧 UTILITÁRIOS GERAIS
// ==========================================

function showLoading() { 
    if (loading) loading.classList.remove('hidden'); 
}

function hideLoading() { 
    if (loading) loading.classList.add('hidden'); 
}

function showError(msg) { 
    if (error) { 
        error.textContent = msg; 
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

function validateApiKey() {
    return true; // Sempre válido para APIs sem chave
}