import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trophy, Clock, Zap, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthDialog } from '@/components/AuthDialog';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface DuelResult {
  id: string;
  created_at: string;
  finished_at: string;
  winner_id: string | null;
  opponent_id: string;
  opponent_name: string;
  my_wpm: number;
  my_accuracy: number;
  opponent_wpm: number;
  opponent_accuracy: number;
}

export default function DuelResults() {
  const [results, setResults] = useState<DuelResult[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchDuelResults = async () => {
      try {
        // Fetch all finished duels where user participated
        const { data: duels, error: duelsError } = await supabase
          .from('duels')
          .select('*')
          .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
          .eq('status', 'finished')
          .order('finished_at', { ascending: false });

        if (duelsError) throw duelsError;

        if (!duels || duels.length === 0) {
          setResults([]);
          setLoading(false);
          return;
        }

        // Get all participant IDs (opponents)
        const opponentIds = duels.map(d => 
          d.player1_id === user.id ? d.player2_id : d.player1_id
        );

        // Fetch opponent profiles
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', opponentIds);

        // Fetch all duel progress for these duels
        const duelIds = duels.map(d => d.id);
        const { data: progress } = await supabase
          .from('duel_progress')
          .select('*')
          .in('duel_id', duelIds);

        // Combine all data
        const resultsData: DuelResult[] = duels.map(duel => {
          const opponentId = duel.player1_id === user.id ? duel.player2_id : duel.player1_id;
          const opponentProfile = profiles?.find(p => p.user_id === opponentId);
          
          const myProgress = progress?.find(p => 
            p.duel_id === duel.id && p.user_id === user.id
          );
          const opponentProgress = progress?.find(p => 
            p.duel_id === duel.id && p.user_id === opponentId
          );

          return {
            id: duel.id,
            created_at: duel.created_at,
            finished_at: duel.finished_at,
            winner_id: duel.winner_id,
            opponent_id: opponentId,
            opponent_name: opponentProfile?.display_name || 'Unknown',
            my_wpm: myProgress?.wpm || 0,
            my_accuracy: myProgress?.accuracy || 0,
            opponent_wpm: opponentProgress?.wpm || 0,
            opponent_accuracy: opponentProgress?.accuracy || 0,
          };
        });

        setResults(resultsData);
      } catch (error) {
        console.error('Error fetching duel results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDuelResults();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Sign in required</h2>
          <p className="text-muted-foreground">You need to sign in to view your duel results.</p>
          <div className="space-x-4">
            <AuthDialog>
              <Button>Sign In</Button>
            </AuthDialog>
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Game
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button onClick={() => navigate('/friends')} variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Friends
            </Button>
            <h1 className="text-2xl font-bold">Duel Results</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading your duel history...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">No duels completed yet</h2>
              <p className="text-muted-foreground mb-6">
                Challenge your friends to a duel and your results will appear here!
              </p>
              <Button onClick={() => navigate('/friends')}>
                Go to Friends
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">
                  Total Duels: {results.length}
                </h2>
                <div className="text-sm text-muted-foreground">
                  Wins: {results.filter(r => r.winner_id === user.id).length} | 
                  Losses: {results.filter(r => r.winner_id !== user.id && r.winner_id !== null).length}
                </div>
              </div>

              {results.map((result) => {
                const isWinner = result.winner_id === user.id;
                const isDraw = result.winner_id === null;

                return (
                  <Card key={result.id} className={`${
                    isWinner ? 'border-green-500/50 bg-green-500/5' : 
                    isDraw ? 'border-yellow-500/50 bg-yellow-500/5' : 
                    'border-red-500/50 bg-red-500/5'
                  }`}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isWinner && <Trophy className="w-5 h-5 text-green-500" />}
                          <span className="text-lg">
                            vs {result.opponent_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-normal">
                          <Clock className="w-4 h-4" />
                          {formatDistanceToNow(new Date(result.finished_at), { addSuffix: true })}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Your Stats */}
                        <div className={`p-4 rounded-lg ${
                          isWinner ? 'bg-green-500/10 border border-green-500/30' : 'bg-muted'
                        }`}>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            You
                            {isWinner && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">Winner</span>}
                          </h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-primary" />
                                <span className="text-sm">WPM</span>
                              </div>
                              <span className="font-bold text-lg">{result.my_wpm}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-primary" />
                                <span className="text-sm">Accuracy</span>
                              </div>
                              <span className="font-bold text-lg">{result.my_accuracy}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Opponent Stats */}
                        <div className={`p-4 rounded-lg ${
                          !isWinner && !isDraw ? 'bg-red-500/10 border border-red-500/30' : 'bg-muted'
                        }`}>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            {result.opponent_name}
                            {!isWinner && !isDraw && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">Winner</span>}
                          </h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-accent" />
                                <span className="text-sm">WPM</span>
                              </div>
                              <span className="font-bold text-lg">{result.opponent_wpm}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-accent" />
                                <span className="text-sm">Accuracy</span>
                              </div>
                              <span className="font-bold text-lg">{result.opponent_accuracy}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
