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

      post '/auth/register', to: 'auth#register'
      post '/auth/login', to: 'auth#login'
      resources :users, except: [:create]

      resources :events, only: [:index, :show, :create] do
        member do
          post :submit,  to: 'events/transitions#submit'
          post :cancel,  to: 'events/transitions#cancel'
          post :approve, to: 'events/transitions#approve'
          post :reject,  to: 'events/transitions#reject'
        end

        resources :categories,
                  only:       [:index, :create, :destroy],
                  param:       :category_id,
                  controller: 'event_categories'
      end

      resources :brands, only: [:index, :create, :show]

      get 'my_tickets', to: 'tickets#my_tickets'

      resources :tickets, only: [:create] do
        member do
          patch :review
        end
      end

      resources :categories, only: [:index, :create]
    end
  end

  # Defines the root path route ("/")
  # root "posts#index"
end
