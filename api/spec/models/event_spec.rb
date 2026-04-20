# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Event, type: :model do
  let(:brand) { create(:brand) }
  let(:category) { create(:category) }

  subject { build(:event, brand: brand, category: category) }

  describe 'validations' do
    it { is_expected.to validate_presence_of(:title) }
    it { is_expected.to validate_presence_of(:start_date) }
    it { is_expected.to validate_presence_of(:location) }
    it { is_expected.to validate_length_of(:title).is_at_most(120) }
    it { is_expected.to validate_length_of(:location).is_at_most(200) }
    it { is_expected.to validate_presence_of(:status) }

    it { is_expected.to belong_to(:brand) }
    it { is_expected.to belong_to(:category) }
  end

  describe 'associations' do
    it { is_expected.to belong_to(:brand) }
    it { is_expected.to belong_to(:category) }
  end

  describe 'enum status' do
    it {
      is_expected.to define_enum_for(:status).with_values(
        draft: 'draft',
        draft_on_review: 'draft_on_review',
        published: 'published',
        rejected: 'rejected',
        published_unverified: 'published_unverified',
        published_on_review: 'published_on_review',
        published_rejected: 'published_rejected',
        archived: 'archived',
        cancelled: 'cancelled'
      ).backed_by_column_of_type(:string)
    }
  end
end
