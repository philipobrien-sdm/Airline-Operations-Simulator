import React from 'react';
import type { GameSpeed } from '../types';
import Tooltip from './Tooltip';

interface ControlsPanelProps {
  gameTime: number;
  playerCash: number;
  cashAtStartOfWeek: number;
  isPaused: boolean;
  gameSpeed: GameSpeed;
  isHelpModeActive: boolean;
  onTogglePause: () => void;
  onChangeSpeed: (speed: GameSpeed) => void;
  onShowFleetManagement: () => void;
  onShowCompetition: () => void;
  onShowStaffManagement: () => void;
  onRunWeeklyReport: () => void;
  onToggleHelpMode: () => void;
}

const gameSpeeds: GameSpeed[] = [1, 5, 20, 50, 500, 3600];

const ControlsPanel: React.FC<ControlsPanelProps> = ({ 
  gameTime, playerCash, cashAtStartOfWeek, isPaused, gameSpeed, isHelpModeActive,
  onTogglePause, onChangeSpeed, onShowFleetManagement, onShowCompetition, onShowStaffManagement, onRunWeeklyReport, onToggleHelpMode
}) => {
  const formatTime = (time: number) => {
    const hours = Math.floor(time) % 24;
    const minutes = Math.floor((time * 60) % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const day = Math.floor(gameTime / 24) + 1;
  const dayInCycle = (day - 1) % 7 + 1;
  const weeklyPnl = playerCash - cashAtStartOfWeek;

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeedIndex = parseInt(e.target.value, 10);
    onChangeSpeed(gameSpeeds[newSpeedIndex]);
  };

  const currentSpeedIndex = gameSpeeds.indexOf(gameSpeed);

  return (
    <div className="w-full text-gray-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-white">AeroDynasty</h2>
          <p className="text-sm text-cyan-400">Week {Math.floor((day-1)/7) + 1}, Day {dayInCycle} | {formatTime(gameTime)}</p>
        </div>
        <div className="text-right">
            <Tooltip text="Your current cash balance. Don't let this go below zero!" isHelpModeActive={isHelpModeActive}>
                <p className="text-2xl font-bold text-green-400">${playerCash.toLocaleString()}</p>
            </Tooltip>
            <Tooltip text="Your profit and loss for the current week." isHelpModeActive={isHelpModeActive}>
                <p className={`text-sm font-semibold ${weeklyPnl >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    ({weeklyPnl >= 0 ? '+' : ''}{weeklyPnl.toLocaleString()})
                </p>
            </Tooltip>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <div className="flex justify-between items-center space-x-2">
            <button id="play-pause-button" onClick={onTogglePause} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white font-bold w-24 flex-shrink-0">
                {isPaused ? '▶ Play' : '❚❚ Pause'}
            </button>
             {isPaused && (
                <Tooltip text="Toggle Help Mode. When active, hover over items to learn about them." isHelpModeActive={isHelpModeActive}>
                    <button onClick={onToggleHelpMode} className={`px-3 py-2 rounded font-bold text-lg transition-colors ${isHelpModeActive ? 'bg-cyan-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}>
                        ?
                    </button>
                </Tooltip>
             )}
            <div className="flex-grow flex items-center space-x-2">
                 <Tooltip text="Controls the speed of the simulation." isHelpModeActive={isHelpModeActive}>
                    <input
                        type="range"
                        min="0"
                        max={gameSpeeds.length - 1}
                        step="1"
                        value={currentSpeedIndex > -1 ? currentSpeedIndex : 0}
                        onChange={handleSpeedChange}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                 </Tooltip>
                <span className="text-sm font-bold w-16 text-right">{gameSpeed}x</span>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
            <Tooltip text="Buy new aircraft and manage your fleet." isHelpModeActive={isHelpModeActive}>
                <button id="manage-fleet-button" onClick={onShowFleetManagement} className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-white font-bold">
                  Manage Fleet
                </button>
            </Tooltip>
            <Tooltip text="View competitor schedules and analyze market saturation." isHelpModeActive={isHelpModeActive}>
                 <button onClick={onShowCompetition} className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded text-white font-bold">
                  Competition
                </button>
            </Tooltip>
        </div>
        <div className="grid grid-cols-2 gap-2">
            <Tooltip text="Hire and manage your pilots, cabin crew, and dispatchers." isHelpModeActive={isHelpModeActive}>
                <button onClick={onShowStaffManagement} className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white font-bold">
                  Manage Staff
                </button>
            </Tooltip>
            <Tooltip text="Generate a performance report for the current week so far." isHelpModeActive={isHelpModeActive}>
                <button onClick={onRunWeeklyReport} className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded text-white font-bold">
                  Run Report
                </button>
            </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default ControlsPanel;