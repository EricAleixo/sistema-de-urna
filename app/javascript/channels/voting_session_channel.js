import consumer from "channels/consumer"

// Função auxiliar para animar números
function animarNumero(elemento, valorFinal, duracao = 600) {
  const valorInicial = parseInt(elemento.textContent) || 0;
  const diferenca = valorFinal - valorInicial;
  
  if (diferenca === 0) return;
  
  const incremento = diferenca / (duracao / 16);
  let valorAtual = valorInicial;
  
  const animar = () => {
    valorAtual += incremento;
    
    if ((incremento > 0 && valorAtual >= valorFinal) || 
        (incremento < 0 && valorAtual <= valorFinal)) {
      elemento.textContent = valorFinal;
      return;
    }
    
    elemento.textContent = Math.round(valorAtual);
    requestAnimationFrame(animar);
  };
  
  animar();
}

// Função para criar animação +1 criativa
function mostrarIncrementoVoto(elemento) {
  const statsSection = elemento.closest('.candidate-stats-section') || elemento.closest('.blank-stats');
  if (!statsSection) return;

  const incremento = document.createElement('div');
  incremento.className = 'voto-incremento';
  incremento.innerHTML = `
    <div class="voto-incremento-content">
      <svg class="voto-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span class="voto-plus">+1</span>
      <div class="voto-particulas">
        <span class="particula"></span>
        <span class="particula"></span>
        <span class="particula"></span>
        <span class="particula"></span>
        <span class="particula"></span>
        <span class="particula"></span>
      </div>
    </div>
  `;
  
  if (window.getComputedStyle(statsSection).position === 'static') {
    statsSection.style.position = 'relative';
  }
  
  incremento.style.position = 'absolute';
  incremento.style.left = '50%';
  incremento.style.top = '35%';
  incremento.style.transform = 'translateX(-50%)';
  incremento.style.zIndex = '200';
  
  statsSection.appendChild(incremento);

  setTimeout(() => {
    incremento.remove();
  }, 1500);
}

// Função para adicionar efeito de pulso
function adicionarPulso(elemento) {
  if (!elemento) return;
  elemento.classList.add('atualizado');
  setTimeout(() => {
    elemento.classList.remove('atualizado');
  }, 800);
}

// Função para atualizar votos com animação
function atualizarVotos(data) {
  const { candidatura_id, votos, votos_em_branco } = data;

  const totalEl = document.getElementById("total-votos");
  if (totalEl) {
    const totalAtual = parseInt(totalEl.textContent) || 0;
    const novoTotal = totalAtual + 1;
    animarNumero(totalEl, novoTotal);
    adicionarPulso(totalEl.closest('.info-card'));
  } else {
    console.error('❌ Elemento #total-votos não encontrado no DOM!');
  }

  const totalVotos = totalEl ? (parseInt(totalEl.textContent) || 0) + 1 : null;

  if (candidatura_id) {
    const votosEl = document.getElementById(`votos-${candidatura_id}`);
    if (votosEl) {
      const votosAntigos = parseInt(votosEl.textContent) || 0;
      
      if (votos > votosAntigos) {
        mostrarIncrementoVoto(votosEl);
      }
      
      animarNumero(votosEl, votos);
      adicionarPulso(votosEl);
      
      const card = votosEl.closest('.candidate-card');
      if (card) {
        card.classList.add('card-destaque');
        setTimeout(() => card.classList.remove('card-destaque'), 1000);
      }
    }

    if (totalVotos && totalVotos > 0) {
      const percentEl = document.getElementById(`percent-${candidatura_id}`);
      if (percentEl) {
        const pct = ((votos / totalVotos) * 100).toFixed(1);
        
        percentEl.style.transform = 'scale(1.15)';
        percentEl.style.color = '#f5a524';
        
        setTimeout(() => {
          percentEl.textContent = `${pct}%`;
          
          setTimeout(() => {
            percentEl.style.transform = 'scale(1)';
            percentEl.style.color = '';
          }, 100);
        }, 150);
      }

      const progressEl = document.getElementById(`progress-${candidatura_id}`);
      if (progressEl) {
        const pct = ((votos / totalVotos) * 100).toFixed(2);
        progressEl.style.width = `${pct}%`;
        
        progressEl.style.boxShadow = '0 0 20px rgba(245, 165, 36, 0.8)';
        setTimeout(() => {
          progressEl.style.boxShadow = '0 0 8px rgba(245, 165, 36, 0.5)';
        }, 600);
      }
    }
  }

  if (votos_em_branco !== undefined) {
    const brancoNumEl = document.querySelector('.blank-number');
    if (brancoNumEl) {
      const brancosAntigos = parseInt(brancoNumEl.textContent) || 0;
      
      if (votos_em_branco > brancosAntigos) {
        mostrarIncrementoVoto(brancoNumEl);
      }
      
      animarNumero(brancoNumEl, votos_em_branco);
      adicionarPulso(brancoNumEl.closest('.blank-votes-card'));
    }

    if (totalVotos && totalVotos > 0) {
      const brancoPercentEl = document.querySelector('.blank-percent');
      if (brancoPercentEl) {
        const pct = ((votos_em_branco / totalVotos) * 100).toFixed(1);
        brancoPercentEl.textContent = `${pct}%`;
      }
    }
  }

  if (totalVotos) {
    atualizarTodasPorcentagens(totalVotos);
  }

  verificarEReordenar();
}

