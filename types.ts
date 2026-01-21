export interface Lesson {
  id: string; 
  title: string;
}

export interface StudyArea {
  id: string;
  title: string;
  icon: any; // Lucide Icon
  lessons: string[];
}

export interface RotationDetails {
  icon: string;
  text: string;
}

export interface DaySchedule {
  day: string;
  morning: string;
  afternoon: string;
  night?: string;
}

export interface Rotation {
  id: string;
  title: string;
  color: string; // Tailwind class
  details: RotationDetails[];
  schedule: DaySchedule[];
}

export interface RotationPeriod {
  start: string;
  end: string;
  assignments: Record<string, string> | "Recesso";
  label: string;
}

export interface StudentShift {
  type: string;
  students: string[];
}

// --- AI & Study Types ---

export interface QuizItem {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface AILessonContent {
  epidemiology: string;
  pathophysiology: string;
  clinicalPicture: string;
  physicalExam: string;
  diagnosis: string;
  treatment: string;
  prognosis: string;
  recentEvidence: string;
  summary: string;
  // O quiz pode vir junto com o conteúdo ou gerado separadamente, mantendo flexibilidade
}

export interface LessonData {
  content: AILessonContent | null;
  residencyQuiz: QuizItem[] | null;
  // pdfUrl removido
  progress: {
    isCompleted: boolean;
    lastUpdated: string;
  };
}