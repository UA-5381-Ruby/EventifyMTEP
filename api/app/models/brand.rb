# frozen_string_literal: true

class Brand < ApplicationRecord
  HEX_COLOR_REGEX = /\A#(?:[0-9a-fA-F]{3}){1,2}\z/
  SUBDOMAIN_REGEX = /\A[a-z0-9-]+\z/

  has_many :brand_memberships, dependent: :destroy
  has_many :users, through: :brand_memberships
  has_many :events, dependent: :destroy

  validates :name,
            presence: true,
            length: { maximum: 100 }

  validates :subdomain,
            presence: true,
            uniqueness: true,
            format: {
              with: SUBDOMAIN_REGEX,
              message: 'can only contain lowercase letters, numbers, and hyphens'
            }

  validates :primary_color,
            format: {
              with: HEX_COLOR_REGEX,
              message: 'must be a valid hex color code'
            },
            allow_blank: true
end
