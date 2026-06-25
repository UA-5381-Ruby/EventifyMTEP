require 'rails_helper'

RSpec.describe 'Api::V1::Contact', type: :request do
  let(:valid_params) do
    {
      contact: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'Hello',
        message: 'This is a test message.'
      }
    }
  end

  describe 'POST /api/v1/contact' do
    context 'with valid params' do
      it 'sends the contact message and returns 200' do
        allow(MailerService).to receive(:send_contact_message)

        post '/api/v1/contact', params: valid_params

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)['message']).to eq('Message sent successfully')
        expect(MailerService).to have_received(:send_contact_message)
                                   .with(ActionController::Parameters.new(valid_params[:contact]).permit(:name, :email, :subject, :message))
      end
    end

    context 'with invalid params' do
      it 'returns 422 when name is missing' do
        params = valid_params.deep_dup
        params[:contact][:name] = ''

        post '/api/v1/contact', params: params

        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['error']).to eq('Invalid parameters')
      end

      it 'returns 422 when email is invalid' do
        params = valid_params.deep_dup
        params[:contact][:email] = 'not-an-email'

        post '/api/v1/contact', params: params

        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['error']).to eq('Invalid parameters')
      end

      it 'returns 422 when subject is missing' do
        params = valid_params.deep_dup
        params[:contact][:subject] = ''

        post '/api/v1/contact', params: params

        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['error']).to eq('Invalid parameters')
      end

      it 'returns 422 when message is missing' do
        params = valid_params.deep_dup
        params[:contact][:message] = ''

        post '/api/v1/contact', params: params

        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['error']).to eq('Invalid parameters')
      end

      it 'does not call MailerService when params are invalid' do
        allow(MailerService).to receive(:send_contact_message)
        params = valid_params.deep_dup
        params[:contact][:message] = ''

        post '/api/v1/contact', params: params

        expect(MailerService).not_to have_received(:send_contact_message)
      end
    end

    context 'when the contact param is missing entirely' do
      it 'raises ActionController::ParameterMissing (caught by app-wide rescue, if any)' do
        post '/api/v1/contact', params: {}

        expect(response).to have_http_status(:bad_request)
      end
    end
  end
end
