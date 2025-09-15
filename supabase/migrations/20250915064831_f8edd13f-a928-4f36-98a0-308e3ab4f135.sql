-- Create friends table
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Create duels table
CREATE TABLE IF NOT EXISTS public.duels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('waiting', 'active', 'finished', 'cancelled')) DEFAULT 'waiting',
  winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE
);

-- Create duel_progress table for real-time updates
CREATE TABLE IF NOT EXISTS public.duel_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  duel_id UUID NOT NULL REFERENCES public.duels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wpm INTEGER NOT NULL DEFAULT 0,
  accuracy INTEGER NOT NULL DEFAULT 0,
  progress DECIMAL NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  finished BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(duel_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_progress ENABLE ROW LEVEL SECURITY;

-- Friends policies
CREATE POLICY "Users can view their own friendships" 
ON public.friends 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friend requests" 
ON public.friends 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own friend requests" 
ON public.friends 
FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Duels policies  
CREATE POLICY "Users can view their own duels" 
ON public.duels 
FOR SELECT 
USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Users can create duels" 
ON public.duels 
FOR INSERT 
WITH CHECK (auth.uid() = player1_id);

CREATE POLICY "Players can update their duels" 
ON public.duels 
FOR UPDATE 
USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Duel progress policies
CREATE POLICY "Users can view duel progress" 
ON public.duel_progress 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.duels 
    WHERE duels.id = duel_progress.duel_id 
    AND (duels.player1_id = auth.uid() OR duels.player2_id = auth.uid())
  )
);

CREATE POLICY "Users can insert their own progress" 
ON public.duel_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.duel_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_duel_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_duel_progress_updated_at
BEFORE UPDATE ON public.duel_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_duel_progress_timestamp();

-- Enable realtime for new tables
ALTER TABLE public.friends REPLICA IDENTITY FULL;
ALTER TABLE public.duels REPLICA IDENTITY FULL;  
ALTER TABLE public.duel_progress REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.friends;
ALTER PUBLICATION supabase_realtime ADD TABLE public.duels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.duel_progress;