import consumer from "channels/consumer"

// ===== FUNÇÕES PARA TELA DE PAUSA =====
function mostrarTelaPausa() {
  const pausaExistente = document.getElementById('tela-pausa-overlay');
  if (pausaExistente) {
    pausaExistente.remove();
  }

  const overlay = document.createElement('div');
  overlay.id = 'tela-pausa-overlay';
  overlay.innerHTML = `
    <div class="pausa-content">
      <div class="pausa-icon-container">
        <svg class="pausa-icon" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="6" y="4" width="4" height="16" rx="1"/>
          <rect x="14" y="4" width="4" height="16" rx="1"/>
        </svg>
      </div>
      <h1 class="pausa-title">VOTAÇÃO PAUSADA</h1>
      <p class="pausa-subtitle">A sessão foi temporariamente suspensa</p>
      <div class="pausa-message">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <span>Aguarde o administrador retomar a votação</span>
      </div>
      <div class="pausa-loader">
        <div class="pausa-dot"></div>
        <div class="pausa-dot"></div>
        <div class="pausa-dot"></div>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  requestAnimationFrame(() => {
    overlay.classList.add('show');
  });
}

function esconderTelaPausa() {
  const overlay = document.getElementById('tela-pausa-overlay');
  if (overlay) {
    overlay.classList.remove('show');
    setTimeout(() => {
      overlay.remove();
    }, 300);
  }
}

function mostrarNotificacao(mensagem, tipo = 'info') {
  const notifExistente = document.querySelector('.notificacao-urna');
  if (notifExistente) {
    notifExistente.remove();
  }

  const icone = tipo === 'pause' ? 
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>' :
    tipo === 'resume' ?
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>' :
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';

  const cores = {
    info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    pause: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    resume: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  };

  const notif = document.createElement('div');
  notif.className = 'notificacao-urna';
  notif.style.background = cores[tipo] || cores.info;
  notif.innerHTML = `${icone}<span>${mensagem}</span>`;
  
  document.body.appendChild(notif);
  setTimeout(() => notif.classList.add('mostrar'), 10);

  setTimeout(() => {
    notif.classList.remove('mostrar');
    setTimeout(() => notif.remove(), 300);
  }, 4000);
}

// Conecta ao canal WebSocket da URNA
consumer.subscriptions.create("UrnaChannel", {
  connected() {
    console.log("[URNA] Conectado ao canal de urna em tempo real");
  },

  disconnected() {
    console.log("[URNA] Desconectado do canal de urna");
  },

  received(data) {
    
    if (data.action === "session_opened") {
      
      mostrarNotificacao("Sessão iniciada! Carregando urna...", "resume");
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
    
    else if (data.action === "status_changed") {
      
      if (data.status === "paused") {
        mostrarTelaPausa();
        mostrarNotificacao("Votação pausada pelo administrador", "pause");
      } 
      else if (data.status === "open") {
        esconderTelaPausa();
        mostrarNotificacao("Votação retomada! Você já pode votar.", "resume");
      }
      else if (data.status === "closed") {
        mostrarNotificacao("Sessão encerrada!", "info");
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    }
  }
});

const estilos = document.createElement('style');
estilos.textContent = `
  /* ===== TELA DE PAUSA ===== */
  #tela-pausa-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(10px);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  #tela-pausa-overlay.show {
    opacity: 1;
  }

  .pausa-content {
    text-align: center;
    color: white;
    max-width: 600px;
    padding: 3rem 2rem;
    animation: pausa-aparecer 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes pausa-aparecer {
    0% {
      transform: scale(0.8) translateY(30px);
      opacity: 0;
    }
    100% {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }

  .pausa-icon-container {
    margin-bottom: 2rem;
    animation: pausa-pulsar 2s ease-in-out infinite;
  }

  @keyframes pausa-pulsar {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  .pausa-icon {
    color: #f59e0b;
    filter: drop-shadow(0 0 30px rgba(245, 158, 11, 0.5));
  }

  .pausa-title {
    font-size: 3rem;
    font-weight: 900;
    color: #f59e0b;
    margin-bottom: 1rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    text-shadow: 0 0 40px rgba(245, 158, 11, 0.6);
  }

  .pausa-subtitle {
    font-size: 1.25rem;
    color: #d1d5db;
    margin-bottom: 2rem;
    font-weight: 500;
  }

  .pausa-message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    background: rgba(245, 158, 11, 0.1);
    border: 2px solid rgba(245, 158, 11, 0.3);
    border-radius: 12px;
    padding: 1.25rem;
    margin: 2rem auto;
    max-width: 400px;
  }

  .pausa-message svg {
    color: #f59e0b;
    flex-shrink: 0;
  }

  .pausa-message span {
    font-size: 1rem;
    color: white;
    font-weight: 500;
  }

  .pausa-loader {
    margin-top: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.75rem;
  }

  .pausa-dot {
    width: 14px;
    height: 14px;
    background: #f59e0b;
    border-radius: 50%;
    animation: pausa-bounce 1.4s infinite ease-in-out both;
  }

  .pausa-dot:nth-child(1) { animation-delay: -0.32s; }
  .pausa-dot:nth-child(2) { animation-delay: -0.16s; }

  @keyframes pausa-bounce {
    0%, 80%, 100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* ===== NOTIFICAÇÃO DA URNA ===== */
  .notificacao-urna {
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 600;
    font-size: 0.9375rem;
    z-index: 99998;
    transform: translateX(400px);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .notificacao-urna.mostrar {
    transform: translateX(0);
    opacity: 1;
  }

  .notificacao-urna svg {
    flex-shrink: 0;
  }

  /* Responsividade para tela de pausa */
  @media (max-width: 768px) {
    .pausa-content {
      padding: 2rem 1.5rem;
    }

    .pausa-title {
      font-size: 2rem;
    }

    .pausa-subtitle {
      font-size: 1rem;
    }

    .pausa-icon {
      width: 60px;
      height: 60px;
    }

    .notificacao-urna {
      right: 10px;
      left: 10px;
      transform: translateY(-100px);
    }

    .notificacao-urna.mostrar {
      transform: translateY(0);
    }
  }
`;

document.head.appendChild(estilos);