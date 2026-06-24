# frozen_string_literal: true

class Activity < ApplicationRecord
  ACTIVITY_TYPES = %w[login logout create update delete approve reject publish download upload other].freeze
  RESOURCE_TYPES = %w[Event Brand User Ticket Category].freeze
  STATUSES = %w[success failed].freeze

  belongs_to :user, optional: true

  validates :activity_type, inclusion: { in: ACTIVITY_TYPES }
  validates :resource_type, inclusion: { in: RESOURCE_TYPES }
  validates :status, inclusion: { in: STATUSES }

  scope :by_activity_types, ->(types) { where(activity_type: types.split(',')) if types.present? }
  scope :by_resource_type, ->(resource) { where(resource_type: resource) if resource.present? }
  scope :by_status, ->(status) { where(status: status) if status.present? }
  scope :by_user_email, ->(email) { joins(:user).where(users: { email: email }) if email.present? }
  scope :recent, -> { order(created_at: :desc) }

  class << self
    def log_activity(activity_type, resource_type, attributes = {})
      user = attributes[:user] || RequestContext.current_user
      return if user.nil?

      create!(build_payload(user, activity_type, resource_type, attributes))
    rescue StandardError => e
      Rails.logger.error("Failed to log activity: #{e.message}")
    end

    private

    def build_payload(user, activity_type, resource_type, attrs)
      {
        user_id: user.id,
        activity_type: activity_type,
        resource_type: resource_type,
        resource_id: attrs[:resource_id],
        resource_name: attrs[:resource_name],
        status: attrs[:status] || 'success',
        details: attrs[:details],
        ip_address: attrs[:ip_address] || RequestContext.current_ip,
        user_agent: attrs[:user_agent] || RequestContext.current_user_agent
      }
    end
  end
end
