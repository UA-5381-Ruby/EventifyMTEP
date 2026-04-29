# frozen_string_literal: true

# чи важлива нам унікальність кожного івенту?
# Якщо так, то треба додати валідацію на унікальність title в межах бренду
# чи обов'язково назначати категорію кожному івенту?
# Якщо так, то треба додати валідацію на присутність хоча б однієї категорії
class Event < ApplicationRecord
  ALLOWED_SORT_COLUMNS = %w[created_at updated_at title start_date status].freeze
  private_constant :ALLOWED_SORT_COLUMNS

  include AASM

  belongs_to :brand

  has_many :event_categories, dependent: :destroy
  has_many :categories, through: :event_categories
  has_many :tickets, dependent: :destroy

  aasm column: :status, enum: true do
    state :draft, initial: true
    state :draft_on_review
    state :published
    state :rejected
    state :published_unverified
    state :published_on_review
    state :published_rejected
    state :archived
    state :cancelled

    event :submit do
      transitions from: :draft, to: :draft_on_review, guard: :all_required_fields_filled?
      transitions from: :published_unverified, to: :published_on_review, guard: :all_required_fields_filled?
    end

    event :approve do
      transitions from: :draft_on_review, to: :published
      transitions from: :published_on_review, to: :published
    end

    event :reject do
      transitions from: :draft_on_review, to: :rejected
      transitions from: :published_on_review, to: :published_rejected

      before do |reason|
        self.rejection_reason = reason if respond_to?(:rejection_reason=)
      end
    end

    event :cancel do
      transitions from: %i[
        draft draft_on_review published rejected
        published_unverified published_on_review
        published_rejected archived
      ], to: :cancelled

      after do
        deactivate_tickets!
      end
    end
  end

  def all_required_fields_filled?
    title.present? && location.present? && start_date.present?
  end

  private

  def deactivate_tickets!
    tickets.where(is_active: true).update_all(is_active: false)
  end

  enum :status, {
    draft: 'draft',
    draft_on_review: 'draft_on_review',
    published: 'published',
    rejected: 'rejected',
    published_unverified: 'published_unverified',
    published_on_review: 'published_on_review',
    published_rejected: 'published_rejected',
    archived: 'archived',
    cancelled: 'cancelled'
  }
  validate :end_date_after_start_date

  def end_date_after_start_date
    return if end_date.blank? || start_date.blank?

    return unless end_date < start_date

    errors.add(:end_date, 'must be after start date')
  end
  validates :title, presence: true, length: { maximum: 120 }
  validates :location, presence: true, length: { maximum: 200 }
  validates :start_date, presence: true
  validates :status, presence: true

  scope :from_date, ->(date) { where(start_date: date..) if date.present? }
  scope :to_date, ->(date) { where(start_date: ..date) if date.present? }

  scope :search_title, ->(query) { where('title ILIKE ?', "%#{query}%") if query.present? }

  scope :sorted_by, lambda { |column, direction|
    sort_column = ALLOWED_SORT_COLUMNS.include?(column) ? column : 'created_at'
    sort_direction = %w[asc desc].include?(direction) ? direction : 'desc'
    order(sort_column => sort_direction)
  }
end
