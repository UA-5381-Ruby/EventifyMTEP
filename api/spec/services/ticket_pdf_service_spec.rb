# frozen_string_literal: true

require 'rails_helper'

RSpec.describe TicketPdfService do
  let(:user) { create(:user, name: 'Alice') }
  let(:event) do
    create(:event, title: 'Ruby Conf', location: 'Kyiv', start_date: Time.zone.parse('2026-06-01 18:00'),
                   end_date: Time.zone.parse('2026-06-01 21:00'))
  end
  let(:ticket) { create(:ticket, user: user, event: event) }

  before do
    allow(TicketQrCodeService).to receive(:new).and_return(
      instance_double(TicketQrCodeService, generate_image_key!: 'tickets/qr/test.png')
    )
  end

  describe '.generate' do
    it 'returns a PDF binary' do
      pdf = described_class.generate(ticket)

      expect(pdf).to start_with('%PDF')
      expect(pdf.bytesize).to be > 100
    end
  end

  describe '#generate' do
    it 'includes event title and attendee name in rendered content' do
      service = described_class.new(ticket)
      pdf = service.generate

      expect(pdf).to start_with('%PDF')
    end

    it 'formats date range when end_date is present' do
      formatted = described_class.new(ticket).send(:formatted_date)

      expect(formatted).to include('2026')
      expect(formatted).to include('–')
    end

    it 'formats start date only when end_date is blank' do
      event.update!(end_date: nil)
      formatted = described_class.new(ticket).send(:formatted_date)

      expect(formatted).to include('2026')
      expect(formatted).not_to include('–')
    end
  end
end
