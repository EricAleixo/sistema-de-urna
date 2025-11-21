class VotingSessionsController < ApplicationController

  def index
    @voting_session = VotingSession.all
  end
  
  def show
    @session = VotingSession.find(params[:id])
    @turma = @session.turma
    @candidaturas = @turma.candidaturas.order(votos: :desc)
    @total_votos = @candidaturas.sum(:votos) + (@turma.votos_em_branco || 0)
  end

  # Alterna entre open/paused (NÃO fecha definitivamente)
  def toggle_status
    @session = VotingSession.find(params[:id])
    
    new_status = @session.open? ? 'paused' : 'open'
    
    if @session.update(status: new_status)
      # Broadcast para todos os clientes conectados
      puts "Aberto agora!!!!"
      ActionCable.server.broadcast(
        "VotingSessionChannel",
        {
          action: 'status_changed',
          status: new_status,
          message: new_status == 'paused' ? 'Votação pausada' : 'Votação retomada'
        }
      )
      
      render json: { 
        success: true, 
        status: new_status,
        message: new_status == 'paused' ? 'Votação pausada com sucesso' : 'Votação retomada'
      }
    else
      render json: { 
        success: false, 
        message: 'Erro ao atualizar sessão' 
      }, status: :unprocessable_entity
    end
  end

  def open
    turma_id = params[:turma_id]
    mesario_id = current_user.id

    session = VotingSession.new(
      turma_id: turma_id,
      mesario_id: mesario_id,
      status: "open"
    )

    if session.save
      redirect_to voting_session_path(session), notice: "Sessão de voto criada com sucesso!"
    else
      redirect_to selecionar_turma_path, alert: "Erro ao criar sessão."
    end
  end

  # Fecha sessão DEFINITIVAMENTE
  def close
    @session = VotingSession.find(params[:id])
    
    if @session.update(status: 'closed')
      # Broadcast definitivo de encerramento
      ActionCable.server.broadcast(
        "VotingSessionChannel",
        {
          action: "status_changed",
          status: "closed",
          session_id: @session.id,
          turma_id: @session.turma_id
        }
      )

      redirect_to @session, notice: "Sessão encerrada com sucesso!"
    else
      redirect_to @session, alert: "Erro ao encerrar sessão"
    end
  end
end