-- 003_single_approved_generation.sql
-- At most one approved generation ("approved direction") per room. The approve
-- endpoint demotes the previous one first; this index stops concurrent approvals
-- from leaving two approved rows behind.
-- Idempotent: safe to re-run.

CREATE UNIQUE INDEX IF NOT EXISTS generations_one_approved_per_room
  ON generations (room_id)
  WHERE status = 'approved';
