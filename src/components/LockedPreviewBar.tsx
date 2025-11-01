import { Trophy, Users, BarChart3, ShoppingBag, Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AuthDialog } from '@/components/AuthDialog';
import { Button } from '@/components/ui/button';

interface FeatureTeaser {
  icon: React.ElementType;
  label: string;
  tooltip: string;
}

const features: FeatureTeaser[] = [
  {
    icon: Trophy,
    label: 'Leaderboards',
    tooltip: 'Unlock Leaderboards — See where you rank among 5,000 racers!'
  },
  {
    icon: Users,
    label: 'Friends',
    tooltip: 'Unlock Friends — Challenge friends and compete in real-time duels!'
  },
  {
    icon: BarChart3,
    label: 'Stats',
    tooltip: 'Unlock Stats — Track your progress and improvement over time!'
  },
  {
    icon: ShoppingBag,
    label: 'Shop',
    tooltip: 'Unlock Shop — Customize your racer with unique icons and themes!'
  }
];

export function LockedPreviewBar() {
  return (
    <div className="w-full border-b bg-muted/30 backdrop-blur">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {features.map((feature) => (
            <AuthDialog key={feature.label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 opacity-50 hover:opacity-70 transition-opacity cursor-pointer"
                  >
                    <feature.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{feature.label}</span>
                    <Lock className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{feature.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </AuthDialog>
          ))}
        </div>
      </div>
    </div>
  );
}
