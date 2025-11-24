# app/channels/urna_channel.rb
class UrnaChannel < ApplicationCable::Channel
  def subscribed
    stream_from "UrnaChannel"
    Rails.logger.info "Urna conectada ao canal"
  end

  def unsubscribed
    stop_all_streams
  end
end