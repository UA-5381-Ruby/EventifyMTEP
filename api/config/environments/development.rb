# frozen_string_literal: true

require 'active_support/core_ext/integer/time'

Rails.application.configure do
  config.enable_reloading = true
  config.eager_load = false
  config.consider_all_requests_local = true
  config.server_timing = true

  setup_cache_store
  config.active_storage.service = :local
  setup_mailer
  config.active_support.deprecation = :log
  config.active_record.migration_error = :page_load
  config.active_record.verbose_query_logs = true
  config.active_record.query_log_tags_enabled = true
  config.active_job.verbose_enqueue_logs = true
  config.action_dispatch.verbose_redirect_logs = true
  config.action_view.annotate_rendered_view_with_filenames = true
  config.action_controller.raise_on_missing_callback_actions = true
  config.hosts << /.*\.ngrok-free\.dev/
  setup_smtp_mailer
end

def setup_cache_store
  if Rails.root.join('tmp/caching-dev.txt').exist?
    Rails.application.config.public_file_server.headers = { 'cache-control' => "public, max-age=#{2.days.to_i}" }
  else
    Rails.application.config.action_controller.perform_caching = false
  end
  Rails.application.config.cache_store = :memory_store
end

def setup_mailer
  config = Rails.application.config
  config.action_mailer.raise_delivery_errors = false
  config.action_mailer.delivery_method = :resend
  config.action_mailer.perform_caching = false
  config.action_mailer.default_url_options = { host: 'localhost', port: 3000 }
  ENV['FRONTEND_URL'] ||= 'http://localhost:5173'
end

def setup_smtp_mailer
  Rails.application.config.action_mailer.smtp_settings = {
    address: 'smtp.gmail.com',
    port: 587,
    domain: 'gmail.com',
    user_name: ENV.fetch('GMAIL_USERNAME'),
    password: ENV.fetch('GMAIL_APP_PASSWORD'),
    authentication: 'plain',
    enable_starttls_auto: true
  }
end
