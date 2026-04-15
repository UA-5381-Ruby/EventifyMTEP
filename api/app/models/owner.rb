class Owner < ApplicationRecord
  belongs_to :user
  belongs_to :brand

  validates :user, presence: true
  validates :brand, presence: true
end