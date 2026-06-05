# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DeleteUnconfirmedUserJob, type: :job do
  let(:user) { create(:user, is_confirmed: false) }

  it 'destroys unconfirmed user' do
    described_class.perform_now(user.id)
    expect(User.find_by(id: user.id)).to be_nil
  end

  it 'does not destroy confirmed user' do
    user.update(is_confirmed: true)
    described_class.perform_now(user.id)
    expect(User.find_by(id: user.id)).to be_present
  end
end
