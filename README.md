# -10---API-REST
Weather App - Consulta Meteorológica
Desenvolvido por: Helberth Renan Gomes de Sousa
# Descrição e Objetivo do Projeto
O Weather App é uma aplicação web que permite aos usuários consultar informações meteorológicas em tempo real de diferentes cidades ao redor do mundo. O projeto utiliza a API WeatherStack para obter dados atualizados sobre condições climáticas, incluindo temperatura, umidade, velocidade do vento, pressão atmosférica e muito mais.

### 🎯 Funcionalidades Principais:

####  **Consulta Meteorológica:**
- Consulta de dados meteorológicos reais por cidade
- Exibição de informações detalhadas do clima atual
- Sistema de cache para otimização
- Debounce para evitar requisições excessivas

#### 👥 **Seção Social:**
- Testimoniais de usuários reais
- Sistema de avaliações com estrelas
- Avatars personalizados
- Informações de localização dos usuários

## 🛠️ Tecnologias Utilizadas

- **Frontend:**
  - HTML5 - Estruturação semântica
  - CSS3 - Estilização avançada com Glassmorphism
  - JavaScript ES6+ - Lógica da aplicação
  - Font Awesome 6.4.0 - Ícones modernos

- **APIs REST:**
  - wttr.in - Dados meteorológicos (principal)
  - OpenWeatherMap - Backup meteorológico
  - JSONPlaceholder - Dados de usuários e testimoniais

## 🔌 APIs e Requisições

### Estrutura de Requisições por Página:

| **Página** | **Tipo** | **API/Endpoint** | **Funcionalidade** |
|------------|----------|------------------|-------------------|
| index.html | GET | `wttr.in/{city}?format=j1` | Dados meteorológicos |
| favoritos.html | GET | `jsonplaceholder.typicode.com/users` | Testimoniais |
| history.html | LOCAL | localStorage | Histórico de pesquisas |

### 📊 Detalhamento das APIs:

#### 🌤️ **API de Clima (wttr.in):**
```javascript
// Endpoint principal
GET https://wttr.in/{city}?format=j1

// Resposta exemplo:
{
  "current_condition": [{
    "temp_C": "25",
    "weatherDesc": [{"value": "Sunny"}],
    "humidity": "65",
    "windspeedKmph": "15"
  }],
  "nearest_area": [{
    "areaName": [{"value": "São Paulo"}],
    "country": [{"value": "Brazil"}]
  }]
}
```

#### 👥 **API de Usuários (JSONPlaceholder):**
```javascript
// Buscar usuários
GET https://jsonplaceholder.typicode.com/users

// Resposta exemplo:
[{
  "id": 1,
  "name": "Leanne Graham",
  "email": "Sincere@april.biz",
  "address": {
    "city": "Gwenborough"
  }
}]
```

## 📁 Estrutura do Projeto

```
weather-app/
├── index.html           # Página principal de consulta
├── favoritos.html       # Cidades favoritas + Testimoniais
├── history.html         # Histórico de pesquisas
├── css/
│   └── estilo.css          # Estilos responsivos
└── js/
    └── main.js             # Lógica completa da aplicação
```

## 🚀 Como Usar

### 1. **Consultar Clima:**
- Acesse a página principal
- Digite o nome de uma cidade
- Aguarde o resultado (debounce de 1.5s)
- Visualize informações detalhadas

### 4. **Conhecer a Comunidade:**
- Na página de Favoritos, role para baixo
- Veja testimoniais de usuários reais que usam o app

## 🔧 Funcionalidades Técnicas

### ⚡ **Performance:**
- Sistema de cache para evitar requisições desnecessárias
- Debounce de 1.5s para otimizar a experiência
- Fallback para dados demo em caso de falha da API

### 💾 **Armazenamento:**
- localStorage para favoritos e histórico
- Cache em memória para sessão atual
- Dados persistem entre sessões


### 📱 **Dispositivos Testados:**
- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px) 
- ✅ Mobile (até 767px)

### 🌐 **Navegadores Suportados:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## ⚠️ Limitações Conhecidas

- **wttr.in**: API gratuita, pode ter limitações de rate limiting
- **localStorage**: Limitado a ~5-10MB por domínio
- **Dados offline**: Não disponíveis (requer conexão com internet)



### Detalhamento das Requisições:

- **index.html**: Realiza requisições GET para o endpoint `/current` da WeatherStack API para buscar dados meteorológicos da cidade pesquisada
- **favoritos.html**: Utiliza requisições GET para atualizar informações das cidades salvas como favoritas
- **history.html**: Recupera dados do histórico armazenados localmente no navegador

## Estrutura do Projeto

```
weather-app/
├── index.html          # Página principal de consulta
├── favoritos.html      # Página de cidades favoritas
├── history.html        # Página de histórico de pesquisas
├── css/
│   └── estilo.css      # Arquivo de estilos
└── js/
    └── main.js         # Lógica JavaScript da aplicação
```

## Créditos e Referências

### **APIs Utilizadas:**
- **wttr.in** - [https://wttr.in/](https://wttr.in/)
  - API gratuita de dados meteorológicos
- **JSONPlaceholder** - [https://jsonplaceholder.typicode.com/](https://jsonplaceholder.typicode.com/)
  - API para dados de usuários e testimoniais
- **UI Avatars** - [https://ui-avatars.com/](https://ui-avatars.com/)
  - Geração de avatars personalizados

### **Ferramentas e Bibliotecas:**
- **Font Awesome** - [https://fontawesome.com/](https://fontawesome.com/)
  - Biblioteca de ícones moderna
- **MDN Web Docs** - [https://developer.mozilla.org/](https://developer.mozilla.org/)
  - Documentação de referência


# Licença
Este projeto é de uso livre e está licenciado sob a [MIT License](https://opensource.org/licenses/MIT).
