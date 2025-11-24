class VotingSessionChannel < ApplicationCable::Channel
  def subscribed
      stream_from "VotingSessionChannel"
      Rails.logger.info "Cliente conectado ao canal voting_session"
  end

  def unsubscribed
    # Cleanup quando o canal é desconectado
    stop_all_streams
  end
end
