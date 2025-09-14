import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTheme, type Theme } from '@/hooks/useTheme';
import { Plus, Trash2, Palette } from 'lucide-react';

export default function ThemeCustomizer() {
  const { currentTheme, addCustomTheme, removeCustomTheme } = useTheme();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [customTheme, setCustomTheme] = useState<Partial<Theme>>({
    name: '',
    colors: { ...currentTheme.colors }
  });

  const colorCategories = [
    {
      title: 'Main Colors',
      colors: ['background', 'foreground', 'card', 'card-foreground']
    },
    {
      title: 'Game Colors',
      colors: ['game-bg', 'game-text', 'game-text-typed', 'game-text-current', 'game-text-error', 'game-text-untyped']
    },
    {
      title: 'Interactive Colors',
      colors: ['primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'accent', 'accent-foreground']
    },
    {
      title: 'System Colors',
      colors: ['destructive', 'destructive-foreground', 'muted', 'muted-foreground', 'border', 'input', 'ring']
    }
  ];

  const handleColorChange = (colorKey: string, value: string) => {
    setCustomTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors!,
        [colorKey]: value
      }
    }));
  };

  const handleSaveTheme = () => {
    if (!customTheme.name?.trim()) {
      toast({
        title: "Theme name required",
        description: "Please enter a name for your custom theme.",
        variant: "destructive"
      });
      return;
    }

    const newTheme: Theme = {
      id: `custom-${Date.now()}`,
      name: customTheme.name,
      colors: customTheme.colors!
    };

    addCustomTheme(newTheme);
    setIsCreating(false);
    setCustomTheme({ name: '', colors: { ...currentTheme.colors } });
    
    toast({
      title: "Theme created",
      description: `Your custom theme "${newTheme.name}" has been saved.`
    });
  };

  const convertHslToHex = (hsl: string) => {
    const [h, s, l] = hsl.split(' ').map(val => parseFloat(val.replace('%', '')));
    const hslToRgb = (h: number, s: number, l: number) => {
      s /= 100;
      l /= 100;
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs((h / 60) % 2 - 1));
      const m = l - c / 2;
      let r = 0, g = 0, b = 0;
      
      if (0 <= h && h < 60) { r = c; g = x; b = 0; }
      else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
      else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
      else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
      else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
      else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
      
      return [
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255)
      ];
    };
    
    const [r, g, b] = hslToRgb(h, s, l);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  const convertHexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  if (!isCreating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Custom Theme Creator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsCreating(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Create Custom Theme
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Create Custom Theme
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="theme-name">Theme Name</Label>
          <Input
            id="theme-name"
            value={customTheme.name || ''}
            onChange={(e) => setCustomTheme(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter theme name..."
          />
        </div>

        {colorCategories.map(category => (
          <div key={category.title} className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">{category.title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {category.colors.map(colorKey => (
                <div key={colorKey} className="space-y-2">
                  <Label htmlFor={colorKey} className="text-xs">
                    {colorKey.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={convertHslToHex(customTheme.colors?.[colorKey as keyof typeof customTheme.colors] || '0 0% 50%')}
                      onChange={(e) => handleColorChange(colorKey, convertHexToHsl(e.target.value))}
                      className="w-12 h-8 rounded border border-border cursor-pointer"
                    />
                    <Input
                      value={customTheme.colors?.[colorKey as keyof typeof customTheme.colors] || ''}
                      onChange={(e) => handleColorChange(colorKey, e.target.value)}
                      placeholder="HSL format: 220 13% 18%"
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSaveTheme} className="flex-1">
            Save Theme
          </Button>
          <Button 
            onClick={() => setIsCreating(false)} 
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}