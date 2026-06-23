# frozen_string_literal: true

require 'rails_helper'

RSpec.describe TicketQrCodeService do
  subject(:service) { described_class.new(s3_service: s3_service) }

  let(:s3_service) { instance_double(S3BucketService) }

  describe '#generate_image_key!' do
    it 'generates a PNG and uploads it to S3' do
      allow(s3_service).to receive(:upload_body) do |body, **|
        expect(body.bytesize).to be > 0
        expect(body).to start_with("\x89PNG".b)

        'tickets/qr/test-key.png'
      end

      key = service.generate_image_key!('550e8400-e29b-41d4-a716-446655440000')

      expect(key).to eq('tickets/qr/test-key.png')
    end

    it 'raises UploadError when S3 upload fails' do
      allow(s3_service).to receive(:upload_body).and_return(nil)

      expect do
        service.generate_image_key!('550e8400-e29b-41d4-a716-446655440000')
      end.to raise_error(TicketQrCodeService::UploadError, I18n.t('services.ticket_qr_code.upload_failed'))
    end
  end
end
