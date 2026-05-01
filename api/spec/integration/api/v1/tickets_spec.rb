# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Tickets Integration', type: :integration do
  describe 'Ticket creation and management' do
    let(:user) { create(:user) }
    let(:brand) { create(:brand) }
    let(:event) { create(:event, brand: brand, start_date: 1.week.from_now, end_date: 1.week.from_now + 1.day) }

    context 'when user creates a ticket' do
      it 'generates a unique QR code' do
        event2 = create(:event, brand: brand, start_date: 2.weeks.from_now, end_date: 2.weeks.from_now + 1.day)

        ticket1 = create(:ticket, user: user, event: event)
        ticket2 = create(:ticket, user: user, event: event2)

        expect(ticket1.qr_code).to be_present
        expect(ticket2.qr_code).to be_present
        expect(ticket1.qr_code).not_to eq(ticket2.qr_code)
      end

      it 'sets is_active to true by default' do
        ticket = create(:ticket, user: user, event: event)
        expect(ticket.is_active).to be true
      end

      it 'prevents duplicate tickets for the same user and event' do
        create(:ticket, user: user, event: event)

        expect do
          create(:ticket, user: user, event: event)
        end.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    context 'when user leaves feedback' do
      let(:ticket) { create(:ticket, user: user, event: event) }

      it 'creates event feedback' do
        feedback = create(:event_feedback, ticket: ticket, rating: 5, comment: 'Great!')

        expect(ticket.event_feedback).to eq(feedback)
        expect(feedback.rating).to eq(5)
        expect(feedback.comment).to eq('Great!')
      end

      it 'destroys feedback when ticket is deleted' do
        feedback = create(:event_feedback, ticket: ticket, rating: 4, comment: 'Good')
        feedback_id = feedback.id

        ticket.destroy

        expect(EventFeedback.find_by(id: feedback_id)).to be_nil
      end
    end

    context 'when user manages tickets' do
      before do
        3.times do |i|
          start_date = (i + 1).weeks.from_now
          create(:ticket,
                 user: user,
                 event: create(:event,
                               brand: brand,
                               title: "Event #{i}",
                               start_date: start_date,
                               end_date: start_date + 1.day))
        end
      end

      it 'lists all user tickets with pagination' do
        tickets = user.tickets.limit(2)

        expect(tickets.count).to eq(2)
      end

      it 'filters tickets by is_active status' do
        user.tickets.first.update(is_active: false)
        user.tickets.second.update(is_active: false)

        active_tickets = user.tickets.where(is_active: true)
        inactive_tickets = user.tickets.where(is_active: false)

        expect(active_tickets.count).to eq(1)
        expect(inactive_tickets.count).to eq(2)
      end

      it 'searches tickets by event title' do
        event_with_title = user.tickets.first.event
        event_with_title.update(title: 'Tech Conference')

        results = user.tickets.search_by_event('Tech')

        expect(results).to include(user.tickets.first)
      end

      it 'sorts tickets by creation date' do
        ticket_ids = user.tickets.sorted_by('created_at', 'asc').pluck(:id)

        expect(ticket_ids).to eq(user.tickets.order(created_at: :asc).pluck(:id))
      end
    end

    context 'when accessing user tickets' do
      let(:other_user) { create(:user) }
      let(:event2) { create(:event, brand: brand, start_date: 2.weeks.from_now, end_date: 2.weeks.from_now + 1.day) }
      let(:user_ticket) { create(:ticket, user: user, event: event) }
      let(:other_user_ticket) { create(:ticket, user: other_user, event: event2) }

      it 'users can only see their own tickets' do
        expect(user.tickets).to include(user_ticket)
        expect(user.tickets).not_to include(other_user_ticket)
      end
    end
  end

  describe 'Ticket associations' do
    let(:user) { create(:user) }
    let(:brand) { create(:brand) }
    let(:event) { create(:event, brand: brand, start_date: 1.week.from_now, end_date: 1.week.from_now + 1.day) }

    context 'when ticket has associations' do
      let(:ticket) { create(:ticket, user: user, event: event) }

      it 'belongs to a user' do
        expect(ticket.user).to eq(user)
      end

      it 'belongs to an event' do
        expect(ticket.event).to eq(event)
      end

      it 'has one event_feedback' do
        feedback = create(:event_feedback, ticket: ticket)

        expect(ticket.event_feedback).to eq(feedback)
      end

      it 'includes event with nested categories' do
        category = create(:category)
        event.categories << category

        expect(ticket.event.categories).to include(category)
      end
    end
  end
end
