# frozen_string_literal: true

# spec/support/auth_helper.rb
module AuthHelper
  # Цей метод генерує заголовки з токеном для конкретного користувача
  def auth_headers(user)
    token = ::JwtService.encode(user_id: user.id)
    {
      'Authorization' => "Bearer #{token}",
      'Content-Type' => 'application/json',
      'Accept' => 'application/json'
    }
  end

  def jwt_for(user)
    ::JwtService.encode(user_id: user.id)
  end
end
