class HomeController < ApplicationController
  before_action :authenticate_user!

  def index
    case current_user.role
    when "mesario"
      redirect_to voting_sessions_path
    when "eleitor"
      redirect_to "/candidaturas/urna"
    else
      redirect_to default_dashboard_path, alert: "Role desconhecida."
    end
  end
end
