import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface GameStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
}

const GAME_DURATION = 30; // seconds

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once.",
  "Programming is not about what you know; it's about what you can figure out. The best way to learn is by doing.",
  "In the digital age, typing speed has become an essential skill for productivity and communication in our daily lives.",
  "Technology advances rapidly, changing how we work, communicate, and interact with the world around us every day.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts in the journey of life."
];

export default function TypingGame() {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [stats, setStats] = useState<GameStats>({
    wpm: 0,
    accuracy: 100,
    correctChars: 0,
    incorrectChars: 0,
    totalChars: 0
  });
  const [startTime, setStartTime] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate random text
  const generateText = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_TEXTS.length);
    setCurrentText(SAMPLE_TEXTS[randomIndex]);
  }, []);

  // Calculate stats
  const calculateStats = useCallback((input: string, elapsed: number) => {
    const correctChars = input.split('').filter((char, index) => 
      char === currentText[index]
    ).length;
    
    const incorrectChars = input.length - correctChars;
    const totalChars = input.length;
    const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 100;
    
    // WPM calculation (assuming average word length of 5 characters)
    const minutes = elapsed / 60;
    const wpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;
    
    return {
      wpm,
      accuracy: Math.round(accuracy),
      correctChars,
      incorrectChars,
      totalChars
    };
  }, [currentText]);

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
        const newStats = calculateStats(value, elapsed);
        setStats(newStats);
      }
    }
  };

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

  // Initialize game
  useEffect(() => {
    generateText();
  }, [generateText]);

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
    setTimeLeft(GAME_DURATION);
    setStartTime(null);
    setStats({
      wpm: 0,
      accuracy: 100,
      correctChars: 0,
      incorrectChars: 0,
      totalChars: 0
    });
    generateText();
    setTimeout(() => inputRef.current?.focus(), 100);
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
              <Button onClick={resetGame} className="btn-game">
                Play Again
              </Button>
              <p className="text-muted-foreground">
                Playing as guest - sign up to save your scores!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-4xl mb-8">
        <h1 className="text-4xl font-bold text-center mb-2">TypeRacingGame</h1>
        <p className="text-center text-muted-foreground">
          {gameState === 'waiting' ? 'Start typing to begin the race!' : 'Type as fast and accurately as you can!'}
        </p>
      </div>

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
      <Card className="w-full max-w-4xl bg-game-bg">
        <CardContent className="p-8">
          <div className="game-text mb-6 text-center leading-loose">
            {renderText()}
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            disabled={gameState !== 'waiting' && gameState !== 'playing'}
            className="w-full bg-transparent border-2 border-muted rounded-lg p-4 text-xl font-mono focus:border-primary focus:outline-none transition-colors"
            placeholder={gameState === 'waiting' ? "Click here and start typing..." : ""}
            autoComplete="off"
            spellCheck={false}
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
  );
}