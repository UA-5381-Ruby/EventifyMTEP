# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EventFilter do
  let(:brand) { create(:brand) }
  let(:category) { create(:category) }
  let(:owner) { create(:user) }
  let(:guest) { nil }
  let!(:membership) { create(:brand_membership, user: owner, brand: brand, role: 'owner') }

  let!(:published_event) do
    create(:event, :published, brand: brand, title: 'Ruby Meetup', start_date: 2.days.from_now,
                               categories: [category])
  end
  let!(:draft_event) { create(:event, brand: brand, title: 'Draft Event', status: :draft) }
  let!(:other_brand_event) { create(:event, :published, title: 'Other Event') }

  def filter(params, user = guest)
    described_class.new(params, user).call
  end

  describe '#call' do
    it 'returns published and cancelled events for logged-in non-manager' do
      member = create(:user)
      create(:brand_membership, user: member, brand: brand, role: 'member')

      results = filter({}, member)

      expect(results).to include(published_event, other_brand_event)
      expect(results).not_to include(draft_event)
    end

    it 'returns published events for regular authenticated user without memberships' do
      user = create(:user)

      results = filter({}, user)

      expect(results).to include(published_event, other_brand_event)
      expect(results).not_to include(draft_event)
    end

    it 'returns managed events for manager role' do
      manager = create(:user)
      create(:brand_membership, user: manager, brand: brand, role: 'manager')

      results = filter({}, manager)

      expect(results).to include(draft_event, published_event)
    end

    it 'returns published events for guests' do
      results = filter({})

      expect(results).to include(published_event, other_brand_event)
      expect(results).not_to include(draft_event)
    end

    it 'returns managed and published events for brand owner' do
      results = filter({}, owner)

      expect(results).to include(published_event, draft_event)
    end

    it 'returns all events for superadmin' do
      superadmin = create(:user, is_superadmin: true)

      results = filter({}, superadmin)

      expect(results).to include(published_event, draft_event, other_brand_event)
    end

    it 'filters by category_id' do
      results = filter({ category_id: category.id })

      expect(results).to include(published_event)
      expect(results).not_to include(other_brand_event)
    end

    it 'filters by brand_id and status' do
      results = filter({ brand_id: brand.id, status: 'draft' }, owner)

      expect(results).to contain_exactly(draft_event)
    end

    it 'filters by date range and search query' do
      results = filter({ from: 1.day.from_now.to_date, to: 5.days.from_now.to_date, q: 'Ruby' })

      expect(results).to contain_exactly(published_event)
    end

    it 'sorts results by allowed column' do
      results = filter({ sort: 'title', order: 'asc' })

      expect(results.to_sql).to include('ORDER BY')
    end
  end
end
