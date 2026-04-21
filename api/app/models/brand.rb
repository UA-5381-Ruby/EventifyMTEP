# frozen_string_literal: true

class Brand < ApplicationRecord
  has_many :brand_memberships, dependent: :destroy
  has_many :users, through: :brand_memberships
  has_many :events, dependent: :destroy

  validates :name, presence: true
  validates :subdomain, presence: true, uniqueness: true
end
