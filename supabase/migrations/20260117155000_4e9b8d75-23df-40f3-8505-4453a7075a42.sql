-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a security definer function to check if a user can view a profile
-- This avoids infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.can_view_profile(_viewer_id uuid, _profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- User can always view their own profile
    _viewer_id = _profile_user_id
    OR
    -- User can view profiles of accepted friends
    EXISTS (
      SELECT 1 FROM public.friends
      WHERE status = 'accepted'
      AND (
        (user_id = _viewer_id AND friend_id = _profile_user_id)
        OR (friend_id = _viewer_id AND user_id = _profile_user_id)
      )
    )
    OR
    -- User can view profiles of opponents in active/recent duels
    EXISTS (
      SELECT 1 FROM public.duels
      WHERE (
        (player1_id = _viewer_id AND player2_id = _profile_user_id)
        OR (player2_id = _viewer_id AND player1_id = _profile_user_id)
      )
      AND status IN ('waiting', 'active', 'finished')
    )
$$;

-- Create a new restrictive SELECT policy for profiles
CREATE POLICY "Users can view allowed profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.can_view_profile(auth.uid(), user_id));