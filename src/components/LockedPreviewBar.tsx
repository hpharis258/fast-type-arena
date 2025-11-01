import { Trophy, Users, BarChart3, ShoppingBag, Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AuthDialog } from '@/components/AuthDialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface FeatureTeaser {
  icon: React.ElementType;
  label: string;
  tooltip: string;
  path: string;
}

const features: FeatureTeaser[] = [
  {
    icon: Users,
    label: 'Friends',
    tooltip: 'Unlock Friends — Challenge friends and compete in real-time duels!',
    path: '/friends'
  },
  {
    icon: BarChart3,
    label: 'Stats',
    tooltip: 'Unlock Stats — Track your progress and improvement over time!',
    path: '/stats'
  },
  {
    icon: ShoppingBag,
    label: 'Shop',
    tooltip: 'Unlock Shop — Customize your racer with unique icons and themes!',
    path: '/shop'
  }
];

export function LockedPreviewBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState('');

  const handleFeatureClick = (path: string) => {
    setSelectedPath(path);
    localStorage.setItem('redirectAfterAuth', path);
    setIsOpen(true);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {features.map((feature) => (
          <Tooltip key={feature.label}>
            <TooltipTrigger asChild>
              <AuthDialog >
              <Button
                variant="ghost"
                className="flex items-center gap-2 opacity-50 hover:opacity-70 transition-opacity cursor-pointer"
                onClick={() => handleFeatureClick(feature.path)}
              >
                <feature.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{feature.label}</span>
                <Lock className="w-3 h-3" />
              </Button>
              </AuthDialog>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{feature.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </>
  );
}
