class CandidaturasController < ApplicationController
  before_action :set_candidatura, only: %i[show edit update]

  def index
    @candidaturas = Candidatura.all
  end

  def show
  end

  def new
    @candidatura = Candidatura.new
  end

  def edit
  end

  def create
    @candidatura = Candidatura.new(candidatura_params)

    if @candidatura.save
      redirect_to @candidatura, notice: "Candidatura criada com sucesso."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def update
    if @candidatura.update(candidatura_params)
      redirect_to @candidatura, notice: "Candidatura atualizada com sucesso."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def selecionar_turma
    require_mesario
    @turmas = Turma.all
  end

  def urna
    @session = VotingSession.find_by(status: :open)
    @turmas = Turma.all
    if(@session == nil)
      return
    end
    @turma = @session.turma
    @candidaturas = Candidatura.where(turma_id: @turma.id)

    if @candidaturas.empty?
      redirect_to selecionar_turma_candidaturas_path, alert: "Não há candidatos para esta turma."
    end
  end

  def registrar_voto
    payload = {}

    if params[:candidatura_id].blank?
      # ✅ Voto em branco
      turma = Turma.find(params[:turma_id])
      turma.increment!(:votos_em_branco)

      payload = {
        action: "blank_vote",
        turma_id: turma.id,
        votos_em_branco: turma.votos_em_branco
      }

      notice = "Voto em branco registrado com sucesso!"
    else
      # ✅ Voto normal
      candidatura = Candidatura.find(params[:candidatura_id])
      candidatura.increment!(:votos)

      payload = {
        action: "vote",
        turma_id: candidatura.turma_id,
        candidatura_id: candidatura.id,
        votos: candidatura.votos
      }

      notice = "Voto registrado com sucesso!"
    end

    # 🔥 Envia mensagem em tempo real para todos conectados
    ActionCable.server.broadcast(
      "VotingSessionChannel",
      payload
    )

    puts "Voto registrado e broadcast enviado: #{payload}"

    redirect_to selecionar_turma_candidaturas_path, notice: notice
  end



  private

  def set_candidatura
    @candidatura = Candidatura.find(params[:id])
  end

  def candidatura_params
    params.require(:candidatura).permit(
      :nome_candidato,
      :nome_urna,
      :turma_id,
      :vice_lider,
      :nome_urna_vice,
      :foto_lider,
      :foto_vice
    )
  end

  def require_mesario
    redirect_to root_path, alert: "Acesso negado." unless current_user&.mesario?
  end
end
