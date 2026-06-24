# frozen_string_literal: true

require 'rails_helper'

RSpec.describe TicketQrCodeService do
  subject(:service) { described_class.new(s3_service: s3_service) }

  let(:s3_service) { instance_double(S3BucketService) }

  describe '#generate_image_key!' do
    it 'uses default S3 service when none is provided' do
      s3 = instance_double(S3BucketService)
      allow(S3BucketService).to receive(:new).and_return(s3)
      allow(s3).to receive(:upload_body).and_return('tickets/qr/default.png')

      key = described_class.new.generate_image_key!('payload')

      expect(key).to eq('tickets/qr/default.png')
    end

    it 'generates a PNG and uploads it to S3' do
      allow(s3_service).to receive(:upload_body) do |body, **|
        expect(body.bytesize).to be.positive?
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
      end.to raise_error(TicketQrCodeService::UploadError, 'Failed to upload QR code to S3')
    end
  end
end
