# frozen_string_literal: true

class Ticket < ApplicationRecord
  belongs_to :user
  belongs_to :event
  has_one :event_feedback, dependent: :destroy

  validates :user_id, :event_id, presence: true
  validates :qr_code, presence: true, uniqueness: true

  before_validation :generate_qr_code, on: :create
  before_create :upload_qr_code_to_s3
  before_destroy :delete_qr_code_from_s3

  scope :search_by_event, lambda { |query|
    return all if query.blank?

    joins(:event).where('events.title ILIKE ?', "%#{query}%")
  }

  scope :sorted_by, lambda { |sort_field, order|
    allowed_fields = {
      'created_at' => :created_at,
      'updated_at' => :updated_at,
      'is_active' => :is_active
    }
    field = allowed_fields.fetch(sort_field.to_s, :created_at)
    direction = order&.downcase == 'asc' ? :asc : :desc
    order(field => direction)
  }

  def qr_code_url
    S3BucketService.new.file_url(qr_image_key) if qr_image_key.present?
  end

  private

  def generate_qr_code
    self.qr_code ||= SecureRandom.uuid
  end

  def upload_qr_code_to_s3
    self.qr_image_key = TicketQrCodeService.new.generate_image_key!(qr_code)
  rescue TicketQrCodeService::UploadError => e
    errors.add(:base, e.message)
    throw :abort
  end

  def delete_qr_code_from_s3
    S3BucketService.new.delete(qr_image_key) if qr_image_key.present?
  end

  def user_can_have_only_one_ticket_per_event
    return if user.blank? || event.blank?

    return unless Ticket.where(user_id: user.id, event_id: event.id).where.not(id: id).exists?

    errors.add(:base, I18n.t('activerecord.errors.models.ticket.attributes.base.already_registered'))
  end
end
