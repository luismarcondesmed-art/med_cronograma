import { Rotation, RotationPeriod, StudentShift, StudyArea } from './types';
import { Baby, Stethoscope, HeartPulse, Brain, Thermometer, Pill, Syringe, Activity, AlertTriangle, FileText } from 'lucide-react';

// --- Practical Rotation Data ---
export const ROTATIONS: Record<string, Rotation> = {
  "A": {
      "id": "A",
      "title": "INFECTO / REUMATO / U&E 1",
      "color": "bg-blue-600",
      "details": [
          { "icon": "map-pin", "text": "Infecto: SAM 2 (3ª, 5ª, 6ª) / SAM 30 (4ª manhã)" },
          { "icon": "users", "text": "Profs: Cristina, Andréa Rossoni, Tony Tahan" }
      ],
      "schedule": [
          { "day": "2ª", "morning": "Estudo Individual", "afternoon": "Estudo Individual" },
          { "day": "3ª", "morning": "Infecto (08:00-10:30) + Aula (10:30)", "afternoon": "Estudo Individual" },
          { "day": "4ª", "morning": "Infecto SAM 30 (08:00-12:00)", "afternoon": "Estudo Individual" },
          { "day": "5ª", "morning": "Estudo Individual", "afternoon": "Infecto (13:00-17:00)" },
          { "day": "6ª", "morning": "Infecto (08:00-10:00) + Casos (10:30)", "afternoon": "Infecto (13:00-17:00)" }
      ]
  },
  "B": {
      "id": "B",
      "title": "IMUNO / PNEUMO / SEC",
      "color": "bg-sky-600",
      "details": [
          { "icon": "map-pin", "text": "Pneumo: SAM 32 (R. Pe Camargo 453)" },
          { "icon": "map-pin", "text": "SEC: CHC Prédio Central" }
      ],
      "schedule": [
          { "day": "2ª", "morning": "SEC (08:00-10:00)", "afternoon": "Pneumologia (13:00-17:00)" },
          { "day": "3ª", "morning": "SEC (08:00-10:00) + Aula (10:30)", "afternoon": "Imuno-alergo (13:30-17:30)" },
          { "day": "4ª", "morning": "Estudo Individual", "afternoon": "Imuno-alergo (13:30-17:30)" },
          { "day": "5ª", "morning": "Reumato (08:30-12:00)", "afternoon": "Pneumologia (13:30-17:30)" },
          { "day": "6ª", "morning": "Pneumo (08:00) + Casos (10:30)", "afternoon": "Estudo Individual" }
      ]
  },
  "C": {
      "id": "C",
      "title": "ENDÓCRINO / CLÍNICA I",
      "color": "bg-indigo-600",
      "details": [
          { "icon": "map-pin", "text": "Endócrino: UEP R. Pe Camargo 250" },
          { "icon": "map-pin", "text": "Clínica: 14º Andar" }
      ],
      "schedule": [
          { "day": "2ª", "morning": "Estudo Individual", "afternoon": "Endócrino (13:00-16:30)" },
          { "day": "3ª", "morning": "Clínica Ped I (08:30-10:00) + Aula (10:30)", "afternoon": "Endócrino (13:00-16:30)" },
          { "day": "4ª", "morning": "Endócrino (07:30-12:00)", "afternoon": "Endócrino (13:00-16:30)" },
          { "day": "5ª", "morning": "Clínica Ped I (07:30-10:00)", "afternoon": "Estudo Individual" },
          { "day": "6ª", "morning": "Endócrino (07:30-10:00) + Casos (10:30)", "afternoon": "Estudo Individual" }
      ]
  },
  "D": {
      "id": "D",
      "title": "AL. CONJUNTO / CCO / SIMULAÇÃO",
      "color": "bg-cyan-600",
      "details": [
          { "icon": "map-pin", "text": "Maternidade 3º andar / CCO 1º andar" },
          { "icon": "map-pin", "text": "Simulação: Leide Parolin 5º andar" }
      ],
      "schedule": [
          { "day": "2ª", "morning": "AC (08:00-11:00)", "afternoon": "CCO (13:30-16:30)" },
          { "day": "3ª", "morning": "Grupo SACI (08:00-09:30) + Aula (10:30)", "afternoon": "Estudo Individual" },
          { "day": "4ª", "morning": "AC (08:00-11:00)", "afternoon": "Estudo Individual" },
          { "day": "5ª", "morning": "AC (08:00-11:00)", "afternoon": "Simulação I (13:00-17:00)" },
          { "day": "6ª", "morning": "CCO (08:00-10:30) + Casos (10:30)", "afternoon": "CCO (12:30-15:30)" }
      ]
  },
  "E": {
      "id": "E",
      "title": "NEUROLOGIA / PUERI ALTO RISCO",
      "color": "bg-violet-600",
      "details": [
          { "icon": "map-pin", "text": "CENEP: R. Floriano Essenfelder, 81" }
      ],
      "schedule": [
          { "day": "2ª", "morning": "Neuro Autismo (07:30-11:30)", "afternoon": "Neuro Geral (13:00-16:00)" },
          { "day": "3ª", "morning": "Neuro Complexos (07:30-10:30) + Aula (10:30)", "afternoon": "Neuro Bate-papo (13:30-15:30)" },
          { "day": "4ª", "morning": "Neuro Aprendizado (07:30-11:30)", "afternoon": "Neuro Geral (13:00-16:00)" },
          { "day": "5ª", "morning": "Neuro Epilepsia (07:30-11:30)", "afternoon": "Neuro Geral (13:00-16:00)" },
          { "day": "6ª", "morning": "Friday Meeting (07:30-10:00) + Casos (10:30)", "afternoon": "Neuro Geral (13:00-16:00)" }
      ]
  },
  "F": {
      "id": "F",
      "title": "PUERICULTURA / ONCOHEMATO",
      "color": "bg-teal-600",
      "details": [
          { "icon": "map-pin", "text": "Onco: Amb 9º andar / Enf 14º andar" },
          { "icon": "map-pin", "text": "Pueri: SAM 11 (Casa da Pueri)" },
          { "icon": "map-pin", "text": "UBS: Vila Diana" }
      ],
      "schedule": [
          { "day": "2ª", "morning": "Puericultura (08:00-12:00)", "afternoon": "UBS Vila Diana (14:00-16:00)" },
          { "day": "3ª", "morning": "Puericultura (08:00-10:30) + Aula (10:30)", "afternoon": "Hemato Amb (13:30-17:30)" },
          { "day": "4ª", "morning": "Puericultura (08:00-12:00)", "afternoon": "UBS Vila Diana (14:00-16:00)" },
          { "day": "5ª", "morning": "Puericultura (08:00-12:00)", "afternoon": "Hemato Amb (14:00-18:00)" },
          { "day": "6ª", "morning": "Estudo + Casos (10:30)", "afternoon": "Estudo Individual" }
      ]
  },
  "G": {
      "id": "G",
      "title": "PA PEDIATRIA (DIURNO)",
      "color": "bg-orange-500", // Alert Color
      "details": [
          { "icon": "map-pin", "text": "PA Pediatria 1º andar CHC" },
          { "icon": "clock", "text": "Plantão 12h: 07:30 - 19:30" },
          { "icon": "alert-circle", "text": "Liberado de aulas 3ª e 6ª" }
      ],
      "schedule": [
          { "day": "2ª", "morning": "PLANTÃO (07:30-12:00)", "afternoon": "PLANTÃO (12:00-19:30)" },
          { "day": "3ª", "morning": "PLANTÃO (07:30-12:00)", "afternoon": "PLANTÃO (12:00-19:30)" },
          { "day": "4ª", "morning": "PLANTÃO (07:30-12:00)", "afternoon": "PLANTÃO (12:00-19:30)" },
          { "day": "5ª", "morning": "PLANTÃO (07:30-12:00)", "afternoon": "PLANTÃO (12:00-19:30)" },
          { "day": "6ª", "morning": "PLANTÃO (07:30-12:00)", "afternoon": "PLANTÃO (12:00-19:30)" }
      ]
  },
  "H": {
      "id": "H",
      "title": "SEMPR / DERMATO / PA NOTURNO",
      "color": "bg-slate-700",
      "details": [
          { "icon": "map-pin", "text": "SEMPR: Av. Agostinho Leão Jr, 285" },
          { "icon": "map-pin", "text": "Dermato: SAM 2" },
          { "icon": "moon", "text": "PA NOITE: 19:30 - 07:30" }
      ],
      "schedule": [
          { "day": "2ª", "morning": "Estudo Individual", "afternoon": "Dermato (13:00-15:00)", "night": "PA (19:30-07:30)" },
          { "day": "3ª", "morning": "SEMPR (08:00-10:00) + Aula (10:30)", "afternoon": "Estudo Individual", "night": "PA (19:30-07:30)" },
          { "day": "4ª", "morning": "Dermato (08:00-10:00)", "afternoon": "Estudo Individual", "night": "PA (19:30-07:30)" },
          { "day": "5ª", "morning": "Dermato (08:00-10:00)", "afternoon": "Estudo Individual", "night": "PA (19:30-07:30)" },
          { "day": "6ª", "morning": "Estudo + Casos (10:30)", "afternoon": "Estudo Individual", "night": "PA (19:30-07:30)" }
      ]
  },
  "I": {
      "id": "I",
      "title": "ENFERMARIA / GASTRO",
      "color": "bg-emerald-600",
      "details": [
          { "icon": "map-pin", "text": "Enfermaria: 14º andar" }
      ],
      "schedule": [
          { "day": "2ª", "morning": "Enfermaria (07:30-10:30)", "afternoon": "Estudo Individual" },
          { "day": "3ª", "morning": "Enfermaria (07:30-10:30) + Aula (10:30)", "afternoon": "Pueri/P.médica (13:00-15:00)" },
          { "day": "4ª", "morning": "Enfermaria (07:30-10:30)", "afternoon": "Pueri Prematuro (13:00-16:30)" },
          { "day": "5ª", "morning": "Pueri/P.médica (07:30-10:30)", "afternoon": "Estudo Individual" },
          { "day": "6ª", "morning": "Enfermaria (07:30-10:30) + Casos (10:30)", "afternoon": "Estudo Individual" }
      ]
  }
};

