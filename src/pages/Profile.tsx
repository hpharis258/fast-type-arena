import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Target, Zap, BarChart3, Clock, Share2, Trophy, User } from 'lucide-react';
import { StatsChart } from '@/components/StatsChart';
import { useToast } from '@/hooks/use-toast';

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
  totalTimeSpent: number;
}

interface UserProfile {
  display_name: string | null;
  player_icon: string | null;
}

export default function Profile() {
  const [scores, setScores] = useState<UserScore[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }
    fetchUserProfile();
  }, [userId, navigate]);

  const fetchUserProfile = async () => {
    if (!userId) return;

    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('display_name, player_icon')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast({
          title: "Profile not found",
          description: "This user profile doesn't exist.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setProfile(profileData);

      // Fetch scores
      const { data, error } = await supabase
        .from('scores')
        .select('id, wpm, accuracy, created_at, duration')
        .eq('user_id', userId)
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

  const shareToTwitter = () => {
    const text = `Check out my typing stats! 🎯\n${stats?.fastestWPM} WPM fastest | ${stats?.averageAccuracy}% avg accuracy | ${stats?.totalGames} games played`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareToFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareToLinkedIn = () => {
    const url = window.location.href;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Profile link copied to clipboard",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading profile...</div>
          <div className="text-muted-foreground">Please wait while we load the stats</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/')} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <User className="w-8 h-8" />
                {profile?.display_name || 'Anonymous Typer'}
              </h1>
              <p className="text-muted-foreground mt-1">Public Typing Profile</p>
            </div>
          </div>
          
          {/* Share Buttons */}
          <div className="flex gap-2">
            <Button onClick={shareToTwitter} size="sm" variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Twitter
            </Button>
            <Button onClick={shareToFacebook} size="sm" variant="outline">
              Facebook
            </Button>
            <Button onClick={shareToLinkedIn} size="sm" variant="outline">
              LinkedIn
            </Button>
            <Button onClick={copyLink} size="sm" variant="default">
              Copy Link
            </Button>
          </div>
        </div>

        {!stats ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">No Games Played Yet</h2>
              <p className="text-muted-foreground">
                This user hasn't played any games yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Highlight Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fastest Speed</CardTitle>
                  <Zap className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-primary">{stats.fastestWPM}</div>
                  <p className="text-xs text-muted-foreground mt-1">Words Per Minute</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
                  <Target className="h-5 w-5 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-accent">{stats.averageAccuracy}%</div>
                  <p className="text-xs text-muted-foreground mt-1">Typing Accuracy</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Games Played</CardTitle>
                  <Trophy className="h-5 w-5 text-secondary-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{stats.totalGames}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total Games</p>
                </CardContent>
              </Card>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Speed</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageWPM} WPM</div>
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
                  <div className="text-2xl font-bold">{stats.bestAccuracy}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Time Spent Typing</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
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
