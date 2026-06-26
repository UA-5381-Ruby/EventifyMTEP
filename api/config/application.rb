# frozen_string_literal: true

require_relative 'boot'

require 'rails/all'

Bundler.require(*Rails.groups)

module Api
  class Application < Rails::Application
    config.load_defaults 8.1

    config.i18n.available_locales = %i[en uk]
    config.i18n.default_locale = :en
    config.i18n.fallbacks = true

    config.autoload_lib(ignore: %w[assets tasks])

    config.api_only = true
  end
end