export const MASTER_SCHEDULE: RotationPeriod[] = [
  { "start": "2025-11-03", "end": "2025-11-07", "assignments": { "GRUPO VI": "E" }, "label": "03/11 a 07/11" },
  { "start": "2025-11-10", "end": "2025-11-14", "assignments": { "GRUPO VI": "F" }, "label": "10/11 a 14/11" },
  { "start": "2025-11-17", "end": "2025-11-28", "assignments": { "GRUPO VI": "G" }, "label": "17/11 a 28/11 (PA DIA)" },
  { "start": "2025-12-01", "end": "2025-12-05", "assignments": { "GRUPO VI": "H" }, "label": "01/12 a 05/12 (PA NOITE)" },
  { "start": "2025-12-08", "end": "2025-12-12", "assignments": { "GRUPO VI": "I" }, "label": "08/12 a 12/12" },
  { "start": "2025-12-15", "end": "2025-12-19", "assignments": { "GRUPO VI": "A" }, "label": "15/12 a 19/12" },
  { "start": "2025-12-20", "end": "2026-01-04", "assignments": "Recesso", "label": "RECESSO" },
  { "start": "2026-01-05", "end": "2026-01-09", "assignments": { "GRUPO VI": "B" }, "label": "05/01 a 09/01" },
  { "start": "2026-01-12", "end": "2026-01-16", "assignments": { "GRUPO VI": "C" }, "label": "12/01 a 16/01" },
  { "start": "2026-01-19", "end": "2026-01-23", "assignments": { "GRUPO VI": "D" }, "label": "19/01 a 23/01" }
];

