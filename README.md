# -10---API-REST
Weather App - Consulta Meteorológica
Desenvolvido por: Helberth Renan Gomes de Sousa
# Descrição e Objetivo do Projeto
O Weather App é uma aplicação web que permite aos usuários consultar informações meteorológicas em tempo real de diferentes cidades ao redor do mundo. O projeto utiliza a API WeatherStack para obter dados atualizados sobre condições climáticas, incluindo temperatura, umidade, velocidade do vento, pressão atmosférica e muito mais.

### Funcionalidades Principais:

- Consulta de dados meteorológicos reais por cidade
- Exibição de informações detalhadas do clima atual
- Sistema de cidades favoritas
- Histórico de pesquisas recentes
- Interface responsiva e moderna
 

### Funcionalidades Principais:
- Consulta do tempo por nome da cidade
- Sistema de favoritos para cidades frequentemente consultadas
- Histórico de pesquisas realizadas
- Interface responsiva e intuitiva
- Exibição de dados meteorológicos detalhados

## Tecnologias Utilizadas

- **HTML5** - Estruturação das páginas
- **CSS3** - Estilização e layout responsivo
- **JavaScript** - Lógica da aplicação e integração com API
- **WeatherStack API** - Fonte de dados meteorológicos
- **Font Awesome** - Ícones da interface

## Requisições por Página

| **Página** | **Tipo de Requisição** | **Endpoint** |
|------------|------------------------|--------------|
| index.html | GET | /current (WeatherStack API) |
| favoritos.html | GET | /current (WeatherStack API) |
| history.html | GET | Dados do localStorage |

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

## Como Usar

1. Acesse a página principal (index.html)
2. Digite o nome de uma cidade no campo de busca
3. Clique em "Buscar" para obter as informações meteorológicas
4. Adicione cidades aos favoritos clicando no botão correspondente
5. Acesse o histórico para visualizar pesquisas anteriores



## **Limitações da API Gratuita:**
   - numero limitados de uso da API POIS ELA E UMA API GRATIS = 100 buscas por mes  
   - Plan gratuito: 1.000 requisições/mês
   - Apenas requisições GET (não POST/PUT/DELETE)
   - Por isso favoritos/histórico são simulados localmente




## Responsividade

O projeto foi testado e é compatível com:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (até 767px)


## Créditos - Fontes de Referência

- **-APILAYER-WeatherStack API** - [https://weatherstack.com/](https://weatherstack.com/)
  - Fonte principal de dados meteorológicos em tempo real
- **Font Awesome** - [https://fontawesome.com/](https://fontawesome.com/)
  - Biblioteca de ícones utilizada na interface
- **MDN Web Docs** - [https://developer.mozilla.org/](https://developer.mozilla.org/)
  - Documentação de referência para HTML, CSS e JavaScript
- **GitHub** - [https://github.com/D3LT7-ops](https://github.com/D3LT7-ops)
  - Repositório do desenvolvedor





# Licença
Este projeto é de uso livre e está licenciado sob a [MIT License](https://opensource.org/licenses/MIT).
