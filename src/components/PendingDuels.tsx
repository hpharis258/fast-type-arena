import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Swords, Check, X } from 'lucide-react';

interface PendingDuel {
  id: string;
  player1_id: string;
  player2_id: string;
  status: string;
  created_at: string;
  challenger_name: string;
}

interface PendingDuelsProps {
  onDuelAccepted: (duelId: string) => void;
}

export default function PendingDuels({ onDuelAccepted }: PendingDuelsProps) {
  const [pendingDuels, setPendingDuels] = useState<PendingDuel[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    loadPendingDuels();

    // Subscribe to new duel invitations
    const channel = supabase
      .channel('duel-invitations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'duels',
          filter: `player2_id=eq.${user.id}`
        },
        () => {
          loadPendingDuels();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadPendingDuels = async () => {
    if (!user) return;

    try {
      // Get duels where user is player2 and status is pending
      const { data: duels, error } = await supabase
        .from('duels')
        .select('*')
        .eq('player2_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (duels && duels.length > 0) {
        // Get challenger names
        const challengerIds = duels.map(d => d.player1_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', challengerIds);

        const duelsWithNames = duels.map(duel => ({
          ...duel,
          challenger_name: profiles?.find(p => p.user_id === duel.player1_id)?.display_name || 'Unknown'
        }));

        setPendingDuels(duelsWithNames);
      } else {
        setPendingDuels([]);
      }
    } catch (error) {
      console.error('Error loading pending duels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (duelId: string) => {
    try {
      const { error } = await supabase
        .from('duels')
        .update({ status: 'accepted' })
        .eq('id', duelId);

      if (error) throw error;

      toast({
        title: "Duel accepted!",
        description: "Get ready to race!"
      });

      onDuelAccepted(duelId);
    } catch (error) {
      console.error('Error accepting duel:', error);
      toast({
        title: "Error",
        description: "Failed to accept duel.",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (duelId: string) => {
    try {
      const { error } = await supabase
        .from('duels')
        .update({ status: 'rejected' })
        .eq('id', duelId);

      if (error) throw error;

      setPendingDuels(prev => prev.filter(d => d.id !== duelId));
      
      toast({
        title: "Duel rejected",
        description: "The challenge has been declined."
      });
    } catch (error) {
      console.error('Error rejecting duel:', error);
      toast({
        title: "Error",
        description: "Failed to reject duel.",
        variant: "destructive"
      });
    }
  };

  if (loading) return null;
  if (pendingDuels.length === 0) return null;

  return (
    <Card className="mb-6 border-accent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent">
          <Swords className="w-5 h-5" />
          Duel Invitations ({pendingDuels.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingDuels.map((duel) => (
            <div key={duel.id} className="flex items-center justify-between p-4 bg-accent/20 rounded-lg border border-accent">
              <div>
                <p className="font-semibold">{duel.challenger_name}</p>
                <p className="text-sm text-muted-foreground">
                  Challenged you to a typing duel
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAccept(duel.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(duel.id)}
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
