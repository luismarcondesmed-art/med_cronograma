import React, { useState, useEffect } from 'react';
import { ChevronRight, FileText, Brain, Sparkles, CheckCircle2, RefreshCw, X, ArrowLeft, Users, AlertTriangle } from 'lucide-react';
import { generateStudyContent, generateResidencyQuiz } from '../services/geminiService';
import { AILessonContent, QuizItem, LessonData } from '../types';
import ReactMarkdown from 'react-markdown';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { User } from 'firebase/auth';

interface Props {
  user: User | null;
  lessonTitle: string;
  isOpen: boolean;
  onClose: () => void;
  mode?: 'modal' | 'inline';
}

export const StudyLessonModal: React.FC<Props> = ({ user, lessonTitle, isOpen, onClose, mode = 'modal' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dados do Conteúdo da Aula (Compartilhado)
  const [contentData, setContentData] = useState<{
    content: AILessonContent | null;
    residencyQuiz: QuizItem[] | null;
  }>({ content: null, residencyQuiz: null });

  // Estado do Progresso do Usuário (Local)
  const [isCompleted, setIsCompleted] = useState(false);
  
  const [tab, setTab] = useState<'content' | 'quiz'>('content');
  const [saving, setSaving] = useState(false);

  // ID sanitizado
  const docId = lessonTitle.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

  // 1. Carregar Conteúdo da Aula (Público/Compartilhado)
  useEffect(() => {
    if (isOpen) {
      console.log(`[Modal] Carregando conteúdo para: ${docId}`);
      setLoading(true);
      setError(null);
      
      const lessonRef = doc(db, "lessons", docId);
      
      const unsubscribeLesson = onSnapshot(lessonRef, (docSnapshot) => {
        setLoading(false);
        if (docSnapshot.exists()) {
          const fetchedData = docSnapshot.data() as LessonData;
          setContentData({
            content: fetchedData.content || null,
            residencyQuiz: fetchedData.residencyQuiz || null,
          });
        } else {
          setContentData({ content: null, residencyQuiz: null });
        }
      }, (err) => {
        console.error("[Firestore Error]", err);
        setError(`Erro ao carregar aula: ${err.message}`);
        setLoading(false);
      });

      return () => unsubscribeLesson();
    }
  }, [isOpen, docId]);

  // 2. Carregar Status de Conclusão do Usuário (Privado)
  useEffect(() => {
    if (isOpen && user) {
      const userRef = doc(db, "users", user.uid);
      getDoc(userRef).then((snap) => {
        if (snap.exists()) {
          const userData = snap.data();
          // Verifica se este docId está marcado como true no mapa studyProgress
          const done = userData.studyProgress?.[docId] === true;
          setIsCompleted(done);
        } else {
          setIsCompleted(false);
        }
      }).catch(err => console.error("Erro ao ler progresso do usuário:", err));
    }
  }, [isOpen, user, docId]);

  // Função para alternar conclusão (Checklist)
  const toggleComplete = async () => {
    if (!user) {
      alert("Erro: Usuário não autenticado.");
      return;
    }

    // Update Otimista
    const newState = !isCompleted;
    setIsCompleted(newState);
    
    try {
      const userRef = doc(db, "users", user.uid);
      // Salva em um mapa: studyProgress: { "aula-id": true/false }
      await setDoc(userRef, {
        studyProgress: {
          [docId]: newState
        }
      }, { merge: true });
      console.log(`[Checklist] ${lessonTitle} marcado como ${newState}`);
    } catch (err) {
      console.error("Erro ao salvar progresso:", err);
      // Reverte se der erro
      setIsCompleted(!newState);
      setError("Falha ao salvar progresso. Tente novamente.");
    }
  };

  // Salva apenas o CONTEÚDO gerado na coleção 'lessons' (público)
  const saveContent = async (newContent: Partial<LessonData>) => {
    setSaving(true);
    try {
      await setDoc(doc(db, "lessons", docId), newContent, { merge: true });
      console.log("[Firestore] Conteúdo salvo com sucesso.");
    } catch (err: any) {
      console.error("[Firestore Save Error]", err);
      setError("Falha ao salvar conteúdo gerado.");
    } finally {
      setTimeout(() => setSaving(false), 800);
    }
  };

  const handleGenerateContent = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("[Action] Solicitando geração de resumo...");
      const result = await generateStudyContent(lessonTitle);
      
      if (result) {
        // Atualiza estado local
        setContentData(prev => ({ ...prev, content: result }));
        // Salva no banco
        await saveContent({ content: result });
      } else {
        throw new Error("A IA retornou vazio.");
      }
    } catch (err: any) {
      console.error("[Generation Error]", err);
      setError(`Erro na IA: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("[Action] Solicitando geração de quiz...");
      const quiz = await generateResidencyQuiz(lessonTitle);
      
      if (quiz && quiz.length > 0) {
        setContentData(prev => ({ ...prev, residencyQuiz: quiz }));
        await saveContent({ residencyQuiz: quiz });
      } else {
        throw new Error("A IA não gerou questões.");
      }
    } catch (err: any) {
      console.error("[Quiz Error]", err);
      setError(`Erro no Quiz: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderContentTab = () => {
    if (!contentData.content) {
      // EMPTY STATE
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 max-w-md mx-auto min-h-[50vh]">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-[2rem] flex items-center justify-center text-gray-400 shadow-sm border border-gray-200 dark:border-gray-800">
             <FileText className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Resumo Inteligente</h3>
            <p className="text-gray-500">Gere um resumo estruturado e baseado em evidências sobre este tópico.</p>
          </div>
          
          <button 
            onClick={handleGenerateContent} 
            disabled={loading}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} 
            {loading ? "Gerando Resumo..." : "Gerar Resumo Agora"}
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-8 pb-20 max-w-3xl mx-auto">
         <div className="bg-gray-900 dark:bg-gray-800 text-gray-50 p-8 rounded-[2rem] shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Resumo Executivo
              </h4>
            </div>
            <div className="prose prose-invert prose-sm max-w-none leading-relaxed text-gray-300">
              <ReactMarkdown>{contentData.content.summary}</ReactMarkdown>
            </div>
         </div>
          
         <Section title="Epidemiologia & Risco" content={contentData.content.epidemiology} />
         <Section title="Fisiopatologia" content={contentData.content.pathophysiology} />
         <Section title="Quadro Clínico" content={contentData.content.clinicalPicture} />
         <Section title="Diagnóstico" content={contentData.content.diagnosis} />
         <Section title="Conduta & Tratamento" content={contentData.content.treatment} highlight />
         <Section title="Prognóstico" content={contentData.content.prognosis} />
         <Section title="Evidências Recentes" content={contentData.content.recentEvidence} />
         
         <div className="flex justify-center pt-8 border-t border-gray-200 dark:border-gray-800">
            <button 
              onClick={() => {
                if (window.confirm("Gerar um novo resumo apagará o atual para todos. Continuar?")) {
                  handleGenerateContent();
                }
              }}
              className="text-gray-500 text-sm font-medium flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors"
            >
               <RefreshCw className="w-4 h-4" /> Regenerar Conteúdo
            </button>
         </div>
      </div>
    );
  };

  const renderQuizTab = () => {
    if (!contentData.residencyQuiz) {
       // EMPTY STATE - QUIZ GENERATION
       return (
         <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 mt-10 min-h-[50vh]">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-[2rem] flex items-center justify-center text-gray-400 shadow-sm border border-gray-200 dark:border-gray-800">
               <Brain className="w-10 h-10" />
            </div>
            <div className="space-y-2">
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Simulado de Residência</h3>
               <p className="text-gray-500">Questões focadas em "{lessonTitle}".</p>
            </div>
            
            <button 
              onClick={handleGenerateQuiz} 
              disabled={loading}
              className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
               {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : null}
               {loading ? "Criando Questões..." : "Criar Simulado"}
            </button>
         </div>
       );
    }

    return (
       <div className="space-y-8 pb-20 max-w-3xl mx-auto">
          {contentData.residencyQuiz.map((item, idx) => (
             <QuizCard key={idx} index={idx} item={item} />
          ))}
          <div className="pt-8 flex justify-center">
             <button 
              onClick={() => {
                  if(window.confirm("Gerar novas questões substituirá as atuais.")) {
                      handleGenerateQuiz();
                  }
              }}
              disabled={loading} 
              className="text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
             >
                <RefreshCw className="w-4 h-4" /> Gerar Novas Questões
             </button>
          </div>
       </div>
    );
  };

  return (
    <div className={`relative w-full h-full bg-white dark:bg-gray-950 flex flex-col ${mode === 'modal' ? 'shadow-2xl animate-slide-in' : 'rounded-[2rem] overflow-hidden'}`}>
        
        {/* --- HEADER --- */}
        <div className="flex-none px-6 py-6 border-b border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl z-10 flex justify-between items-center">
          <div className="flex items-center gap-4">
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
              onClick={toggleComplete}
              className={`p-2 rounded-full transition-all ${isCompleted ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-300 hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              title={isCompleted ? "Concluído" : "Marcar como concluído"}
            >
              <CheckCircle2 className="w-6 h-6" fill={isCompleted ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* --- MOBILE TABS --- */}
        <div className="md:hidden flex p-4 pb-0 gap-4 border-b border-gray-100 dark:border-gray-800">
           <button onClick={() => setTab('content')} className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${tab === 'content' ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white' : 'border-transparent text-gray-400'}`}>
              Resumo
           </button>
           <button onClick={() => setTab('quiz')} className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${tab === 'quiz' ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white' : 'border-transparent text-gray-400'}`}>
              Questões
           </button>
        </div>

        {/* --- ERROR MESSAGE --- */}
        {error && (
          <div className="m-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 text-sm font-medium">
             <AlertTriangle className="w-5 h-5 shrink-0" />
             <span>{error}</span>
          </div>
        )}

        {/* --- MAIN AREA --- */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-6 md:p-8">
          
          {loading && !contentData.content && !contentData.residencyQuiz ? (
             <div className="h-full flex flex-col items-center justify-center animate-pulse space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-center space-y-2">
                   <p className="text-gray-900 dark:text-white font-bold">Processando conhecimento...</p>
                   <p className="text-xs text-gray-500">Isso pode levar alguns segundos.</p>
                </div>
             </div>
          ) : (
            <>
              {tab === 'content' && renderContentTab()}
              {tab === 'quiz' && renderQuizTab()}
            </>
          )}
        </div>
    </div>
  );
};

const Section: React.FC<{ title: string; content: string; highlight?: boolean }> = ({ title, content, highlight }) => {
  if (!content) return null;
  return (
    <div className={`p-8 rounded-[2rem] transition-colors ${highlight ? 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg' : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800'}`}>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        {highlight && <Sparkles className="w-4 h-4 text-emerald-500" />} {title}
      </h3>
      <div className="prose prose-zinc dark:prose-invert prose-sm max-w-none prose-headings:font-bold prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-ul:list-disc prose-li:marker:text-gray-400">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

const QuizCard: React.FC<{ index: number, item: QuizItem }> = ({ index, item }) => {
   return (
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
         <div className="flex gap-4 mb-6">
            <span className="flex-shrink-0 w-8 h-8 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center font-bold text-sm shadow-md">{index + 1}</span>
            <p className="font-bold text-gray-900 dark:text-gray-100 pt-1 leading-relaxed text-lg">{item.question}</p>
         </div>
         
         <div className="ml-12 flex flex-col gap-4 mb-6">
            {item.options?.map((opt, i) => (
               <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <span className="font-bold text-gray-400 text-sm mt-0.5">{String.fromCharCode(65 + i)})</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{opt}</span>
               </div>
            ))}
         </div>

         <details className="group ml-12">
            <summary className="cursor-pointer inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors select-none py-2 bg-emerald-50 dark:bg-emerald-900/20 px-4 rounded-full">
               <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" /> Ver Gabarito Comentado
            </summary>
            <div className="mt-4 p-6 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl text-sm border-l-4 border-emerald-500 leading-relaxed animate-fade-in">
               <p className="font-bold text-emerald-800 dark:text-emerald-200 mb-3 text-base">Resposta: {item.correctAnswer}</p>
               <div className="text-gray-700 dark:text-gray-300 prose prose-sm prose-emerald dark:prose-invert max-w-none">
                  <ReactMarkdown>{item.explanation}</ReactMarkdown>
               </div>
            </div>
         </details>
      </div>
   );
};