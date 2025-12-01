import React, { useState } from 'react';
import type { WeeklyReportData } from '../types';

interface WeeklyReportModalProps {
  data: WeeklyReportData;
  onClose: () => void;
}

type ReportTab = 'summary' | 'pnl' | 'opportunities' | 'satisfaction';

const WeeklyReportModal: React.FC<WeeklyReportModalProps> = ({ data, onClose }) => {
    const [activeTab, setActiveTab] = useState<ReportTab>('summary');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'summary':
                return (
                    <div>
                        <h3 className="text-xl font-bold text-yellow-400 mb-4">Top 10 Profitable Routes</h3>
                        <div className="space-y-2">
                            {data.topProfitableRoutes.length > 0 ? data.topProfitableRoutes.map(({ routeKey, profit }) => (
                                <div key={routeKey} className="flex justify-between items-center bg-gray-800/50 p-2 rounded">
                                    <span className="font-semibold text-gray-300">{routeKey}</span>
                                    <span className="font-bold text-green-400">${Math.round(profit).toLocaleString()}</span>
                                </div>
                            )) : <p className="text-gray-500 text-center py-4">No profitable routes recorded this week.</p>}
                        </div>
                    </div>
                );
            case 'pnl':
                return (
                    <div>
                        <h3 className="text-xl font-bold text-yellow-400 mb-4">Daily Profit & Loss</h3>
                        <div className="space-y-2">
                             {data.dailyPnl.sort((a,b) => a.day - b.day).map(({ day, pnl }) => (
                                <div key={day} className="flex justify-between items-center bg-gray-800/50 p-2 rounded">
                                    <span className="font-semibold text-gray-300">Day {day}</span>
                                    <span className={`font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pnl >= 0 ? '+' : ''}${Math.round(pnl).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'opportunities':
                 return (
                    <div>
                        <h3 className="text-xl font-bold text-yellow-400 mb-4">Unserved Passenger Opportunities</h3>
                        <p className="text-sm text-gray-400 mb-4">Routes where your flights were full, but more demand existed. Consider using larger aircraft.</p>
                        <div className="space-y-2">
                            {data.unservedOpportunities.length > 0 ? data.unservedOpportunities.map(({ routeKey, passengersMissed, potentialRevenueIncrease }, index) => (
                                <div key={index} className="grid grid-cols-3 items-center bg-gray-800/50 p-2 rounded text-center">
                                    <span className="font-semibold text-gray-300 text-left">{routeKey}</span>
                                    <span className="text-white">{passengersMissed.toLocaleString()} <span className="text-xs text-gray-400">missed</span></span>
                                    <span className="text-green-400 font-semibold">+${Math.round(potentialRevenueIncrease).toLocaleString()} <span className="text-xs text-gray-400">potential</span></span>
                                </div>
                            )) : <p className="text-gray-500 text-center py-4">No significant unserved passenger opportunities detected.</p>}
                        </div>
                    </div>
                );
            case 'satisfaction':
                 return (
                    <div>
                        <h3 className="text-xl font-bold text-yellow-400 mb-4">Route Satisfaction Scores</h3>
                        <p className="text-sm text-gray-400 mb-4">Passenger likelihood to choose your airline on competitive routes (0-100).</p>
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                            {data.routeSatisfaction.map(({ routeKey, satisfaction }) => {
                                const satisfactionColor = satisfaction > 65 ? 'text-green-400' : satisfaction < 45 ? 'text-red-400' : 'text-yellow-400';
                                return (
                                    <div key={routeKey} className="flex justify-between items-center bg-gray-800/50 p-2 rounded">
                                        <span className="font-semibold text-gray-300">{routeKey}</span>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-24 bg-gray-700 rounded-full h-2.5">
                                                <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${satisfaction}%` }}></div>
                                            </div>
                                            <span className={`font-bold w-8 text-right ${satisfactionColor}`}>{Math.round(satisfaction)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
        }
    }

    return (
        <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center z-50" onClick={onClose}>
            <div className="w-full max-w-4xl h-[80vh] bg-gray-800 border-2 border-purple-500/30 rounded-lg shadow-2xl p-6 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">Weekly Performance Report</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                
                <div className="flex border-b border-gray-700 mb-4 flex-shrink-0">
                    {(['summary', 'pnl', 'opportunities', 'satisfaction'] as ReportTab[]).map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-semibold capitalize ${activeTab === tab ? 'border-b-2 border-yellow-400 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            {tab === 'pnl' ? 'P&L' : tab}
                        </button>
                    ))}
                </div>

                <div className="flex-grow overflow-y-auto pr-2">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default WeeklyReportModal;
