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

| Página         | Tipo de Requisição| Endpoint                                                                         | Descrição |
|----------------|-------------------|----------------------------------------------------------------------------------|
| index.html     | GET               | `https://api.weatherstack.com/current?access_key={API_KEY}&query={city}&units=m` | Buscar dados meteorológicos **reais** da cidade |
| index.html     | POST              | `/favorites` (simulado localmente).                                              | Adicionar cidade aos favoritos |
| favorites.html | GET               | `/favorites` (simulado localmente)                                               | Listar cidades favoritas |
| favorites.html | DELETE            | `/favorites/{id}` (simulado localmente)                                          |Remover cidade dos favoritos |
| history.html   | GET               | `/history` (simulado localmente)                                                 | Exibir histórico de pesquisas |


## **Limitações da API Gratuita:**
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


