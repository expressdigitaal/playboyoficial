// Script de Monitoramento em Tempo Real para Playboy Oficial
// Este script deve ser incluído no site existente para rastrear visitas e cliques

(function() {
    'use strict';

    // Configuração do monitoramento
    const MONITORING_CONFIG = {
        serverUrl: 'https://playboyoficial.onrender.com',
        trackingEnabled: true,
        debugMode: false
    };

    // Dados de sessão
    let sessionData = {
        sessionId: generateSessionId(),
        startTime: Date.now(),
        pageViews: 0,
        buttonClicks: 0,
        packageClicks: {
            seducao: 0,
            premium: 0
        }
    };

    // Gerar ID único para a sessão
    function generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Log de debug
    function debugLog(message, data = null) {
        if (MONITORING_CONFIG.debugMode) {
            console.log('[MONITORING]', message, data);
        }
    }

    // Enviar dados para o servidor
    function sendData(eventType, data) {
        if (!MONITORING_CONFIG.trackingEnabled) return;

        const payload = {
            eventType: eventType,
            sessionId: sessionData.sessionId,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            data: data
        };

        // Enviar via fetch (fallback para XMLHttpRequest)
        if (window.fetch) {
            fetch(`${MONITORING_CONFIG.serverUrl}/api/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            }).catch(error => {
                debugLog('Erro ao enviar dados via fetch:', error);
            });
        } else {
            // Fallback para XMLHttpRequest
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${MONITORING_CONFIG.serverUrl}/api/track`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(payload));
        }

        debugLog(`Dados enviados: ${eventType}`, payload);
    }

    // Rastrear visita à página
    function trackPageView() {
        sessionData.pageViews++;
        sendData('page_view', {
            pageViews: sessionData.pageViews,
            timeOnPage: Date.now() - sessionData.startTime
        });
        debugLog('Página visualizada');
    }

    // Rastrear cliques nos botões de compra
    function trackButtonClick(packageType, buttonElement) {
        sessionData.buttonClicks++;
        sessionData.packageClicks[packageType]++;
        
        sendData('button_click', {
            packageType: packageType,
            buttonClicks: sessionData.buttonClicks,
            packageClicks: sessionData.packageClicks,
            buttonText: buttonElement.textContent.trim(),
            buttonHref: buttonElement.href || null
        });
        
        debugLog(`Clique no botão: ${packageType}`, {
            totalClicks: sessionData.buttonClicks,
            packageClicks: sessionData.packageClicks
        });
    }

    // Detectar cliques nos botões de compra
    function setupButtonTracking() {
        // Aguardar um pouco para garantir que o DOM está carregado
        setTimeout(() => {
            // Buscar todos os botões que contêm "LIBERAR PACOTE"
            const allButtons = document.querySelectorAll('button, a');
            
            allButtons.forEach(button => {
                const buttonText = button.textContent || button.innerText || '';
                const buttonOnclick = button.onclick ? button.onclick.toString() : '';
                const buttonHref = button.href || '';
                
                // Verificar se é um botão de compra
                if (buttonText.includes('LIBERAR PACOTE') || 
                    buttonOnclick.includes('pay.cakto.com.br') ||
                    buttonHref.includes('pay.cakto.com.br')) {
                    
                    // Adicionar listener de clique
                    button.addEventListener('click', function(event) {
                        let packageType = 'unknown';
                        
                        // Determinar tipo do pacote
                        if (buttonOnclick.includes('pcytvby_607625') || buttonHref.includes('pcytvby_607625')) {
                            packageType = 'seducao';
                        } else if (buttonOnclick.includes('c2a2g68_607613') || buttonHref.includes('c2a2g68_607613')) {
                            packageType = 'premium';
                        }

                        trackButtonClick(packageType, button);
                        debugLog(`Clique detectado no botão: ${packageType}`, button);
                    });

                    debugLog(`Botão de compra rastreado: ${packageType}`, button);
                }
            });
        }, 1000); // Aguardar 1 segundo para garantir que tudo carregou
    }

    // Rastrear tempo na página
    function trackTimeOnPage() {
        setInterval(() => {
            const timeOnPage = Date.now() - sessionData.startTime;
            if (timeOnPage > 0) {
                sendData('time_on_page', {
                    timeOnPage: timeOnPage,
                    pageViews: sessionData.pageViews
                });
            }
        }, 30000); // A cada 30 segundos
    }

    // Rastrear scroll e engajamento
    function trackEngagement() {
        let maxScroll = 0;
        let scrollEvents = 0;

        window.addEventListener('scroll', function() {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                scrollEvents++;
                
                // Enviar dados de scroll significativo
                if (scrollPercent % 25 === 0) { // A cada 25% de scroll
                    sendData('scroll_engagement', {
                        scrollPercent: scrollPercent,
                        scrollEvents: scrollEvents
                    });
                }
            }
        });
    }

    // Rastrear saída da página
    function trackPageExit() {
        window.addEventListener('beforeunload', function() {
            const timeOnPage = Date.now() - sessionData.startTime;
            sendData('page_exit', {
                timeOnPage: timeOnPage,
                pageViews: sessionData.pageViews,
                buttonClicks: sessionData.buttonClicks,
                packageClicks: sessionData.packageClicks
            });
        });
    }

    // Inicializar monitoramento
    function initMonitoring() {
        debugLog('Inicializando monitoramento...');
        
        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setupMonitoring();
            });
        } else {
            setupMonitoring();
        }
    }

    function setupMonitoring() {
        // Rastrear visualização da página
        trackPageView();
        
        // Configurar rastreamento de botões
        setupButtonTracking();
        
        // Configurar rastreamento de tempo
        trackTimeOnPage();
        
        // Configurar rastreamento de engajamento
        trackEngagement();
        
        // Configurar rastreamento de saída
        trackPageExit();
        
        debugLog('Monitoramento configurado com sucesso');
    }

    // Inicializar quando o script for carregado
    initMonitoring();

    // Expor funções para debug (apenas em modo debug)
    if (MONITORING_CONFIG.debugMode) {
        window.monitoringDebug = {
            sessionData: sessionData,
            sendData: sendData,
            trackPageView: trackPageView,
            trackButtonClick: trackButtonClick
        };
    }

})();
