# frozen_string_literal: true

# Stub S3 uploads in Minitest only. RSpec uses spec/support/s3_mocks.rb for request specs
# and unit-tests S3BucketService directly with AWS doubles.
if Rails.env.test? && !defined?(RSpec)
  module S3BucketServiceTestStub
    def upload_body(_body, folder:, extension:, **)
      "#{folder}/#{SecureRandom.uuid}#{extension}"
    end
  end

  S3BucketService.prepend(S3BucketServiceTestStub)
end
