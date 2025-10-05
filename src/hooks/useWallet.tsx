import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Wallet {
  coins: number;
  current_streak: number;
  last_play_date: string | null;
}

export function useWallet() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWallet = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('coins, current_streak, last_play_date')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Create wallet if it doesn't exist
        const { data: newWallet, error: insertError } = await supabase
          .from('user_wallets')
          .insert({
            user_id: user.id,
            coins: 10,
            current_streak: 0
          })
          .select('coins, current_streak, last_play_date')
          .single();

        if (insertError) throw insertError;
        setWallet(newWallet);
      } else if (error) {
        throw error;
      } else {
        setWallet(data);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const calculateStreakBonus = (streak: number): number => {
    if (streak >= 365) return 5;
    if (streak >= 180) return 4;
    if (streak >= 90) return 3;
    if (streak >= 30) return 2;
    return 1;
  };

  const awardDailyCoins = useCallback(async () => {
    if (!user || !wallet) return { awarded: false, coins: 0 };

    const today = new Date().toISOString().split('T')[0];
    const lastPlayDate = wallet.last_play_date;

    // Check if already played today
    if (lastPlayDate === today) {
      return { awarded: false, coins: 0 };
    }

    // Calculate new streak
    let newStreak = wallet.current_streak;
    if (lastPlayDate) {
      const lastDate = new Date(lastPlayDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak += 1; // Continue streak
      } else if (diffDays > 1) {
        newStreak = 1; // Reset streak
      }
    } else {
      newStreak = 1; // First play
    }

    const coinsAwarded = calculateStreakBonus(newStreak);

    try {
      const { error } = await supabase
        .from('user_wallets')
        .update({
          coins: wallet.coins + coinsAwarded,
          current_streak: newStreak,
          last_play_date: today
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setWallet({
        coins: wallet.coins + coinsAwarded,
        current_streak: newStreak,
        last_play_date: today
      });

      toast({
        title: "Daily reward earned! 🎉",
        description: `+${coinsAwarded} Type Coins (${newStreak} day streak)`
      });

      return { awarded: true, coins: coinsAwarded };
    } catch (error) {
      console.error('Error awarding daily coins:', error);
      return { awarded: false, coins: 0 };
    }
  }, [user, wallet, toast]);

  const spendCoins = useCallback(async (amount: number) => {
    if (!user || !wallet || wallet.coins < amount) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_wallets')
        .update({ coins: wallet.coins - amount })
        .eq('user_id', user.id);

      if (error) throw error;

      setWallet({ ...wallet, coins: wallet.coins - amount });
      return true;
    } catch (error) {
      console.error('Error spending coins:', error);
      return false;
    }
  }, [user, wallet]);

  const addCoins = useCallback(async (amount: number) => {
    if (!user || !wallet) return false;

    try {
      const { error } = await supabase
        .from('user_wallets')
        .update({ coins: wallet.coins + amount })
        .eq('user_id', user.id);

      if (error) throw error;

      setWallet({ ...wallet, coins: wallet.coins + amount });
      return true;
    } catch (error) {
      console.error('Error adding coins:', error);
      return false;
    }
  }, [user, wallet]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return {
    wallet,
    loading,
    awardDailyCoins,
    spendCoins,
    addCoins,
    refetch: fetchWallet
  };
}
