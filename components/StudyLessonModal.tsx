import React, { useState, useEffect } from 'react';
import { ChevronRight, Upload, FileText, Brain, Sparkles, CheckCircle2, Cloud, RefreshCw, X, ArrowLeft, Users } from 'lucide-react';
import { generateStudyContent, generateResidencyQuiz } from '../services/geminiService';
import { AILessonContent, QuizItem, LessonData } from '../types';
import ReactMarkdown from 'react-markdown';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface Props {
  lessonTitle: string;
  isOpen: boolean;
  onClose: () => void;
  mode?: 'modal' | 'inline';
}

export const StudyLessonModal: React.FC<Props> = ({ lessonTitle, isOpen, onClose, mode = 'modal' }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LessonData>({
    content: null,
    residencyQuiz: null,
    progress: { isCompleted: false, lastUpdated: '' }
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [tab, setTab] = useState<'content' | 'quiz'>('content');
  const [saving, setSaving] = useState(false);

  // Use a sanitized document ID for Firestore
  const docId = lessonTitle.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

  useEffect(() => {
    if (isOpen) {
      setLoading(true); // Show loading state initially while fetching from DB
      
      // Subscribe to real-time updates from Firestore
      const unsubscribe = onSnapshot(doc(db, "lessons", docId), (docSnapshot) => {
        setLoading(false);
        if (docSnapshot.exists()) {
          setData(docSnapshot.data() as LessonData);
        } else {
          // Initialize empty state if document doesn't exist yet
          setData({ 
            content: null, 
            residencyQuiz: null, 
            progress: { isCompleted: false, lastUpdated: '' } 
          });
        }
      }, (error) => {
        console.error("Error fetching lesson data:", error);
        setLoading(false);
      });

      setPdfFile(null);
      return () => unsubscribe();
    }
  }, [isOpen, docId]);

  const saveData = async (newData: LessonData) => {
    setSaving(true);
    // Optimistic update
    setData(newData);
    
    try {
      await setDoc(doc(db, "lessons", docId), newData, { merge: true });
    } catch (error) {
      console.error("Error saving to Firestore:", error);
      // Ideally revert state here on failure, but for now we log
    } finally {
      setTimeout(() => setSaving(false), 800);
    }
  };

  const markComplete = () => {
    const newData = { 
      ...data, 
      progress: { 
        ...data.progress, 
        isCompleted: !data.progress.isCompleted,
        lastUpdated: new Date().toISOString()
      } 
    };
    saveData(newData);
  };

  const handleGenerateContent = async () => {
    setLoading(true);
    let base64Pdf = undefined;
    if (pdfFile) {
       base64Pdf = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(pdfFile);
       });
    }

    const result = await generateStudyContent(lessonTitle, base64Pdf);
    if (result) {
      const newData = { 
        ...data, 
        content: result, 
        progress: { ...data.progress, lastUpdated: new Date().toISOString() } 
      };
      saveData(newData);
    }
    setLoading(false);
  };

  const handleGenerateQuiz = async () => {
    setLoading(true);
    const quiz = await generateResidencyQuiz(lessonTitle);
    if (quiz) {
      const newData = { ...data, residencyQuiz: quiz };
      saveData(newData);
    }
    setLoading(false);
  };

  // If not open and not inline, return null
  if (!isOpen) return null;

  const Content = (
    <div className={`relative w-full h-full bg-white dark:bg-gray-950 flex flex-col ${mode === 'modal' ? 'shadow-2xl animate-slide-in' : 'rounded-[2rem] overflow-hidden'}`}>
        
        {/* --- HEADER --- */}
        <div className="flex-none px-6 py-6 border-b border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl z-10 flex justify-between items-center">
          <div className="flex items-center gap-4">
             {/* Show back button only on modal or if specifically needed on inline to close/deselect */}
             <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500">
               {mode === 'modal' ? <ArrowLeft className="w-5 h-5" /> : <X className="w-5 h-5" />}
             </button>
             <div>
               <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight line-clamp-1">{lessonTitle}</h2>
               <div className="flex items-center gap-2 mt-1">
                 {saving ? (
                   <span className="text-xs text-gray-400 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Salvando...</span>
                 ) : (
                   <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium"><Users className="w-3 h-3" /> Compartilhado</span>
                 )}
               </div>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button 
                onClick={() => setTab('content')} 
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${tab === 'content' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}
              >
                Conteúdo
              </button>
              <button 
                onClick={() => setTab('quiz')} 
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${tab === 'quiz' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}
              >
                Questões
              </button>
            </div>
            
            <button 
              onClick={markComplete}
              className={`p-2 rounded-full transition-all ${data.progress.isCompleted ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-300 hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              title="Marcar como concluído"
            >
              <CheckCircle2 className="w-6 h-6" fill={data.progress.isCompleted ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* --- MOBILE TABS (Visible only on mobile) --- */}
        <div className="md:hidden flex p-4 pb-0 gap-4 border-b border-gray-100 dark:border-gray-800">
           <button onClick={() => setTab('content')} className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${tab === 'content' ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white' : 'border-transparent text-gray-400'}`}>
              Resumo
           </button>
           <button onClick={() => setTab('quiz')} className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${tab === 'quiz' ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white' : 'border-transparent text-gray-400'}`}>
              Questões
           </button>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-6 md:p-8">
          
          {loading && !data.content ? (
             <div className="h-full flex flex-col items-center justify-center animate-pulse space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-center space-y-2">
                   <p className="text-gray-900 dark:text-white font-bold">Sincronizando conhecimento...</p>
                   <p className="text-xs text-gray-500">Buscando resumo compartilhado</p>
                </div>
             </div>
          ) : (
            <>
              {tab === 'content' && (
                <>
                  {!data.content ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-8 max-w-md mx-auto">
                      <div className="w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-[2rem] flex items-center justify-center text-gray-400 shadow-sm border border-gray-200 dark:border-gray-800">
                         <FileText className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Gerar Resumo Clínico</h3>
                        <p className="text-gray-500">A IA criará um material completo baseado em evidências. Se outro aluno já criou, aparecerá automaticamente.</p>
                      </div>
                      
                      <label className="w-full group cursor-pointer">
                         <div className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-600 transition-all">
                            <div className="flex flex-col items-center gap-2 text-gray-500">
                               <Upload className="w-6 h-6 group-hover:scale-110 transition-transform" />
                               <span className="text-sm font-bold">{pdfFile ? pdfFile.name : "Anexar PDF (Opcional)"}</span>
                            </div>
                         </div>
                         <input type="file" className="hidden" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
                      </label>

                      <button 
                        onClick={handleGenerateContent} 
                        disabled={loading}
                        className="w-full bg-gray-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} 
                        {loading ? "Gerando..." : "Gerar Conteúdo"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-8 pb-20 max-w-3xl mx-auto">
                       {/* Summary Box */}
                       <div className="bg-gray-900 dark:bg-gray-800 text-gray-50 p-8 rounded-[2rem] shadow-xl">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                              <Sparkles className="w-3 h-3" /> Resumo Executivo
                            </h4>
                            <span className="text-[10px] text-gray-500 border border-gray-700 rounded-full px-2 py-0.5">
                              Atualizado em {new Date(data.progress.lastUpdated).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="prose prose-invert prose-sm max-w-none leading-relaxed text-gray-300">
                            <ReactMarkdown>{data.content.summary}</ReactMarkdown>
                          </div>
                       </div>

                       <Section title="Epidemiologia & Risco" content={data.content.epidemiology} />
                       <Section title="Fisiopatologia" content={data.content.pathophysiology} />
                       <Section title="Quadro Clínico" content={data.content.clinicalPicture} />
                       <Section title="Diagnóstico" content={data.content.diagnosis} />
                       <Section title="Conduta & Tratamento" content={data.content.treatment} highlight />
                       <Section title="Evidências Recentes" content={data.content.recentEvidence} />
                    </div>
                  )}
                </>
              )}

              {tab === 'quiz' && (
                 <div className="max-w-3xl mx-auto">
                   {!data.residencyQuiz ? (
                     <div className="h-full flex flex-col items-center justify-center text-center space-y-8 mt-20">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-[2rem] flex items-center justify-center text-gray-400 shadow-sm border border-gray-200 dark:border-gray-800">
                           <Brain className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                           <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Simulado de Residência</h3>
                           <p className="text-gray-500">Gerar 10 questões nível R1 com gabarito comentado.</p>
                        </div>
                        <button 
                          onClick={handleGenerateQuiz} 
                          disabled={loading}
                          className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
                        >
                           {loading ? "Criando..." : "Criar Simulado"}
                        </button>
                     </div>
                   ) : (
                     <div className="space-y-6 pb-20">
                        {data.residencyQuiz.map((item, idx) => (
                           <div key={idx} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex gap-4 mb-4">
                                 <span className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center font-bold text-gray-900 dark:text-white text-sm border border-gray-200 dark:border-gray-700">{idx + 1}</span>
                                 <p className="font-medium text-gray-800 dark:text-gray-100 pt-1 leading-relaxed">{item.question}</p>
                              </div>
                              <details className="group">
                                 <summary className="cursor-pointer inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors select-none py-2">
                                    <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" /> Ver Gabarito
                                 </summary>
                                 <div className="mt-4 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl text-sm text-gray-600 dark:text-gray-300 border-l-4 border-gray-900 dark:border-white leading-relaxed">
                                    {item.answer}
                                 </div>
                              </details>
                           </div>
                        ))}
                        <div className="pt-8 flex justify-center">
                           <button onClick={handleGenerateQuiz} disabled={loading} className="text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-50">
                              <RefreshCw className="w-4 h-4" /> Gerar Novas Questões
                           </button>
                        </div>
                     </div>
                   )}
                 </div>
              )}
            </>
          )}
        </div>
    </div>
  );

  if (mode === 'inline') {
    return Content;
  }

  // Modal Mode (Mobile)
  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-950 h-full shadow-2xl flex flex-col border-l border-gray-200 dark:border-gray-800 animate-slide-in-right">
        {Content}
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; content: string; highlight?: boolean }> = ({ title, content, highlight }) => (
  <div className={`p-8 rounded-[2rem] transition-colors ${highlight ? 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg' : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800'}`}>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
      {highlight && <Sparkles className="w-4 h-4 text-emerald-500" />} {title}
    </h3>
    <div className="prose prose-zinc dark:prose-invert prose-sm max-w-none prose-headings:font-bold prose-p:text-gray-600 dark:prose-p:text-gray-300">
       <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  </div>
);