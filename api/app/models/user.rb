class User < ApplicationRecord
  has_secure_password

  has_many :owners, dependent: :destroy
  has_many :brands, through: :owners
  has_many :tickets, dependent: :destroy
  has_many :attended_events, through: :tickets, source: :event

  validates :username, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: true
  validates :is_admin, inclusion: { in: [true, false] }
end