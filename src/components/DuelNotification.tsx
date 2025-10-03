import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Swords } from 'lucide-react';

interface DuelNotification {
  id: string;
  challenger_name: string;
}

interface DuelNotificationProps {
  onAcceptDuel: (duelId: string) => void;
}

export default function DuelNotification({ onAcceptDuel }: DuelNotificationProps) {
  const [notification, setNotification] = useState<DuelNotification | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Subscribe to new duel invitations where user is player2
    const channel = supabase
      .channel('duel-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'duels',
          filter: `player2_id=eq.${user.id}`
        },
        async (payload) => {
          if (payload.new.status === 'pending') {
            // Get challenger's name
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('user_id', payload.new.player1_id)
              .single();

            setNotification({
              id: payload.new.id,
              challenger_name: profile?.display_name || 'Someone'
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleAccept = async () => {
    if (!notification) return;

    try {
      const { error } = await supabase
        .from('duels')
        .update({ status: 'accepted' })
        .eq('id', notification.id);

      if (error) throw error;

      onAcceptDuel(notification.id);
      setNotification(null);
    } catch (error) {
      console.error('Error accepting duel:', error);
    }
  };

  const handleReject = async () => {
    if (!notification) return;

    try {
      await supabase
        .from('duels')
        .update({ status: 'rejected' })
        .eq('id', notification.id);

      setNotification(null);
    } catch (error) {
      console.error('Error rejecting duel:', error);
    }
  };

  return (
    <AlertDialog open={!!notification}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-accent" />
            Duel Challenge!
          </AlertDialogTitle>
          <AlertDialogDescription>
            {notification?.challenger_name} has challenged you to a typing duel! Do you accept?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <button
            onClick={handleReject}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Decline
          </button>
          <AlertDialogAction onClick={handleAccept}>
            Accept Challenge
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
