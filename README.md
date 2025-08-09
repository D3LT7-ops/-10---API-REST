# -10---API-REST

# Weather Monitor - Sistema de Monitoramento Climático

**Desenvolvido por:** [Helbeerth Renan Gomes De Sousa]

## Descrição e Objetivo do Projeto

O Weather Monitor é um sistema completo de monitoramento climático que utiliza a **APILAYER WEATHERSTACK API** para fornecer informações meteorológicas em tempo real, previsões do tempo e análises históricas com foco especial em **precipitação de chuvas**.




## 🔧 Modo Demonstração

O projeto inclui um **modo demonstração** que simula dados da API para fins de teste:

```javascript
const DEMO_MODE = false; // deixei destvado , para para funcionar com dados reais da api 

// Dados simulados para 5 cidades brasileiras:
- São Paulo (Parcialmente nublado, 23°C, 2.5mm precipitação)
- Rio de Janeiro (Ensolarado, 28°C, 0mm precipitação)  
- Belo Horizonte (Nublado, 21°C, 5.2mm precipitação)
- Salvador (Parcialmente nublado, 30°C, 1.8mm precipitação)
- Brasília (Claro, 24°C, 0mm precipitação)


## Limitações da API Gratuita

- **1.000 requisições/mês** no plano gratuito
- **Dados atuais apenas** (previsão e histórico requerem planos pagos)
- **HTTPS necessário** para produção (planos pagos)
- **Rate limiting**: Máximo 1 requisição por segundo



### Links Úteis
- **API Documentation**: [https://weatherstack.com/documentation]


## Créditos

### Fontes de Referência Utilizadas
- **APILAYER WEATHERSTACK**: Dados meteorológicos
- **Font Awesome**: Biblioteca de ícones
- **MDN Web Docs**: Documentação técnica
- **CSS Grid Guide**: Layout responsivo
- **Canvas API Tutorial**: Gráficos customizados
