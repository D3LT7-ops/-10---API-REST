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
 
Tecnologias Utilizadas

# Frontend:

HTML5
CSS3 (com Flexbox e Grid)
JavaScript (ES6+)
Responsive Design


# API:
WeatherStack API (http://weatherstack.com/)


## Tabela de Requisições por Página

### Descrição  
#### Buscar dados meteorológicos **reais** da cidade
**index.html -- get -- `https://api.weatherstack.com/current?access_key={API_KEY}&query={city}&units=`**
### Descrição  
#### Adicionar cidade aos favoritos 
**index.html index.html -- post -- `/favorites`**
### Descrição  
#### Listar cidades favoritas 
**favorites.html -- GET--`/favorites`**    
### Descrição  
#### Remover cidade dos favoritos 
**favorites.html --DELETE-- `/favorites/{id}`**

### descriçao 
#### exibir historico de pesquisas
**history.html   --GET--  `/history` (simulado localmente)**



## **Limitações da API Gratuita:**
   - numero limitados de uso da api de graca = 100 buscas por mes 
   - Plan gratuito: 1.000 requisições/mês
   - Apenas requisições GET (não POST/PUT/DELETE)
   - Por isso favoritos/histórico são simulados localmente




## Responsividade

O projeto foi testado e é compatível com:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (até 767px)


## Créditos - Fontes de Referência

- **API de Dados:** [WeatherStack API](https://weatherstack.com/)
- **Ícones Meteorológicos:** WeatherStack Icons
- **Documentação CSS:** [MDN Web Docs](https://developer.mozilla.org/)
- **Documentação JavaScript:** [MDN Web Docs](https://developer.mozilla.org/)
- **Inspiração de Design:** [Dribbble](https://dribbble.com/)
- **Gradientes CSS:** [UI Gradients](https://uigradients.com/)
- **Fontes:** Google Fonts (Arial como fallback)


# Licença
Este projeto é de uso livre e está licenciado sob a [MIT License](https://opensource.org/licenses/MIT).
