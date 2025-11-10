import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Coins, Check, Lock, Palette, Zap } from 'lucide-react';

interface CarColor {
  id: string;
  name: string;
  hex_color: string;
  price: number;
}

interface CarUpgrade {
  id: string;
  name: string;
  description: string;
  effect_type: string;
  price: number;
  icon: string | null;
}

interface CarCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carId: string;
  carName: string;
  carImage: string;
}

export function CarCustomizer({ open, onOpenChange, carId, carName, carImage }: CarCustomizerProps) {
  const { user } = useAuth();
  const { wallet, spendCoins, refetch } = useWallet();
  const { toast } = useToast();
  const [colors, setColors] = useState<CarColor[]>([]);
  const [upgrades, setUpgrades] = useState<CarUpgrade[]>([]);
  const [ownedColors, setOwnedColors] = useState<string[]>([]);
  const [ownedUpgrades, setOwnedUpgrades] = useState<string[]>([]);
  const [currentColor, setCurrentColor] = useState<string | null>(null);
  const [currentUpgrades, setCurrentUpgrades] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && user) {
      fetchCustomizationData();
    }
  }, [open, user]);

  const fetchCustomizationData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch available colors
      const { data: colorsData } = await supabase
        .from('car_colors')
        .select('*')
        .order('price', { ascending: true });

      // Fetch available upgrades
      const { data: upgradesData } = await supabase
        .from('car_upgrades')
        .select('*')
        .order('price', { ascending: true });

      // Fetch owned colors
      const { data: ownedColorsData } = await supabase
        .from('owned_colors')
        .select('color_id')
        .eq('user_id', user.id);

      // Fetch owned upgrades
      const { data: ownedUpgradesData } = await supabase
        .from('owned_upgrades')
        .select('upgrade_id')
        .eq('user_id', user.id);

      // Fetch current customization
      const { data: profile } = await supabase
        .from('profiles')
        .select('car_color, car_upgrades')
        .eq('user_id', user.id)
        .single();

      setColors(colorsData || []);
      setUpgrades(upgradesData || []);
      setOwnedColors(ownedColorsData?.map(c => c.color_id) || []);
      setOwnedUpgrades(ownedUpgradesData?.map(u => u.upgrade_id) || []);
      setCurrentColor(profile?.car_color || null);
      setCurrentUpgrades(profile?.car_upgrades || []);
    } catch (error) {
      console.error('Error fetching customization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseColor = async (color: CarColor) => {
    if (!user || !wallet) return;

    if (wallet.coins < color.price) {
      toast({
        title: "Not enough coins! 💰",
        description: `You need ${color.price} coins but only have ${wallet.coins}`,
        variant: "destructive"
      });
      return;
    }

    const success = await spendCoins(color.price);
    if (!success) {
      toast({
        title: "Purchase failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
      return;
    }

    // Add to owned colors
    await supabase
      .from('owned_colors')
      .insert({ user_id: user.id, color_id: color.id });

    setOwnedColors([...ownedColors, color.id]);
    toast({
      title: "Color purchased! 🎨",
      description: `${color.name} is now yours!`
    });

    refetch();
  };

  const purchaseUpgrade = async (upgrade: CarUpgrade) => {
    if (!user || !wallet) return;

    if (wallet.coins < upgrade.price) {
      toast({
        title: "Not enough coins! 💰",
        description: `You need ${upgrade.price} coins but only have ${wallet.coins}`,
        variant: "destructive"
      });
      return;
    }

    const success = await spendCoins(upgrade.price);
    if (!success) {
      toast({
        title: "Purchase failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
      return;
    }

    // Add to owned upgrades
    await supabase
      .from('owned_upgrades')
      .insert({ user_id: user.id, upgrade_id: upgrade.id });

    setOwnedUpgrades([...ownedUpgrades, upgrade.id]);
    toast({
      title: "Upgrade purchased! ⚡",
      description: `${upgrade.name} is now yours!`
    });

    refetch();
  };

  const applyColor = async (colorId: string | null) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ car_color: colorId })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error applying color:', error);
      return;
    }

    setCurrentColor(colorId);
    toast({
      title: "Color applied! ✨",
      description: colorId ? "Your car color has been updated" : "Reset to original color"
    });
  };

  const toggleUpgrade = async (upgradeId: string) => {
    if (!user) return;

    const newUpgrades = currentUpgrades.includes(upgradeId)
      ? currentUpgrades.filter(u => u !== upgradeId)
      : [...currentUpgrades, upgradeId];

    const { error } = await supabase
      .from('profiles')
      .update({ car_upgrades: newUpgrades })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error toggling upgrade:', error);
      return;
    }

    setCurrentUpgrades(newUpgrades);
    toast({
      title: currentUpgrades.includes(upgradeId) ? "Upgrade removed" : "Upgrade applied! ⚡",
      description: "Your car customization has been updated"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Palette className="w-6 h-6" />
            Customize {carName}
          </DialogTitle>
          <DialogDescription>
            Personalize your car with custom colors and upgrades
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="upgrades">Upgrades</TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {colors.map((color) => {
                  const isOwned = color.hex_color === 'original' || ownedColors.includes(color.id);
                  const isActive = currentColor === color.id || (color.hex_color === 'original' && !currentColor);

                  return (
                    <div
                      key={color.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{color.name}</span>
                        {isActive && <Check className="w-4 h-4 text-primary" />}
                      </div>
                      
                      <div 
                        className="h-16 rounded-lg mb-3"
                        style={{ 
                          backgroundColor: color.hex_color === 'original' ? '#3B82F6' : color.hex_color,
                          border: '2px solid rgba(255,255,255,0.1)'
                        }}
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Coins className="w-3 h-3 text-primary" />
                          <span className="text-sm font-bold">{color.price}</span>
                        </div>

                        {isOwned ? (
                          <Button
                            size="sm"
                            variant={isActive ? "default" : "outline"}
                            onClick={() => applyColor(color.hex_color === 'original' ? null : color.id)}
                          >
                            {isActive ? 'Applied' : 'Apply'}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => purchaseColor(color)}
                            disabled={!wallet || wallet.coins < color.price}
                          >
                            {wallet && wallet.coins < color.price ? (
                              <Lock className="w-3 h-3" />
                            ) : (
                              'Buy'
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="upgrades" className="space-y-4">
              <div className="grid gap-3">
                {upgrades.map((upgrade) => {
                  const isOwned = ownedUpgrades.includes(upgrade.id);
                  const isActive = currentUpgrades.includes(upgrade.id);

                  return (
                    <div
                      key={upgrade.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {upgrade.icon && <span className="text-2xl">{upgrade.icon}</span>}
                            <h4 className="font-semibold">{upgrade.name}</h4>
                            <Badge variant={upgrade.effect_type === 'visual' ? 'default' : 'secondary'}>
                              {upgrade.effect_type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{upgrade.description}</p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1">
                            <Coins className="w-3 h-3 text-primary" />
                            <span className="text-sm font-bold">{upgrade.price}</span>
                          </div>

                          {isOwned ? (
                            <Button
                              size="sm"
                              variant={isActive ? "default" : "outline"}
                              onClick={() => toggleUpgrade(upgrade.id)}
                            >
                              {isActive ? <Check className="w-3 h-3 mr-1" /> : null}
                              {isActive ? 'Active' : 'Activate'}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => purchaseUpgrade(upgrade)}
                              disabled={!wallet || wallet.coins < upgrade.price}
                            >
                              {wallet && wallet.coins < upgrade.price ? (
                                <Lock className="w-3 h-3" />
                              ) : (
                                'Buy'
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
