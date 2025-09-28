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
  const [page, setPage] = useState(1); 
  const [pageLength, setPageLength] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  useEffect(() => {
    fetchLeaderboard();
  }, [page, pageLength]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // get total
      const { count } = await supabase
        .from('scores')
        .select('id', { count: 'exact', head: true });
      setTotalCount(count || 0);

      // Pagination logic
      const from = (page - 1) * pageLength;
      const to = from + pageLength - 1;

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
        .range(from, to);

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
 const totalPages = Math.ceil(totalCount / pageLength); 
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
        {/* Page Length Picker */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2 bg-muted/40 px-3 py-2 rounded-lg shadow-sm">
            <label className="font-medium text-muted-foreground" htmlFor="page-length-picker">
              Page Length:
            </label>
            <select
              id="page-length-picker"
              className="border border-border bg-background rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary transition"
              value={pageLength}
              onChange={e => {
                setPageLength(Number(e.target.value));
                setPage(1);
              }}
            >
              {[5, 10, 20, 30, 40, 50].map(len => (
                <option key={len} value={len}>{len}</option>
              ))}
            </select>
          </div>
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
                  const rank = (page - 1) * pageLength + index + 1; // update rank calculation
                  const displayName = score.profiles?.display_name || 'Anonymous';

                  // Only show trophies for top 3 on the first page
                  const showTrophy = page === 1 && rank <= 3;

                  return (
                    <div
                      key={score.id}
                      className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                        showTrophy ? 'bg-accent/20' : 'bg-muted/20 hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {showTrophy ? getRankIcon(rank) : (
                          <span className="w-6 h-6 flex items-center justify-center font-bold text-muted-foreground">{rank}</span>
                        )}
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
           {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageLength + 1}
                {' - '}
                {Math.min(page * pageLength, totalCount)} of {totalCount}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>

        
        
      </div>
    </div>
  );
}