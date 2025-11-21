Rails.application.routes.draw do
  devise_for :users

  root to: "home#index"

  resources :candidaturas do
    collection do
      get 'selecionar_turma'
      get 'urna'
      post 'registrar_voto'
    end
  end

  resources :voting_sessions do
    member do
      patch :toggle_status
      patch :close
    end
  end

  get "/mesario/selecionar_turma", to: "mesarios#selecionar_turma", as: :mesario_selecionar_turma
  post "voting_session/open", to: "voting_sessions#open", as: :open_voting_session



  resources :turmas
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/*
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

  # Defines the root path route ("/")
  # root "posts#index"
end
