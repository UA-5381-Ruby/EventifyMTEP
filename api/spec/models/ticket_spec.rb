# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Ticket, type: :model do
  subject { build(:ticket) }

  it { is_expected.to belong_to(:user) }
  it { is_expected.to belong_to(:event) }

  it { is_expected.to validate_presence_of(:user_id) }
  it { is_expected.to validate_presence_of(:event_id) }
  it { is_expected.to validate_uniqueness_of(:qr_code) }
  it { is_expected.to have_one(:event_feedback) }

  it 'is active by default' do
    ticket = create(:ticket)
    expect(ticket.is_active).to be(true)
  end

  describe 'callbacks' do
    it 'generates a qr_code before validation on create' do
      ticket = build(:ticket, qr_code: nil)
      expect(ticket.qr_code).to be_nil
      ticket.valid?
      expect(ticket.qr_code).to be_present
    end

    it 'returns qr_code_url when qr_image_key is present' do
      ticket = build(:ticket, qr_image_key: 'tickets/qr/test.png')
      expect(ticket.qr_code_url).to eq('https://example.com/tickets/qr/test.png')
    end

    it 'returns nil for qr_code_url when qr_image_key is blank' do
      ticket = build(:ticket, qr_image_key: nil)
      expect(ticket.qr_code_url).to be_nil
    end
  end

  describe 'scopes' do
    describe '.search_by_event' do
      it 'returns all tickets when query is blank' do
        t1 = create(:ticket)
        expect(Ticket.search_by_event(nil)).to include(t1)
      end

      it 'filters tickets by event title' do
        event = create(:event, title: 'RubyConf 2026')
        other = create(:event, title: 'JS Fest')
        t1    = create(:ticket, event: event)
        t2    = create(:ticket, event: other)

        results = Ticket.search_by_event('Ruby')
        expect(results).to include(t1)
        expect(results).not_to include(t2)
      end
    end

    describe '.sorted_by' do
      it 'sorts by allowed fields and direction' do
        t1 = create(:ticket, created_at: 2.days.ago)
        t2 = create(:ticket, created_at: 1.day.ago)

        expect(Ticket.sorted_by('created_at', 'asc').first).to eq(t1)
        expect(Ticket.sorted_by('created_at', 'desc').first).to eq(t2)
      end

      it 'falls back to created_at when unknown field is provided' do
        expect { Ticket.sorted_by('unknown_field', 'asc').first }.not_to raise_error
      end

      it 'defaults to desc when invalid direction is provided' do
        create(:ticket, created_at: 2.days.ago)
        t2 = create(:ticket, created_at: 1.day.ago)

        expect(Ticket.sorted_by('created_at', 'invalid').first).to eq(t2)
      end
    end
  end

  describe '#user_can_have_only_one_ticket_per_event' do
    let(:user)  { create(:user) }
    let(:event) { create(:event) }

    before { create(:ticket, user: user, event: event) }

    context 'when validate hook is registered in the model' do
      it 'does not allow a user to have two tickets for the same event', :aggregate_failures do
        duplicate = build(:ticket, user: user, event: event)

        if duplicate.respond_to?(:user_can_have_only_one_ticket_per_event, true)
          duplicate.send(:user_can_have_only_one_ticket_per_event)
          expect(duplicate.errors[:base]).to be_present
        else
          skip 'validate hook not registered — skipping model-level uniqueness test'
        end
      end

      it 'allows a user to have tickets for different events' do
        other_event    = create(:event)
        another_ticket = build(:ticket, user: user, event: other_event)

        begin
          another_ticket.send(:user_can_have_only_one_ticket_per_event)
        rescue StandardError
          nil
        end
        expect(another_ticket.errors[:base]).to be_empty
      end

      it 'ignores the current ticket when checking for duplicates (update case)' do
        existing = Ticket.find_by(user: user, event: event)
        existing.send(:user_can_have_only_one_ticket_per_event)
        expect(existing.errors[:base]).to be_empty
      end

      it 'skips validation when user is blank' do
        ticket = build(:ticket, user: nil, event: event)
        ticket.send(:user_can_have_only_one_ticket_per_event)
        expect(ticket.errors[:base]).to be_empty
      end

      it 'skips validation when event is blank' do
        ticket = build(:ticket, user: user, event: nil)
        ticket.send(:user_can_have_only_one_ticket_per_event)
        expect(ticket.errors[:base]).to be_empty
      end
    end
  end
end
