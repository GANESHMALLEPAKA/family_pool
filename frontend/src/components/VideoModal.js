import React, { useState, useEffect } from 'react';
import './VideoModal.css';

const VideoModal = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const demoSteps = [
        {
            title: "Welcome to Family Pool",
            description: "India's #1 Family Wealth Management Platform",
            visual: "welcome",
            icon: "💰"
        },
        {
            title: "Create Your Family",
            description: "Add family members and set permissions",
            visual: "family",
            icon: "👨‍👩‍👧‍👦"
        },
        {
            title: "Pool Your Income",
            description: "Combine earnings into a shared family fund",
            visual: "pool",
            icon: "💵"
        },
        {
            title: "Set Shared Goals",
            description: "Dream home, education, vacation - track them all",
            visual: "goals",
            icon: "🎯"
        },
        {
            title: "Get AI Insights",
            description: "Smart recommendations to grow your wealth",
            visual: "ai",
            icon: "🤖"
        },
        {
            title: "Track Progress",
            description: "Beautiful dashboards for the whole family",
            visual: "dashboard",
            icon: "📊"
        },
        {
            title: "Grow Together",
            description: "Build generational wealth as a family",
            visual: "success",
            icon: "🚀"
        }
    ];

    useEffect(() => {
        if (isOpen && isPlaying) {
            const timer = setInterval(() => {
                setCurrentStep((prev) => {
                    if (prev >= demoSteps.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 3000);
            return () => clearInterval(timer);
        }
    }, [isOpen, isPlaying, demoSteps.length]);

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
            setIsPlaying(true);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        setIsPlaying(false);
        setCurrentStep(0);
        onClose();
    };

    const handleRestart = () => {
        setCurrentStep(0);
        setIsPlaying(true);
    };

    return (
        <div className="video-modal-overlay" onClick={handleClose}>
            <div className="video-modal" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button className="modal-close" onClick={handleClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                {/* Demo Content */}
                <div className="demo-container">
                    {/* Visual Area */}
                    <div className={`demo-visual visual-${demoSteps[currentStep].visual}`}>
                        <div className="demo-icon">{demoSteps[currentStep].icon}</div>

                        {/* Animated Elements based on step */}
                        {demoSteps[currentStep].visual === "welcome" && (
                            <div className="welcome-animation">
                                <div className="welcome-coins">💰 💎 💵 🪙</div>
                                <div className="welcome-text">Family Pool</div>
                            </div>
                        )}

                        {demoSteps[currentStep].visual === "family" && (
                            <div className="family-animation">
                                <div className="family-member m1">👴</div>
                                <div className="family-member m2">👨</div>
                                <div className="family-member m3">👩</div>
                                <div className="family-member m4">👦</div>
                                <div className="family-member m5">👧</div>
                                <div className="family-lines"></div>
                            </div>
                        )}

                        {demoSteps[currentStep].visual === "pool" && (
                            <div className="pool-animation">
                                <div className="money-flow">
                                    <span>₹50,000</span>
                                    <span>₹30,000</span>
                                    <span>₹20,000</span>
                                </div>
                                <div className="pool-total">
                                    <span className="pool-label">Family Pool</span>
                                    <span className="pool-amount">₹1,00,000</span>
                                </div>
                            </div>
                        )}

                        {demoSteps[currentStep].visual === "goals" && (
                            <div className="goals-animation">
                                <div className="goal-item">
                                    <span>🏠 Dream Home</span>
                                    <div className="goal-bar"><div className="fill" style={{ width: '65%' }}></div></div>
                                </div>
                                <div className="goal-item">
                                    <span>🎓 Education</span>
                                    <div className="goal-bar"><div className="fill gold" style={{ width: '42%' }}></div></div>
                                </div>
                                <div className="goal-item">
                                    <span>✈️ Vacation</span>
                                    <div className="goal-bar"><div className="fill green" style={{ width: '88%' }}></div></div>
                                </div>
                            </div>
                        )}

                        {demoSteps[currentStep].visual === "ai" && (
                            <div className="ai-animation">
                                <div className="ai-bubble">
                                    <span>💡 Save ₹5,000 more this month</span>
                                </div>
                                <div className="ai-bubble delay-1">
                                    <span>📈 Invest in mutual funds</span>
                                </div>
                                <div className="ai-bubble delay-2">
                                    <span>🎯 You're 15% ahead of goal!</span>
                                </div>
                            </div>
                        )}

                        {demoSteps[currentStep].visual === "dashboard" && (
                            <div className="dashboard-animation">
                                <div className="mini-card">📊 ₹12,45,000</div>
                                <div className="mini-card gold">📈 +12%</div>
                                <div className="mini-card green">🎯 78%</div>
                                <div className="chart-bars">
                                    <div className="bar" style={{ height: '60%' }}></div>
                                    <div className="bar" style={{ height: '80%' }}></div>
                                    <div className="bar" style={{ height: '45%' }}></div>
                                    <div className="bar" style={{ height: '90%' }}></div>
                                    <div className="bar" style={{ height: '70%' }}></div>
                                </div>
                            </div>
                        )}

                        {demoSteps[currentStep].visual === "success" && (
                            <div className="success-animation">
                                <div className="success-icon">🎉</div>
                                <div className="success-text">Start Your Journey Today!</div>
                                <div className="confetti">🎊 ✨ 🌟 💫</div>
                            </div>
                        )}
                    </div>

                    {/* Text Content */}
                    <div className="demo-content">
                        <div className="step-indicator">
                            Step {currentStep + 1} of {demoSteps.length}
                        </div>
                        <h2>{demoSteps[currentStep].title}</h2>
                        <p>{demoSteps[currentStep].description}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="demo-progress">
                        {demoSteps.map((_, index) => (
                            <div
                                key={index}
                                className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                                onClick={() => { setCurrentStep(index); setIsPlaying(false); }}
                            />
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="demo-controls">
                        <button
                            className="control-btn prev"
                            onClick={() => { setCurrentStep(Math.max(0, currentStep - 1)); setIsPlaying(false); }}
                            disabled={currentStep === 0}
                        >
                            ← Previous
                        </button>
                        <button
                            className="control-btn play"
                            onClick={() => setIsPlaying(!isPlaying)}
                        >
                            {isPlaying ? '⏸ Pause' : '▶ Play'}
                        </button>
                        {currentStep === demoSteps.length - 1 ? (
                            <button className="control-btn restart" onClick={handleRestart}>
                                🔄 Restart
                            </button>
                        ) : (
                            <button
                                className="control-btn next"
                                onClick={() => { setCurrentStep(Math.min(demoSteps.length - 1, currentStep + 1)); setIsPlaying(false); }}
                            >
                                Next →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoModal;
