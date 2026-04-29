# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe Category, type: :model do
  # pending "add some examples to (or delete) #{__FILE__}"
  it 'is valid with valid attributes' do
    category = build(:category)
    expect(category).to be_valid
  end
end
