import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Target, Zap, BarChart3, Clock } from 'lucide-react';
import { StatsChart } from '@/components/StatsChart';

interface UserScore {
  id: string;
  wpm: number;
  accuracy: number;
  created_at: string;
  duration?: number;
}

interface UserStats {
  totalGames: number;
  fastestWPM: number;
  averageWPM: number;
  slowestWPM: number;
  averageAccuracy: number;
  bestAccuracy: number;
  totalTimeSpent: number; // in seconds
}

export default function Stats() {
  const [scores, setScores] = useState<UserScore[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchUserStats();
  }, [user, navigate]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scores')
        .select('id, wpm, accuracy, created_at, duration')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching user stats:', error);
        return;
      }

      const userScores = data || [];
      setScores(userScores);

      if (userScores.length > 0) {
        const wpmValues = userScores.map(s => s.wpm);
        const accuracyValues = userScores.map(s => s.accuracy);
        const totalTimeSpent = userScores.reduce((sum, score) => sum + (score.duration || 30), 0);

        const calculatedStats: UserStats = {
          totalGames: userScores.length,
          fastestWPM: Math.max(...wpmValues),
          averageWPM: Math.round(wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length),
          slowestWPM: Math.min(...wpmValues),
          averageAccuracy: Math.round(accuracyValues.reduce((a, b) => a + b, 0) / accuracyValues.length),
          bestAccuracy: Math.max(...accuracyValues),
          totalTimeSpent
        };

        setStats(calculatedStats);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    return scores.map(score => ({
      date: score.created_at,
      wpm: score.wpm,
      accuracy: score.accuracy
    }));
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading your stats...</div>
          <div className="text-muted-foreground">Please wait while we analyze your progress</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={() => navigate('/')} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Game
          </Button>
          <h1 className="text-4xl font-bold">Your Statistics</h1>
        </div>

        {!stats ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">No Games Played Yet</h2>
              <p className="text-muted-foreground mb-4">
                Start playing to see your typing statistics and progress over time!
              </p>
              <Button onClick={() => navigate('/')}>
                Play Your First Game
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Games Played</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalGames}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fastest Speed</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.fastestWPM} WPM</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Speed</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{stats.averageWPM} WPM</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Slowest Speed</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-muted-foreground">{stats.slowestWPM} WPM</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Best Accuracy</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">{stats.bestAccuracy}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">{stats.averageAccuracy}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Time Spent Typing</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {Math.floor(stats.totalTimeSpent / 60)}m {stats.totalTimeSpent % 60}s
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <StatsChart data={getChartData()} />
              </CardContent>
            </Card>

            {/* Recent Games */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Games (Last 10)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scores.slice(-10).reverse().map((score) => (
                    <div
                      key={score.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                    >
                      <div className="text-sm text-muted-foreground">
                        {new Date(score.created_at).toLocaleDateString()} at{' '}
                        {new Date(score.created_at).toLocaleTimeString()}
                      </div>
                      <div className="flex gap-4">
                        <span className="font-semibold text-primary">{score.wpm} WPM</span>
                        <span className="font-semibold text-accent">{score.accuracy}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}