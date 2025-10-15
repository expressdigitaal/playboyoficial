const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Dados de monitoramento em memória (em produção, usar banco de dados)
let monitoringData = {
    totalVisits: 0,
    visitsToday: 0,
    totalClicks: 0,
    seducaoClicks: 0,
    premiumClicks: 0,
    visitsByHour: Array(24).fill(0),
    realtimeActivity: [],
    sessions: new Map()
};

// Função para obter data atual no Brasil
function getBrazilDate() {
    return new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
}

// Função para resetar contadores diários
function resetDailyCounters() {
    const now = getBrazilDate();
    const lastReset = monitoringData.lastReset || now.getDate();
    
    if (now.getDate() !== lastReset) {
        monitoringData.visitsToday = 0;
        monitoringData.visitsByHour = Array(24).fill(0);
        monitoringData.lastReset = now.getDate();
        console.log('Contadores diários resetados');
    }
}

// Endpoint para receber dados de tracking
app.post('/api/track', (req, res) => {
    try {
        const { eventType, sessionId, timestamp, data } = req.body;
        
        // Resetar contadores se necessário
        resetDailyCounters();
        
        switch (eventType) {
            case 'page_view':
                monitoringData.totalVisits++;
                monitoringData.visitsToday++;
                
                const hour = getBrazilDate().getHours();
                monitoringData.visitsByHour[hour]++;
                
                // Adicionar atividade em tempo real
                monitoringData.realtimeActivity.unshift({
                    type: 'visit',
                    message: 'Nova visita detectada',
                    timestamp: Date.now(),
                    sessionId: sessionId
                });
                
                // Manter apenas últimas 100 atividades
                if (monitoringData.realtimeActivity.length > 100) {
                    monitoringData.realtimeActivity = monitoringData.realtimeActivity.slice(0, 100);
                }
                
                // Emitir evento via Socket.IO
                io.emit('visit', {
                    totalVisits: monitoringData.totalVisits,
                    visitsToday: monitoringData.visitsToday,
                    visitsByHour: monitoringData.visitsByHour
                });
                
                break;
                
            case 'button_click':
                monitoringData.totalClicks++;
                
                if (data.packageType === 'seducao') {
                    monitoringData.seducaoClicks++;
                } else if (data.packageType === 'premium') {
                    monitoringData.premiumClicks++;
                }
                
                // Adicionar atividade em tempo real
                const packageName = data.packageType === 'seducao' ? 'Pacote Sedução (R$ 10,00)' : 'Pacote Premium (R$ 19,90)';
                monitoringData.realtimeActivity.unshift({
                    type: 'click',
                    message: `Clique no ${packageName}`,
                    timestamp: Date.now(),
                    sessionId: sessionId,
                    packageType: data.packageType
                });
                
                // Manter apenas últimas 100 atividades
                if (monitoringData.realtimeActivity.length > 100) {
                    monitoringData.realtimeActivity = monitoringData.realtimeActivity.slice(0, 100);
                }
                
                // Emitir evento via Socket.IO
                io.emit('button_click', {
                    totalClicks: monitoringData.totalClicks,
                    seducaoClicks: monitoringData.seducaoClicks,
                    premiumClicks: monitoringData.premiumClicks,
                    package: data.packageType
                });
                
                break;
                
            case 'scroll_engagement':
                // Log de engajamento (opcional)
                console.log(`Engajamento detectado: ${data.scrollPercent}% de scroll`);
                break;
                
            case 'time_on_page':
                // Atualizar tempo na página para a sessão
                if (monitoringData.sessions.has(sessionId)) {
                    monitoringData.sessions.get(sessionId).timeOnPage = data.timeOnPage;
                }
                break;
                
            case 'page_exit':
                // Finalizar sessão
                if (monitoringData.sessions.has(sessionId)) {
                    const session = monitoringData.sessions.get(sessionId);
                    session.endTime = Date.now();
                    session.duration = session.endTime - session.startTime;
                }
                break;
        }
        
        // Atualizar dados da sessão
        if (!monitoringData.sessions.has(sessionId)) {
            monitoringData.sessions.set(sessionId, {
                startTime: Date.now(),
                pageViews: 0,
                buttonClicks: 0,
                packageClicks: { seducao: 0, premium: 0 }
            });
        }
        
        const session = monitoringData.sessions.get(sessionId);
        if (eventType === 'page_view') {
            session.pageViews++;
        } else if (eventType === 'button_click') {
            session.buttonClicks++;
            if (data.packageType === 'seducao') {
                session.packageClicks.seducao++;
            } else if (data.packageType === 'premium') {
                session.packageClicks.premium++;
            }
        }
        
        res.json({ success: true, message: 'Dados recebidos com sucesso' });
        
    } catch (error) {
        console.error('Erro ao processar dados de tracking:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Endpoint para obter dados do dashboard
app.get('/api/dashboard', (req, res) => {
    resetDailyCounters();
    
    const dashboardData = {
        totalVisits: monitoringData.totalVisits,
        visitsToday: monitoringData.visitsToday,
        totalClicks: monitoringData.totalClicks,
        seducaoClicks: monitoringData.seducaoClicks,
        premiumClicks: monitoringData.premiumClicks,
        visitsByHour: monitoringData.visitsByHour,
        realtimeActivity: monitoringData.realtimeActivity.slice(0, 20), // Últimas 20 atividades
        activeSessions: monitoringData.sessions.size,
        conversionRate: monitoringData.visitsToday > 0 ? 
            ((monitoringData.totalClicks / monitoringData.visitsToday) * 100).toFixed(1) : 0
    };
    
    res.json(dashboardData);
});

// Endpoint para servir o dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Endpoint para servir o site principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'site teste.html'));
});

// Configurar Socket.IO
io.on('connection', (socket) => {
    console.log('Dashboard conectado:', socket.id);
    
    // Enviar dados iniciais para o dashboard
    socket.emit('initial_data', {
        totalVisits: monitoringData.totalVisits,
        visitsToday: monitoringData.visitsToday,
        totalClicks: monitoringData.totalClicks,
        seducaoClicks: monitoringData.seducaoClicks,
        premiumClicks: monitoringData.premiumClicks,
        visitsByHour: monitoringData.visitsByHour,
        realtimeActivity: monitoringData.realtimeActivity.slice(0, 10)
    });
    
    socket.on('disconnect', () => {
        console.log('Dashboard desconectado:', socket.id);
    });
});

// Limpeza de sessões antigas (a cada 5 minutos)
setInterval(() => {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutos
    
    for (const [sessionId, session] of monitoringData.sessions) {
        if (now - session.startTime > maxAge) {
            monitoringData.sessions.delete(sessionId);
        }
    }
    
    console.log(`Sessões ativas: ${monitoringData.sessions.size}`);
}, 5 * 60 * 1000);

// Inicializar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor de monitoramento rodando na porta ${PORT}`);
    console.log(`Dashboard disponível em: http://localhost:${PORT}/dashboard`);
    console.log(`Site principal em: http://localhost:${PORT}/`);
});

module.exports = { app, server, io };
