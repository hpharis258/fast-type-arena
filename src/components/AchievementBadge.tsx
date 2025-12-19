import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Trophy, Zap, Target, Award, Medal, Star, Flame, Crown,
  Sword, Shield, Calendar, CalendarCheck, Play, Repeat, CheckCircle, Crosshair, Swords
} from 'lucide-react';

interface AchievementBadgeProps {
  name: string;
  description: string;
  icon: string;
  badgeColor: string;
  unlocked?: boolean;
  unlockedAt?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  zap: Zap,
  target: Target,
  award: Award,
  medal: Medal,
  star: Star,
  flame: Flame,
  crown: Crown,
  sword: Sword,
  shield: Shield,
  calendar: Calendar,
  'calendar-check': CalendarCheck,
  play: Play,
  repeat: Repeat,
  'check-circle': CheckCircle,
  crosshair: Crosshair,
  swords: Swords,
};

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

const iconSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function AchievementBadge({
  name,
  description,
  icon,
  badgeColor,
  unlocked = true,
  unlockedAt,
  size = 'md',
  showTooltip = true,
}: AchievementBadgeProps) {
  const IconComponent = iconMap[icon] || Trophy;

  const badge = (
    <div
      className={cn(
        'relative rounded-full flex items-center justify-center transition-all duration-300',
        sizeClasses[size],
        unlocked
          ? 'shadow-lg hover:scale-110 cursor-pointer'
          : 'opacity-40 grayscale'
      )}
      style={{
        backgroundColor: unlocked ? badgeColor : '#374151',
        boxShadow: unlocked ? `0 0 20px ${badgeColor}40` : 'none',
      }}
    >
      <IconComponent
        className={cn(
          iconSizeClasses[size],
          'text-white drop-shadow-sm'
        )}
      />
      {unlocked && (
        <div
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background: `radial-gradient(circle, ${badgeColor}20 0%, transparent 70%)`,
          }}
        />
      )}
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {badge}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px]">
        <div className="text-center">
          <p className="font-semibold">{name}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
          {unlocked && unlockedAt && (
            <p className="text-xs text-primary mt-1">
              Unlocked {new Date(unlockedAt).toLocaleDateString()}
            </p>
          )}
          {!unlocked && (
            <p className="text-xs text-muted-foreground mt-1 italic">Locked</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
