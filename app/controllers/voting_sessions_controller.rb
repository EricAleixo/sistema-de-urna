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

  def toggle_status
    @session = VotingSession.find(params[:id])
    
    new_status = @session.open? ? 'paused' : 'open'
    
    if @session.update(status: new_status)
      # Broadcast para as urnas
      ActionCable.server.broadcast(
        "UrnaChannel",
        {
          action: 'status_changed',
          status: new_status,
          turma_id: @session.turma_id,
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

  def open_one
    @session = VotingSession.find(params[:id])
    @session.update(status: "open")

    ActionCable.server.broadcast(
        "UrnaChannel",
        {
          action: "session_opened",
          status: "open",
          turma_id: @session.turma_id,
          session_id: @session.id
        }
    )

    redirect_to voting_session_path(@session), notice: "Sessão de voto criada com sucesso!"
    
  end

  def open
    VotingSession.update_all(status: "closed")
    turma_id = params[:turma_id]
    mesario_id = current_user.id

    session = VotingSession.new(
      turma_id: turma_id,
      mesario_id: mesario_id,
      status: "open"
    )

    if session.save
      # Broadcast para as URNAS saírem da tela de espera
      ActionCable.server.broadcast(
        "UrnaChannel",
        {
          action: "session_opened",
          status: "open",
          turma_id: turma_id,
          session_id: session.id
        }
      )
      
      redirect_to voting_session_path(session), notice: "Sessão de voto criada com sucesso!"
    else
      redirect_to mesario_selecionar_turma_path, alert: "Erro ao criar sessão."
    end
  end

  def close
    @session = VotingSession.find(params[:id])
    
    if @session.update(status: 'closed')
      # Broadcast para as urnas
      ActionCable.server.broadcast(
        "UrnaChannel",
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

  def destroy
    @session = VotingSession.find(params[:id])
    turma_nome = @session.turma.nome
    
    # Fecha a sessão antes de excluir (se não estiver fechada)
    if @session.status != 'closed'
      @session.update(status: 'closed')
      
      # Broadcast para as urnas informando o fechamento
      ActionCable.server.broadcast(
        "UrnaChannel",
        {
          action: "status_changed",
          status: "closed",
          session_id: @session.id,
          turma_id: @session.turma_id
        }
      )
    end
    
    # Aguarda um momento para garantir que o broadcast foi processado
    sleep(0.5)
    
    # Broadcast informando que a sessão será excluída
    ActionCable.server.broadcast(
      "UrnaChannel",
      {
        action: "session_deleted",
        session_id: @session.id,
        turma_id: @session.turma_id,
        message: "Sessão excluída pelo mesário"
      }
    )
    
    if @session.destroy
      redirect_to voting_sessions_path, notice: "Sessão da turma #{turma_nome} excluída com sucesso!"
    else
      redirect_to voting_sessions_path, alert: "Erro ao excluir sessão"
    end
  end
end