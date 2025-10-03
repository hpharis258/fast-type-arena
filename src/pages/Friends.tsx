import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthDialog } from '@/components/AuthDialog';
import FriendList from '@/components/FriendList';
import SuggestedFriends from '@/components/SuggestedFriends';
import DuelRoom from '@/components/DuelRoom';
import PendingDuels from '@/components/PendingDuels';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Friends() {
  const [currentDuel, setCurrentDuel] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [reloadFriends, setReloadFriends] = useState(0);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
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
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('duels' as any)
        .insert({
          player1_id: user.id,
          player2_id: friendId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Challenge sent!",
        description: "Waiting for your friend to accept..."
      });

      // Don't navigate until accepted
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
            <h1 className="text-2xl font-bold">Friends & Duels</h1>
            <div className="w-24"></div>
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