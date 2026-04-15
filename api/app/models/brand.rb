class Brand < ApplicationRecord
  has_many :owners, dependent: :destroy
  has_many :users, through: :owners
  has_many :events, dependent: :destroy

  validates :name, presence: true
end