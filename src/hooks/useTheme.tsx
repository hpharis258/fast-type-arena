import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Theme {
  id: string;
  name: string;
  colors: {
    background: string;
    foreground: string;
    'game-bg': string;
    'game-text': string;
    'game-text-typed': string;
    'game-text-current': string;
    'game-text-error': string;
    'game-text-untyped': string;
    card: string;
    'card-foreground': string;
    primary: string;
    'primary-foreground': string;
    secondary: string;
    'secondary-foreground': string;
    accent: string;
    'accent-foreground': string;
    destructive: string;
    'destructive-foreground': string;
    muted: string;
    'muted-foreground': string;
    border: string;
    input: string;
    ring: string;
  };
}

export const predefinedThemes: Theme[] = [
  {
    id: 'default',
    name: 'Default Dark',
    colors: {
      background: '220 13% 9%',
      foreground: '220 9% 89%',
      'game-bg': '220 13% 12%',
      'game-text': '220 9% 65%',
      'game-text-typed': '47 96% 53%',
      'game-text-current': '220 9% 89%',
      'game-text-error': '0 84% 60%',
      'game-text-untyped': '220 9% 35%',
      card: '220 13% 12%',
      'card-foreground': '220 9% 89%',
      primary: '47 96% 53%',
      'primary-foreground': '220 13% 9%',
      secondary: '220 13% 18%',
      'secondary-foreground': '220 9% 89%',
      accent: '210 100% 56%',
      'accent-foreground': '220 13% 9%',
      destructive: '0 84% 60%',
      'destructive-foreground': '220 9% 89%',
      muted: '220 13% 18%',
      'muted-foreground': '220 9% 65%',
      border: '220 13% 18%',
      input: '220 13% 18%',
      ring: '47 96% 53%',
    },
  },
  {
    id: 'light',
    name: 'Light Mode',
    colors: {
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%',
      'game-bg': '210 40% 98%',
      'game-text': '215.4 16.3% 46.9%',
      'game-text-typed': '142.1 76.2% 36.3%',
      'game-text-current': '222.2 84% 4.9%',
      'game-text-error': '0 84% 60%',
      'game-text-untyped': '215.4 16.3% 56.9%',
      card: '0 0% 100%',
      'card-foreground': '222.2 84% 4.9%',
      primary: '222.2 47.4% 11.2%',
      'primary-foreground': '210 40% 98%',
      secondary: '210 40% 96%',
      'secondary-foreground': '222.2 47.4% 11.2%',
      accent: '210 40% 96%',
      'accent-foreground': '222.2 47.4% 11.2%',
      destructive: '0 84% 60%',
      'destructive-foreground': '210 40% 98%',
      muted: '210 40% 96%',
      'muted-foreground': '215.4 16.3% 46.9%',
      border: '214.3 31.8% 91.4%',
      input: '214.3 31.8% 91.4%',
      ring: '222.2 47.4% 11.2%',
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    colors: {
      background: '285 100% 4%',
      foreground: '300 100% 85%',
      'game-bg': '285 100% 6%',
      'game-text': '300 50% 60%',
      'game-text-typed': '300 100% 70%',
      'game-text-current': '300 100% 85%',
      'game-text-error': '0 100% 70%',
      'game-text-untyped': '300 30% 40%',
      card: '285 100% 6%',
      'card-foreground': '300 100% 85%',
      primary: '300 100% 70%',
      'primary-foreground': '285 100% 4%',
      secondary: '285 50% 15%',
      'secondary-foreground': '300 100% 85%',
      accent: '180 100% 60%',
      'accent-foreground': '285 100% 4%',
      destructive: '0 100% 70%',
      'destructive-foreground': '300 100% 85%',
      muted: '285 50% 15%',
      'muted-foreground': '300 50% 60%',
      border: '285 50% 15%',
      input: '285 50% 15%',
      ring: '300 100% 70%',
    },
  },
  {
    id: 'matrix',
    name: 'Matrix Green',
    colors: {
      background: '120 100% 2%',
      foreground: '120 100% 85%',
      'game-bg': '120 100% 4%',
      'game-text': '120 50% 50%',
      'game-text-typed': '120 100% 60%',
      'game-text-current': '120 100% 85%',
      'game-text-error': '0 100% 60%',
      'game-text-untyped': '120 30% 30%',
      card: '120 100% 4%',
      'card-foreground': '120 100% 85%',
      primary: '120 100% 60%',
      'primary-foreground': '120 100% 2%',
      secondary: '120 50% 10%',
      'secondary-foreground': '120 100% 85%',
      accent: '120 100% 40%',
      'accent-foreground': '120 100% 2%',
      destructive: '0 100% 60%',
      'destructive-foreground': '120 100% 85%',
      muted: '120 50% 10%',
      'muted-foreground': '120 50% 50%',
      border: '120 50% 10%',
      input: '120 50% 10%',
      ring: '120 100% 60%',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    colors: {
      background: '15 100% 6%',
      foreground: '30 100% 90%',
      'game-bg': '15 100% 8%',
      'game-text': '30 50% 60%',
      'game-text-typed': '30 100% 65%',
      'game-text-current': '30 100% 90%',
      'game-text-error': '0 100% 65%',
      'game-text-untyped': '30 30% 40%',
      card: '15 100% 8%',
      'card-foreground': '30 100% 90%',
      primary: '30 100% 65%',
      'primary-foreground': '15 100% 6%',
      secondary: '15 50% 15%',
      'secondary-foreground': '30 100% 90%',
      accent: '45 100% 60%',
      'accent-foreground': '15 100% 6%',
      destructive: '0 100% 65%',
      'destructive-foreground': '30 100% 90%',
      muted: '15 50% 15%',
      'muted-foreground': '30 50% 60%',
      border: '15 50% 15%',
      input: '15 50% 15%',
      ring: '30 100% 65%',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    colors: {
      background: '210 100% 6%',
      foreground: '200 100% 90%',
      'game-bg': '210 100% 8%',
      'game-text': '200 50% 60%',
      'game-text-typed': '190 100% 65%',
      'game-text-current': '200 100% 90%',
      'game-text-error': '0 100% 65%',
      'game-text-untyped': '200 30% 40%',
      card: '210 100% 8%',
      'card-foreground': '200 100% 90%',
      primary: '190 100% 65%',
      'primary-foreground': '210 100% 6%',
      secondary: '210 50% 15%',
      'secondary-foreground': '200 100% 90%',
      accent: '180 100% 60%',
      'accent-foreground': '210 100% 6%',
      destructive: '0 100% 65%',
      'destructive-foreground': '200 100% 90%',
      muted: '210 50% 15%',
      'muted-foreground': '200 50% 60%',
      border: '210 50% 15%',
      input: '210 50% 15%',
      ring: '190 100% 65%',
    },
  },
  {
    id: 'forest',
    name: 'Forest Theme',
    colors: {
      background: '140 30% 8%',
      foreground: '120 20% 85%',
      'game-bg': '140 30% 10%',
      'game-text': '120 20% 60%',
      'game-text-typed': '140 60% 55%',
      'game-text-current': '120 20% 85%',
      'game-text-error': '0 70% 60%',
      'game-text-untyped': '120 20% 40%',
      card: '140 30% 10%',
      'card-foreground': '120 20% 85%',
      primary: '140 60% 55%',
      'primary-foreground': '140 30% 8%',
      secondary: '140 20% 15%',
      'secondary-foreground': '120 20% 85%',
      accent: '160 50% 50%',
      'accent-foreground': '140 30% 8%',
      destructive: '0 70% 60%',
      'destructive-foreground': '120 20% 85%',
      muted: '140 20% 15%',
      'muted-foreground': '120 20% 60%',
      border: '140 20% 15%',
      input: '140 20% 15%',
      ring: '140 60% 55%',
    },
  },
  {
    id: 'retro',
    name: 'Retro Amber',
    colors: {
      background: '45 20% 8%',
      foreground: '45 80% 85%',
      'game-bg': '45 20% 10%',
      'game-text': '45 40% 60%',
      'game-text-typed': '45 100% 65%',
      'game-text-current': '45 80% 85%',
      'game-text-error': '0 80% 60%',
      'game-text-untyped': '45 20% 40%',
      card: '45 20% 10%',
      'card-foreground': '45 80% 85%',
      primary: '45 100% 65%',
      'primary-foreground': '45 20% 8%',
      secondary: '45 20% 15%',
      'secondary-foreground': '45 80% 85%',
      accent: '60 100% 60%',
      'accent-foreground': '45 20% 8%',
      destructive: '0 80% 60%',
      'destructive-foreground': '45 80% 85%',
      muted: '45 20% 15%',
      'muted-foreground': '45 40% 60%',
      border: '45 20% 15%',
      input: '45 20% 15%',
      ring: '45 100% 65%',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Purple',
    colors: {
      background: '260 30% 5%',
      foreground: '270 20% 85%',
      'game-bg': '260 30% 7%',
      'game-text': '270 20% 60%',
      'game-text-typed': '270 70% 65%',
      'game-text-current': '270 20% 85%',
      'game-text-error': '0 80% 60%',
      'game-text-untyped': '270 20% 35%',
      card: '260 30% 7%',
      'card-foreground': '270 20% 85%',
      primary: '270 70% 65%',
      'primary-foreground': '260 30% 5%',
      secondary: '260 20% 12%',
      'secondary-foreground': '270 20% 85%',
      accent: '280 60% 60%',
      'accent-foreground': '260 30% 5%',
      destructive: '0 80% 60%',
      'destructive-foreground': '270 20% 85%',
      muted: '260 20% 12%',
      'muted-foreground': '270 20% 60%',
      border: '260 20% 12%',
      input: '260 20% 12%',
      ring: '270 70% 65%',
    },
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    colors: {
      background: '0 0% 8%',
      foreground: '0 0% 90%',
      'game-bg': '0 0% 10%',
      'game-text': '0 0% 60%',
      'game-text-typed': '0 0% 80%',
      'game-text-current': '0 0% 90%',
      'game-text-error': '0 0% 40%',
      'game-text-untyped': '0 0% 40%',
      card: '0 0% 10%',
      'card-foreground': '0 0% 90%',
      primary: '0 0% 80%',
      'primary-foreground': '0 0% 8%',
      secondary: '0 0% 15%',
      'secondary-foreground': '0 0% 90%',
      accent: '0 0% 70%',
      'accent-foreground': '0 0% 8%',
      destructive: '0 0% 50%',
      'destructive-foreground': '0 0% 90%',
      muted: '0 0% 15%',
      'muted-foreground': '0 0% 60%',
      border: '0 0% 15%',
      input: '0 0% 15%',
      ring: '0 0% 80%',
    },
  },
];

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
  customThemes: Theme[];
  addCustomTheme: (theme: Theme) => void;
  removeCustomTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(predefinedThemes[0]);
  const [customThemes, setCustomThemes] = useState<Theme[]>([]);

  useEffect(() => {
    // Load saved theme from localStorage
    const savedThemeId = localStorage.getItem('typing-game-theme');
    const savedCustomThemes = localStorage.getItem('typing-game-custom-themes');
    
    if (savedCustomThemes) {
      const parsed = JSON.parse(savedCustomThemes);
      setCustomThemes(parsed);
    }
    
    if (savedThemeId) {
      const theme = [...predefinedThemes, ...customThemes].find(t => t.id === savedThemeId);
      if (theme) {
        setCurrentTheme(theme);
      }
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    
    // Save to localStorage
    localStorage.setItem('typing-game-theme', currentTheme.id);
  }, [currentTheme]);

  const setTheme = (theme: Theme) => {
    setCurrentTheme(theme);
  };

  const addCustomTheme = (theme: Theme) => {
    const updatedCustomThemes = [...customThemes, theme];
    setCustomThemes(updatedCustomThemes);
    localStorage.setItem('typing-game-custom-themes', JSON.stringify(updatedCustomThemes));
  };

  const removeCustomTheme = (themeId: string) => {
    const updatedCustomThemes = customThemes.filter(t => t.id !== themeId);
    setCustomThemes(updatedCustomThemes);
    localStorage.setItem('typing-game-custom-themes', JSON.stringify(updatedCustomThemes));
    
    // If the current theme is being removed, switch to default
    if (currentTheme.id === themeId) {
      setCurrentTheme(predefinedThemes[0]);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      currentTheme, 
      setTheme, 
      customThemes, 
      addCustomTheme, 
      removeCustomTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}