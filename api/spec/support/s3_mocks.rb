# frozen_string_literal: true

require Rails.root.join('test/support/fake_s3_bucket_service')

RSpec.configure do |config|
  %i[request controller mailer].each do |type|
    config.before(type: type) do
      allow(S3BucketService).to receive(:new).and_return(FakeS3BucketService.new)
    end
  end
end
