import React, { useState } from 'react';

import ControlsPanel from './ControlsPanel';
import FleetPanel from './FleetPanel';
import AirportListPanel from './AirportListPanel';
import Tooltip from './Tooltip';

import type { GameSpeed, Aircraft, Airport } from '../types';

interface RightPanelProps {
    // For ControlsPanel
    gameTime: number;
    playerCash: number;
    cashAtStartOfWeek: number;
    isPaused: boolean;
    gameSpeed: GameSpeed;
    schedulesLocked: boolean;
    isHelpModeActive: boolean;
    onTogglePause: () => void;
    onChangeSpeed: (speed: GameSpeed) => void;
    onShowFleetManagement: () => void;
    onShowCompetition: () => void;
    onShowStaffManagement: () => void;
    onLockSchedules: () => void;
    onRunWeeklyReport: () => void;
    onToggleHelpMode: () => void;

    // For FleetPanel
    aircrafts: Aircraft[];
    selectedAircraftId: string | null;
    onSelectAircraft: (id: string) => void;
    getAirportByCode: (code: string) => Airport | undefined;

    // For AirportListPanel
    airports: Airport[];
    onSelectAirport: (code: string) => void;
    selectedAirport: Airport | null;
}

const RightPanel: React.FC<RightPanelProps> = (props) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    const day = Math.floor(props.gameTime / 24) + 1;
    const dayInCycle = (day - 1) % 7 + 1;
    const isPlanningPhase = dayInCycle === 1 && !props.schedulesLocked;

    return (
        <Tooltip text="This is your main control panel. Manage game time, finances, fleets, and airports from here." isHelpModeActive={props.isHelpModeActive}>
            <div id="right-panel" className="absolute top-4 right-4 w-80 bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 rounded-lg flex flex-col">
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)} 
                    className="w-full p-2 text-center font-bold text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-t-lg flex justify-between items-center"
                >
                    <span>Game Controls & Info</span>
                    <span className={`transform transition-transform text-lg ${isCollapsed ? '-rotate-90' : 'rotate-90'}`}>›</span>
                </button>
                {!isCollapsed && (
                    <div className="max-h-[calc(100vh-5rem)] overflow-y-auto">
                        <div className="p-4 space-y-4">
                            <ControlsPanel 
                                gameTime={props.gameTime}
                                playerCash={props.playerCash}
                                cashAtStartOfWeek={props.cashAtStartOfWeek}
                                isPaused={props.isPaused}
                                gameSpeed={props.gameSpeed}
                                isHelpModeActive={props.isHelpModeActive}
                                onTogglePause={props.onTogglePause}
                                onChangeSpeed={props.onChangeSpeed}
                                onShowFleetManagement={props.onShowFleetManagement}
                                onShowCompetition={props.onShowCompetition}
                                onShowStaffManagement={props.onShowStaffManagement}
                                onRunWeeklyReport={props.onRunWeeklyReport}
                                onToggleHelpMode={props.onToggleHelpMode}
                            />
                            <FleetPanel
                                aircrafts={props.aircrafts}
                                selectedAircraftId={props.selectedAircraftId}
                                onSelectAircraft={props.onSelectAircraft}
                                getAirportByCode={props.getAirportByCode}
                                isHelpModeActive={props.isHelpModeActive}
                            />
                            {isPlanningPhase && (
                                <div className="mt-4">
                                     <Tooltip text="Lock in your schedules for the week to start operations. This can only be done on Day 1." isHelpModeActive={props.isHelpModeActive}>
                                        <button id="lock-schedules-button" onClick={props.onLockSchedules} className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-400 rounded text-black font-bold">
                                            Lock-in Schedules
                                        </button>
                                     </Tooltip>
                                </div>
                            )}
                            <AirportListPanel
                                airports={props.airports}
                                onSelectAirport={props.onSelectAirport}
                                selectedAirport={props.selectedAirport}
                                isHelpModeActive={props.isHelpModeActive}
                            />
                        </div>
                    </div>
                )}
            </div>
        </Tooltip>
    );
};

export default RightPanel;