// Função para atualizar todas as porcentagens quando o total de votos muda
function atualizarTodasPorcentagens(total_votos) {
  if (!total_votos || total_votos === 0) return;

  document.querySelectorAll('[id^="votos-"]').forEach(votosEl => {
    const candidaturaId = votosEl.id.replace('votos-', '');
    const votos = parseInt(votosEl.textContent) || 0;
    
    const percentEl = document.getElementById(`percent-${candidaturaId}`);
    if (percentEl) {
      const pct = ((votos / total_votos) * 100).toFixed(1);
      percentEl.textContent = `${pct}%`;
    }

    const progressEl = document.getElementById(`progress-${candidaturaId}`);
    if (progressEl) {
      const pct = ((votos / total_votos) * 100).toFixed(2);
      progressEl.style.width = `${pct}%`;
    }
  });

  const brancoNumEl = document.querySelector('.blank-number');
  const brancoPercentEl = document.querySelector('.blank-percent');
  if (brancoNumEl && brancoPercentEl) {
    const votosEmBranco = parseInt(brancoNumEl.textContent) || 0;
    const pct = ((votosEmBranco / total_votos) * 100).toFixed(1);
    brancoPercentEl.textContent = `${pct}%`;
  }
}

// Função para verificar e reordenar candidatos
function verificarEReordenar() {
  const grid = document.querySelector('.candidates-grid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.candidate-card'));
  
  cards.sort((a, b) => {
    const votosA = parseInt(a.querySelector('[id^="votos-"]')?.textContent) || 0;
    const votosB = parseInt(b.querySelector('[id^="votos-"]')?.textContent) || 0;
    return votosB - votosA;
  });

  cards.forEach((card, index) => {
    const badge = card.querySelector('.position-badge');
    if (badge) {
      const isFirst = index === 0;
      const sessionEncerrada = document.querySelector('.status-badge.closed') !== null;
      
      if (isFirst && sessionEncerrada) {
        badge.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        `;
        
        if (!card.classList.contains('winner-card')) {
          card.classList.add('winner-card');
          adicionarPulso(card);
        }
      } else {
        badge.textContent = `${index + 1}º`;
        card.classList.remove('winner-card');
      }
    }
  });

  cards.forEach(card => grid.appendChild(card));
}

// Função para mostrar notificação visual
function mostrarNotificacao(mensagem, tipo = 'success') {
  const notifExistente = document.querySelector('.notificacao-voto');
  if (notifExistente) {
    notifExistente.remove();
  }

  const icone = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';

  const notif = document.createElement('div');
  notif.className = 'notificacao-voto';
  notif.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
  notif.innerHTML = `${icone}<span>${mensagem}</span>`;
  
  document.body.appendChild(notif);
  setTimeout(() => notif.classList.add('mostrar'), 10);

  setTimeout(() => {
    notif.classList.remove('mostrar');
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

// Conecta ao canal WebSocket
consumer.subscriptions.create("VotingSessionChannel", {
  connected() {
    console.log("Conectado ao canal de votação em tempo real");
  },

  disconnected() {
    console.log("Desconectado do canal de votação");
  },

  received(data) {
    
    if (data.action === "vote") {
      atualizarVotos(data);
      mostrarNotificacao("Novo voto registrado!");
    }
    // Status changes são ignorados no painel administrativo
  }
});

// Adiciona estilos CSS para animações
const estilos = document.createElement('style');
estilos.textContent = `
  /* ===== ANIMAÇÃO +1 CRIATIVA ===== */
  .voto-incremento {
    pointer-events: none;
    z-index: 200;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .voto-incremento-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    animation: voto-subir 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    white-space: nowrap;
  }

  .voto-check {
    color: #10b981;
    animation: check-aparecer 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .voto-plus {
    font-size: 1.375rem;
    font-weight: 900;
    background: linear-gradient(135deg, #f5a524 0%, #e59517 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: plus-aparecer 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s backwards;
  }

  .voto-particulas {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }

  .particula {
    position: absolute;
    width: 5px;
    height: 5px;
    background: linear-gradient(135deg, #f5a524, #e59517);
    border-radius: 50%;
    opacity: 0;
    animation: particula-explodir 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  .particula:nth-child(1) { 
    animation-delay: 0.2s;
    left: 50%;
    top: 50%;
    --x: -25px;
    --y: -25px;
  }
  .particula:nth-child(2) { 
    animation-delay: 0.25s;
    left: 50%;
    top: 50%;
    --x: 25px;
    --y: -25px;
  }
  .particula:nth-child(3) { 
    animation-delay: 0.3s;
    left: 50%;
    top: 50%;
    --x: -30px;
    --y: 8px;
  }
  .particula:nth-child(4) { 
    animation-delay: 0.35s;
    left: 50%;
    top: 50%;
    --x: 30px;
    --y: 8px;
  }
  .particula:nth-child(5) { 
    animation-delay: 0.27s;
    left: 50%;
    top: 50%;
    --x: 0px;
    --y: -35px;
  }
  .particula:nth-child(6) { 
    animation-delay: 0.32s;
    left: 50%;
    top: 50%;
    --x: 0px;
    --y: 30px;
  }

  @keyframes voto-subir {
    0% {
      transform: translateY(0) scale(0.5);
      opacity: 0;
    }
    20% {
      opacity: 1;
      transform: translateY(-8px) scale(1);
    }
    80% {
      opacity: 1;
      transform: translateY(-45px) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(-70px) scale(0.8);
    }
  }

  @keyframes check-aparecer {
    0% {
      transform: scale(0) rotate(-45deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.2) rotate(10deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }

  @keyframes plus-aparecer {
    0% {
      transform: scale(0) rotate(-180deg);
      opacity: 0;
    }
    60% {
      transform: scale(1.3) rotate(10deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }

  @keyframes particula-explodir {
    0% {
      transform: translate(0, 0) scale(1);
      opacity: 1;
    }
    50% {
      transform: translate(var(--x), var(--y)) scale(1.5);
      opacity: 1;
    }
    100% {
      transform: translate(calc(var(--x) * 1.5), calc(var(--y) * 1.5)) scale(0);
      opacity: 0;
    }
  }

  /* ===== EFEITOS GERAIS ===== */
  .atualizado {
    animation: pulsar 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes pulsar {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  .card-destaque {
    animation: card-brilho 1s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes card-brilho {
    0%, 100% {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
    50% {
      box-shadow: 0 8px 30px rgba(245, 165, 36, 0.3);
      transform: translateX(6px);
    }
  }

  .stats-percentage {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .notificacao-voto {
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 600;
    font-size: 0.9375rem;
    z-index: 9999;
    transform: translateX(400px);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .notificacao-voto.mostrar {
    transform: translateX(0);
    opacity: 1;
  }

  .notificacao-voto svg {
    flex-shrink: 0;
  }

  .candidate-card {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .progress-bar-fill {
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                box-shadow 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .info-card.atualizado {
    animation: pulsar-card 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes pulsar-card {
    0%, 100% {
      transform: scale(1) translateY(0);
    }
    50% {
      transform: scale(1.02) translateY(-2px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
    }
  }

  .blank-votes-card.atualizado {
    animation: destaque-branco 0.6s ease;
  }

  @keyframes destaque-branco {
    0%, 100% {
      border-color: #d1d5db;
    }
    50% {
      border-color: #f5a524;
      box-shadow: 0 4px 16px rgba(245, 165, 36, 0.2);
    }
  }

  @media (max-width: 640px) {
    .notificacao-voto {
      right: 10px;
      left: 10px;
      transform: translateY(-100px);
    }

    .notificacao-voto.mostrar {
      transform: translateY(0);
    }
  }
`;

document.head.appendChild(estilos);