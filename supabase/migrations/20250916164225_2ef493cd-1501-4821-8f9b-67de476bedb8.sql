-- Add duration column to scores table to track time spent per game
ALTER TABLE public.scores 
ADD COLUMN duration INTEGER NOT NULL DEFAULT 30;