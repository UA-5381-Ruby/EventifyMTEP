# frozen_string_literal: true

require 'rqrcode'

class Ticket < ApplicationRecord
  belongs_to :user
  belongs_to :event

  validates :rating, numericality: {
    only_integer: true,
    greater_than_or_equal_to: 1,
    less_than_or_equal_to: 5
  }, allow_nil: true

  validates :comment, length: { maximum: 1000 }, allow_nil: true
  validates :is_active, inclusion: { in: [true, false] }

  # If qr_code should be unique per ticket
  validates :qr_code, uniqueness: true, allow_nil: true
  validates :user_id, uniqueness: { scope: :event_id, message: :duplicate_ticket }

  before_validation :generate_qr_code, on: :create

  def qr_code_svg
    return nil unless qr_code

    begin
      qrcode = RQRCode::QRCode.new(qr_code)
      qrcode.as_svg(
        color: '000',
        shape_rendering: 'crispEdges',
        module_size: 6,
        standalone: true,
        use_path: true
      )
    rescue RQRCode::QRCodeRunTimeError => e
      Rails.logger.error("QR code generation failed for ticket #{id}: #{e.message}")
      nil
    end
  end

  private

  def generate_qr_code
    self.qr_code = SecureRandom.hex(12) if qr_code.blank?
  end
end
