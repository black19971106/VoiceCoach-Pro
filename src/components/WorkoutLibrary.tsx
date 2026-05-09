import React from 'react';
import { Plus, Play, Trash2, Download, Upload, Dumbbell } from 'lucide-react';
import { WorkoutPlan } from '../App';
import { DEFAULT_PLAN } from '../constants';

interface LibraryProps {
  plans: WorkoutPlan[];
  onSelect: (plan: WorkoutPlan) => void;
  onDelete: (index: number) => void;
  onNew: () => void;
  onImport: (plan: WorkoutPlan) => void;
}

export function WorkoutLibrary({ plans, onSelect, onDelete, onNew, onImport }: LibraryProps) {
  const handleExport = (plan: WorkoutPlan) => {
    const dataStr = JSON.stringify(plan, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${plan.planName}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const plan = JSON.parse(event.target?.result as string);
        onImport(plan);
      } catch (err) {
        alert('无效的计划文件');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8 bg-slate-50 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-slate-200 sticky top-4 sm:top-6 z-10 shadow-xl shadow-slate-200/50 gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <Dumbbell size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">我的训练库</h1>
            <p className="text-[9px] sm:text-[10px] opacity-40 font-black uppercase tracking-[0.2em]">Workout Library</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <label className="flex-1 sm:flex-none flex items-center justify-center p-3 rounded-xl sm:rounded-full bg-slate-100 border border-slate-200 hover:bg-violet-600 hover:text-white transition-all cursor-pointer shadow-sm group">
            <Upload size={20} className="text-slate-600 group-hover:text-white" />
            <span className="ml-2 sm:hidden text-xs font-bold">导入</span>
            <input type="file" className="hidden" accept=".json" onChange={handleImport} />
          </label>
          <button 
            onClick={onNew}
            className="flex-[2] sm:flex-none px-4 sm:px-6 py-3 rounded-xl sm:rounded-full bg-violet-600 text-white font-black flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-violet-500/20 text-sm sm:text-base"
          >
            <Plus size={20} /> 新建计划
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="text-5xl sm:text-6xl grayscale opacity-20">📂</div>
            <p className="text-slate-400 font-bold tracking-tight text-sm sm:text-base px-10">暂时还没有保存的计划，点击上方“新建计划”开始吧！</p>
          </div>
        ) : (
          plans.map((plan, index) => (
            <div 
              key={index}
              className="bento-card group bg-white border border-slate-100 hover:border-violet-500/50 transition-all flex flex-col justify-between gap-6 sm:gap-8 p-6 sm:p-8"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 line-clamp-1 tracking-tight">{plan.planName}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[9px] sm:text-[10px] px-2 sm:px-3 py-1 bg-slate-100 text-slate-500 rounded-full font-black uppercase tracking-wider">
                      {plan.phases.length} 个阶段
                    </span>
                    <span className="text-[9px] sm:text-[10px] px-2 sm:px-3 py-1 bg-slate-100 text-slate-500 rounded-full font-black uppercase tracking-wider">
                      {plan.theme === 'dark' ? '深色' : '浅色'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleExport(plan); }}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-violet-600 transition-colors"
                    title="导出"
                  >
                    <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(index); }}
                    className="p-2 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    title="删除"
                  >
                    <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>
              </div>

              <button 
                onClick={() => onSelect(plan)}
                className="w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl bg-slate-900 text-white font-black flex items-center justify-center gap-2 sm:gap-3 hover:bg-violet-600 transition-all shadow-lg active:scale-95 text-sm sm:text-base"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Play size={12} fill="currentColor" className="ml-0.5 sm:w-[14px] sm:h-[14px]" />
                </div>
                开始训练 / 修改
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
