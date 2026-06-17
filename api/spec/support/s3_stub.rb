# frozen_string_literal: true

if Rails.env.test?
  module S3BucketServiceTestStub
    def upload_body(_body, folder:, extension:, **)
      "#{folder}/#{SecureRandom.uuid}#{extension}"
    end
  end

  S3BucketService.prepend(S3BucketServiceTestStub)
end
