# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EventPolicy, type: :policy do
  let(:brand) { create(:brand) }
  let(:owner) { create(:user) }
  let(:manager) { create(:user) }
  let(:member) { create(:user) }
  let(:guest) { nil }
  let(:superadmin) { create(:user, is_superadmin: true) }

  before do
    create(:brand_membership, user: owner, brand: brand, role: 'owner')
    create(:brand_membership, user: manager, brand: brand, role: 'manager')
    create(:brand_membership, user: member, brand: brand, role: 'member')
  end

  describe '#show?' do
    it 'allows anyone to view published events' do
      event = create(:event, :published, brand: brand)

      expect(described_class.new(guest, event).show?).to be(true)
    end

    it 'allows owner to view draft events' do
      event = create(:event, brand: brand, status: :draft)

      expect(described_class.new(owner, event).show?).to be(true)
    end

    it 'allows anyone to view cancelled events' do
      event = create(:event, brand: brand, status: :cancelled)

      expect(described_class.new(guest, event).show?).to be(true)
    end

    it 'allows manager to view draft events' do
      event = create(:event, brand: brand, status: :draft)

      expect(described_class.new(manager, event).show?).to be(true)
    end

    it 'denies guest access to draft events' do
      event = create(:event, brand: brand, status: :draft)

      expect(described_class.new(guest, event).show?).to be_falsy
    end
  end

  describe '#create?' do
    it 'permits owner and superadmin' do
      event = build(:event, brand: brand)

      expect(described_class.new(owner, event).create?).to be(true)
      expect(described_class.new(superadmin, event).create?).to be(true)
    end

    it 'denies regular members and guests' do
      event = build(:event, brand: brand)

      expect(described_class.new(member, event).create?).to be(false)
      expect(described_class.new(guest, event).create?).to be(false)
    end
  end

  describe '#update?' do
    it 'permits owner for non-cancelled events' do
      event = create(:event, brand: brand, status: :draft)

      expect(described_class.new(owner, event).update?).to be(true)
    end

    it 'denies updates to cancelled events' do
      event = create(:event, brand: brand, status: :cancelled)

      expect(described_class.new(owner, event).update?).to be(false)
    end
  end

  describe '#destroy?' do
    it 'permits owner only for draft events' do
      draft = create(:event, brand: brand, status: :draft)
      published = create(:event, :published, brand: brand)

      expect(described_class.new(owner, draft).destroy?).to be(true)
      expect(described_class.new(owner, published).destroy?).to be(false)
    end
  end

  describe '#submit? and #cancel?' do
    it 'permits owner and superadmin' do
      event = create(:event, brand: brand, status: :draft)

      expect(described_class.new(owner, event).submit?).to be(true)
      expect(described_class.new(superadmin, event).submit?).to be(true)
      expect(described_class.new(owner, event).cancel?).to be(true)
    end
  end

  describe '#approve? and #reject?' do
    it 'permits only superadmin' do
      event = create(:event, brand: brand, status: :draft_on_review)

      expect(described_class.new(superadmin, event).approve?).to be(true)
      expect(described_class.new(superadmin, event).reject?).to be(true)
      expect(described_class.new(owner, event).approve?).to be(false)
    end
  end

  describe '#manage_categories?' do
    it 'permits owner, manager, and superadmin' do
      event = create(:event, brand: brand)

      expect(described_class.new(owner, event).manage_categories?).to be(true)
      expect(described_class.new(manager, event).manage_categories?).to be(true)
      expect(described_class.new(superadmin, event).manage_categories?).to be(true)
      expect(described_class.new(member, event).manage_categories?).to be(false)
    end
  end

  describe 'Scope' do
    let!(:published_event) { create(:event, :published, brand: brand) }
    let!(:draft_event) { create(:event, brand: brand, status: :draft) }
    let!(:other_event) { create(:event, :published) }

    it 'resolves published events for guests' do
      scope = described_class::Scope.new(guest, Event.all).resolve

      expect(scope).to include(published_event, other_event)
      expect(scope).not_to include(draft_event)
    end

    it 'resolves managed and published events for owners' do
      scope = described_class::Scope.new(owner, Event.all).resolve

      expect(scope).to include(published_event, draft_event)
    end

    it 'resolves all events for superadmin' do
      scope = described_class::Scope.new(superadmin, Event.all).resolve

      expect(scope).to include(published_event, draft_event, other_event)
    end
  end
end
