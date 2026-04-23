# frozen_string_literal: true

class User < ApplicationRecord
  has_secure_password

  has_many :brand_memberships, dependent: :destroy
  has_many :brands, through: :brand_memberships
  has_many :tickets, dependent: :destroy

  validates :name, presence: true

  validates :password, presence: true, length: { minimum: 6 }, if: -> { new_record? || !password.nil? }

  validates :email,
            presence: true,
            uniqueness: { case_sensitive: false },
            format: { with: /\A[^@\s]+@[^@\s]+\.[^@\s]+\z/, message: 'must be a valid email address' }
end
