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
        t1 = create(:ticket, event: event)
        t2 = create(:ticket, event: other)

        results = Ticket.search_by_event('Ruby')
        expect(results).to include(t1)
        expect(results).not_to include(t2)
      end
    end

    describe '.sorted_by' do
      it 'sorts by allowed fields and direction' do
        t1 = create(:ticket, created_at: 2.days.ago, is_active: true)
        t2 = create(:ticket, created_at: 1.day.ago, is_active: false)

        expect(Ticket.sorted_by('created_at', 'asc').first).to eq(t1)
        expect(Ticket.sorted_by('created_at', 'desc').first).to eq(t2)

        # fallback to created_at when unknown field provided
        expect(Ticket.sorted_by('unknown_field', 'asc').first).to be_present
      end

      it 'defaults to desc when invalid direction provided' do
        create(:ticket, created_at: 2.days.ago)
        t2 = create(:ticket, created_at: 1.day.ago)

        expect(Ticket.sorted_by('created_at', 'invalid').first).to eq(t2)
      end
    end
  end
end
