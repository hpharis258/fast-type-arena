-- Add player_icon column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN player_icon TEXT DEFAULT 'default';

-- Add owned_icons column to track purchased icons
ALTER TABLE public.profiles 
ADD COLUMN owned_icons TEXT[] DEFAULT ARRAY['default']::TEXT[];