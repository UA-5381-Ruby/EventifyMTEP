# frozen_string_literal: true

require 'securerandom'

class S3BucketService
  def initialize
    @s3 = Aws::S3::Resource.new(
      region: ENV.fetch('AWS_REGION', nil),
      access_key_id: ENV.fetch('AWS_ACCESS_KEY_ID', nil),
      secret_access_key: ENV.fetch('AWS_SECRET_ACCESS_KEY', nil)
    )
    @bucket = @s3.bucket(ENV.fetch('AWS_BUCKET_NAME', nil))
  end

  def upload(file, folder:)
    extension = File.extname(file.original_filename)
    upload_body(
      File.binread(file.tempfile.path),
      folder: folder,
      extension: extension,
      content_type: file.content_type.presence || 'application/octet-stream'
    )
  end

  def upload_body(body, folder:, extension:, content_type:)
    unique_filename = "#{SecureRandom.uuid}#{extension}"
    s3_key = "#{folder}/#{unique_filename}"
    object = @bucket.object(s3_key)

    begin
      object.put(body: body, content_type: content_type)
      s3_key
    rescue Aws::S3::Errors::ServiceError => e
      Rails.logger.error("S3 Upload Error: #{e.message}")
      nil
    end
  end

  def file_url(s3_key)
    return nil if s3_key.blank?

    @bucket.object(s3_key).public_url
  end

  def delete(s3_key)
    return false if s3_key.blank?

    begin
      @bucket.object(s3_key).delete
      true
    rescue Aws::S3::Errors::ServiceError => e
      Rails.logger.error("S3 Delete Error: #{e.message}")
      false
    end
  end
end
