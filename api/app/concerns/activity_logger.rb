# frozen_string_literal: true

module ActivityLogger
  extend ActiveSupport::Concern

  included do
    after_create :log_create_activity, if: :should_log_activity?
    after_update :log_update_activity, if: :should_log_activity?
    before_destroy :log_destroy_activity, if: :should_log_activity?
  end

  private

  def should_log_activity?
    RequestContext.current_user.present?
  end

  def log_create_activity
    record_activity('create', changes_summary)
  end

  def log_update_activity
    return unless significant_changes?

    record_activity('update', changes_summary)
  end

  def log_destroy_activity
    record_activity('delete', "Deleted #{self.class.name}")
  end

  # --- Extracted Helpers ---

  def significant_changes?
    return false if changes.blank?

    changes.keys.any? { |k| k != 'updated_at' }
  end

  def record_activity(action, details)
    Activity.log_activity(
      action,
      self.class.name,
      user: RequestContext.current_user,
      resource_id: id,
      resource_name: model_display_name,
      details: details,
      ip_address: RequestContext.current_ip,
      user_agent: RequestContext.current_user_agent
    )
  rescue StandardError => e
    Rails.logger.error("Failed to log #{action} activity: #{e.message}")
  end

  def model_display_name
    if respond_to?(:name) && name.present?
      name
    elsif respond_to?(:title) && title.present?
      title
    elsif respond_to?(:email) && email.present?
      email
    else
      "#{self.class.name} ##{id}"
    end
  end

  def changes_summary
    if changes.any?
      changes.except('updated_at', 'created_at').to_s
    else
      "Updated #{self.class.name}"
    end
  end
end
