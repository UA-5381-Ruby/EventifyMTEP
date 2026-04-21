# frozen_string_literal: true

class User < ApplicationRecord
  has_secure_password

  has_many :brand_memberships, dependent: :destroy
  has_many :brands, through: :brand_memberships
  has_many :tickets, dependent: :destroy

  validates :email, presence: true, uniqueness: true
end
