class Category < ApplicationRecord
  has_many :events, dependent: :nullify

  validates :name, presence: true, uniqueness: true
end