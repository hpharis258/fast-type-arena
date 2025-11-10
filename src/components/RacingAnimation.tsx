import React from 'react';
import defaultCar from '@/assets/cars/default.png';
import redRocketCar from '@/assets/cars/red-rocket.png';
import greenSpeedsterCar from '@/assets/cars/green-speedster.png';
import goldChampionCar from '@/assets/cars/gold-champion.png';
import purplePhantomCar from '@/assets/cars/purple-phantom.png';
import cyanFlashCar from '@/assets/cars/cyan-flash.png';
import pinkPowerCar from '@/assets/cars/pink-power.png';
import silverBulletCar from '@/assets/cars/silver-bullet.png';

interface RacingAnimationProps {
  player1Progress: number; // 0-100
  player2Progress: number; // 0-100
  player1Name: string;
  player2Name: string;
  player1Icon?: string;
  player2Icon?: string;
}

const getIconColor = (iconId?: string): string => {
  const iconColors: Record<string, string> = {
    'default': '#3B82F6',
    'red-rocket': '#EF4444',
    'green-speedster': '#10B981',
    'gold-champion': '#F59E0B',
    'purple-phantom': '#8B5CF6',
    'cyan-flash': '#06B6D4',
    'pink-power': '#EC4899',
    'silver-bullet': '#9CA3AF',
  };
  return iconColors[iconId || 'default'] || '#3B82F6';
};

const getIconImage = (iconId?: string): string => {
  const iconImages: Record<string, string> = {
    'default': defaultCar,
    'red-rocket': redRocketCar,
    'green-speedster': greenSpeedsterCar,
    'gold-champion': goldChampionCar,
    'purple-phantom': purplePhantomCar,
    'cyan-flash': cyanFlashCar,
    'pink-power': pinkPowerCar,
    'silver-bullet': silverBulletCar,
  };
  return iconImages[iconId || 'default'] || defaultCar;
};

export default function RacingAnimation({ 
  player1Progress, 
  player2Progress, 
  player1Name, 
  player2Name,
  player1Icon,
  player2Icon 
}: RacingAnimationProps) {
  const player1Color = getIconColor(player1Icon);
  const player2Color = getIconColor(player2Icon);
  const player1Image = getIconImage(player1Icon);
  const player2Image = getIconImage(player2Icon);
  return (
    <div className="w-full bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6 mb-6">
      <div className="relative h-32 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg overflow-hidden">
        {/* Track lines */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 w-full h-0.5 bg-yellow-400 transform -translate-y-0.5 opacity-60"></div>
          <div className="absolute top-1/4 w-full h-px bg-white opacity-30"></div>
          <div className="absolute top-3/4 w-full h-px bg-white opacity-30"></div>
          
          {/* Dashed center line */}
          <div className="absolute top-1/2 w-full h-0.5 transform -translate-y-0.5">
            <div className="flex w-full h-full">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-white' : 'bg-transparent'} opacity-40`}></div>
              ))}
            </div>
          </div>
        </div>

        {/* Player 1 Car (Top lane) */}
        <div className="absolute top-2 left-2 h-12 flex items-center">
          <div 
            className="transition-all duration-300 ease-out"
            style={{ transform: `translateX(${player1Progress * 3}px)` }}
          >
            <div className="relative">
              {/* Car body */}
              <div 
                className="w-12 h-10 rounded-lg shadow-lg relative flex items-center justify-center"
                style={{ 
                  transform: 'scaleX(-1)'
                }}
              >
                <img 
                  src={player1Image} 
                  alt={player1Name}
                  className="w-full h-full object-contain"
                />
              </div>
              {/* Speed effect */}
              {player1Progress > 0 && (
                <div className="absolute top-2 -left-6 flex space-x-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="w-3 h-0.5 bg-blue-400 opacity-60 animate-pulse"></div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="ml-4 text-sm font-medium text-red-400">{player1Name}</div>
        </div>

        {/* Player 2 Car (Bottom lane) */}
        <div className="absolute bottom-2 left-2 h-12 flex items-center">
          <div 
            className="transition-all duration-300 ease-out"
            style={{ transform: `translateX(${player2Progress * 3}px)` }}
          >
            <div className="relative">
              {/* Car body */}
              <div 
                className="w-12 h-10 rounded-lg shadow-lg relative flex items-center justify-center"
                style={{ 
                  transform: 'scaleX(-1)'
                }}
              >
                <img 
                  src={player2Image} 
                  alt={player2Name}
                  className="w-full h-full object-contain"
                />
              </div>
              {/* Speed effect */}
              {player2Progress > 0 && (
                <div className="absolute top-2 -left-6 flex space-x-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="w-3 h-0.5 bg-red-400 opacity-60 animate-pulse"></div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="ml-4 text-sm font-medium text-blue-400">{player2Name}</div>
        </div>

        {/* Finish line */}
        <div className="absolute top-0 right-4 w-1 h-full bg-gradient-to-b from-white via-black to-white opacity-80">
          <div className="w-full h-full" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, white 0px, white 4px, black 4px, black 8px)'
          }}></div>
        </div>
      </div>

      {/* Progress bars */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: player1Color }}></div>
          <div className="flex-1 bg-gray-700 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ width: `${player1Progress}%`, backgroundColor: player1Color }}
            ></div>
          </div>
          <span className="text-sm w-12" style={{ color: player1Color }}>{Math.round(player1Progress)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: player2Color }}></div>
          <div className="flex-1 bg-gray-700 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ width: `${player2Progress}%`, backgroundColor: player2Color }}
            ></div>
          </div>
          <span className="text-sm w-12" style={{ color: player2Color }}>{Math.round(player2Progress)}%</span>
        </div>
      </div>
    </div>
  );
}