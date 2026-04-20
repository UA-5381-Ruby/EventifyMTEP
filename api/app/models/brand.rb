# frozen_string_literal: true

class Brand < ApplicationRecord
  has_many :organizers, dependent: :destroy
  has_many :users, through: :organizers
  has_many :events, dependent: :destroy

  validates :name, presence: true, length: { maximum: 100 }
  validates :subdomain,
            presence: true,
            uniqueness: { case_sensitive: false },
            format: { with: /\A[a-z0-9-]+\z/ }

  validates :primary_color,
            presence: true,
            format: { with: /\A#[0-9a-fA-F]{6}\z/ }

  validates :secondary_color,
            presence: true,
            format: { with: /\A#[0-9a-fA-F]{6}\z/ }
end
