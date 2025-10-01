-- Add foreign key constraint for friend_id if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'friends_friend_id_fkey'
  ) THEN
    ALTER TABLE public.friends
    ADD CONSTRAINT friends_friend_id_fkey 
    FOREIGN KEY (friend_id) 
    REFERENCES public.profiles(user_id) 
    ON DELETE CASCADE;
  END IF;
END $$;