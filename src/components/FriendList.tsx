import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Sword, Users, Search } from 'lucide-react';

interface User {
  id: string;
  display_name: string | null;
}

interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
  friend: User;
}

interface FriendListProps {
  onDuelRequest: (friendId: string) => void;
}

export default function FriendList({ onDuelRequest }: FriendListProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load friends
  useEffect(() => {
    if (!user) return;
    loadFriends();
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('friends' as any)
        .select(`
          *,
          friend:profiles!friends_friend_id_fkey(id, display_name)
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');
        console.log(data, error);
      if (error) throw error;
      setFriends((data as any[]) || []);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim() || !user) return;
    
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .ilike('display_name', `%${query}%`)
        .neq('user_id', user.id)
        .limit(10);

      if (error) throw error;
      setSearchResults(data?.map(profile => ({
        id: profile.user_id,
        display_name: profile.display_name
      })) || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('friends' as any)
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
      
      setSearchResults(prev => prev.filter(u => u.id !== friendId));
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request.",
        variant: "destructive"
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchUsers(searchQuery);
  };

  return (
    <div className="space-y-6">
      {/* Search Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Find Friends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by display name..."
              className="flex-1"
            />
            <Button type="submit" disabled={isSearching}>
              <Search className="w-4 h-4" />
            </Button>
          </form>
          
          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <span>{user.display_name || 'Anonymous'}</span>
                  <Button
                    size="sm"
                    onClick={() => sendFriendRequest(user.id)}
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

      {/* Friends List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Your Friends ({friends.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-6 text-muted-foreground">Loading friends...</div>
          ) : friends.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No friends yet. Search for users above to add friends!
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map((friendship) => (
                <div key={friendship.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <span className="font-medium">
                    {friendship.friend.display_name || 'Anonymous'}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => onDuelRequest(friendship.friend_id)}
                    className="bg-accent hover:bg-accent/90"
                  >
                    <Sword className="w-4 h-4 mr-2" />
                    Challenge
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}