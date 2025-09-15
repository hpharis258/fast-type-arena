-- Enable realtime for new tables
ALTER TABLE public.friends REPLICA IDENTITY FULL;
ALTER TABLE public.duels REPLICA IDENTITY FULL;  
ALTER TABLE public.duel_progress REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.friends;
ALTER PUBLICATION supabase_realtime ADD TABLE public.duels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.duel_progress;