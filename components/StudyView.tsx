import React, { useState, useEffect, useMemo } from 'react';
import { STUDY_AREAS } from '../constants';
import { StudyLessonModal } from './StudyLessonModal';
import { Search, ChevronDown, CheckCircle2, Circle, BookOpen } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { User } from 'firebase/auth';

interface StudyViewProps {
  user: User | null;
}

export const StudyView: React.FC<StudyViewProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [expandedArea, setExpandedArea] = useState<string | null>(null);
  
  // Estado para armazenar o progresso do usuário vindo do Firebase
  // Formato: { "id-da-aula": true, ... }
  const [userProgress, setUserProgress] = useState<Record<string, boolean>>({});

  // Efeito para ouvir o progresso do usuário em Tempo Real
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    
    // Otimização: Escuta apenas o documento do usuário, não toda a coleção de aulas
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Assume que o progresso está salvo num campo 'studyProgress'
        setUserProgress(data.studyProgress || {});
      }
    }, (error) => {
      console.error("[StudyView] Erro ao sincronizar progresso:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Helper para gerar ID consistente
  const getLessonId = (title: string) => title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

  // Otimização: useMemo para evitar re-cálculos pesados a cada renderização
  const filteredAreas = useMemo(() => {
    return STUDY_AREAS.map(area => {
      const matches = area.lessons.filter(lesson => 
        lesson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        area.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return { ...area, lessons: matches };
    }).filter(area => area.lessons.length > 0);
  }, [searchTerm]);

  const calculateAreaProgress = (lessons: string[]) => {
    if (lessons.length === 0) return 0;
    const completedCount = lessons.filter(lesson => userProgress[getLessonId(lesson)]).length;
    return Math.round((completedCount / lessons.length) * 100);
  };

  const toggleArea = (id: string) => {
    setExpandedArea(expandedArea === id ? null : id);
  };

  return (
    // Fixed height container for Desktop to enable internal scrolling
    <div className="flex flex-col animate-fade-in md:h-[calc(100vh-7rem)]">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 shrink-0">
        <div>
           <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">Central de Estudos</h2>
           <p className="text-gray-500 font-medium">Material baseado em evidências.</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-80 group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
           <input 
             type="text" 
             placeholder="Pesquisar tema..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-500 transition-all shadow-sm"
           />
        </div>
      </div>

      {/* --- SPLIT VIEW CONTENT --- */}
      <div className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-12 md:gap-8">
        
        {/* LEFT COLUMN: LIST (Scrollable) */}
        <div className="md:col-span-5 lg:col-span-4 overflow-y-auto pr-1 no-scrollbar space-y-4 pb-24 md:pb-0 h-full">
          {filteredAreas.map((area) => {
            const progress = calculateAreaProgress(area.lessons);
            const isExpanded = expandedArea === area.id || searchTerm.length > 0;

            return (
              <div key={area.id} className="bg-white dark:bg-gray-900 rounded-[1.5rem] border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm transition-all duration-300">
                
                <button 
                  onClick={() => toggleArea(area.id)}
                  className="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        <area.icon className="w-6 h-6" strokeWidth={1.5} />
                      </div>
                      <div className="text-left">
                         <h3 className="font-bold text-lg text-gray-900 dark:text-white">{area.title}</h3>
                         <div className="flex items-center gap-3 mt-1.5">
                            <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                               <div className="h-full bg-gray-900 dark:bg-white transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400">{progress}%</span>
                         </div>
                      </div>
                   </div>
                   <div className={`p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-gray-100 dark:bg-gray-800' : ''}`}>
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                   </div>
                </button>
                
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 p-2">
                    <div className="flex flex-col gap-1">
                      {area.lessons.map((lesson, lIdx) => {
                         const lessonId = getLessonId(lesson);
                         const isDone = !!userProgress[lessonId];
                         const isSelected = selectedLesson === lesson;
                         return (
                          <button
                            key={lIdx}
                            onClick={() => setSelectedLesson(lesson)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all text-left group border ${
                              isSelected 
                                ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm' 
                                : 'border-transparent hover:bg-white dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                            }`}
                          >
                            <span className={`text-sm font-medium transition-colors ${
                              isDone ? 'text-gray-400 line-through' : 
                              isSelected ? 'text-gray-900 dark:text-white font-bold' :
                              'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                            }`}>
                              {lesson}
                            </span>
                            {isDone ? (
                               <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                               <Circle className={`w-5 h-5 transition-colors ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-300 group-hover:text-gray-400'}`} />
                            )}
                          </button>
                         );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: DETAIL (Desktop only) */}
        <div className="hidden md:block md:col-span-7 lg:col-span-8 h-full min-h-[400px]">
          {selectedLesson ? (
            <div className="h-full rounded-[2rem] overflow-hidden shadow-soft border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
              <StudyLessonModal 
                key={selectedLesson} 
                user={user}
                lessonTitle={selectedLesson} 
                isOpen={true} 
                onClose={() => setSelectedLesson(null)}
                mode="inline"
              />
            </div>
          ) : (
            <div className="h-full bg-gray-50 dark:bg-gray-900/40 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-white dark:bg-gray-900 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Selecione uma aula</h3>
              <p className="text-gray-500 max-w-xs">Escolha um tópico na lista ao lado para ver o resumo completo e questões.</p>
            </div>
          )}
        </div>

      </div>

      {/* MOBILE MODAL (Pop-up) */}
      <div className="md:hidden">
        {selectedLesson && (
          <StudyLessonModal 
            key={selectedLesson}
            user={user}
            lessonTitle={selectedLesson} 
            isOpen={!!selectedLesson} 
            onClose={() => setSelectedLesson(null)}
            mode="modal"
          />
        )}
      </div>
    </div>
  );
};