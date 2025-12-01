import React, { useState } from 'react';
import type { GameDifficulty } from '../types';

interface WelcomeModalProps {
  onStart: (difficulty: GameDifficulty) => void;
  onQuickStart: (difficulty: GameDifficulty) => void;
  onStartTutorial: () => void;
  onBigStart: (difficulty: GameDifficulty) => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onStart, onQuickStart, onStartTutorial, onBigStart }) => {
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');

  return (
    <div className="absolute inset-0 bg-gray-900/95 flex items-center justify-center font-sans z-50">
        <div className="w-full max-w-3xl mx-auto bg-gray-800 border-2 border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-500/10 p-8 text-left">
            <h1 className="text-3xl font-bold text-center text-gray-100 mb-4">Welcome to AeroDynasty</h1>
            <p className="text-gray-400 mb-6 text-center leading-relaxed">
                Your goal is to build a thriving airline from the ground up. You will manage finances, purchase aircraft, and plan routes in a dynamic, simulated airspace.
            </p>
            
            <div className="bg-gray-900/50 p-4 rounded-md mb-6">
                <h2 className="text-lg font-semibold text-center text-cyan-400 mb-3">Choose Difficulty</h2>
                <div className="flex justify-center space-x-4">
                    {(['easy', 'medium', 'hard'] as GameDifficulty[]).map(d => (
                        <label key={d} className={`cursor-pointer p-3 rounded-md border-2 w-1/3 text-center transition-colors ${difficulty === d ? 'bg-cyan-600 border-cyan-400' : 'bg-gray-700 border-gray-600 hover:border-gray-500'}`}>
                            <input
                                type="radio"
                                name="difficulty"
                                value={d}
                                checked={difficulty === d}
                                onChange={() => setDifficulty(d)}
                                className="sr-only"
                            />
                            <span className="font-bold capitalize">{d}</span>
                            <p className="text-xs text-gray-300 mt-1">
                                {d === 'easy' && '-10% Event Severity'}
                                {d === 'medium' && 'Standard Experience'}
                                {d === 'hard' && '+10% Event Severity'}
                            </p>
                        </label>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                 <button
                    onClick={onStartTutorial}
                    className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-md text-white text-lg font-bold transition-colors duration-300 lg:col-span-2"
                >
                    Start Tutorial
                </button>
                 <button
                    onClick={() => onStart(difficulty)}
                    className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white text-lg font-bold transition-colors duration-300"
                >
                    Standard Game
                </button>
                <button
                    onClick={() => onQuickStart(difficulty)}
                    className="w-full px-6 py-3 bg-yellow-600 hover:bg-yellow-500 rounded-md text-white text-lg font-bold transition-colors duration-300"
                >
                    Quick Start
                </button>
                 <button
                    onClick={() => onBigStart(difficulty)}
                    className="w-full px-6 py-3 bg-green-600 hover:bg-green-500 rounded-md text-white text-lg font-bold transition-colors duration-300 lg:col-span-4"
                >
                    Big Start (10 Aircraft)
                </button>
            </div>
        </div>
    </div>
  );
};

export default WelcomeModal;