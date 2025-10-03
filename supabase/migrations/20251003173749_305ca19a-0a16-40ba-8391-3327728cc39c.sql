-- Update duels status constraint to allow pending and accepted statuses
ALTER TABLE duels DROP CONSTRAINT IF EXISTS duels_status_check;
ALTER TABLE duels ADD CONSTRAINT duels_status_check 
CHECK (status = ANY (ARRAY['waiting'::text, 'pending'::text, 'accepted'::text, 'active'::text, 'finished'::text, 'cancelled'::text, 'rejected'::text]));