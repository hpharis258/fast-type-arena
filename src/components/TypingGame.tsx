import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';
import { AuthDialog } from '@/components/AuthDialog';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Trophy, LogOut, Settings, BarChart3, Users, Zap, User, Info, Coins, ShoppingBag, FileText, Upload, Heart, Clock } from 'lucide-react';
import RacingAnimation from '@/components/RacingAnimation';
import { useWallet } from '@/hooks/useWallet';
import SAMPLE_TEXTS from '@/dataset/dataset';
import { LockedPreviewBar } from '@/components/LockedPreviewBar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface GameStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
}

interface BestScore {
  wpm: number;
  accuracy: number;
  correct_chars: number;
  total_chars: number;
}

type GameMode = 'classic' | 'ghost' | 'custom';
type TimeMode = 15 | 30 | 60;



export default function TypingGame() {
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [timeMode, setTimeMode] = useState<TimeMode>(30);
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [customText, setCustomText] = useState('');
  const [customTextDialogOpen, setCustomTextDialogOpen] = useState(false);
  const [customTextInput, setCustomTextInput] = useState('');
  const [stats, setStats] = useState<GameStats>({
    wpm: 0,
    accuracy: 100,
    correctChars: 0,
    incorrectChars: 0,
    totalChars: 0
  });
  const [cumulativeStats, setCumulativeStats] = useState({
    totalCorrectChars: 0,
    totalIncorrectChars: 0,
    totalChars: 0
  });
  const [startTime, setStartTime] = useState<number | null>(null);
  const [savingScore, setSavingScore] = useState(false);
  const [bestScore, setBestScore] = useState<BestScore | null>(null);
  const [ghostProgress, setGhostProgress] = useState(0);
  const [userProgress, setUserProgress] = useState(0);
  const [myIcon, setMyIcon] = useState<string>('default');
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { wallet, awardDailyCoins } = useWallet();

  // Fetch user's best score for ghost racing
  const fetchBestScore = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('wpm, accuracy, correct_chars, total_chars')
        .eq('user_id', user.id)
        .order('wpm', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching best score:', error);
        return;
      }

      if (data) {
        setBestScore(data);
      }
      
      // Also fetch user's icon
      const { data: profile } = await supabase
        .from('profiles')
        .select('player_icon')
        .eq('user_id', user.id)
        .single();
      
      setMyIcon(profile?.player_icon || 'default');
    } catch (error) {
      console.error('Error:', error);
    }
  }, [user]);

  // Generate random text
  const generateText = useCallback(() => {
    if (gameMode === 'custom' && customText) {
      setCurrentText(customText);
    } else {
      const randomIndex = Math.floor(Math.random() * SAMPLE_TEXTS.length);
      setCurrentText(SAMPLE_TEXTS[randomIndex]);
    }
  }, [gameMode, customText]);

  // Handle custom text file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - only allow .txt files
    const validExtensions = ['.txt'];
    const fileName = file.name.toLowerCase();
    const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    // Also check MIME type
    const isValidMimeType = file.type === 'text/plain' || file.type === '';

    if (!isValidExtension || !isValidMimeType) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt file only.",
        variant: "destructive"
      });
      e.target.value = ''; // Reset input
      return;
    }

    // Check file size (max 100KB to prevent abuse)
    if (file.size > 100 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a text file smaller than 100KB.",
        variant: "destructive"
      });
      e.target.value = ''; // Reset input
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text && text.trim().length > 0) {
        setCustomTextInput(text.trim());
      } else {
        toast({
          title: "Empty file",
          description: "The uploaded file is empty.",
          variant: "destructive"
        });
      }
    };
    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "There was an error reading the file.",
        variant: "destructive"
      });
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // Handle custom text submission
  const handleCustomTextSubmit = () => {
    if (!customTextInput.trim()) {
      toast({
        title: "No text provided",
        description: "Please paste or upload some text.",
        variant: "destructive"
      });
      return;
    }

    if (customTextInput.trim().length < 50) {
      toast({
        title: "Text too short",
        description: "Please provide at least 50 characters.",
        variant: "destructive"
      });
      return;
    }

    setCustomText(customTextInput.trim());
    setCurrentText(customTextInput.trim());
    setCustomTextDialogOpen(false);
    toast({
      title: "Custom text loaded!",
      description: "Start typing to begin the race with your custom text."
    });
  };

  // Calculate stats using cumulative data
  const calculateStats = useCallback((input: string, elapsed: number, cumulative: any) => {
    const currentCorrectChars = input.split('').filter((char, index) => 
      char === currentText[index]
    ).length;
    
    const currentIncorrectChars = input.length - currentCorrectChars;
    
    const totalCorrectChars = cumulative.totalCorrectChars + currentCorrectChars;
    const totalIncorrectChars = cumulative.totalIncorrectChars + currentIncorrectChars;
    const totalChars = totalCorrectChars + totalIncorrectChars;
    
    const accuracy = totalChars > 0 ? (totalCorrectChars / totalChars) * 100 : 100;
    
    // WPM calculation (assuming average word length of 5 characters)
    const minutes = elapsed / 60;
    const wpm = minutes > 0 ? Math.round((totalCorrectChars / 5) / minutes) : 0;
    
    return {
      wpm,
      accuracy: Math.round(accuracy),
      correctChars: totalCorrectChars,
      incorrectChars: totalIncorrectChars,
      totalChars
    };
  }, [currentText]);

  // Calculate progress for racing animation
  const calculateProgress = useCallback((correctChars: number, elapsed: number) => {
    // User progress based on current performance
    const userProgressPercent = Math.min(100, (correctChars / (currentText.length || 1)) * 100);
    setUserProgress(userProgressPercent);

    // Ghost progress based on best score performance
    if (gameMode === 'ghost' && bestScore && elapsed > 0) {
      const ghostExpectedChars = (bestScore.correct_chars / timeMode) * elapsed;
      const ghostProgressPercent = Math.min(100, (ghostExpectedChars / (currentText.length || 1)) * 100);
      setGhostProgress(ghostProgressPercent);
    }
  }, [currentText.length, gameMode, bestScore, timeMode]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Start game on first keystroke
    if (gameState === 'waiting' && value.length === 1) {
      setGameState('playing');
      setStartTime(Date.now());
    }
    
    // Prevent typing beyond text length
    if (value.length <= currentText.length) {
      setUserInput(value);
      
      if (startTime) {
        const elapsed = (Date.now() - startTime) / 1000;
        const newStats = calculateStats(value, elapsed, cumulativeStats);
        setStats(newStats);
        
        // Update progress for racing animation
        const currentCorrectChars = value.split('').filter((char, index) => 
          char === currentText[index]
        ).length;
        calculateProgress(cumulativeStats.totalCorrectChars + currentCorrectChars, elapsed);
      }
      
      // Auto-progress to new text when current text is completed
      if (value.length === currentText.length && gameState === 'playing') {
        // Update cumulative stats
        const currentCorrectChars = value.split('').filter((char, index) => 
          char === currentText[index]
        ).length;
        const currentIncorrectChars = value.length - currentCorrectChars;
        
        setCumulativeStats(prev => ({
          totalCorrectChars: prev.totalCorrectChars + currentCorrectChars,
          totalIncorrectChars: prev.totalIncorrectChars + currentIncorrectChars,
          totalChars: prev.totalChars + value.length
        }));
        
        setTimeout(() => {
          generateText();
          setUserInput('');
        }, 500);
      }
    }
  };

  // Save score to database
  const saveScore = useCallback(async (gameStats: GameStats) => {
    if (!user) return;
    
    setSavingScore(true);
    try {
      const { error } = await supabase
        .from('scores')
        .insert({
          user_id: user.id,
          wpm: gameStats.wpm,
          accuracy: gameStats.accuracy,
          correct_chars: gameStats.correctChars,
          incorrect_chars: gameStats.incorrectChars,
          total_chars: gameStats.totalChars,
          duration: timeMode
        });

      if (error) {
        console.error('Error saving score:', error);
        toast({
          title: "Error saving score",
          description: "There was an issue saving your score. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Score saved!",
          description: `Your score of ${gameStats.wpm} WPM has been saved to the leaderboard.`
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSavingScore(false);
    }
  }, [user, toast]);

  // Game timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [gameState]);

  // Save score and award coins when game finishes
  useEffect(() => {
    if (gameState === 'finished' && user && stats.totalChars > 0) {
      saveScore(stats);
      awardDailyCoins();
    }
  }, [gameState, user, stats, saveScore, awardDailyCoins]);

  // Initialize game
  useEffect(() => {
    generateText();
    if (user) {
      fetchBestScore();
    }
  }, [generateText, fetchBestScore, user]);

  // Focus input when game starts
  useEffect(() => {
    if (gameState === 'waiting' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState]);

  // Reset game
  const resetGame = () => {
    setGameState('waiting');
    setUserInput('');
    setTimeLeft(timeMode);
    setStartTime(null);
    setSavingScore(false);
    setUserProgress(0);
    setGhostProgress(0);
    setStats({
      wpm: 0,
      accuracy: 100,
      correctChars: 0,
      incorrectChars: 0,
      totalChars: 0
    });
    setCumulativeStats({
      totalCorrectChars: 0,
      totalIncorrectChars: 0,
      totalChars: 0
    });
    generateText();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Handle time mode change
  const handleTimeModeChange = (newTimeMode: TimeMode) => {
    setTimeMode(newTimeMode);
    setTimeLeft(newTimeMode);
    setGameState('waiting');
    setUserInput('');
    setStartTime(null);
    setUserProgress(0);
    setGhostProgress(0);
    setStats({
      wpm: 0,
      accuracy: 100,
      correctChars: 0,
      incorrectChars: 0,
      totalChars: 0
    });
    setCumulativeStats({
      totalCorrectChars: 0,
      totalIncorrectChars: 0,
      totalChars: 0
    });
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  // Render text with highlighting
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
            <h2 className="text-3xl font-bold mb-6">Game Complete!</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="stat-card">
                <div className="text-2xl font-bold text-primary">{stats.wpm}</div>
                <div className="text-sm text-muted-foreground">WPM</div>
              </div>
              <div className="stat-card">
                <div className="text-2xl font-bold text-accent">{stats.accuracy}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="stat-card">
                <div className="text-2xl font-bold text-green-400">{stats.correctChars}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="stat-card">
                <div className="text-2xl font-bold text-destructive">{stats.incorrectChars}</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-4 justify-center">
                <Button onClick={resetGame} className="btn-game">
                  Play Again
                </Button>
                <Button onClick={() => navigate('/leaderboard')} variant="secondary">
                  <Trophy className="w-4 h-4 mr-2" />
                  Leaderboard
                </Button>
              </div>
              
              {savingScore && (
                <p className="text-primary">Saving your score...</p>
              )}
              
              {user ? (
                <p className="text-muted-foreground">
                  Score saved to leaderboard! Playing as {user.email}
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    Playing as guest - sign up to save your scores!
                  </p>
                  <AuthDialog>
                    <Button variant="outline" size="sm">
                      Sign Up to Save Scores
                    </Button>
                  </AuthDialog>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between"> {/* Modified this line */}
            <h1 
              className="text-2xl font-bold cursor-pointer hover:text-primary transition-colors"
              onClick={() => navigate('/')}
            >
              TypeRacingGame
            </h1>
            
            <div className="flex items-center gap-2"> {/* Added items-center */}
              {!user && (
                <Button onClick={() => navigate('/about')} variant="ghost">
                  <Info className="w-4 h-4 mr-2" />
                  About
                </Button>
              )}
              <Button onClick={() => navigate('/support')} variant="ghost">
                <Heart className="w-4 h-4 mr-2" />
                Support
              </Button>
              <Button onClick={() => navigate('/leaderboard')} variant="ghost">
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </Button>
              {!user && <LockedPreviewBar />}
              

              {user && (
                <Button onClick={() => navigate('/friends')} variant="ghost">
                  <Users className="w-4 h-4 mr-2" />
                  Friends
                </Button>
              )}
            </div>
            
            <div className="flex gap-2 items-center">
              {user && wallet && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg cursor-help">
                      <Coins className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{wallet.coins}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Type Coins - Current streak: {wallet.current_streak} days</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {user ? (
                <>
                  <Button onClick={() => navigate('/stats')} variant="ghost">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Stats
                  </Button>
                  <Button onClick={() => navigate('/shop')} variant="ghost">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Shop
                  </Button>
                  <Button onClick={() => navigate('/settings')} variant="ghost">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                  <Button onClick={handleSignOut} variant="ghost">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <AuthDialog>
                  <Button variant="ghost">
                    Login
                  </Button>
                </AuthDialog>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Game Mode Selection */}
        <div className="w-full max-w-4xl mb-6">
          <div className="flex justify-center space-x-4 mb-4">
            <Button
              onClick={() => setGameMode('classic')}
              variant={gameMode === 'classic' ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Classic Mode
            </Button>
            <Button
              onClick={() => {
                setGameMode('ghost');
                if (user) fetchBestScore();
              }}
              variant={gameMode === 'ghost' ? 'default' : 'outline'}
              className="flex items-center gap-2"
              disabled={!user || !bestScore}
            >
              <User className="w-4 h-4" />
              Ghost Racing
              {!user && ' (Login Required)'}
              {user && !bestScore && ' (Play Classic First)'}
            </Button>
            <Button
              onClick={() => {
                setGameMode('custom');
                setCustomTextDialogOpen(true);
              }}
              variant={gameMode === 'custom' ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Custom Text
            </Button>
          </div>
          
          {/* Time Mode Selection */}
          <div className="flex justify-center space-x-3">
            <Button
              onClick={() => handleTimeModeChange(15)}
              variant={timeMode === 15 ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              15s
            </Button>
            <Button
              onClick={() => handleTimeModeChange(30)}
              variant={timeMode === 30 ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              30s
            </Button>
            <Button
              onClick={() => handleTimeModeChange(60)}
              variant={timeMode === 60 ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              60s
            </Button>
          </div>
          
          {gameMode === 'ghost' && bestScore && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              Racing against your best: {bestScore.wpm} WPM ({bestScore.accuracy}% accuracy)
            </p>
          )}
          {gameMode === 'custom' && customText && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              Using custom text ({customText.length} characters)
            </p>
          )}
        </div>

        {/* Custom Text Dialog */}
        <Dialog open={customTextDialogOpen} onOpenChange={setCustomTextDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Custom Text</DialogTitle>
              <DialogDescription>
                Paste your text below or upload a .txt file to practice typing with custom content.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="custom-text">Paste Text (minimum 50 characters)</Label>
                <Textarea
                  id="custom-text"
                  placeholder="Paste your custom text here..."
                  value={customTextInput}
                  onChange={(e) => setCustomTextInput(e.target.value)}
                  className="min-h-[200px] mt-2"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 border-t" />
                <span className="text-sm text-muted-foreground">OR</span>
                <div className="flex-1 border-t" />
              </div>
              <div>
                <Label htmlFor="file-upload">Upload Text File (.txt only)</Label>
                <div className="mt-2">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".txt,text/plain"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Text File
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setCustomTextDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCustomTextSubmit}>
                  Use This Text
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Game Title and Status */}
        <div className="w-full max-w-4xl mb-8 text-center">
          <p className="text-muted-foreground mb-4">
            {gameState === 'waiting' 
              ? (gameMode === 'ghost' 
                  ? 'Start typing to race your ghost!' 
                  : gameMode === 'custom' 
                    ? (customText ? 'Start typing your custom text!' : 'Click "Custom Text" to add your text first!')
                    : 'Start typing to begin the race!')
              : (gameMode === 'ghost' 
                  ? 'Race against your best performance!' 
                  : gameMode === 'custom'
                    ? 'Type your custom text as fast as you can!'
                    : 'Type as fast and accurately as you can!')
            }
          </p>
        </div>

        {/* Racing Animation for Ghost Mode */}
        {gameMode === 'ghost' && gameState === 'playing' && (
          <div className="w-full max-w-4xl mb-6">
            <RacingAnimation
              player1Progress={userProgress}
              player2Progress={ghostProgress}
              player1Name="You"
              player2Name={`Ghost (${bestScore?.wpm} WPM)`}
              player1Icon={myIcon}
              player2Icon={myIcon}
            />
          </div>
        )}

      {/* Stats Bar */}
      <div className="w-full max-w-4xl mb-6">
        <div className="flex justify-center space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.wpm}</div>
            <div className="text-sm text-muted-foreground">WPM</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{stats.accuracy}%</div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{timeLeft}s</div>
            <div className="text-sm text-muted-foreground">Time</div>
          </div>
        </div>
      </div>

        {/* Game Area */}
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
              disabled={gameState !== 'waiting' && gameState !== 'playing'}
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

        {/* Controls */}
        <div className="mt-6 flex space-x-4">
          <Button onClick={resetGame} variant="secondary" className="btn-secondary">
            Reset
          </Button>
          <Button onClick={generateText} variant="secondary" className="btn-secondary">
            New Text
          </Button>
        </div>
      </div>
    </div>
  );
}