# frozen_string_literal: true

class AddRejectionReasonToEvents < ActiveRecord::Migration[8.1]
  def change
    add_column :events, :rejection_reason, :string
  end
end
