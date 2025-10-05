import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, History, Coins } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthDialog } from '@/components/AuthDialog';
import FriendList from '@/components/FriendList';
import SuggestedFriends from '@/components/SuggestedFriends';
import DuelRoom from '@/components/DuelRoom';
import PendingDuels from '@/components/PendingDuels';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Friends() {
  const [currentDuel, setCurrentDuel] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [reloadFriends, setReloadFriends] = useState(0);
  const [showWagerDialog, setShowWagerDialog] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { wallet, spendCoins } = useWallet();
  const location = useLocation();

  // Check URL params for duel ID
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const duelId = params.get('duel');
    if (duelId) {
      setCurrentDuel(duelId);
    }
  }, [location]);

  // Subscribe to duel status changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('duel-status-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'duels',
          filter: `player1_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new.status === 'accepted') {
            toast({
              title: "Duel accepted!",
              description: "Your opponent is ready to duel!"
            });
            setCurrentDuel(payload.new.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  // Fetch pending friend requests once on mount
  useEffect(() => {
    if (!user) return;

    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('friends')
        .select('id, created_at, user_id, friend_id, status')
        .eq('friend_id', user.id)
        .eq('status', 'pending');
      if (!error && data) {
        //console.log(data, error);
        const userIds = data.map(r => r.user_id);
        //console.log('userIds', userIds);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', userIds);

        //console.log('profiles', profiles);
        //console.log('pending requests', data);
      
        
        if (!profiles) return
        // Merge display names into requests
        const requestsWithNames = data.map(req => ({
          ...req,
          display_name: profiles?.find(p => p.user_id === req.user_id)?.display_name || "Unknown"
        }));

        setPendingRequests(requestsWithNames);
      }
    };
    fetchRequests();
  }, [user]);

  const handleDuelRequest = async (friendId: string) => {
    setSelectedFriend(friendId);
    setShowWagerDialog(true);
  };
  
  const createDuel = async (withWager: boolean) => {
    if (!user || !selectedFriend) return;

    try {
      const coinWager = withWager ? 1 : 0;
      
      // Deduct coins if wagering
      if (withWager) {
        if (!wallet || wallet.coins < 1) {
          toast({
            title: "Not enough coins",
            description: "You need at least 1 Type Coin to wager.",
            variant: "destructive"
          });
          return;
        }
        
        const success = await spendCoins(1);
        if (!success) {
          toast({
            title: "Error",
            description: "Failed to deduct coins.",
            variant: "destructive"
          });
          return;
        }
      }

      const { data, error } = await supabase
        .from('duels' as any)
        .insert({
          player1_id: user.id,
          player2_id: selectedFriend,
          status: 'pending',
          coin_wager: coinWager
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Challenge sent!",
        description: withWager 
          ? "1 Type Coin wagered. Winner takes all!"
          : "Waiting for your friend to accept..."
      });

      setShowWagerDialog(false);
      setSelectedFriend(null);
    } catch (error) {
      console.error('Error creating duel:', error);
      toast({
        title: "Error",
        description: "Failed to send duel invitation.",
        variant: "destructive"
      });
    }
  };

  const handleDuelAccepted = (duelId: string) => {
    setCurrentDuel(duelId);
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
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Friends & Duels</h1>
              {wallet && (
                <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                  <Coins className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{wallet.coins}</span>
                </div>
              )}
            </div>
            <Button onClick={() => navigate('/duel-results')} variant="outline">
              <History className="w-4 h-4 mr-2" />
              Results
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Pending Duel Invitations */}
          <PendingDuels onDuelAccepted={handleDuelAccepted} />

          {/* Pending Friend Requests UI Cards */}
          {pendingRequests.length > 0 && (
            <div className="mb-8">
              <h2 className="font-bold mb-4 text-foreground">Pending Friend Requests</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {pendingRequests.map(req => (
                  <div
                    key={req.id}
                    className="bg-accent/20 border border-accent rounded-lg p-4 shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-semibold text-lg text-foreground">
                        {req.display_name}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        Requested: {new Date(req.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          await supabase
                            .from('friends')
                            .update({ status: 'accepted' })
                            .eq('id', req.id);
                          setPendingRequests(pendingRequests.filter(r => r.id !== req.id));
                          setReloadFriends(r => r + 1);
                          toast({ title: "Friend request accepted!" });
                        }}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await supabase
                            .from('friends')
                            .update({ status: 'rejected' })
                            .eq('id', req.id);
                          setPendingRequests(pendingRequests.filter(r => r.id !== req.id));
                          setReloadFriends(r => r + 1);
                          toast({ title: "Friend request rejected." });
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <FriendList onDuelRequest={handleDuelRequest} reload={reloadFriends} />
            </div>
            <div>
              <SuggestedFriends />
            </div>
          </div>
        </div>
      </div>
      
      {/* Wager Dialog */}
      <AlertDialog open={showWagerDialog} onOpenChange={setShowWagerDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Challenge Options</AlertDialogTitle>
            <AlertDialogDescription>
              Choose whether to make this a coin duel. Both players will wager 1 Type Coin, and the winner takes both!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowWagerDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <Button variant="outline" onClick={() => createDuel(false)}>
              Free Duel
            </Button>
            <AlertDialogAction 
              onClick={() => createDuel(true)}
              disabled={!wallet || wallet.coins < 1}
              className="bg-primary"
            >
              <Coins className="w-4 h-4 mr-2" />
              Wager 1 Coin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

type PendingRequest = {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  status: string;
  display_name: string;
};