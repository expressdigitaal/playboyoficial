# Dashboard de Monitoramento em Tempo Real - Playboy Oficial

Sistema completo de monitoramento em tempo real para o site Playboy Oficial, incluindo dashboard interativo, tracking de visitas e cliques nos botões de compra.

## 🚀 Funcionalidades

### Dashboard em Tempo Real
- **Visitas diárias**: Contador em tempo real de visitas do dia
- **Cliques nos botões**: Rastreamento de cliques nos botões de compra
- **Contagem por pacote**: Separação entre Pacote Sedução (R$ 10,00) e Pacote Premium (R$ 19,90)
- **Gráficos interativos**: Visualização de dados com Chart.js
- **Atividade em tempo real**: Feed de atividades ao vivo
- **Taxa de conversão**: Cálculo automático da taxa de conversão

### Tracking Avançado
- Rastreamento de visitas por hora
- Monitoramento de engajamento (scroll)
- Tempo de permanência na página
- Sessões de usuário
- Dados de referrer e user agent

## 📁 Estrutura de Arquivos

```
├── site teste.html          # Site principal (modificado com tracking)
├── dashboard.html           # Dashboard de monitoramento
├── monitoring-script.js    # Script de tracking (integrado ao site)
├── server.js               # Servidor backend com Socket.IO
├── package.json           # Dependências do Node.js
└── README.md              # Este arquivo
```

## 🛠️ Instalação e Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Executar o Servidor

```bash
# Modo produção
npm start

# Modo desenvolvimento (com auto-reload)
npm run dev
```

### 3. Acessar o Sistema

- **Site principal**: `http://localhost:3000/`
- **Dashboard**: `http://localhost:3000/dashboard`

## 📊 Como Usar o Dashboard

### Métricas Principais
1. **Visitas Hoje**: Número total de visitas no dia atual
2. **Total de Cliques**: Soma de todos os cliques nos botões
3. **Pacote Sedução**: Cliques específicos no pacote de R$ 10,00
4. **Pacote Premium**: Cliques específicos no pacote de R$ 19,90

### Gráficos
- **Visitas por Hora**: Gráfico de linha mostrando distribuição de visitas nas últimas 24h
- **Distribuição de Cliques**: Gráfico de pizza mostrando proporção entre os pacotes

### Atividade em Tempo Real
- Feed de atividades ao vivo
- Notificações de novas visitas
- Alertas de cliques nos botões
- Timestamp de cada evento

## 🔧 Configuração Avançada

### Modificar Tracking
Edite o arquivo `monitoring-script.js` para personalizar:

```javascript
const MONITORING_CONFIG = {
    serverUrl: 'https://playboyoficial.onrender.com',
    trackingEnabled: true,
    debugMode: false  // Ativar para logs detalhados
};
```

### Personalizar Dashboard
Modifique `dashboard.html` para:
- Alterar cores e layout
- Adicionar novas métricas
- Personalizar gráficos
- Modificar intervalos de atualização

## 🌐 Deploy em Produção

### Render.com (Recomendado)
1. Conecte seu repositório GitHub ao Render
2. Configure as variáveis de ambiente:
   - `NODE_ENV=production`
   - `PORT=10000` (automático no Render)
3. Deploy automático a cada push

### Outras Plataformas
- **Heroku**: `git push heroku main`
- **Vercel**: `vercel --prod`
- **DigitalOcean**: Configure PM2 para gerenciar o processo

## 📈 API Endpoints

### Tracking
- `POST /api/track` - Receber dados de tracking
- `GET /api/dashboard` - Obter dados do dashboard

### Páginas
- `GET /` - Site principal
- `GET /dashboard` - Dashboard de monitoramento

## 🔍 Monitoramento de Eventos

### Tipos de Eventos Rastreados
1. **page_view**: Visualização da página
2. **button_click**: Clique em botão de compra
3. **scroll_engagement**: Engajamento com scroll
4. **time_on_page**: Tempo gasto na página
5. **page_exit**: Saída da página

### Dados Coletados
- ID da sessão
- Timestamp
- URL da página
- User Agent
- Referrer
- Tipo de evento
- Dados específicos do evento

## 🚨 Troubleshooting

### Problemas Comuns

1. **Dashboard não atualiza**
   - Verifique se o Socket.IO está funcionando
   - Confirme se o servidor está rodando
   - Verifique logs do console

2. **Tracking não funciona**
   - Verifique se o `monitoring-script.js` está carregado
   - Confirme se o servidor está acessível
   - Ative `debugMode: true` para logs

3. **Dados não persistem**
   - Os dados são armazenados em memória
   - Para persistência, implemente banco de dados
   - Configure backup automático

## 📝 Logs e Debug

### Ativar Modo Debug
```javascript
// Em monitoring-script.js
const MONITORING_CONFIG = {
    debugMode: true  // Ativa logs detalhados
};
```

### Verificar Logs
```bash
# Logs do servidor
npm start

# Logs em produção
pm2 logs
```

## 🔒 Segurança

### Recomendações
- Use HTTPS em produção
- Configure CORS adequadamente
- Implemente rate limiting
- Monitore tentativas de acesso suspeitas

### Dados Sensíveis
- Não colete dados pessoais
- Respeite LGPD/GDPR
- Implemente anonimização
- Configure retenção de dados

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console
2. Confirme se todas as dependências estão instaladas
3. Teste em ambiente local primeiro
4. Verifique configurações de rede/firewall

## 🎯 Próximos Passos

### Melhorias Futuras
- [ ] Integração com banco de dados
- [ ] Relatórios automáticos por email
- [ ] Alertas de performance
- [ ] Análise de funil de conversão
- [ ] A/B testing integrado
- [ ] Exportação de dados
- [ ] Integração com Google Analytics
- [ ] Dashboard mobile responsivo

---

**Desenvolvido para Playboy Oficial** 🐰
*Sistema de monitoramento em tempo real*
