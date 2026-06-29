# frozen_string_literal: true

Rails.application.routes.draw do
  if Rails.env.development? || Rails.env.test?
    mount Rswag::Ui::Engine => '/api-docs'
    mount Rswag::Api::Engine => '/api-docs'
    mount LetterOpenerWeb::Engine, at: '/letter_opener' if Rails.env.development?
  end
get '/favicon.ico', to: proc { [204, {}, []] }
  
  get 'up' => 'rails/health#show', as: :rails_health_check

  namespace :api do
    namespace :v1 do
      resources :payments, only: [:create]
      post "payments/webhook", to: "payments#webhook"

      post '/auth/register', to: 'auth#register'
      post '/auth/login', to: 'auth#login'
      post '/auth/confirm_email', to: 'confirmations#create'
      post '/auth/resend_confirmation', to: 'confirmations#resend'
      post '/contact', to: 'contact#create'

      get 'users/me', to: 'users#me'
      resources :users, except: [:create] do
        resources :brand_memberships, only: [:index]
      end

   
      resources :activities, only: [:index]
      resources :events, only: [:index, :show, :create, :update] do
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

      resources :brands, only: [:index, :create, :show, :update, :destroy] do
        resources :memberships, controller: 'brand_memberships', only: [:index, :create, :update, :destroy]

        resources :invitations, only: [:create] do
          collection do
            post :accept
          end
        end
      end

      post '/auth/password/reset', to: 'passwords#update', constraints: ->(req) { req.params[:token].present? }
      post '/auth/password/reset', to: 'passwords#create'
      patch '/auth/password/change', to: 'passwords#change'

      get 'my_tickets', to: 'tickets#index'

      resources :tickets, only: [:index, :create, :update, :show] do
        member do
          post :review
        end
      end

      resources :categories, only: [:index, :create]
    end
  end

  # Defines the root path route ("/")
  # root "posts#index"
end
