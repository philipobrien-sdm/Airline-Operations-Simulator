import React, { useState, useEffect, useMemo } from 'react';

export interface TutorialStep {
    targetSelector: string;
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    preAction?: () => void;
    postAction?: () => void;
}

interface TutorialOverlayProps {
    steps: TutorialStep[];
    stepIndex: number;
    onNext: () => void;
    onEnd: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ steps, stepIndex, onNext, onEnd }) => {
    const [highlightBox, setHighlightBox] = useState<DOMRect | null>(null);

    const currentStep = useMemo(() => steps[stepIndex], [steps, stepIndex]);

    useEffect(() => {
        if (!currentStep) return;

        // Use a small timeout to allow the UI to update from any preActions
        const timer = setTimeout(() => {
            try {
                const element = document.querySelector(currentStep.targetSelector);
                if (element) {
                    setHighlightBox(element.getBoundingClientRect());
                } else {
                    console.warn(`Tutorial target not found: ${currentStep.targetSelector}`);
                    setHighlightBox(null); // Hide highlight if target not found
                }
            } catch (e) {
                console.error("Invalid selector for tutorial:", currentStep.targetSelector);
                setHighlightBox(null);
            }
        }, 100); // 100ms delay

        return () => clearTimeout(timer);

    }, [currentStep]);

    const handleNext = () => {
        // On the final step, any click should end the tutorial.
        if (stepIndex === steps.length - 1) {
            onEnd();
            return;
        }
        if (currentStep.postAction) {
            currentStep.postAction();
        }
        onNext();
    };

    if (!currentStep) return null;

    const tooltipPosition: React.CSSProperties = {
        position: 'absolute',
        width: '20rem', // w-80
        transition: 'all 300ms ease-in-out',
    };
    
    if (highlightBox) {
        const spacing = 15;
        let position = currentStep.position || 'bottom';

        // Auto-adjust position if target is too close to the edge
        if (position === 'top' && highlightBox.top < 150) {
            position = 'bottom';
        }
        if (position === 'bottom' && highlightBox.bottom > window.innerHeight - 150) {
            position = 'top';
        }

        switch(position) {
            case 'top':
                tooltipPosition.bottom = `${window.innerHeight - highlightBox.top + spacing}px`;
                tooltipPosition.left = `${highlightBox.left + highlightBox.width / 2}px`;
                tooltipPosition.transform = 'translateX(-50%)';
                break;
            case 'bottom':
                tooltipPosition.top = `${highlightBox.bottom + spacing}px`;
                tooltipPosition.left = `${highlightBox.left + highlightBox.width / 2}px`;
                tooltipPosition.transform = 'translateX(-50%)';
                break;
            case 'left':
                tooltipPosition.top = `${highlightBox.top + highlightBox.height / 2}px`;
                tooltipPosition.right = `${window.innerWidth - highlightBox.left + spacing}px`;
                tooltipPosition.transform = 'translateY(-50%)';
                break;
            case 'right':
                tooltipPosition.top = `${highlightBox.top + highlightBox.height / 2}px`;
                tooltipPosition.left = `${highlightBox.right + spacing}px`;
                tooltipPosition.transform = 'translateY(-50%)';
                break;
        }
    } else {
        // Center tooltip if no target
        tooltipPosition.top = '50%';
        tooltipPosition.left = '50%';
        tooltipPosition.transform = 'translate(-50%, -50%)';
    }


    return (
        <div className="absolute inset-0 z-[100]" onClick={handleNext}>
            {/* Highlight Box, which also creates the overlay via shadow */}
            {highlightBox && (
                 <div
                    className="absolute transition-all duration-300 ease-in-out pointer-events-none"
                    style={{
                        top: `${highlightBox.top - 5}px`,
                        left: `${highlightBox.left - 5}px`,
                        width: `${highlightBox.width + 10}px`,
                        height: `${highlightBox.height + 10}px`,
                        boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.7)', // bg-slate-900 with 70% opacity
                        border: '2px solid #22d3ee', // cyan-400
                        borderRadius: '8px',
                    }}
                ></div>
            )}
           
            {/* Tooltip */}
            <div 
                style={tooltipPosition}
                className="bg-gray-800/80 backdrop-blur-md border-2 border-cyan-500/50 rounded-lg shadow-2xl p-4 text-left"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-lg font-bold text-cyan-400 mb-2">{currentStep.title}</h3>
                <p className="text-gray-300 text-sm mb-4">{currentStep.content}</p>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Step {stepIndex + 1} of {steps.length}</span>
                    <div>
                        <button onClick={onEnd} className="text-xs text-gray-400 hover:text-white mr-4">Skip Tutorial</button>
                        <button onClick={handleNext} className="px-4 py-1.5 bg-cyan-600 rounded text-white font-bold hover:bg-cyan-500">
                           {stepIndex === steps.length - 1 ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorialOverlay;
