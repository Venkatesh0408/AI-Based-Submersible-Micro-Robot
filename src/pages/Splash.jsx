import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Navigation, ShieldCheck, Database, Camera, Activity } from 'lucide-react';

export default function Splash() {
    const navigate = useNavigate();
    const [loadingStage, setLoadingStage] = useState(0);
    const [progress, setProgress] = useState(0);

    const stages = [
        { text: "System Initialization", icon: <Activity className="w-4 h-4" /> },
        { text: "Checking Sensors", icon: <Activity className="w-4 h-4" /> },
        { text: "Loading AI Engine", icon: <Database className="w-4 h-4" /> },
        { text: "Initializing Mission Control", icon: <Navigation className="w-4 h-4" /> },
        { text: "Preparing Camera", icon: <Camera className="w-4 h-4" /> },
        { text: "Connecting Database", icon: <Database className="w-4 h-4" /> },
        { text: "Starting Secure Session", icon: <ShieldCheck className="w-4 h-4" /> }
    ];

    useEffect(() => {
        // Progress bar animation
        const duration = 5000; // 5 seconds total
        const interval = 50;
        const steps = duration / interval;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            setProgress(Math.min(100, Math.floor((currentStep / steps) * 100)));
            
            // Update loading stage based on progress
            const stageIndex = Math.floor((currentStep / steps) * stages.length);
            if (stageIndex < stages.length) {
                setLoadingStage(stageIndex);
            }

            if (currentStep >= steps) {
                clearInterval(timer);
                setTimeout(() => navigate('/main'), 800); // Wait a bit at 100% before navigating
            }
        }, interval);

        return () => clearInterval(timer);
    }, [navigate, stages.length]);

    return (
        <div className="fixed inset-0 bg-transparent overflow-hidden flex flex-col items-center justify-center z-50">

            {/* Simulated Robot Wake / Ripple */}
            <motion.div
                className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-48 h-12 rounded-full border border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                animate={{
                    scale: [1, 5],
                    opacity: [0.8, 0],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                style={{ transformStyle: 'preserve-3d', transform: 'rotateX(75deg)' }}
            />

            <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-2xl px-6">
                {/* Logo & Title */}
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="flex flex-col items-center mb-16"
                >
                    <div className="w-24 h-24 bg-red-950/60 rounded-3xl flex items-center justify-center border border-red-500/40 shadow-[0_8px_32px_rgba(0,0,0,0.5)] mb-8 relative overflow-hidden backdrop-blur-md">
                        <Navigation className="w-12 h-12 text-red-500 drop-shadow-md" />
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-red-500/20 to-transparent"
                            animate={{ y: ["100%", "-100%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-widest text-center mb-4 uppercase drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]" style={{ fontFamily: '"Orbitron", sans-serif' }}>
                        Submersible
                        <br />
                        Micro Robot
                    </h1>
                    <p className="text-red-500 tracking-[0.2em] text-sm md:text-base font-bold uppercase opacity-90 text-center drop-shadow-md">
                        AI Powered Ocean Inspection System
                    </p>
                </motion.div>

                {/* Loading Status */}
                <div className="w-full max-w-md flex flex-col items-center bg-[#1a080c]/80 p-6 rounded-3xl backdrop-blur-md border border-red-500/30 shadow-2xl">
                    <div className="flex justify-between w-full text-xs font-bold font-mono text-red-300 mb-3 px-1 drop-shadow-md">
                        <span className="uppercase flex items-center gap-2">
                            <motion.span
                                animate={{ opacity: [1, 0, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="w-2 h-2 rounded-full bg-red-500 inline-block shadow-[0_0_8px_rgba(255,42,75,1)]"
                            />
                            Scanning...
                        </span>
                        <span>{progress}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden relative mb-5 border border-red-500/20">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-red-800 via-red-500 to-red-300 shadow-[0_0_10px_rgba(255,42,75,0.8)]"
                            style={{ width: `${progress}%` }}
                        />
                        {/* Scanning beam effect */}
                        <motion.div
                            className="absolute top-0 bottom-0 w-12 bg-white/60 blur-[3px]"
                            animate={{ left: ["-20%", "120%"] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                    </div>

                    {/* Stage Text */}
                    <div className="h-6 w-full relative overflow-hidden flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={loadingStage}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.3 }}
                                className="text-xs font-bold font-mono text-red-400 flex items-center gap-2 tracking-wider uppercase drop-shadow-md"
                            >
                                {stages[loadingStage]?.icon}
                                {stages[loadingStage]?.text}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
