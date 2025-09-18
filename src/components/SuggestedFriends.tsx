import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Users, RefreshCw } from 'lucide-react';

interface User {
  id: string;
  display_name: string | null;
}

export default function SuggestedFriends() {
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    loadSuggestedFriends();
  }, [user]);

  const loadSuggestedFriends = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get existing friends to exclude them
      const { data: existingFriends } = await supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', user.id);

      const friendIds = existingFriends?.map(f => f.friend_id) || [];
      friendIds.push(user.id); // Exclude self

      // Get random users excluding existing friends
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .not('user_id', 'in', `(${friendIds.join(',')})`)
        .limit(10);

      if (error) throw error;
      
      // Randomize the results
      const shuffled = (data || []).sort(() => 0.5 - Math.random());
      setSuggestedUsers(shuffled.map(profile => ({
        id: profile.user_id,
        display_name: profile.display_name
      })));
    } catch (error) {
      console.error('Error loading suggested friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('friends')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) throw error;
      
      toast({
        title: "Friend request sent!",
        description: "Your friend request has been sent successfully."
      });
      
      setSuggestedUsers(prev => prev.filter(u => u.id !== friendId));
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Suggested Friends
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadSuggestedFriends}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-6 text-muted-foreground">Loading suggestions...</div>
        ) : suggestedUsers.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No suggestions available. Try refreshing!
          </div>
        ) : (
          <div className="space-y-2">
            {suggestedUsers.map((suggestedUser) => (
              <div key={suggestedUser.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <span>{suggestedUser.display_name || 'Anonymous'}</span>
                <Button
                  size="sm"
                  onClick={() => sendFriendRequest(suggestedUser.id)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Friend
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}