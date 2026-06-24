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
    Activity.log_activity(
      RequestContext.current_user,
      'create',
      self.class.name,
      id,
      model_display_name,
      changes_summary,
      RequestContext.current_ip,
      RequestContext.current_user_agent
    )
  rescue StandardError => e
    Rails.logger.error("Failed to log create activity: #{e.message}")
  end

  def log_update_activity
    return if changes.blank? || changes.keys.all? { |k| %w[updated_at].include?(k) }

    Activity.log_activity(
      RequestContext.current_user,
      'update',
      self.class.name,
      id,
      model_display_name,
      changes_summary,
      RequestContext.current_ip,
      RequestContext.current_user_agent
    )
  rescue StandardError => e
    Rails.logger.error("Failed to log update activity: #{e.message}")
  end

  def log_destroy_activity
    Activity.log_activity(
      RequestContext.current_user,
      'delete',
      self.class.name,
      id,
      model_display_name,
      "Deleted #{self.class.name}",
      RequestContext.current_ip,
      RequestContext.current_user_agent
    )
  rescue StandardError => e
    Rails.logger.error("Failed to log destroy activity: #{e.message}")
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
