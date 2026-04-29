# frozen_string_literal: true


Rswag::Api.configure do |c|
  c.openapi_root = File.join(Rails.root, "swagger")
  c.swagger_filter = lambda do |swagger, env|
    base = ENV["SWAGGER_SERVER_URL"].presence || "#{env['rack.url_scheme']}://#{env['HTTP_HOST']}"
    swagger["servers"] = [ { "url" => base } ]
  end
end
