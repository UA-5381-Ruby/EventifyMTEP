# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
  #pending "add some examples to (or delete) #{__FILE__}"
  it 'is valid with valid attributes' do
    user = build(:user)
    expect(user).to be_valid
  end
end
