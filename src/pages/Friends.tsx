import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthDialog } from '@/components/AuthDialog';
import FriendList from '@/components/FriendList';
import SuggestedFriends from '@/components/SuggestedFriends';
import DuelRoom from '@/components/DuelRoom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Friends() {
  const [currentDuel, setCurrentDuel] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleDuelRequest = async (friendId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('duels' as any)
        .insert({
          player1_id: user.id,
          player2_id: friendId,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Duel started!",
        description: "Get ready to race!"
      });

      setCurrentDuel((data as any).id);
    } catch (error) {
      console.error('Error creating duel:', error);
      toast({
        title: "Error",
        description: "Failed to start duel. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleExitDuel = () => {
    setCurrentDuel(null);
  };

  if (currentDuel) {
    return <DuelRoom duelId={currentDuel} onExit={handleExitDuel} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Sign in required</h2>
          <p className="text-muted-foreground">You need to sign in to access the friends feature.</p>
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
            <Button onClick={() => navigate('/')} variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Game
            </Button>
            <h1 className="text-2xl font-bold">Friends & Duels</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <FriendList onDuelRequest={handleDuelRequest} />
            </div>
            <div>
              <SuggestedFriends />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}