export const SPECIFIC_SHIFTS: Record<string, StudentShift> = {
  "2025-11-17": { type: "DIA", students: ["Luis Gustavo", "Lyan Ortega", "Paulo César"] },
  "2025-11-18": { type: "DIA", students: ["Gustavo Oliveira", "Gustavo Cardoso", "Lucas Siqueira"] },
  "2025-11-19": { type: "DIA", students: ["Luis Gustavo", "Gustavo Cardoso", "Lucas Siqueira"] },
  "2025-11-20": { type: "DIA", students: ["-"] },
  "2025-11-21": { type: "DIA", students: ["-"] },
  "2025-11-24": { type: "DIA", students: ["Gustavo Oliveira", "Lyan Ortega", "Paulo César"] },
  "2025-11-25": { type: "DIA", students: ["Gustavo Cardoso", "Paulo Cesar", "Lucas Siqueira"] },
  "2025-11-26": { type: "DIA", students: ["Gustavo Oliveira", "Paulo César", "Lyan Ortega"] },
  "2025-11-27": { type: "DIA", students: ["Luis Gustavo", "Lucas Siqueira", "Gustavo Cardoso"] },
  "2025-11-28": { type: "DIA", students: ["Lyan Ortega", "Gustavo Oliveira", "Luis Gustavo"] },
  "2025-12-01": { type: "NOITE", students: ["Luis Marcondes", "Paulo"] },
  "2025-12-02": { type: "NOITE", students: ["Gustavo Oliveira", "Lyan"] },
  "2025-12-03": { type: "NOITE", students: ["Luis Marcondes", "Paulo"] },
  "2025-12-04": { type: "NOITE", students: ["Gustavo Oliveira", "Lyan"] },
  "2025-12-05": { type: "NOITE", students: ["Lucas", "Gustavo Cardoso"] },
};

