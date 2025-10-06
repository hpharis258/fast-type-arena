import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Target, Trophy, Users, BarChart3, User, Coins } from 'lucide-react';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Game
            </Button>
            <h1 className="text-2xl font-bold">About TypeRacingGame</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            TypeRacingGame.com
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The ultimate typing speed and accuracy challenge. Race against time, compete with friends, 
            and improve your typing skills with our engaging typing game platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <Zap className="w-8 h-8 mx-auto mb-2 text-primary" />
              <CardTitle>Classic Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Test your typing speed and accuracy in our classic 30-second challenge. 
                Race against the clock to achieve your best WPM score.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <User className="w-8 h-8 mx-auto mb-2 text-accent" />
              <CardTitle>Ghost Racing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Compete against your own best performance! Watch as your ghost races 
                alongside you, pushing you to beat your personal records.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <CardTitle>Global Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                See how you stack up against typists worldwide. Climb the leaderboard 
                and earn your place among the fastest fingers on the planet.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <CardTitle>Friends & Social</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Connect with friends, send challenges, and compete in friendly 
                typing duels. Make improving your typing skills a social experience.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <CardTitle>Detailed Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Track your progress with comprehensive statistics. Monitor your WPM, 
                accuracy trends, and total time spent improving your skills.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Target className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <CardTitle>Smart Practice</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Practice with carefully curated texts that challenge different aspects 
                of typing, from common words to programming-focused content.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Coins className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <CardTitle>Type Coins & Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Earn Type Coins daily and build streaks for bonus rewards. Use coins 
                to unlock custom racer icons and wager in duels against friends.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold mb-2">Choose Your Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Select between Classic mode for pure speed challenges or Ghost Racing to compete against your best runs.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-accent">2</span>
                </div>
                <h3 className="font-semibold mb-2">Start Typing</h3>
                <p className="text-sm text-muted-foreground">
                  Type the displayed text as quickly and accurately as possible. See your stats update in real-time.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-400/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-green-400">3</span>
                </div>
                <h3 className="font-semibold mb-2">Track Progress</h3>
                <p className="text-sm text-muted-foreground">
                  View your results, compare with others, and watch your skills improve over time with detailed analytics.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why TypeRacingGame */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Why TypeRacingGame?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                In today's digital world, typing speed and accuracy are essential skills for productivity 
                and professional success. Whether you're a student, professional, developer, or anyone 
                who works with computers, improving your typing skills can significantly boost your efficiency.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                TypeRacingGame makes practicing typing fun and engaging through gamification, social features, 
                and detailed progress tracking. Our platform is designed to help you:
              </p>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>• <strong>Improve Speed:</strong> Increase your words per minute (WPM) through regular practice</li>
                <li>• <strong>Enhance Accuracy:</strong> Reduce errors and develop muscle memory for common key combinations</li>
                <li>• <strong>Build Consistency:</strong> Maintain steady performance across different types of text</li>
                <li>• <strong>Stay Motivated:</strong> Compete with friends and track your improvement over time</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Join thousands of users who have already improved their typing skills with TypeRacingGame. 
                Start your journey to becoming a faster, more accurate typist today!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Button
            onClick={() => navigate('/')}
            className="btn-game"
            size="lg"
          >
            Start Typing Now
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No registration required to start playing. Sign up to save your scores and unlock all features.
          </p>
        </div>
      </div>
    </div>
  );
}