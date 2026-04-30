# frozen_string_literal: true

# Enforce at the database level that each ticket can have at most one feedback
# record. The application already prevents duplicates through model callbacks,
# but a DB-level unique index is the reliable last line of defense against
# race conditions.
#
# NOTE: If duplicate rows already exist in production, remove them before
# running this migration:
#
#   WITH ranked AS (
#     SELECT id,
#            ROW_NUMBER() OVER (PARTITION BY ticket_id ORDER BY id) AS rn
#     FROM   event_feedbacks
#   )
#   DELETE FROM event_feedbacks WHERE id IN (SELECT id FROM ranked WHERE rn > 1);
#
class AddUniqueIndexToEventFeedbacksTicketId < ActiveRecord::Migration[8.1]
  def change
    add_index :event_feedbacks, :ticket_id, unique: true,
                                            name: 'index_event_feedbacks_on_ticket_id_unique'
  end
end
