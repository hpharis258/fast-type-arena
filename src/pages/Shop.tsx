import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins, Check, Lock, Palette } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CarCustomizer } from '@/components/CarCustomizer';
import defaultCar from '@/assets/cars/default.png';
import redRocketCar from '@/assets/cars/red-rocket.png';
import greenSpeedsterCar from '@/assets/cars/green-speedster.png';
import goldChampionCar from '@/assets/cars/gold-champion.png';
import purplePhantomCar from '@/assets/cars/purple-phantom.png';
import cyanFlashCar from '@/assets/cars/cyan-flash.png';
import pinkPowerCar from '@/assets/cars/pink-power.png';
import silverBulletCar from '@/assets/cars/silver-bullet.png';

interface PlayerIcon {
  id: string;
  name: string;
  price: number;
  color: string;
  description: string;
  image: string;
}

const availableIcons: PlayerIcon[] = [
  { id: 'default', name: 'Classic Racer', price: 0, color: '#3B82F6', description: 'The original racing icon', image: defaultCar },
  { id: 'red-rocket', name: 'Red Rocket', price: 50, color: '#EF4444', description: 'Speed demon in red', image: redRocketCar },
  { id: 'green-speedster', name: 'Green Speedster', price: 50, color: '#10B981', description: 'Eco-friendly speed', image: greenSpeedsterCar },
  { id: 'gold-champion', name: 'Gold Champion', price: 100, color: '#F59E0B', description: 'For the true champions', image: goldChampionCar },
  { id: 'purple-phantom', name: 'Purple Phantom', price: 75, color: '#8B5CF6', description: 'Mysterious and fast', image: purplePhantomCar },
  { id: 'cyan-flash', name: 'Cyan Flash', price: 75, color: '#06B6D4', description: 'Lightning quick', image: cyanFlashCar },
  { id: 'pink-power', name: 'Pink Power', price: 60, color: '#EC4899', description: 'Bold and beautiful', image: pinkPowerCar },
  { id: 'silver-bullet', name: 'Silver Bullet', price: 150, color: '#9CA3AF', description: 'Elite racer exclusive', image: silverBulletCar },
];

export default function Shop() {
  const { user } = useAuth();
  const { wallet, spendCoins, refetch } = useWallet();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentIcon, setCurrentIcon] = useState<string>('default');
  const [ownedIcons, setOwnedIcons] = useState<string[]>(['default']);
  const [loading, setLoading] = useState(true);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [customizingIcon, setCustomizingIcon] = useState<PlayerIcon | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchUserProfile();
  }, [user, navigate]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('player_icon, owned_icons')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setCurrentIcon(data?.player_icon || 'default');
      setOwnedIcons(data?.owned_icons || ['default']);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseIcon = async (icon: PlayerIcon) => {
    if (!user || !wallet) return;

    if (wallet.coins < icon.price) {
      toast({
        title: "Not enough coins! 💰",
        description: `You need ${icon.price} coins but only have ${wallet.coins}`,
        variant: "destructive"
      });
      return;
    }

    const success = await spendCoins(icon.price);
    if (!success) {
      toast({
        title: "Purchase failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
      return;
    }

    // Update owned icons and set as current
    const newOwnedIcons = [...ownedIcons, icon.id];
    const { error } = await supabase
      .from('profiles')
      .update({ 
        owned_icons: newOwnedIcons,
        player_icon: icon.id 
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      return;
    }

    setOwnedIcons(newOwnedIcons);
    setCurrentIcon(icon.id);

    toast({
      title: "Icon purchased! 🎉",
      description: `${icon.name} is now yours and equipped!`
    });

    refetch();
  };

  const equipIcon = async (iconId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ player_icon: iconId })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error equipping icon:', error);
      return;
    }

    setCurrentIcon(iconId);
    toast({
      title: "Icon equipped! ✨",
      description: "Your new icon will appear in races"
    });
  };

  const openCustomizer = (icon: PlayerIcon) => {
    setCustomizingIcon(icon);
    setCustomizerOpen(true);
  };

  if (!user || loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={() => navigate('/')} variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">Icon Shop</h1>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
              <Coins className="w-5 h-5 text-primary" />
              <span className="font-bold text-lg">{wallet?.coins || 0}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Customize Your Racer
          </h2>
          <p className="text-muted-foreground">
            Purchase new icons with Type Coins and stand out in races and duels!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableIcons.map((icon) => {
            const isOwned = ownedIcons.includes(icon.id);
            const isEquipped = currentIcon === icon.id;

            return (
              <Card key={icon.id} className={`relative ${isEquipped ? 'border-primary border-2' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{icon.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{icon.description}</p>
                    </div>
                    {isEquipped && (
                      <div className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold">
                        Equipped
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Icon Preview */}
                  <div className="h-32 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg flex items-center justify-center p-4">
                    <img 
                      src={icon.image} 
                      alt={icon.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Price and Action */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-primary" />
                        <span className="font-bold">{icon.price}</span>
                      </div>

                      {isOwned ? (
                        isEquipped ? (
                          <Button disabled className="flex-1 ml-4">
                            <Check className="w-4 h-4 mr-2" />
                            Equipped
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => equipIcon(icon.id)}
                            variant="outline"
                            className="flex-1 ml-4"
                          >
                            Equip
                          </Button>
                        )
                      ) : (
                        <Button
                          onClick={() => purchaseIcon(icon)}
                          disabled={!wallet || wallet.coins < icon.price}
                          className="flex-1 ml-4"
                        >
                          {wallet && wallet.coins < icon.price ? (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Not enough coins
                            </>
                          ) : (
                            'Purchase'
                          )}
                        </Button>
                      )}
                    </div>
                    
                    {isOwned && (
                      <Button
                        onClick={() => openCustomizer(icon)}
                        variant="secondary"
                        className="w-full"
                        size="sm"
                      >
                        <Palette className="w-3 h-3 mr-2" />
                        Customize
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 p-6 bg-muted/30 rounded-lg">
          <h3 className="font-semibold mb-2">💡 How to Earn More Coins</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Play daily to earn streak bonuses (up to 5 coins/day at 365+ days!)</li>
            <li>• Win duels against friends to claim their wagered coins</li>
            <li>• Keep your streak alive for bigger rewards</li>
          </ul>
        </div>
      </div>

      {customizingIcon && (
        <CarCustomizer
          open={customizerOpen}
          onOpenChange={setCustomizerOpen}
          carId={customizingIcon.id}
          carName={customizingIcon.name}
          carImage={customizingIcon.image}
        />
      )}
    </div>
  );
}