// --- Reorganized by Knowledge Area (Áreas do Conhecimento) ---
export const STUDY_AREAS: StudyArea[] = [
  {
    id: "neonatologia",
    title: "Neonatologia",
    icon: Baby,
    lessons: [
      "Aleitamento materno",
      "Assistência ao Rn no Alojamento conjunto",
      "Atendimento ao Rn na sala de parto",
      "Circulação Transicional",
      "Icterícia neonatal",
      "Prematuridade",
      "Protocolos de alojamento conjunto",
      "Testes de triagem neonatal",
      "Triagem neonatal"
    ]
  },
  {
    id: "crescimento",
    title: "Crescimento & Desenvolvimento",
    icon: Activity,
    lessons: [
      "Alta estatura",
      "Baixa Estatura",
      "Crescimento e Desenvolvimento",
      "Desenvolvimento Neuropsicomotor",
      "Puberdade Precoce e Tardia",
      "Cardápio no Primeiro Ano de Vida",
      "Fórmulas Infantis"
    ]
  },
  {
    id: "infectologia",
    title: "Infectologia & Imuno",
    icon: Syringe,
    lessons: [
      "Calendário vacinal",
      "Dengue",
      "IVAS (Infecções de Vias Aéreas Superiores)",
      "Meningites e infecções do SNC",
      "Síndrome de imunodeficiência adquirida (HIV)",
      "Protocolos de TORCHES",
      "Tuberculose",
      "Viroses exantemáticas"
    ]
  },
  {
    id: "pneumo_alergia",
    title: "Pneumo & Alergia",
    icon: Stethoscope,
    lessons: [
      "Alergia a Proteína do Leite de Vaca (APLV)",
      "Asma e crise de asma",
      "Dermatite atópica",
      "Rinite alérgica",
      "Síndrome do Bebê Chiador",
      "Fibrose Cística"
    ]
  },
  {
    id: "emergencia",
    title: "Emergência & UTI",
    icon: AlertTriangle,
    lessons: [
      "Cetoacidose Diabética",
      "Choque Séptico",
      "Crises Convulsivas",
      "Distúrbio Hidroeletrolíticos",
      "Parada Cardiorespiratória (PCR)"
    ]
  },
  {
    id: "gastro",
    title: "Gastroenterologia",
    icon: Pill,
    lessons: [
      "Anorexia",
      "Constipação Intestinal",
      "Desnutrição",
      "Diarreia Crônica",
      "Doenças Inflamatórias Intestinais (DII)",
      "Dor abdominal",
      "Hemorragias Digestivas"
    ]
  },
  {
    id: "hemato_onco",
    title: "Hemato & Oncologia",
    icon: HeartPulse,
    lessons: [
      "Anemia Falciforme",
      "Anemias Carenciais",
      "Leucemias e Linfomas",
      "Linfonodomegalia",
      "Tumores do Sistema Nervoso Central"
    ]
  },
  {
    id: "neuro",
    title: "Neurologia",
    icon: Brain,
    lessons: [
      "Autismo",
      "Cefaleia na Infância",
      "Epilepsias",
      "Paralisia cerebral",
      "Retardo Mental",
      "TDAH e transtornos de aprendizado"
    ]
  },
  {
    id: "diversos",
    title: "Tópicos Gerais & Especialidades",
    icon: FileText,
    lessons: [
      "Diabetes Mellitus",
      "Doenças cutâneas parasitárias",
      "Dermatopatia da infância",
      "Doenças inflamatórias e reumatológicas",
      "Erros Inatos do Metabolismo",
      "Ética",
      "Hipertensão Arterial Sistêmica",
      "Hipertireoidismo",
      "Hipotireoidismo congênito",
      "Hipovitaminoses",
      "Obesidade",
      "Prescrição médica em pediatria",
      "Corticoterapia"
    ]
  }
];