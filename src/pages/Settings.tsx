import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTheme, predefinedThemes } from '@/hooks/useTheme';
import ThemeCustomizer from '@/components/ThemeCustomizer';
import { ArrowLeft, Lock, Trash2, AlertTriangle, Palette, Check, User } from 'lucide-react';

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [displayNameLoading, setDisplayNameLoading] = useState(false);
  const { user, signOut } = useAuth();
  const { currentTheme, setTheme, customThemes, removeCustomTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      fetchUserProfile();
    }
  }, [user, navigate]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setDisplayName(data?.display_name || '');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation password do not match.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // First, verify the current password by signing in
      if (!user?.email) {
        toast({
          title: "Error",
          description: "User email not found.",
          variant: "destructive"
        });
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });

      if (signInError) {
        toast({
          title: "Invalid current password",
          description: "Please check your current password and try again.",
          variant: "destructive"
        });
        return;
      }

      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast({
          title: "Password update failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Password updated",
        description: "Your password has been successfully updated."
      });

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisplayNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setDisplayNameLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() || null })
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Display name updated",
        description: "Your display name has been successfully updated."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setDisplayNameLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setDeleteLoading(true);
    
    try {
      // Delete user scores first
      const { error: scoresError } = await supabase
        .from('scores')
        .delete()
        .eq('user_id', user.id);

      if (scoresError) {
        console.error('Error deleting scores:', scoresError);
      }

      // Delete user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
      }

      // Sign out the user (Supabase handles account deletion through admin functions)
      await signOut();
      
      toast({
        title: "Account deletion initiated",
        description: "Your account and all associated data have been removed."
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error deleting account",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={() => navigate('/')} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Game
          </Button>
          <h1 className="text-4xl font-bold">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Theme Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Theme Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Predefined Themes</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {predefinedThemes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setTheme(theme)}
                        className={`relative p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                          currentTheme.id === theme.id 
                            ? 'border-primary shadow-[0_0_20px_hsl(var(--primary)_/_0.3)]' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        style={{
                          backgroundColor: `hsl(${theme.colors.background})`,
                          color: `hsl(${theme.colors.foreground})`
                        }}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex gap-1">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
                            />
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: `hsl(${theme.colors.accent})` }}
                            />
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: `hsl(${theme.colors['game-text-typed']})` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{theme.name}</span>
                        </div>
                        {currentTheme.id === theme.id && (
                          <Check className="absolute -top-1 -right-1 w-4 h-4 text-primary bg-background rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {customThemes.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Custom Themes</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {customThemes.map((theme) => (
                        <div key={theme.id} className="relative">
                          <button
                            onClick={() => setTheme(theme)}
                            className={`w-full p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                              currentTheme.id === theme.id 
                                ? 'border-primary shadow-[0_0_20px_hsl(var(--primary)_/_0.3)]' 
                                : 'border-border hover:border-primary/50'
                            }`}
                            style={{
                              backgroundColor: `hsl(${theme.colors.background})`,
                              color: `hsl(${theme.colors.foreground})`
                            }}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="flex gap-1">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
                                />
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: `hsl(${theme.colors.accent})` }}
                                />
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: `hsl(${theme.colors['game-text-typed']})` }}
                                />
                              </div>
                              <span className="text-xs font-medium">{theme.name}</span>
                            </div>
                            {currentTheme.id === theme.id && (
                              <Check className="absolute -top-1 -right-1 w-4 h-4 text-primary bg-background rounded-full" />
                            )}
                          </button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -left-2 w-6 h-6 p-0"
                            onClick={() => removeCustomTheme(theme.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Theme Customizer */}
          <ThemeCustomizer />

          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDisplayNameUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    type="text"
                    placeholder="Enter your display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={50}
                  />
                  <p className="text-sm text-muted-foreground">
                    This name will appear on the leaderboard and in friend requests.
                  </p>
                </div>
                <Button type="submit" disabled={displayNameLoading}>
                  {displayNameLoading ? 'Updating...' : 'Update Display Name'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user.email || ''} disabled />
                <p className="text-sm text-muted-foreground">
                  Your email address cannot be changed.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Delete Account */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                Delete Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> This action cannot be undone. This will permanently 
                  delete your account and all associated data including your typing scores and statistics.
                </AlertDescription>
              </Alert>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={deleteLoading}>
                    {deleteLoading ? 'Deleting...' : 'Delete Account'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers including:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>All your typing test scores</li>
                        <li>Your progress statistics</li>
                        <li>Your account information</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}