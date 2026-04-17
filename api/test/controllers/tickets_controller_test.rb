# frozen_string_literal: true

require 'test_helper'

class TicketsControllerTest < ActionDispatch::IntegrationTest
  test 'should get update' do
    get tickets_update_url
    assert_response :success
  end
end
