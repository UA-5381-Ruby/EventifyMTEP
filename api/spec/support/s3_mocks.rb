# frozen_string_literal: true

require Rails.root.join('test/support/fake_s3_bucket_service')

RSpec.configure do |config|
  config.before do |example|
    next if example.file_path.include?('s3_bucket_service_spec.rb')

    allow(S3BucketService).to receive(:new).and_return(FakeS3BucketService.new)
  end
end
