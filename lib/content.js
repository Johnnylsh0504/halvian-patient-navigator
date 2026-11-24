export const languages = { en: "English", es: "Español", zh: "中文" };
export const speechLang = { en: "en-US", es: "es-US", zh: "zh-CN" };
export const pick = (lang, en, es, zh) => ({ en, es, zh })[lang] ?? en;
export const screens = [
  "check-in",
  "symptoms",
  "wait",
  "assistant",
  "discharge",
  "follow-up",
];
export const hospitalWorkspaces = [
  "intake",
  "flow",
  "discharge",
  "requests",
  "outcomes",
];
export const screeningLabels = {
  "check-in": ["Check in", "Registro", "登记"],
  symptoms: ["Symptoms", "Síntomas", "症状"],
  wait: ["Wait status", "Espera", "等候进度"],
  assistant: ["Ask a question", "Haz una pregunta", "咨询问题"],
  discharge: ["Discharge guide", "Guía de alta", "出院指南"],
  "follow-up": ["Follow-up visit", "Cita de seguimiento", "复诊安排"],
};

export const waitStages = {
  registration: ["Registration", "Registro", "登记"],
  triage: ["Nurse review", "Revisión de enfermería", "护士评估"],
  waiting: ["Waiting for a room", "Esperando una sala", "等待诊室"],
  room: ["Room ready", "Sala disponible", "诊室已准备"],
  clinician: ["Care in progress", "Atención en curso", "正在诊疗"],
  complete: ["Visit complete", "Visita completada", "就诊完成"],
  left: ["Left before being seen", "Se retiró antes de la consulta", "就诊前离开"],
};

export const coverageOptions = {
  commercial: ["Commercial insurance", "Seguro comercial", "商业保险"],
  medicaid: ["Medicaid", "Medicaid", "Medicaid"],
  medicare: ["Medicare", "Medicare", "Medicare"],
  uninsured: ["No insurance", "Sin seguro", "无保险"],
};

