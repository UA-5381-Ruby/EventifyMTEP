# frozen_string_literal: true

require 'rqrcode'

class TicketQrCodeService
  class UploadError < StandardError; end

  QR_FOLDER = 'tickets/qr'

  def initialize(s3_service: S3BucketService.new)
    @s3_service = s3_service
  end

  def generate_image_key!(payload)
    png_data = generate_png(payload)
    s3_key = @s3_service.upload_body(
      png_data,
      folder: QR_FOLDER,
      extension: '.png',
      content_type: 'image/png'
    )

    raise UploadError, 'Failed to upload QR code to S3' if s3_key.nil?

    s3_key
  end

  private

  def generate_png(payload)
    qr = RQRCode::QRCode.new(payload)
    qr.as_png(size: 300, border_modules: 2).to_s
  end
end
