import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  wpm: number;
  accuracy: number;
  correct_chars: number;
  incorrect_chars: number;
  total_chars: number;
  created_at: string;
  profiles: {
    display_name: string | null;
  } | null;
}

export default function Leaderboard() {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select(`
          id,
          wpm,
          accuracy,
          correct_chars,
          incorrect_chars,
          total_chars,
          created_at,
          user_id,
          profiles!scores_user_id_fkey (
            display_name
          )
        `)
        .order('wpm', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return;
      }

      setScores(data as LeaderboardEntry[] || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-bold text-muted-foreground">{rank}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading leaderboard...</div>
          <div className="text-muted-foreground">Please wait while we fetch the scores</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground mb-4">Top typing champions</p>
          <Button onClick={() => navigate('/')} variant="secondary">
            Back to Game
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Top Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scores.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No scores yet. Be the first to play!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {scores.map((score, index) => {
                  const rank = index + 1;
                  const displayName = score.profiles?.display_name || 'Anonymous';
                  
                  return (
                    <div
                      key={score.id}
                      className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                        rank <= 3 ? 'bg-accent/20' : 'bg-muted/20 hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {getRankIcon(rank)}
                        <div>
                          <div className="font-semibold">{displayName}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(score.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-6 text-right">
                        <div>
                          <div className="text-2xl font-bold text-primary">{score.wpm}</div>
                          <div className="text-xs text-muted-foreground">WPM</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-accent">{score.accuracy}%</div>
                          <div className="text-xs text-muted-foreground">Accuracy</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-green-400">{score.correct_chars}</div>
                          <div className="text-xs text-muted-foreground">Correct</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}