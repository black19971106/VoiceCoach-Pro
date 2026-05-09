import React, { useState, useEffect } from 'react';
import { WorkoutEditor } from './components/WorkoutEditor';
import { WorkoutPlayer } from './components/WorkoutPlayer';
import { WorkoutLibrary } from './components/WorkoutLibrary';
import { DEFAULT_PLAN } from './constants';

export type WorkoutType = 'work' | 'rest';
export type ThemeMode = 'light' | 'dark';

export interface WorkoutItem {
  id: string;
  name: string;
  duration: number;
  type: WorkoutType;
}

export interface WorkoutPhase {
  id: string;
  phaseName: string;
  items: WorkoutItem[];
  loop: number;
}

export interface WorkoutPlan {
  planName: string;
  theme: ThemeMode;
  phases: WorkoutPhase[];
}

export interface CurrentState {
  phaseIndex: number;
  loopIndex: number;
  itemIndex: number;
  timeLeft: number;
  status: 'idle' | 'running' | 'paused' | 'finished';
}

export default function App() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const savedPlans = localStorage.getItem('voicecoach_library');
    if (savedPlans) {
      try {
        const parsed = JSON.parse(savedPlans);
        setPlans(parsed);
      } catch (e) {
        console.error("Failed to load library", e);
      }
    }
  }, []);

  const saveLibrary = (newPlans: WorkoutPlan[]) => {
    setPlans(newPlans);
    localStorage.setItem('voicecoach_library', JSON.stringify(newPlans));
  };

  const handleCreateNew = () => {
    setCurrentPlan({ ...DEFAULT_PLAN, id: Math.random().toString(36).substr(2, 9) });
    setIsEditing(true);
    document.documentElement.classList.remove('dark');
  };

  const handleSavePlan = (plan: WorkoutPlan) => {
    const existingIndex = plans.findIndex(p => p.planName === plan.planName);
    let newPlans = [...plans];
    if (existingIndex >= 0) {
      newPlans[existingIndex] = plan;
    } else {
      newPlans.push(plan);
    }
    saveLibrary(newPlans);
    setCurrentPlan(plan);
    setIsEditing(false);
    setIsPlayerOpen(true);
    
    // Apply theme
    if (plan.theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleDeletePlan = (index: number) => {
    if (window.confirm('确定要删除这个训练计划吗？')) {
      const newPlans = plans.filter((_, i) => i !== index);
      saveLibrary(newPlans);
    }
  };

  const handleSelectPlan = (plan: WorkoutPlan) => {
    setCurrentPlan(plan);
    setIsEditing(true);
    // 确保编辑器处于亮色模式，深色仅供播放器使用
    document.documentElement.classList.remove('dark');
  };

  const handleImport = (plan: WorkoutPlan) => {
    const newPlans = [...plans, plan];
    saveLibrary(newPlans);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-violet-100">
      {!isPlayerOpen && !isEditing && (
        <WorkoutLibrary 
          plans={plans}
          onSelect={handleSelectPlan}
          onDelete={handleDeletePlan}
          onNew={handleCreateNew}
          onImport={handleImport}
        />
      )}

      {isEditing && currentPlan && (
        <WorkoutEditor 
          initialPlan={currentPlan}
          onSave={handleSavePlan}
          onCancel={() => setIsEditing(false)}
        />
      )}

      {isPlayerOpen && currentPlan && (
        <WorkoutPlayer 
          plan={currentPlan}
          onExit={() => {
            setIsPlayerOpen(false);
            // 退出播放器时强制回归亮色模式
            document.documentElement.classList.remove('dark');
          }}
        />
      )}
    </div>
  );
}
