# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Event, type: :model do
  subject { build(:event, brand: brand, categories: [category]) }

  let(:brand) { create(:brand) }
  let(:category) { create(:category) }


  describe 'validations' do
    it { is_expected.to validate_presence_of(:title) }
    it { is_expected.to validate_presence_of(:start_date) }
    it { is_expected.to validate_presence_of(:location) }
    it { is_expected.to validate_length_of(:title).is_at_most(120) }
    it { is_expected.to validate_length_of(:location).is_at_most(200) }
    it { is_expected.to validate_presence_of(:status) }

    it { is_expected.to belong_to(:brand) }
    it { is_expected.to have_many(:event_categories).dependent(:destroy) }
    it { is_expected.to have_many(:categories).through(:event_categories) }
  end

  describe 'associations' do
    it { is_expected.to belong_to(:brand) }
    it { is_expected.to have_many(:event_categories).dependent(:destroy) }
    it { is_expected.to have_many(:categories).through(:event_categories) }
  end

  it do
    expect(subject).to define_enum_for(:status).with_values(
      draft: 'draft',
      draft_on_review: 'draft_on_review',
      published: 'published',
      rejected: 'rejected',
      published_unverified: 'published_unverified',
      published_on_review: 'published_on_review',
      published_rejected: 'published_rejected',
      archived: 'archived',
      cancelled: 'cancelled'
    ).backed_by_column_of_type(:enum)
  end
end
