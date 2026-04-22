# frozen_string_literal: true

Rails.application.routes.draw do
  if Rails.env.development? || Rails.env.test?
    mount Rswag::Ui::Engine => '/api-docs'
    mount Rswag::Api::Engine => '/api-docs'
  end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get 'up' => 'rails/health#show', as: :rails_health_check

  namespace :api do
    namespace :v1 do
      #resources :events, only: [:index, :create]
      resources :events, only: [:index, :show, :create]
      resources :brands, only: [:index, :create, :show]

      resources :tickets, only: [:create] do
        member do
          patch :review
        end
        collection do
          get :my_tickets
        end
      end

      resources :categories, only: [:index, :create]
    end
  end

  # Defines the root path route ("/")
  # root "posts#index"
end
