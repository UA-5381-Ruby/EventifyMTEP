# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe ApplicationController, type: :controller do
  controller do
    before_action :authorize_request

    def index
      render plain: 'Success'
    end
  end

  describe '#authorize_request' do
    let(:user) { create(:user) }
    let(:token) { 'valid.jwt.token' }
    let(:headers) { { 'Authorization' => "Bearer #{token}" } }

    context 'when Authorization header is missing' do
      it 'returns 401 unauthorized with missing token error' do
        get :index

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)['error']).to eq('Unauthorized access. Missing token.')
      end
    end

    context 'when Authorization header is present' do
      before do
        request.headers.merge!(headers)
      end

      context 'but token is invalid' do
        before do
          allow(JwtService).to receive(:decode).with(token).and_return(nil)
        end

        it 'returns 401 unauthorized with invalid token error' do
          get :index

          expect(response).to have_http_status(:unauthorized)
          expect(JSON.parse(response.body)['error']).to eq('Unauthorized access. Invalid token.')
        end
      end

      context 'and token is valid' do
        let(:decoded_payload) { { user_id: user.id } }

        before do
          allow(JwtService).to receive(:decode).with(token).and_return(decoded_payload)
        end

        context 'and user exists' do
          before do
            allow(User).to receive(:find).with(user.id).and_return(user)
          end

          it 'allows the request and sets @current_user' do
            get :index

            expect(response).to have_http_status(:ok)
            expect(response.body).to eq('Success')
            expect(assigns(:current_user)).to eq(user)
          end
        end

        context 'but user was deleted' do
          before do
            allow(User).to receive(:find).with(user.id).and_raise(ActiveRecord::RecordNotFound)
          end

          it 'returns 401 unauthorized with user no longer exists error' do
            get :index

            expect(response).to have_http_status(:unauthorized)
            expect(JSON.parse(response.body)['error']).to eq('User with this token no longer exists.')
          end
        end
      end

      context 'when an unexpected error occurs' do
        let(:error_message) { 'Something went completely wrong' }

        before do
          allow(JwtService).to receive(:decode).and_raise(StandardError.new(error_message))
        end

        it 'returns 401 unauthorized with the error message' do
          get :index

          expect(response).to have_http_status(:unauthorized)
          expect(JSON.parse(response.body)['error']).to eq("Unauthorized access. #{error_message}")
        end
      end
    end
  end
end
