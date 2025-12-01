
import React from 'react';
import type { StaffState, Aircraft, Airport, StaffMember } from '../types';

interface StaffModalProps {
    staff: StaffState;
    playerCash: number;
    aircrafts: Aircraft[];
    airports: Airport[];
    staffCost: Record<string, number>;
    onHireStaff: (type: 'pilots' | 'engineers' | 'dispatchers' | 'cabinCrews') => void;
    onUnassignStaff: (staffMemberId: string) => void;
    onClose: () => void;
}

const StaffModal: React.FC<StaffModalProps> = ({ staff, playerCash, aircrafts, airports, staffCost, onHireStaff, onUnassignStaff, onClose }) => {
    const totalDailyCost = (staff.pilots.length * staffCost.pilots) +
                           (staff.engineers * staffCost.engineers) +
                           (staff.dispatchers.length * staffCost.dispatchers) +
                           (staff.cabinCrews.length * staffCost.cabinCrews);
    
    const getAssignmentName = (member: StaffMember, type: 'pilots' | 'cabinCrews' | 'dispatchers'): string => {
        if (!member.assignedTo) return 'In Pool';
        if (type === 'dispatchers') {
            return airports.find(ap => ap.code === member.assignedTo)?.code || 'Unknown Airport';
        }
        return aircrafts.find(ac => ac.id === member.assignedTo)?.name || 'Unknown Aircraft';
    };


    return (
        <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center z-50" onClick={onClose}>
            <div className="w-full max-w-7xl h-[80vh] bg-gray-800 border-2 border-green-500/30 rounded-lg shadow-2xl p-6 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">Staff Management</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-md mb-4 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-200">Total Daily Staff Cost</h3>
                        <p className="text-xl font-bold text-red-400">${totalDailyCost.toLocaleString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-grow overflow-hidden">
                    {/* Engineers */}
                    <div className="bg-gray-900/50 p-4 rounded-md flex flex-col">
                        <h4 className="font-bold text-orange-400 border-b border-orange-700 pb-1 mb-2">Engineering Teams</h4>
                        <p className="text-sm text-gray-400 mb-3 flex-grow">Each team reduces mechanical fault chances fleet-wide by 5%.</p>
                        <p className="text-4xl font-bold text-center text-white mb-3">{staff.engineers}</p>
                        <button
                            onClick={() => onHireStaff('engineers')}
                            disabled={playerCash < staffCost.engineers}
                            className="w-full px-4 py-2 bg-orange-600 rounded text-white font-bold hover:bg-orange-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            Hire (${staffCost.engineers.toLocaleString()})
                        </button>
                    </div>
                    
                    {/* Render Staff Category */}
                    {(['pilots', 'cabinCrews', 'dispatchers'] as const).map(type => {
                        const config = {
                            pilots: { title: 'Pilots', description: 'Assign to aircraft. Higher levels improve resilience to faults & weather.', cost: staffCost.pilots, color: 'yellow' },
                            cabinCrews: { title: 'Cabin Crews', description: 'Assign to aircraft. Higher levels attract more passengers on competitive routes.', cost: staffCost.cabinCrews, color: 'blue' },
                            dispatchers: { title: 'Dispatchers', description: 'Assign to hubs. Higher levels mitigate strikes & weather impacts.', cost: staffCost.dispatchers, color: 'green' },
                        };
                        const { title, description, cost, color } = config[type];
                        const staffList = staff[type];

                        return (
                            <div key={type} className="bg-gray-900/50 p-4 rounded-md flex flex-col">
                                <h4 className={`font-bold text-${color}-400 border-b border-${color}-700 pb-1 mb-2`}>{title} ({staffList.length})</h4>
                                <p className="text-sm text-gray-400 mb-3">{description}</p>
                                <button onClick={() => onHireStaff(type)} disabled={playerCash < cost} className={`w-full px-4 py-2 bg-${color}-600 rounded text-white font-bold hover:bg-${color}-500 disabled:bg-gray-600 disabled:cursor-not-allowed mb-3`}>
                                    Hire (${cost.toLocaleString()})
                                </button>
                                
                                <div className="flex-grow overflow-y-auto pr-1 text-xs space-y-2">
                                    <div className="grid grid-cols-4 font-bold text-gray-400 px-2">
                                        <span>ID</span>
                                        <span>Lvl</span>
                                        <span>Flights</span>
                                        <span>Assignment</span>
                                    </div>
                                    {staffList.length > 0 ? staffList.map(member => (
                                        <div key={member.id} className="grid grid-cols-4 items-center bg-gray-800 p-2 rounded">
                                            <span className="truncate" title={member.id}>{member.id.slice(0, 8)}</span>
                                            <span className="font-bold text-center">{member.level}</span>
                                            <span className="text-center">{member.flightsCompleted}</span>
                                            <div className="truncate text-right">
                                                <span title={getAssignmentName(member, type)}>{getAssignmentName(member, type)}</span>
                                                {member.assignedTo && <button onClick={() => onUnassignStaff(member.id)} className="text-yellow-400 hover:text-yellow-300 font-semibold ml-2">X</button>}
                                            </div>
                                        </div>
                                    )) : <p className="text-gray-500 text-center pt-8">No {title.toLowerCase()} hired.</p>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default StaffModal;
