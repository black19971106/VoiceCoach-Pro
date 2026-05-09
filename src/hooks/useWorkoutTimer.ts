import { useState, useEffect, useRef, useCallback } from 'react';
import { WorkoutPlan, CurrentState } from '../App';
import { voiceService } from '../services/voiceService';

export function useWorkoutTimer(plan: WorkoutPlan | null) {
  const [state, setState] = useState<CurrentState>({
    phaseIndex: 0,
    loopIndex: 0,
    itemIndex: 0,
    timeLeft: 0,
    status: 'idle',
  });

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const stateRef = useRef<CurrentState>(state);

  const calculateTotalSecondsRemaining = useCallback(() => {
    if (!plan) return 0;
    let total = 0;
    
    // Remaining in current item
    total += stateRef.current.timeLeft;

    const currentPhase = plan.phases[stateRef.current.phaseIndex];

    // Remaining items in current loop
    for (let i = stateRef.current.itemIndex + 1; i < currentPhase.items.length; i++) {
      total += currentPhase.items[i].duration;
    }

    // Remaining loops in current phase
    const itemsTotalInPhase = currentPhase.items.reduce((acc, item) => acc + item.duration, 0);
    const loopsRemaining = currentPhase.loop - (stateRef.current.loopIndex + 1);
    total += loopsRemaining * itemsTotalInPhase;

    // Remaining phases
    for (let i = stateRef.current.phaseIndex + 1; i < plan.phases.length; i++) {
        const ph = plan.phases[i];
        total += ph.loop * ph.items.reduce((acc, item) => acc + item.duration, 0);
    }

    return total;
  }, [plan]);

  const calculateTotalDuration = useCallback(() => {
    if (!plan) return 0;
    return plan.phases.reduce((acc, ph) => {
      const phaseSum = ph.items.reduce((sum, item) => sum + item.duration, 0);
      return acc + (phaseSum * ph.loop);
    }, 0);
  }, [plan]);

  // Sync ref with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const tick = useCallback(() => {
    const now = Date.now();
    const elapsed = Math.floor((now - startTimeRef.current) / 1000);
    const newTimeLeft = Math.max(0, durationRef.current - elapsed);

    if (newTimeLeft !== stateRef.current.timeLeft) {
      // Voice Logic
      handleVoice(newTimeLeft, durationRef.current);

      if (newTimeLeft === 0) {
        nextStep();
      } else {
        setState(s => ({ ...s, timeLeft: newTimeLeft }));
      }
    }

    if (stateRef.current.status === 'running') {
      timerRef.current = requestAnimationFrame(tick);
    }
  }, [plan]);

  const start = useCallback(() => {
    if (!plan) return;
    
    if (state.status === 'idle') {
      const firstItem = plan.phases[0].items[0];
      durationRef.current = firstItem.duration;
      startTimeRef.current = Date.now();
      setState({
        phaseIndex: 0,
        loopIndex: 0,
        itemIndex: 0,
        timeLeft: firstItem.duration,
        status: 'running',
      });
      voiceService.announceStart(firstItem.name);
    } else {
      startTimeRef.current = Date.now() - (durationRef.current - state.timeLeft) * 1000;
      setState(s => ({ ...s, status: 'running' }));
    }
  }, [plan, state]);

  const pause = useCallback(() => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    setState(s => ({ ...s, status: 'paused' }));
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    setState({
      phaseIndex: 0,
      loopIndex: 0,
      itemIndex: 0,
      timeLeft: 0,
      status: 'idle',
    });
  }, []);

  const nextStep = useCallback(() => {
    const { phaseIndex, loopIndex, itemIndex } = stateRef.current;
    if (!plan) return;

    let nPhase = phaseIndex;
    let nLoop = loopIndex;
    let nItem = itemIndex + 1;

    // Check if item finished
    if (nItem >= plan.phases[nPhase].items.length) {
      nItem = 0;
      nLoop++;
      // Check if loop finished
      if (nLoop >= plan.phases[nPhase].loop) {
        nLoop = 0;
        nPhase++;
        // Check if phase finished
        if (nPhase >= plan.phases.length) {
          setState(s => ({ ...s, status: 'finished', timeLeft: 0 }));
          voiceService.speak("锻炼完成，干得漂亮！");
          if (timerRef.current) cancelAnimationFrame(timerRef.current);
          return;
        } else {
          voiceService.announcePhase(plan.phases[phaseIndex].phaseName);
        }
      }
    }

    const nextItem = plan.phases[nPhase].items[nItem];
    durationRef.current = nextItem.duration;
    startTimeRef.current = Date.now();
    
    setState({
      phaseIndex: nPhase,
      loopIndex: nLoop,
      itemIndex: nItem,
      timeLeft: nextItem.duration,
      status: 'running',
    });

    if (nextItem.type === 'work') {
      voiceService.announceStart(nextItem.name);
    } else {
      const followingItem = getFollowingItem(plan, nPhase, nLoop, nItem);
      voiceService.announceRest(nextItem.duration, followingItem?.name);
    }
  }, [plan]);

  const handleVoice = (timeLeft: number, total: number) => {
    // Halfway encouragement
    if (total >= 10 && timeLeft === Math.floor(total / 2)) {
      voiceService.announceEncouragement();
    }
    // Final countdown
    if (timeLeft <= 3 && timeLeft > 0) {
      voiceService.announceCountdown(timeLeft);
    }
  };

  const getFollowingItem = (p: WorkoutPlan, pi: number, li: number, ii: number) => {
    let nextII = ii + 1;
    let nextLI = li;
    let nextPI = pi;

    if (nextII >= p.phases[nextPI].items.length) {
      nextII = 0;
      nextLI++;
      if (nextLI >= p.phases[nextPI].loop) {
        nextLI = 0;
        nextPI++;
      }
    }
    return p.phases[nextPI]?.items[nextII];
  };

  useEffect(() => {
    if (state.status === 'running') {
      timerRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [state.status, tick]);

  const totalDuration = calculateTotalDuration();
  const totalRemaining = calculateTotalSecondsRemaining();
  const progress = totalDuration > 0 ? ((totalDuration - totalRemaining) / totalDuration) : 0;

  return { 
    state, 
    start, 
    pause, 
    reset, 
    totalSecondsRemaining: totalRemaining,
    totalDuration,
    totalProgress: progress
  };
}
