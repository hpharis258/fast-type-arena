-- Create achievements table for available achievements
CREATE TABLE public.achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'trophy',
  category text NOT NULL DEFAULT 'general',
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL,
  badge_color text NOT NULL DEFAULT '#FFD700',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_achievements table to track unlocked achievements
CREATE TABLE public.user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements (viewable by everyone)
CREATE POLICY "Achievements are viewable by everyone"
ON public.achievements
FOR SELECT
USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "User achievements are viewable by everyone"
ON public.user_achievements
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own achievements"
ON public.user_achievements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Seed achievements data
INSERT INTO public.achievements (name, description, icon, category, requirement_type, requirement_value, badge_color) VALUES
-- WPM Milestones
('Speed Demon', 'Reach 50 WPM in a game', 'zap', 'speed', 'wpm', 50, '#3B82F6'),
('Lightning Fingers', 'Reach 75 WPM in a game', 'zap', 'speed', 'wpm', 75, '#8B5CF6'),
('Keyboard Warrior', 'Reach 100 WPM in a game', 'sword', 'speed', 'wpm', 100, '#F59E0B'),
('Speed Master', 'Reach 125 WPM in a game', 'crown', 'speed', 'wpm', 125, '#EF4444'),
('Legendary Typist', 'Reach 150 WPM in a game', 'flame', 'speed', 'wpm', 150, '#EC4899'),

-- Accuracy Milestones
('Precise', 'Achieve 95% accuracy in a game', 'target', 'accuracy', 'accuracy', 95, '#10B981'),
('Sharpshooter', 'Achieve 98% accuracy in a game', 'crosshair', 'accuracy', 'accuracy', 98, '#14B8A6'),
('Perfectionist', 'Achieve 100% accuracy in a game', 'check-circle', 'accuracy', 'accuracy', 100, '#22D3EE'),

-- Games Played Milestones
('Getting Started', 'Play 10 games', 'play', 'dedication', 'games_played', 10, '#6366F1'),
('Regular Player', 'Play 50 games', 'repeat', 'dedication', 'games_played', 50, '#8B5CF6'),
('Dedicated Typist', 'Play 100 games', 'award', 'dedication', 'games_played', 100, '#A855F7'),
('Typing Veteran', 'Play 500 games', 'medal', 'dedication', 'games_played', 500, '#D946EF'),
('Typing Legend', 'Play 1000 games', 'trophy', 'dedication', 'games_played', 1000, '#F43F5E'),

-- Streak Milestones
('On Fire', 'Maintain a 3-day streak', 'flame', 'streak', 'streak', 3, '#F97316'),
('Week Warrior', 'Maintain a 7-day streak', 'calendar', 'streak', 'streak', 7, '#FB923C'),
('Fortnight Fighter', 'Maintain a 14-day streak', 'calendar-check', 'streak', 'streak', 14, '#FBBF24'),
('Monthly Master', 'Maintain a 30-day streak', 'star', 'streak', 'streak', 30, '#FCD34D'),

-- Duel Milestones
('First Victory', 'Win your first duel', 'swords', 'duels', 'duel_wins', 1, '#60A5FA'),
('Duel Champion', 'Win 10 duels', 'shield', 'duels', 'duel_wins', 10, '#34D399'),
('Arena Master', 'Win 50 duels', 'crown', 'duels', 'duel_wins', 50, '#FBBF24'),
('Unbeatable', 'Win 100 duels', 'trophy', 'duels', 'duel_wins', 100, '#F472B6');

-- Create index for faster lookups
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_achievements_category ON public.achievements(category);