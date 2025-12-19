import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  badge_color: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch all achievements
  const fetchAchievements = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('requirement_value', { ascending: true });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  }, []);

  // Fetch user's unlocked achievements
  const fetchUserAchievements = useCallback(async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          id,
          user_id,
          achievement_id,
          unlocked_at,
          achievements (*)
        `)
        .eq('user_id', targetUserId);

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformed = (data || []).map(ua => ({
        ...ua,
        achievement: ua.achievements as unknown as Achievement
      }));
      
      setUserAchievements(transformed);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Check and award achievements based on game stats
  const checkAndAwardAchievements = useCallback(async (stats: {
    wpm: number;
    accuracy: number;
  }) => {
    if (!user) return;

    try {
      // Get user's current stats from database
      const { data: scores, error: scoresError } = await supabase
        .from('scores')
        .select('id')
        .eq('user_id', user.id);

      if (scoresError) throw scoresError;

      const { data: wallet, error: walletError } = await supabase
        .from('user_wallets')
        .select('current_streak')
        .eq('user_id', user.id)
        .single();

      if (walletError && walletError.code !== 'PGRST116') throw walletError;

      const { data: duelsWon, error: duelsError } = await supabase
        .from('duels')
        .select('id')
        .eq('winner_id', user.id);

      if (duelsError) throw duelsError;

      // Get already unlocked achievements
      const { data: existingAchievements, error: existingError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id);

      if (existingError) throw existingError;

      const unlockedIds = new Set((existingAchievements || []).map(a => a.achievement_id));

      // Check each achievement
      const newlyUnlocked: Achievement[] = [];

      for (const achievement of achievements) {
        if (unlockedIds.has(achievement.id)) continue;

        let shouldUnlock = false;

        switch (achievement.requirement_type) {
          case 'wpm':
            shouldUnlock = stats.wpm >= achievement.requirement_value;
            break;
          case 'accuracy':
            shouldUnlock = stats.accuracy >= achievement.requirement_value;
            break;
          case 'games_played':
            shouldUnlock = (scores?.length || 0) >= achievement.requirement_value;
            break;
          case 'streak':
            shouldUnlock = (wallet?.current_streak || 0) >= achievement.requirement_value;
            break;
          case 'duel_wins':
            shouldUnlock = (duelsWon?.length || 0) >= achievement.requirement_value;
            break;
        }

        if (shouldUnlock) {
          // Insert achievement
          const { error: insertError } = await supabase
            .from('user_achievements')
            .insert({
              user_id: user.id,
              achievement_id: achievement.id
            });

          if (!insertError) {
            newlyUnlocked.push(achievement);
            unlockedIds.add(achievement.id);
          }
        }
      }

      // Show toast for newly unlocked achievements
      if (newlyUnlocked.length > 0) {
        for (const achievement of newlyUnlocked) {
          toast({
            title: "🏆 Achievement Unlocked!",
            description: `${achievement.name}: ${achievement.description}`,
          });
        }
        // Refresh user achievements
        await fetchUserAchievements();
      }

      return newlyUnlocked;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }, [user, achievements, toast, fetchUserAchievements]);

  // Initial fetch
  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  useEffect(() => {
    if (user) {
      fetchUserAchievements();
    }
  }, [user, fetchUserAchievements]);

  return {
    achievements,
    userAchievements,
    loading,
    checkAndAwardAchievements,
    fetchUserAchievements,
    fetchAchievements
  };
}
