import React, { useState } from 'react';
import { MASTER_SCHEDULE, ROTATIONS, SPECIFIC_SHIFTS } from '../constants';
import { Rotation } from '../types';
import { MapPin, ChevronLeft, ChevronRight, Sun, Moon, AlertCircle, Calendar as CalendarIcon, Clock, ArrowRight } from 'lucide-react';

const SELECTED_GROUP = "GRUPO VI";

export const Dashboard: React.FC<{ onChangeView: (v: string) => void }> = ({ onChangeView }) => {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  // Week Calculation
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + (currentWeekOffset * 7));
  const startOfWeek = new Date(baseDate);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); 
  startOfWeek.setDate(diff);

  const weekDays = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  // Status Logic
  const getStatusForDate = (date: Date) => {
    const dStr = date.toISOString().split('T')[0];
    const period = MASTER_SCHEDULE.find(p => dStr >= p.start && dStr <= p.end);
    let rotation: Rotation | null = null;
    let isRecess = false;

    if (period) {
      if (period.assignments === "Recesso") {
        isRecess = true;
      } else {
        const rotId = period.assignments[SELECTED_GROUP];
        rotation = ROTATIONS[rotId];
      }
    }

    const specificShift = SPECIFIC_SHIFTS[dStr];
    let activity = null;
    
    if (rotation && !isRecess && !specificShift) {
      const dayOfWeek = date.getDay(); 
      if (dayOfWeek > 0 && dayOfWeek < 6) {
        activity = rotation.schedule[dayOfWeek - 1];
      }
    }
    return { rotation, activity, specificShift, isRecess, period };
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const currentStatus = getStatusForDate(new Date());

  const handlePrevWeek = () => setCurrentWeekOffset(prev => prev - 1);
  const handleNextWeek = () => setCurrentWeekOffset(prev => prev + 1);
  const handleResetWeek = () => setCurrentWeekOffset(0);

  return (
    <div className="space-y-6 pt-10 md:pt-0 animate-fade-in">
      
      {/* --- PAGE TITLE & WEEK NAV --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">Painel</h2>
          <p className="text-gray-500 font-medium">Visão geral das atividades.</p>
        </div>

        {/* Week Navigator Pill */}
        <div className="self-center md:self-auto flex items-center bg-white dark:bg-gray-900 p-1.5 rounded-full shadow-soft border border-gray-200 dark:border-gray-800">
          <button onClick={handlePrevWeek} className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-6 text-center cursor-pointer min-w-[140px]" onClick={handleResetWeek}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Semana de</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {startOfWeek.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
            </p>
          </div>
          <button onClick={handleNextWeek} className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* --- MAIN GRID LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* --- LEFT COLUMN: CONTEXT (4 cols) --- */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          
          {/* TODAY HERO CARD */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-950 text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden flex flex-col min-h-[380px] justify-between group">
             
             {/* Abstract BG */}
             <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:bg-white/10 transition-colors duration-700" />
             
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                   <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/5 backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Hoje</span>
                   </div>
                   {currentStatus.rotation && (
                      <span className="text-xs font-bold text-gray-400 tracking-wider">
                        {currentStatus.rotation.id}
                      </span>
                   )}
                </div>
                
                <div className="space-y-4">
                   {currentStatus.specificShift ? (
                      <div className="animate-slide-in">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Evento Especial</p>
                        <h2 className="text-4xl font-bold leading-tight tracking-tight">Plantão {currentStatus.specificShift.type}</h2>
                        <div className="mt-2 text-gray-400 text-sm">Equipe escalada</div>
                      </div>
                   ) : currentStatus.activity ? (
                      <div className="animate-slide-in">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Agora</p>
                        <h2 className="text-4xl md:text-5xl font-bold leading-none tracking-tight">
                          {new Date().getHours() < 12 ? currentStatus.activity.morning : currentStatus.activity.afternoon}
                        </h2>
                      </div>
                   ) : (
                      <h2 className="text-4xl font-bold text-gray-300">Dia Livre</h2>
                   )}
                </div>
             </div>

             <div className="relative z-10 pt-8 border-t border-white/10 mt-auto">
                {currentStatus.rotation?.details[0] ? (
                   <div className="flex items-start gap-4">
                      <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-md border border-white/5">
                        <MapPin className="w-5 h-5 text-gray-200" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Local</p>
                        <p className="font-medium text-sm text-gray-200 leading-snug">{currentStatus.rotation.details[0].text}</p>
                      </div>
                   </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500">
                    <CalendarIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Sem detalhes</span>
                  </div>
                )}
             </div>
          </div>
          
          {/* INFO CARDS (Desktop Only) */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
             <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-soft">
                <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-3">
                   <Sun className="w-4 h-4 text-gray-500" />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Manhã</p>
                <p className="font-bold text-gray-900 dark:text-white text-lg">07:30</p>
             </div>
             <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-soft">
                <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-3">
                   <Moon className="w-4 h-4 text-gray-500" />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tarde</p>
                <p className="font-bold text-gray-900 dark:text-white text-lg">13:30</p>
             </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: SCHEDULE LIST (8 cols) --- */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-soft overflow-hidden">
             
             <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Cronograma da Semana</h3>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full uppercase tracking-wider">
                   {weekDays.length} Dias
                </span>
             </div>

             <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {weekDays.map((date, idx) => {
                   const { rotation, activity, specificShift, isRecess } = getStatusForDate(date);
                   const isToday = date.toISOString().split('T')[0] === todayStr;

                   return (
                      <div key={idx} className={`group p-6 flex flex-col md:flex-row gap-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isToday ? 'bg-gray-50/80 dark:bg-gray-800/30' : ''}`}>
                         
                         {/* Date */}
                         <div className="flex md:flex-col items-center md:items-start gap-3 md:w-24 shrink-0">
                            <span className={`text-xs font-bold uppercase tracking-widest ${isToday ? 'text-emerald-600' : 'text-gray-400'}`}>
                               {date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                            </span>
                            <span className={`text-2xl md:text-3xl font-bold leading-none ${isToday ? 'text-gray-900 dark:text-white' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>
                               {date.getDate()}
                            </span>
                            {isToday && <span className="md:hidden text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">Hoje</span>}
                         </div>

                         {/* Content */}
                         <div className="flex-1 space-y-3">
                            {isRecess ? (
                               <div className="py-4 text-gray-400 font-medium italic">Recesso Acadêmico</div>
                            ) : specificShift ? (
                               <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 p-4 rounded-2xl flex items-center gap-4 shadow-lg">
                                  <AlertCircle className="w-5 h-5 text-yellow-400 dark:text-yellow-600" />
                                  <div>
                                     <p className="font-bold text-sm">Plantão {specificShift.type}</p>
                                     <p className="text-xs opacity-80 mt-0.5">{specificShift.students.join(', ')}</p>
                                  </div>
                               </div>
                            ) : activity ? (
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {/* Morning */}
                                  <div className="flex flex-col p-3 rounded-2xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
                                     <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Manhã</span>
                                     </div>
                                     <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm leading-tight">{activity.morning}</p>
                                  </div>
                                  
                                  {/* Afternoon */}
                                  <div className="flex flex-col p-3 rounded-2xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
                                     <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tarde</span>
                                     </div>
                                     <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm leading-tight">{activity.afternoon}</p>
                                  </div>

                                  {/* Night */}
                                  {activity.night && (
                                     <div className="md:col-span-2 flex items-center gap-3 p-3 rounded-2xl bg-gray-900 text-white">
                                        <Moon className="w-4 h-4 text-gray-400" />
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between">
                                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Noite</span>
                                          </div>
                                          <p className="font-semibold text-sm">{activity.night}</p>
                                        </div>
                                     </div>
                                  )}
                               </div>
                            ) : (
                               <div className="py-2 text-gray-400 text-sm italic">Sem atividades acadêmicas.</div>
                            )}
                         </div>

                         {/* Tag */}
                         {rotation && !specificShift && !isRecess && (
                            <div className="hidden md:block">
                               <span className="inline-block px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                  {rotation.title}
                               </span>
                            </div>
                         )}
                      </div>
                   );
                })}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};