# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V1::TicketsController, type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers(user) }
  let(:json_headers) { headers.merge('Content-Type' => 'application/json') }

  let(:event) { create(:event) }
  let!(:ticket) { create(:ticket, user: user, event: event) }
  describe 'GET /api/v1/tickets' do
    context 'when authenticated' do
      it 'returns 200 and a list of tickets' do
        get '/api/v1/tickets', headers: headers

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data']).to be_an(Array)
        expect(json['meta']).to be_present
      end

      it 'includes event and qr_code_url keys in each ticket' do
        get '/api/v1/tickets', headers: headers

        first = response.parsed_body['data'].first
        expect(first).to include('event', 'qr_code_url')
        expect(first['event'].keys).to include('id', 'title', 'location', 'start_date', 'end_date')
      end

      it 'includes event_feedback key when feedback exists' do
        create(:event_feedback, ticket: ticket)

        get '/api/v1/tickets', headers: headers

        first = response.parsed_body['data'].first
        expect(first).to have_key('event_feedback')
        expect(first['event_feedback']).to include('id', 'rating', 'comment')
      end

      it 'returns only tickets belonging to the current user' do
        other_user_ticket = create(:ticket, user: create(:user), event: event)

        get '/api/v1/tickets', headers: headers

        ids = response.parsed_body['data'].pluck('id')
        expect(ids).to include(ticket.id)
        expect(ids).not_to include(other_user_ticket.id)
      end

      context 'with filtering' do
        it 'filters by is_active' do
          other_event     = create(:event)
          inactive_ticket = create(:ticket, user: user, event: other_event, is_active: false)

          get '/api/v1/tickets', params: { is_active: true }, headers: headers

          ids = response.parsed_body['data'].pluck('id')
          expect(ids).to include(ticket.id)
          expect(ids).not_to include(inactive_ticket.id)
        end

        it 'filters by event_id' do
          other_event  = create(:event)
          other_ticket = create(:ticket, user: user, event: other_event)

          get '/api/v1/tickets', params: { event_id: event.id }, headers: headers

          ids = response.parsed_body['data'].pluck('id')
          expect(ids).to include(ticket.id)
          expect(ids).not_to include(other_ticket.id)
        end

        it 'searches by event name via :q param' do
          get '/api/v1/tickets', params: { q: event.title }, headers: headers

          expect(response).to have_http_status(:ok)
          ids = response.parsed_body['data'].pluck('id')
          expect(ids).to include(ticket.id)
        end
      end

      context 'with pagination' do
        it 'respects page and per_page params' do
          create_list(:ticket, 3, user: user, event: create(:event))

          get '/api/v1/tickets', params: { page: 1, per_page: 2 }, headers: headers

          json = response.parsed_body
          expect(json['data'].size).to eq(2)
          expect(json['meta']).to be_present
        end
      end
    end
  end

  describe 'GET /api/v1/tickets/:id' do
    context 'when the ticket belongs to the current user' do
      it 'returns 200 and the ticket' do
        get "/api/v1/tickets/#{ticket.id}", headers: headers

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['id']).to eq(ticket.id)
        expect(json).to include('event', 'qr_code_url')
      end

      it 'includes event_feedback when it exists' do
        create(:event_feedback, ticket: ticket)

        get "/api/v1/tickets/#{ticket.id}", headers: headers

        json = response.parsed_body
        expect(json).to have_key('event_feedback')
        expect(json['event_feedback']).to include('id', 'rating', 'comment')
      end
    end

    context 'when the ticket does not exist or belongs to another user' do
      it 'returns 404 for non-existent id' do
        get '/api/v1/tickets/0', headers: headers

        expect(response).to have_http_status(:not_found)
        expect(response.parsed_body).to include('error')
      end

      it "returns 404 for another user's ticket" do
        other_ticket = create(:ticket, user: create(:user), event: event)

        get "/api/v1/tickets/#{other_ticket.id}", headers: headers

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'POST /api/v1/tickets' do
    context 'with valid params' do
      it 'creates a ticket and returns 201' do
        new_event = create(:event)

        expect {
          post '/api/v1/tickets',
               params: { ticket: { event_id: new_event.id } }.to_json,
               headers: json_headers
        }.to change(Ticket, :count).by(1)

        expect(response).to have_http_status(:created)
        json = response.parsed_body
        expect(json['id']).to be_present
        expect(json).to include('event', 'qr_code_url')
      end
    end

    context 'with invalid params' do
      it 'returns 422 when event_id is missing' do
        post '/api/v1/tickets',
             params: { ticket: {} }.to_json,
             headers: json_headers

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body).to include('errors')
      end

      it 'returns 422 when a duplicate ticket already exists (RecordNotUnique)' do
        tickets_relation = instance_double(ActiveRecord::Associations::CollectionProxy)
        built_ticket     = build(:ticket, user: user, event: event)

        allow(@current_user || user).to receive(:tickets).and_return(tickets_relation) if false

        allow_any_instance_of(Ticket).to receive(:save).and_raise(ActiveRecord::RecordNotUnique)

        post '/api/v1/tickets',
             params: { ticket: { event_id: event.id } }.to_json,
             headers: json_headers

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body.dig('errors', 'base')).to be_present
      end
    end
  end

  describe 'PATCH /api/v1/tickets/:id' do
    context 'with valid params' do
      it 'updates is_active and returns 200' do
        patch "/api/v1/tickets/#{ticket.id}",
              params: { ticket: { is_active: false } }.to_json,
              headers: json_headers

        expect(response).to have_http_status(:ok)
        expect(ticket.reload.is_active).to be(false)
      end

      it 'returns the updated ticket with expected keys' do
        patch "/api/v1/tickets/#{ticket.id}",
              params: { ticket: { is_active: false } }.to_json,
              headers: json_headers

        json = response.parsed_body
        expect(json['id']).to eq(ticket.id)
        expect(json).to include('event', 'qr_code_url')
      end
    end

    context 'with invalid params' do
      it 'returns 422 when update fails due to model validation' do
        allow_any_instance_of(Ticket).to receive(:update).and_return(false)
        errors_double = instance_double(ActiveModel::Errors, full_messages: ['is_active is invalid'])
        allow_any_instance_of(Ticket).to receive(:errors).and_return(errors_double)

        patch "/api/v1/tickets/#{ticket.id}",
              params: { ticket: { is_active: false } }.to_json,
              headers: json_headers

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body).to include('errors')
      end
    end

    context 'when the ticket does not belong to the user' do
      it 'returns 404' do
        other_ticket = create(:ticket, user: create(:user), event: event)

        patch "/api/v1/tickets/#{other_ticket.id}",
              params: { ticket: { is_active: false } }.to_json,
              headers: json_headers

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'POST /api/v1/tickets/:id/review' do
    let(:review_body) { { ticket: { rating: 5, comment: 'Great event!' } }.to_json }

    context 'when the ticket has no existing feedback' do
      it 'creates event_feedback and returns 200' do
        expect {
          post "/api/v1/tickets/#{ticket.id}/review", params: review_body, headers: json_headers
        }.to change(EventFeedback, :count).by(1)

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['rating']).to eq(5)
        expect(json['comment']).to eq('Great event!')
      end
    end

    context 'when the ticket already has feedback' do
      let!(:existing_feedback) do
        create(:event_feedback, ticket: ticket, rating: 3, comment: 'OK')
      end

      it 'updates existing feedback without creating a new record' do
        expect {
          post "/api/v1/tickets/#{ticket.id}/review", params: review_body, headers: json_headers
        }.not_to change(EventFeedback, :count)

        expect(response).to have_http_status(:ok)
        expect(existing_feedback.reload.rating).to eq(5)
        expect(existing_feedback.reload.comment).to eq('Great event!')
      end
    end

    context 'with invalid review params' do
      it 'returns 422 when feedback fails validation' do
        allow_any_instance_of(EventFeedback).to receive(:update).and_return(false)
        errors_double = instance_double(ActiveModel::Errors, full_messages: ['Rating is invalid'])
        allow_any_instance_of(EventFeedback).to receive(:errors).and_return(errors_double)

        post "/api/v1/tickets/#{ticket.id}/review", params: review_body, headers: json_headers

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body).to include('errors')
      end
    end

    context 'when the ticket does not belong to the user' do
      it 'returns 404' do
        other_ticket = create(:ticket, user: create(:user), event: event)

        post "/api/v1/tickets/#{other_ticket.id}/review", params: review_body, headers: json_headers

        expect(response).to have_http_status(:not_found)
      end
    end
  end
end