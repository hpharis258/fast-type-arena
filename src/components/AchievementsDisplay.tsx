import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AchievementBadge } from '@/components/AchievementBadge';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Zap, Target, Flame, Swords, Award } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  badge_color: string;
}

interface UserAchievement {
  achievement_id: string;
  unlocked_at: string;
}

interface AchievementsDisplayProps {
  userId: string;
  compact?: boolean;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  speed: Zap,
  accuracy: Target,
  dedication: Award,
  streak: Flame,
  duels: Swords,
};

const categoryLabels: Record<string, string> = {
  speed: 'Speed',
  accuracy: 'Accuracy',
  dedication: 'Dedication',
  streak: 'Streak',
  duels: 'Duels',
};

export function AchievementsDisplay({ userId, compact = false }: AchievementsDisplayProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      // Fetch all achievements
      const { data: allAchievements, error: achError } = await supabase
        .from('achievements')
        .select('*')
        .order('requirement_value', { ascending: true });

      if (achError) throw achError;

      // Fetch user's unlocked achievements
      const { data: userAch, error: userAchError } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', userId);

      if (userAchError) throw userAchError;

      setAchievements(allAchievements || []);
      setUserAchievements(userAch || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const unlockedMap = new Map(
    userAchievements.map(ua => [ua.achievement_id, ua.unlocked_at])
  );

  const categories = [...new Set(achievements.map(a => a.category))];
  const unlockedCount = userAchievements.length;
  const totalCount = achievements.length;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    // Show only unlocked achievements in a horizontal scroll
    const unlockedAchievements = achievements.filter(a => unlockedMap.has(a.id));
    
    if (unlockedAchievements.length === 0) {
      return null;
    }

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Achievements ({unlockedCount}/{totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {unlockedAchievements.map(achievement => (
              <AchievementBadge
                key={achievement.id}
                name={achievement.name}
                description={achievement.description}
                icon={achievement.icon}
                badgeColor={achievement.badge_color}
                unlocked={true}
                unlockedAt={unlockedMap.get(achievement.id)}
                size="sm"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Achievements
          </div>
          <span className="text-sm font-normal text-muted-foreground">
            {unlockedCount} / {totalCount} Unlocked
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={categories[0]} className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 mb-4">
            {categories.map(category => {
              const CategoryIcon = categoryIcons[category] || Trophy;
              const categoryAchievements = achievements.filter(a => a.category === category);
              const categoryUnlocked = categoryAchievements.filter(a => unlockedMap.has(a.id)).length;
              
              return (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="flex items-center gap-1 text-xs"
                >
                  <CategoryIcon className="w-3 h-3" />
                  {categoryLabels[category] || category}
                  <span className="text-muted-foreground">
                    ({categoryUnlocked}/{categoryAchievements.length})
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {categories.map(category => {
            const categoryAchievements = achievements.filter(a => a.category === category);
            
            return (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {categoryAchievements.map(achievement => {
                    const isUnlocked = unlockedMap.has(achievement.id);
                    const unlockedAt = unlockedMap.get(achievement.id);
                    
                    return (
                      <div
                        key={achievement.id}
                        className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        <AchievementBadge
                          name={achievement.name}
                          description={achievement.description}
                          icon={achievement.icon}
                          badgeColor={achievement.badge_color}
                          unlocked={isUnlocked}
                          unlockedAt={unlockedAt}
                          size="lg"
                        />
                        <div className="text-center">
                          <p className="text-sm font-medium truncate max-w-[100px]">
                            {achievement.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {achievement.requirement_value}
                            {achievement.requirement_type === 'wpm' && ' WPM'}
                            {achievement.requirement_type === 'accuracy' && '%'}
                            {achievement.requirement_type === 'games_played' && ' games'}
                            {achievement.requirement_type === 'streak' && ' days'}
                            {achievement.requirement_type === 'duel_wins' && ' wins'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