export const visit = {
  dischargeDate: "2026-11-24",
  clinician: "Discharging clinician",
  coordinator: "Care coordinator",
  sourceVersion: "Discharge plan / v1",
  source: [
    "Medication reconciliation: No new prescriptions were issued at discharge.",
    "Return precautions: In the event of a medical emergency, call 911.",
    "Follow-up: Schedule and attend a visit at Halvian Family Clinic within 14 days of discharge. Bring the medication list.",
  ],
};
export const planRows = [
  ["Medicines", "Medicamentos", "用药说明"],
  ["When to get urgent help", "Cuándo pedir ayuda urgente", "何时寻求紧急帮助"],
  ["Your next visit", "Tu próxima cita", "下一次就诊"],
];
// A controlled rendering of clinician-authored facts. A clinician releases each language separately.
export const approvedPhrases = {
  en: [
    "No new medicines were prescribed at this visit.",
    "If you have a medical emergency, call 911.",
    "See Halvian Family Clinic within 14 days. Bring your medicine list.",
  ],
  es: [
    "En esta visita no te recetaron medicamentos nuevos.",
    "Si tienes una emergencia médica, llama al 911.",
    "Acude a Halvian Family Clinic dentro de 14 días. Lleva tu lista de medicamentos.",
  ],
  zh: [
    "本次就诊没有开新药。",
    "遇到医疗紧急情况，请拨打 911。",
    "请在 14 天内到 Halvian 家庭诊所复诊，并带上用药清单。",
  ],
};
const question = (id, examples, response) => ({ id, examples, response });
export const faq = [
  question(
    "interpreter",
    [
      [
        "How do I ask for an interpreter?",
        "Can I get a language interpreter?",
        "I need an interpreter",
        "Can someone translate for me?",
      ],
      [
        "¿Cómo pido un intérprete?",
        "Necesito un intérprete",
        "¿Pueden ayudarme en mi idioma?",
      ],
      [
        "我想找口译员",
        "怎么申请口译服务？",
        "可以帮我找翻译吗？",
        "我需要中文翻译",
      ],
    ],
    [
      "Ask the front desk or your nurse for an interpreter. You can also choose “Ask staff” here and we’ll add your request to the care team’s list.",
      "Pide un intérprete en recepción o a tu enfermero. También puedes elegir «Pedir ayuda» para enviar la solicitud al equipo.",
      "请向前台或护士申请口译服务，也可以点「联系工作人员」提交请求。",
    ],
  ),
  question(
    "follow",
    [
      [
        "How do I book my follow-up?",
        "Where can I schedule my follow-up visit?",
        "How can I arrange my next appointment?",
      ],
      [
        "¿Cómo programo mi cita de seguimiento?",
        "¿Dónde puedo reservar mi próxima cita?",
        "Quiero programar mi próxima visita",
      ],
      ["我怎么预约复诊？", "如何安排下一次就诊？", "怎么预约下次复诊"],
    ],
    [
      "Open Follow-up visit to see available appointments. If none works, choose “I need help” so a coordinator can help you arrange one.",
      "Abre Cita de seguimiento para ver las opciones. Si ninguna te sirve, selecciona «Necesito ayuda» para avisar a coordinación.",
      "打开「复诊安排」查看可选时间。如果都不合适，点「我需要帮助」，由协调员协助安排。",
    ],
  ),
  question(
    "wait",
    [
      [
        "Why is the wait time changing?",
        "Why did my estimated wait change?",
        "Why do wait times change?",
      ],
      ["¿Por qué cambia el tiempo de espera?", "¿Por qué cambió mi espera?"],
      ["为什么等候时间会变？", "为什么预计等待时间变了？"],
    ],
    [
      "The team sees patients according to how urgently they need care. Your nurse can check your visit status. Tell staff immediately if you need urgent help while you wait.",
      "El equipo atiende según la urgencia. Tu enfermero puede revisar el estado de tu visita. Avisa al personal de inmediato si necesitas ayuda urgente mientras esperas.",
      "团队会按病情紧急程度安排就诊。护士可以查询你的进度。等候时如需紧急帮助，请立即告诉现场工作人员。",
    ],
  ),
  question(
    "plan",
    [
      [
        "Where are my discharge instructions?",
        "How can I read my discharge plan?",
        "Where is my discharge guide?",
      ],
      ["¿Dónde están mis instrucciones de alta?", "¿Cómo leo mi guía de alta?"],
      ["我的出院说明在哪里？", "怎样查看出院指南？"],
    ],
    [
      "Open Discharge guide. Once your nurse or attending physician signs your note, you can read and download it.",
      "Abre Guía de alta. Cuando tu enfermero o médico tratante firme tu nota, podrás leerla y descargarla.",
      "打开「出院指南」。护士或主治医生签署出院记录后，你可以阅读并下载原文。",
    ],
  ),
];
export const idx = (lang) => ["en", "es", "zh"].indexOf(lang);
export const slots = [
  { day: 7, time: "10:00", iso: "2026-12-01" },
  { day: 9, time: "14:30", iso: "2026-12-03" },
  { day: 13, time: "09:00", iso: "2026-12-07" },
];
export const prettyDate = (iso, lang, short = false) =>
  new Intl.DateTimeFormat(speechLang[lang], {
    timeZone: "UTC",
    month: short ? "short" : "long",
    day: "numeric",
  }).format(new Date(iso + "T12:00:00Z"));
export const dayDate = (day) =>
  new Date(Date.UTC(2026, 10, 24 + day)).toISOString().slice(0, 10);
export const asTime = (slot, lang) =>
  new Intl.DateTimeFormat(speechLang[lang], {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(slot.iso + "T" + slot.time + ":00Z"));
export const barriers = {
  transport: ["I need a ride", "Necesito transporte", "我需要交通协助"],
  schedule: [
    "These times don’t work",
    "Estos horarios no me sirven",
    "现有时间不合适",
  ],
  phone: [
    "I need help by phone",
    "Necesito ayuda por teléfono",
    "我需要电话协助",
  ],
};
export const issues = {
  clinical: ["Clinical question", "Pregunta clínica", "医疗问题"],
  unsure: ["Unanswered question", "Pregunta sin respuesta", "待解答问题"],
  feedback: ["Unclear information", "Información poco clara", "说明不清楚"],
  staff: ["Requested staff help", "Solicitud de ayuda", "请求工作人员协助"],
  teach: ["Discharge clarification", "Duda sobre el alta", "出院说明需解释"],
  "wait-help": [
    "Waiting-area assistance",
    "Ayuda en la sala de espera",
    "等候区协助",
  ],
  ...barriers,
};
export const helpText = [
  "For severe trouble breathing or loss of consciousness, get help now. In the ED, alert staff. Outside the ED, call 911.",
  "Ante una dificultad grave para respirar o pérdida del conocimiento, pide ayuda de inmediato. En urgencias, avisa al personal. Fuera de urgencias, llama al 911.",
  "如遇严重呼吸困难或意识丧失，请立即求助。在急诊科请马上通知现场人员，离院后请拨打 911。",
];
