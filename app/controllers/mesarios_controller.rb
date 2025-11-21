class MesariosController < ApplicationController
  before_action :require_mesario

  def selecionar_turma
    @turmas = Turma.all
  end

  private

  def require_mesario
    redirect_to root_path, alert: "Acesso negado." unless current_user&.mesario?
  end
end
