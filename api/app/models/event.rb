class Event < ApplicationRecord
  belongs_to :brand
  validates :brand, presence: true
  
  # Optional because the DBML didn't specify 'not null' for category_id
  belongs_to :category, optional: true 

  has_many :tickets, dependent: :destroy
  has_many :attendees, through: :tickets, source: :user

  enum :status, {
    draft: "draft",
    draft_on_review: "draft_on_review",
    published: "published",
    rejected: "rejected",
    published_unverified: "published_unverified",
    published_on_review: "published_on_review",
    published_rejected: "published_rejected",
    archived: "archived",
    cancelled: "cancelled"
  }, default: "draft"

  validates :title, presence: true
  validates :start_date, presence: true
end