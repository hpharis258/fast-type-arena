import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Users } from 'lucide-react';
import RacingAnimation from './RacingAnimation';

interface DuelStats {
  wpm: number;
  accuracy: number;
  progress: number;
  finished: boolean;
}

interface DuelRoomProps {
  duelId: string;
  onExit: () => void;
}

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "Programming is not about what you know; it's about what you can figure out.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Innovation distinguishes between a leader and a follower.",
  "The only way to do great work is to love what you do.",
];

export default function DuelRoom({ duelId, onExit }: DuelRoomProps) {
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'countdown' | 'playing' | 'finished'>('waiting');
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [myStats, setMyStats] = useState<DuelStats>({
    wpm: 0,
    accuracy: 100,
    progress: 0,
    finished: false
  });
  const [opponentStats, setOpponentStats] = useState<DuelStats>({
    wpm: 0,
    accuracy: 100,
    progress: 0,
    finished: false
  });
  const [opponentName, setOpponentName] = useState('');
  const [winner, setWinner] = useState<string | null>(null);
  const [isOpponentOnline, setIsOpponentOnline] = useState(false);
  const [bothReady, setBothReady] = useState(false);
  const [myReady, setMyReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize game and presence
  useEffect(() => {
    const randomText = SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
    setCurrentText(randomText);
    
    checkDuelStatus();
    loadOpponentInfo();

    // Set up presence channel
    const presenceChannel = supabase
      .channel(`duel-presence-${duelId}`, {
        config: {
          presence: {
            key: user?.id
          }
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const onlineUsers = Object.keys(state);
        
        // Check if both players are online
        setIsOpponentOnline(onlineUsers.length >= 2);
        
        // Check ready status
        const presences = Object.values(state).flat() as any[];
        const myPresence = presences.find((p: any) => p.user_id === user?.id);
        const opponentPresence = presences.find((p: any) => p.user_id !== user?.id);
        
        if (myPresence) setMyReady(myPresence.ready || false);
        if (opponentPresence) setOpponentReady(opponentPresence.ready || false);
        
        // Start game if both ready
        if (myPresence?.ready && opponentPresence?.ready && gameState === 'ready') {
          setBothReady(true);
          startCountdown();
        }
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        console.log('Player joined:', key);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        console.log('Player left:', key);
        if (gameState !== 'finished') {
          toast({
            title: "Opponent left",
            description: "Your opponent has disconnected.",
            variant: "destructive"
          });
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user?.id,
            ready: false,
            online_at: new Date().toISOString()
          });
        }
      });

    // Set up real-time subscription for duel progress
    const progressChannel = supabase
      .channel('duel-progress')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'duel_progress',
        filter: `duel_id=eq.${duelId}`
      }, (payload) => {
        handleDuelUpdate(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(progressChannel);
    };
  }, [duelId]);

  const checkDuelStatus = async () => {
    try {
      const { data: duelData, error } = await supabase
        .from('duels')
        .select('status')
        .eq('id', duelId)
        .single();

      if (error) throw error;

      if (duelData.status !== 'accepted') {
        toast({
          title: "Duel not ready",
          description: "Waiting for opponent to accept...",
          variant: "destructive"
        });
        onExit();
      }
    } catch (error) {
      console.error('Error checking duel status:', error);
    }
  };

  const loadOpponentInfo = async () => {
    try {
      const { data: duelData, error } = await supabase
        .from('duels')
        .select('player1_id, player2_id')
        .eq('id', duelId)
        .single();

      if (error) throw error;

      const opponentId = duelData.player1_id === user?.id ? duelData.player2_id : duelData.player1_id;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', opponentId)
        .single();

      setOpponentName(profile?.display_name || 'Anonymous');
    } catch (error) {
      console.error('Error loading opponent info:', error);
    }
  };

  const handleReady = async () => {
    const presenceChannel = supabase.channel(`duel-presence-${duelId}`);
    await presenceChannel.track({
      user_id: user?.id,
      ready: true,
      online_at: new Date().toISOString()
    });
    
    setMyReady(true);
    setGameState('ready');
    
    toast({
      title: "You're ready!",
      description: "Waiting for opponent..."
    });
  };

  const handleDuelUpdate = (payload: any) => {
    const progress = payload.new;
    if (progress.user_id !== user?.id) {
      setOpponentStats({
        wpm: progress.wpm,
        accuracy: progress.accuracy,
        progress: progress.progress,
        finished: progress.finished
      });
      
      if (progress.finished && !myStats.finished) {
        setWinner(opponentName);
        setGameState('finished');
      }
    }
  };

  const calculateStats = useCallback((input: string, elapsed: number) => {
    const correctChars = input.split('').filter((char, index) => 
      char === currentText[index]
    ).length;
    
    const accuracy = input.length > 0 ? (correctChars / input.length) * 100 : 100;
    const progress = (input.length / currentText.length) * 100;
    const minutes = elapsed / 60;
    const wpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;
    
    return { wpm, accuracy: Math.round(accuracy), progress, finished: progress >= 100 };
  }, [currentText]);

  const updateProgress = useCallback(async (stats: DuelStats) => {
    if (!user) return;

    try {
      await supabase
        .from('duel_progress')
        .upsert({
          duel_id: duelId,
          user_id: user.id,
          wpm: stats.wpm,
          accuracy: stats.accuracy,
          progress: stats.progress,
          finished: stats.finished
        });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }, [duelId, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (gameState !== 'playing') return;
    
    if (value.length <= currentText.length) {
      setUserInput(value);
      
      if (startTime) {
        const elapsed = (Date.now() - startTime) / 1000;
        const stats = calculateStats(value, elapsed);
        setMyStats(stats);
        updateProgress(stats);
        
        if (stats.finished && !opponentStats.finished) {
          setWinner('You');
          setGameState('finished');
          updateDuelWinner();
        }
      }
    }
  };

  const updateDuelWinner = async () => {
    try {
      await supabase
        .from('duels')
        .update({ 
          winner_id: user?.id,
          finished_at: new Date().toISOString(),
          status: 'finished'
        })
        .eq('id', duelId);
    } catch (error) {
      console.error('Error updating winner:', error);
    }
  };

  const startCountdown = () => {
    setGameState('countdown');
    let count = 3;
    
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      
      if (count <= 0) {
        clearInterval(countdownInterval);
        setGameState('playing');
        setStartTime(Date.now());
        inputRef.current?.focus();
      }
    }, 1000);
  };

  const renderText = () => {
    return currentText.split('').map((char, index) => {
      let className = 'char-untyped';
      
      if (index < userInput.length) {
        className = userInput[index] === char ? 'char-correct' : 'char-incorrect';
      } else if (index === userInput.length) {
        className = 'char-current';
      }
      
      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  if (gameState === 'finished') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-6">
              {winner === 'You' ? '🏆 You Won!' : `${winner} Wins!`}
            </h2>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Your Stats</h3>
                <div className="text-2xl font-bold text-primary">{myStats.wpm} WPM</div>
                <div className="text-lg">{myStats.accuracy}% Accuracy</div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{opponentName}</h3>
                <div className="text-2xl font-bold text-accent">{opponentStats.wpm} WPM</div>
                <div className="text-lg">{opponentStats.accuracy}% Accuracy</div>
              </div>
            </div>
            
            <Button onClick={onExit} className="btn-game">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Friends
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button onClick={onExit} variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold">Duel vs {opponentName}</h1>
            <div className="flex items-center gap-2">
              <Users className={`w-5 h-5 ${isOpponentOnline ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="text-sm">{isOpponentOnline ? 'Both Online' : 'Waiting...'}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl mb-6">
          <RacingAnimation
            player1Progress={myStats.progress}
            player2Progress={opponentStats.progress}
            player1Name="You"
            player2Name={opponentName}
          />
        </div>

        <div className="w-full max-w-4xl mb-6 text-center">
          {gameState === 'waiting' && (
            <div className="space-y-4">
              {!isOpponentOnline ? (
                <div className="space-y-2">
                  <p className="text-lg font-semibold">Waiting for opponent to join...</p>
                  <p className="text-sm text-muted-foreground">Both players must be online to start</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-lg font-semibold text-green-600">Both players online!</p>
                  <Button onClick={handleReady} className="btn-game" size="lg">
                    I'm Ready!
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {gameState === 'ready' && (
            <div className="space-y-4">
              <div className="flex justify-center gap-8">
                <div className={`text-center p-4 rounded-lg ${myReady ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  <p className="font-semibold">You</p>
                  <p className="text-sm">{myReady ? '✓ Ready' : 'Not Ready'}</p>
                </div>
                <div className={`text-center p-4 rounded-lg ${opponentReady ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  <p className="font-semibold">{opponentName}</p>
                  <p className="text-sm">{opponentReady ? '✓ Ready' : 'Not Ready'}</p>
                </div>
              </div>
              {!bothReady && (
                <p className="text-muted-foreground">Waiting for both players to be ready...</p>
              )}
            </div>
          )}
          
          {gameState === 'countdown' && (
            <div className="text-6xl font-bold text-primary animate-pulse">
              {countdown > 0 ? countdown : 'GO!'}
            </div>
          )}
          
          {gameState === 'playing' && (
            <div className="flex justify-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{myStats.wpm}</div>
                <div className="text-sm text-muted-foreground">Your WPM</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{opponentStats.wpm}</div>
                <div className="text-sm text-muted-foreground">{opponentName} WPM</div>
              </div>
            </div>
          )}
        </div>

        {gameState === 'playing' && (
          <Card className="w-full max-w-4xl bg-game-bg cursor-text" onClick={() => inputRef.current?.focus()}>
            <CardContent className="p-8 relative">
              <div className="game-text mb-6 text-center leading-loose">
                {renderText()}
              </div>
              
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                className="absolute inset-0 opacity-0 pointer-events-none caret-transparent"
                style={{ 
                  caretColor: 'transparent',
                  position: 'fixed',
                  top: '-9999px',
                  left: '-9999px',
                  width: '1px',
                  height: '1px'
                }}
                autoComplete="off"
                spellCheck={false}
                autoFocus
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
