import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Square, ChevronLeft, Volume2, VolumeX, Sun, Moon, Clock } from 'lucide-react';
import { WorkoutPlan } from '../App';
import { useWorkoutTimer } from '../hooks/useWorkoutTimer';
import { useWakeLock } from '../hooks/useWakeLock';
import { audioService } from '../services/audioService';

interface PlayerProps {
  plan: WorkoutPlan;
  onExit: () => void;
}

export function WorkoutPlayer({ plan, onExit }: PlayerProps) {
  const { state, start, pause, reset, totalProgress, totalSecondsRemaining } = useWorkoutTimer(plan);
  const { requestWakeLock, releaseWakeLock } = useWakeLock();
  const [isMuted, setIsMuted] = useState(false);
  const [isTicking, setIsTicking] = useState(false);
  const [isDark, setIsDark] = useState(plan.theme === 'dark');

  // Handle ticking sound
  useEffect(() => {
    if (isTicking && state.status === 'running' && state.timeLeft > 0) {
      audioService.playTick();
    }
  }, [state.timeLeft, state.status, isTicking]);

  const currentPhase = plan.phases[state.phaseIndex];
  const currentItem = currentPhase?.items[state.itemIndex];
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBgColor = () => {
    if (state.status === 'idle') return isDark ? 'bg-black' : 'bg-white';
    if (state.status === 'finished') return 'bg-purple-600';
    if (currentItem?.type === 'rest') return 'bg-green-500';
    return state.phaseIndex === 0 && currentPhase.phaseName === '热身' 
      ? 'bg-blue-500' 
      : 'bg-red-500';
  };

  const handleStart = async () => {
    await requestWakeLock();
    start();
  };

  const handlePause = () => {
    pause();
  };

  const handleReset = async () => {
    await releaseWakeLock();
    reset();
    onExit();
  };

  return (
    <div className={`fixed inset-0 flex flex-col transition-colors duration-500 ${getBgColor()} ${isDark ? 'text-white' : 'text-slate-900'}`}>
      {/* Header */}
      <div className="p-6 flex justify-between items-center z-10">
        <button onClick={handleReset} className="p-2 rounded-full bg-black/10 backdrop-blur-sm border border-white/20 hover:bg-black/20 transition-colors">
          <ChevronLeft size={24} />
        </button>
        
        <div className="flex-1 px-8 hidden sm:block">
          <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-white/40"
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] font-black uppercase tracking-widest opacity-50">
            <span>Progress: {Math.round(totalProgress * 100)}%</span>
            <span>Est. Remaining: {formatTime(totalSecondsRemaining)}</span>
          </div>
        </div>

        <div className="flex gap-2 sm:gap-4 items-center">
          <div className="hidden sm:block text-xs font-black bg-black/10 px-4 py-2 rounded-full border border-white/10 uppercase tracking-widest">
            Total {formatTime(totalSecondsRemaining)}
          </div>
          <button onClick={() => setIsTicking(!isTicking)} className={`p-2 rounded-full backdrop-blur-sm border border-white/20 transition-all ${isTicking ? 'bg-white/20 text-white' : 'bg-black/10 text-white/50'}`}>
            <Clock size={24} />
          </button>
          <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full bg-black/10 backdrop-blur-sm border border-white/20 hover:bg-black/20 transition-colors">
            {isDark ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          <button onClick={() => setIsMuted(!isMuted)} className="p-2 rounded-full bg-black/10 backdrop-blur-sm border border-white/20 hover:bg-black/20 transition-colors">
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </div>
      </div>

      {/* Main Display */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center select-none relative">
        <AnimatePresence mode="wait">
          {state.status === 'finished' ? (
            <motion.div
              key="finished"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-4"
            >
              <h2 className="text-5xl font-black tracking-tight">训练完成！</h2>
              <p className="text-xl opacity-60 uppercase tracking-widest font-bold">今天表现得太棒了</p>
            </motion.div>
          ) : (
            <motion.div
              key={currentItem?.id + state.status}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="w-full space-y-12"
            >
              <div className="space-y-4">
                <div className="inline-block px-4 py-1 rounded-full bg-black/10 backdrop-blur-sm border border-white/10">
                  <span className="text-xs font-black tracking-[0.2em] opacity-80 uppercase">
                    {currentPhase?.phaseName} 
                    {currentPhase?.loop > 1 && ` • 第 ${state.loopIndex + 1}/${currentPhase.loop} 组`}
                  </span>
                </div>
                <div className="sm:hidden text-[10px] font-black uppercase tracking-widest opacity-40 mt-2">
                  总进度: {Math.round(totalProgress * 100)}% • 剩余: {formatTime(totalSecondsRemaining)}
                </div>
                <h1 className="text-7xl sm:text-9xl font-black tracking-tighter leading-none">
                  {currentItem?.name || plan.planName}
                </h1>
              </div>

              <div className="relative inline-flex items-center justify-center">
                <span className="text-[14rem] sm:text-[22rem] font-black font-mono leading-none tracking-tighter tabular-nums drop-shadow-2xl">
                  {state.timeLeft}
                </span>
                <span className="absolute -bottom-6 -right-12 text-4xl font-black opacity-30 tracking-widest">
                  秒
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls Container */}
      <div className="p-8 pb-16 flex justify-center items-center gap-12 z-10">
        {state.status === 'running' ? (
          <button 
            onClick={handlePause}
            className="w-24 h-24 flex items-center justify-center rounded-full bg-black/10 backdrop-blur-xl border border-white/20 hover:scale-105 active:scale-95 transition-all shadow-2xl"
          >
            <Pause size={48} fill="currentColor" />
          </button>
        ) : (
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleStart}
            className="w-32 h-32 flex items-center justify-center rounded-full bg-white text-black shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            <Play size={64} fill="currentColor" className="ml-2" />
          </motion.button>
        )}
        
        {state.status !== 'idle' && (
          <button 
            onClick={handleReset}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-black/10 backdrop-blur-xl border border-white/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Square size={24} fill="currentColor" />
          </button>
        )}
      </div>

      {/* Progress Bar Container */}
      <div className="fixed bottom-0 left-0 w-full h-3 bg-black/5">
        <motion.div 
          className="h-full bg-white/30 backdrop-blur-sm"
          initial={{ width: 0 }}
          animate={{ width: `${(state.timeLeft / (currentItem?.duration || 1)) * 100}%` }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </div>
    </div>
  );
}
