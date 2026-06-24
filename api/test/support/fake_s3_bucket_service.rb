# frozen_string_literal: true

class FakeS3BucketService
  def upload(file, folder:)
    extension = File.extname(file.original_filename)
    upload_body(
      File.binread(file.tempfile.path),
      folder: folder,
      extension: extension,
      content_type: file.content_type.presence || 'application/octet-stream'
    )
  end

  def upload_body(_body, folder:, extension:, **)
    "#{folder}/#{SecureRandom.uuid}#{extension}"
  end

  def file_url(s3_key)
    return nil if s3_key.blank?

    "https://example.com/#{s3_key}"
  end

  # rubocop:disable Naming/PredicateMethod -- mirrors S3BucketService API
  def delete(_s3_key)
    true
  end
  # rubocop:enable Naming/PredicateMethod
end
