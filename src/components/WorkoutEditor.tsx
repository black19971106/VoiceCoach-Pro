import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Settings2, Save } from 'lucide-react';
import { WorkoutPlan, WorkoutPhase, WorkoutItem } from '../App';
import { DEFAULT_PLAN } from '../constants';

interface EditorProps {
  onSave: (plan: WorkoutPlan) => void;
  onCancel?: () => void;
  initialPlan?: WorkoutPlan;
}

export function WorkoutEditor({ onSave, onCancel, initialPlan }: EditorProps) {
  const [plan, setPlan] = useState<WorkoutPlan>(initialPlan || DEFAULT_PLAN);

  const addPhase = () => {
    const newPhase: WorkoutPhase = {
      id: Math.random().toString(36).substr(2, 9),
      phaseName: "新阶段",
      items: [{ id: Math.random().toString(36).substr(2, 9), name: "动作", duration: 30, type: "work" }],
      loop: 1
    };
    setPlan({ ...plan, phases: [...plan.phases, newPhase] });
  };

  const removePhase = (index: number) => {
    const newPhases = [...plan.phases];
    newPhases.splice(index, 1);
    setPlan({ ...plan, phases: newPhases });
  };

  const addItem = (phaseIndex: number) => {
    const newItem: WorkoutItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: "新动作",
      duration: 30,
      type: "work"
    };
    const newPhases = [...plan.phases];
    newPhases[phaseIndex].items.push(newItem);
    setPlan({ ...plan, phases: newPhases });
  };

  const removeItem = (phaseIndex: number, itemIndex: number) => {
    const newPhases = [...plan.phases];
    newPhases[phaseIndex].items.splice(itemIndex, 1);
    setPlan({ ...plan, phases: newPhases });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 pb-32 bg-slate-50 min-h-screen">
      {/* Header Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="md:col-span-2 bento-card border-t-4 border-violet-500 flex flex-col justify-center gap-2 bg-white p-6">
          <span className="text-[10px] uppercase tracking-widest text-violet-500 font-bold">训练计划</span>
          <input 
            value={plan.planName}
            onChange={e => setPlan({ ...plan, planName: e.target.value })}
            className="text-2xl sm:text-4xl font-black bg-transparent border-none outline-none focus:ring-0 w-full text-zinc-900"
            placeholder="输入计划名称..."
          />
        </div>
        <div className="bento-card flex flex-col justify-between bg-white p-6">
          <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">设置</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs sm:text-sm text-zinc-500 font-medium">播放器主题 ({plan.theme === 'dark' ? '深色' : '浅色'})</span>
            <button 
              onClick={() => {
                const newTheme = plan.theme === 'dark' ? 'light' : 'dark';
                setPlan({ ...plan, theme: newTheme });
              }}
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 transition-all hover:bg-slate-200"
            >
              <Settings2 size={18} className="text-zinc-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {plan.phases.map((phase, pIndex) => (
          <div key={phase.id} className="bento-card space-y-4 sm:space-y-6 bg-white shadow-sm border border-slate-100 p-4 sm:p-8">
            <div className="flex flex-col gap-4 border-b border-slate-50 pb-4">
              <div className="flex items-center gap-3">
                <GripVertical className="opacity-20 shrink-0 hidden sm:block" size={20} />
                <input 
                  value={phase.phaseName}
                  onChange={e => {
                    const newPhases = [...plan.phases];
                    newPhases[pIndex].phaseName = e.target.value;
                    setPlan({ ...plan, phases: newPhases });
                  }}
                  className="text-lg sm:text-xl font-bold bg-transparent border-none outline-none w-full text-zinc-900"
                />
              </div>
              
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 sm:pb-0">
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl shrink-0">
                   <button 
                    disabled={pIndex === 0}
                    onClick={() => {
                      const newPhases = [...plan.phases];
                      [newPhases[pIndex-1], newPhases[pIndex]] = [newPhases[pIndex], newPhases[pIndex-1]];
                      setPlan({ ...plan, phases: newPhases });
                    }}
                    className="p-2 text-xs font-bold text-zinc-400 hover:text-violet-600 disabled:opacity-20 transition-colors"
                  >
                    上移
                  </button>
                  <button 
                    disabled={pIndex === plan.phases.length - 1}
                    onClick={() => {
                      const newPhases = [...plan.phases];
                      [newPhases[pIndex], newPhases[pIndex+1]] = [newPhases[pIndex+1], newPhases[pIndex]];
                      setPlan({ ...plan, phases: newPhases });
                    }}
                    className="p-2 text-xs font-bold text-zinc-400 hover:text-violet-600 disabled:opacity-20 transition-colors"
                  >
                    下移
                  </button>
                </div>
                
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 shrink-0">
                  <span className="text-[10px] opacity-50 uppercase font-black">循环</span>
                  <input 
                    type="number"
                    value={phase.loop}
                    onChange={e => {
                      const newPhases = [...plan.phases];
                      newPhases[pIndex].loop = parseInt(e.target.value) || 1;
                      setPlan({ ...plan, phases: newPhases });
                    }}
                    className="w-8 text-center bg-transparent border-none outline-none font-bold text-sm text-violet-600"
                  />
                  <span className="text-[10px] opacity-30 font-bold uppercase">次</span>
                </div>

                <button 
                  onClick={() => removePhase(pIndex)}
                  className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0 ml-auto"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {phase.items.map((item, iIndex) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:border-violet-200 hover:shadow-sm group">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        const newPhases = [...plan.phases];
                        const newType = item.type === 'work' ? 'rest' : 'work';
                        newPhases[pIndex].items[iIndex].type = newType;
                        if (newType === 'rest') newPhases[pIndex].items[iIndex].name = '休息';
                        else if (item.name === '休息') newPhases[pIndex].items[iIndex].name = '动作';
                        setPlan({ ...plan, phases: newPhases });
                      }}
                      className={`w-10 h-6 rounded-full relative transition-colors p-1 shrink-0 ${item.type === 'work' ? 'bg-red-500' : 'bg-emerald-500'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${item.type === 'work' ? 'translate-x-0' : 'translate-x-4'}`} />
                    </button>
                    <input 
                      value={item.name}
                      onChange={e => {
                        const newPhases = [...plan.phases];
                        newPhases[pIndex].items[iIndex].name = e.target.value;
                        setPlan({ ...plan, phases: newPhases });
                      }}
                      className="flex-1 bg-transparent border-none outline-none font-semibold text-sm text-zinc-800"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-2 pl-13 sm:pl-0 mt-1 sm:mt-0">
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                      <input 
                        type="number"
                        value={item.duration}
                        onChange={e => {
                          const newPhases = [...plan.phases];
                          newPhases[pIndex].items[iIndex].duration = parseInt(e.target.value) || 0;
                          setPlan({ ...plan, phases: newPhases });
                        }}
                        className="w-10 text-right bg-transparent border-none outline-none font-mono font-bold text-xs"
                      />
                      <span className="text-[8px] opacity-40 uppercase font-black">秒</span>
                    </div>
                    <button 
                      onClick={() => removeItem(pIndex, iIndex)}
                      className="p-2 sm:p-1 opacity-40 sm:opacity-0 sm:group-hover:opacity-100 text-red-500 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button 
                  onClick={() => addItem(pIndex)}
                  className="py-4 rounded-2xl border-2 border-dashed border-slate-200 text-red-400 hover:border-red-500 hover:bg-red-50/30 transition-all flex items-center justify-center gap-2 text-xs font-bold"
                >
                  <Plus size={14} /> 训练
                </button>
                <button 
                  onClick={() => {
                    const newItem: WorkoutItem = {
                      id: Math.random().toString(36).substr(2, 9),
                      name: "休息",
                      duration: 10,
                      type: "rest"
                    };
                    const newPhases = [...plan.phases];
                    newPhases[pIndex].items.push(newItem);
                    setPlan({ ...plan, phases: newPhases });
                  }}
                  className="py-4 rounded-2xl border-2 border-dashed border-slate-200 text-emerald-500 hover:border-emerald-600 hover:bg-emerald-50/30 transition-all flex items-center justify-center gap-2 text-xs font-bold"
                >
                  <Plus size={14} /> 休息
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={addPhase}
        className="w-full py-5 rounded-[1.5rem] bg-zinc-900 text-white hover:bg-zinc-800 transition-all font-bold uppercase tracking-widest text-xs shadow-xl active:scale-95"
      >
        + 添加训练阶段
      </button>

      <div className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-lg flex gap-3 sm:gap-4 z-50">
        {onCancel && (
          <button 
            onClick={onCancel}
            className="flex-1 py-4 sm:py-5 rounded-full bg-white border border-slate-200 text-zinc-500 font-bold sm:font-black shadow-xl hover:bg-slate-50 active:scale-95 transition-all text-sm sm:text-base"
          >
            取消
          </button>
        )}
        <button 
          onClick={() => onSave(plan)}
          className="flex-[1.5] sm:flex-1 py-4 sm:py-5 rounded-full bg-violet-600 text-white font-bold sm:font-black shadow-2xl shadow-violet-500/20 flex items-center justify-center gap-2 sm:gap-3 hover:scale-105 active:scale-95 transition-all text-sm sm:text-base"
        >
          <Save size={20} className="sm:w-6 sm:h-6" /> 保存并开始
        </button>
      </div>
    </div>
  );
}
