# frozen_string_literal: true

# Enforce at the database level the constraints that are already required by
# model validations for Event#location and Event#start_date.
#
# NOTE: This migration assumes all existing rows already satisfy the constraints
# (i.e., no NULL values exist in those columns). If NULLs are present in an
# existing database, run the following cleanup query first:
#
#   UPDATE events SET location = '' WHERE location IS NULL;
#   UPDATE events SET start_date = NOW() WHERE start_date IS NULL;
#
class AddNotNullToEventsRequiredFields < ActiveRecord::Migration[8.1]
  def up
    change_column_null :events, :location, false
    change_column_null :events, :start_date, false
  end

  def down
    change_column_null :events, :location, true
    change_column_null :events, :start_date, true
  end
end
