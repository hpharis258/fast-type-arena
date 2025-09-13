-- Drop the existing foreign key constraint and add a new one linking to profiles
ALTER TABLE public.scores DROP CONSTRAINT scores_user_id_fkey;

-- Add foreign key constraint to link scores to profiles table
ALTER TABLE public.scores ADD CONSTRAINT scores_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;