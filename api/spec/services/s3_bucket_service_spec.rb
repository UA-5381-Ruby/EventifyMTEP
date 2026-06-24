# frozen_string_literal: true

require 'rails_helper'

RSpec.describe S3BucketService do
  subject(:service) { described_class.new }

  let(:s3_resource) { instance_double(Aws::S3::Resource) }
  let(:bucket) { instance_double(Aws::S3::Bucket) }
  let(:object) { instance_double(Aws::S3::Object) }

  before do
    allow(Aws::S3::Resource).to receive(:new).and_return(s3_resource)
    allow(s3_resource).to receive(:bucket).and_return(bucket)
    allow(bucket).to receive(:object).and_return(object)
  end

  describe '#upload_body' do
    it 'uploads and returns the s3 key' do
      allow(object).to receive(:put).and_return(true)

      key = service.upload_body('data', folder: 'events/banners', extension: '.png', content_type: 'image/png')

      expect(key).to match(%r{\Aevents/banners/[0-9a-f-]+\.png\z})
      expect(object).to have_received(:put).with(body: 'data', content_type: 'image/png')
    end

    it 'returns nil when S3 raises ServiceError' do
      allow(object).to receive(:put).and_raise(Aws::S3::Errors::ServiceError.new(nil, 'upload failed'))

      expect(service.upload_body('data', folder: 'x', extension: '.png', content_type: 'image/png')).to be_nil
    end
  end

  describe '#upload' do
    it 'reads the uploaded file and delegates to upload_body' do
      tempfile = Tempfile.new(['banner', '.png'])
      tempfile.write('png-bytes')
      tempfile.rewind
      file = instance_double(
        ActionDispatch::Http::UploadedFile,
        original_filename: 'banner.png',
        content_type: 'image/png',
        tempfile: tempfile
      )
      allow(service).to receive(:upload_body).and_return('events/banners/key.png')

      expect(service.upload(file, folder: 'events/banners')).to eq('events/banners/key.png')
      expect(service).to have_received(:upload_body).with(
        'png-bytes',
        folder: 'events/banners',
        extension: '.png',
        content_type: 'image/png'
      )
    end
  end

  describe '#file_url' do
    it 'returns nil for blank key' do
      expect(service.file_url('')).to be_nil
      expect(service.file_url(nil)).to be_nil
    end

    it 'returns the public url' do
      allow(object).to receive(:public_url).and_return('https://bucket.s3.amazonaws.com/key')

      expect(service.file_url('key')).to eq('https://bucket.s3.amazonaws.com/key')
    end
  end

  describe '#delete' do
    it 'returns false for blank key' do
      expect(service.delete('')).to be(false)
    end

    it 'returns true on success' do
      allow(object).to receive(:delete).and_return(true)

      expect(service.delete('key')).to be(true)
    end

    it 'returns false when S3 raises ServiceError' do
      allow(object).to receive(:delete).and_raise(Aws::S3::Errors::ServiceError.new(nil, 'delete failed'))

      expect(service.delete('key')).to be(false)
    end
  end
end
