import {
  faq,
  approvedPhrases,
  slots,
  languages,
  visit,
  waitStages,
  coverageOptions,
} from "./content.js";
const clinical =
  /\b(dos(e|is|age)|medicat\w*|medicin\w*|meds?|prescri\w*|prescrip\w*|drug|pill|take|taking|pain|hurt\w*|chest|breath\w*|bleed\w*|symptom\w*|diagnos\w*|treat\w*|fever|dizz\w*|faint\w*|suicid\w*|vomit\w*|dolor|duele|tomar|tomo|sangr\w*|pecho|respir\w*|fiebre|mare\w*|embaraz\w*|emergen\w*|urgent\w*|urgenc\w*)\b|药|痛|疼|症状|诊断|呼吸|流血|发烧|头晕|自杀|急救|紧急|胸闷/i;
const clean = (value) =>
  String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
function terms(s) {
  const normalized = clean(s);
  if (/[\u3400-\u9fff]/.test(normalized)) {
    const chars = normalized.replace(/\s/g, "");
    return new Set(
      Array.from(chars.slice(1)).map((_, i) => chars.slice(i, i + 2)),
    );
  }
  return new Set(normalized.split(" ").filter(Boolean));
}
const examples = faq.flatMap((item) =>
  item.examples.flat().map((example) => ({
    id: item.id,
    words: terms(example),
    normalized: clean(example),
  })),
);
const vocabulary = new Set(examples.flatMap((row) => [...row.words]));
// Nearest-example text classification with abstention. A new or compound request defaults to a person.
export function classify(text) {
  const normalized = clean(text);
  if (!normalized) return { kind: "empty" };
  if (clinical.test(normalized)) return { kind: "clinical" };
  const exact = examples.find((row) => row.normalized === normalized);
  if (exact) return { kind: "faq", id: exact.id };
  const words = terms(text);
  if (words.size < 2 || [...words].some((word) => !vocabulary.has(word)))
    return { kind: "unsure" };
  const scores = faq
    .map(({ id }) => {
      const similarities = examples
        .filter((row) => row.id === id)
        .map(({ words: other }) => {
          const shared = [...words].filter((x) => other.has(x)).length;
          return shared / (words.size + other.size - shared);
        });
      return { id, score: Math.max(...similarities) };
    })
    .sort((a, b) => b.score - a.score);
  return scores[0].score >= 0.76 && scores[0].score - scores[1].score >= 0.18
    ? { kind: "faq", id: scores[0].id }
    : { kind: "unsure" };
}
const field = (value, max = 160) => String(value || "").trim().slice(0, max);
export function structureSymptoms(input) {
  const description = field(input?.description, 1000);
  if (!description) return null;
  const normalized = clean(description);
  const observations = [];
  const rules = [
    [/chest|pecho|胸/, "chest"],
    [/head|cabeza|头/, "head"],
    [/stomach|abdomen|belly|est[oó]mago|腹|胃/, "abdomen"],
    [/breath|respir|呼吸/, "breathing"],
    [/bleed|sangr|流血/, "bleeding"],
    [/dizz|mare|头晕/, "dizziness"],
    [/fever|fiebre|发烧/, "fever"],
  ];
  for (const [pattern, label] of rules)
    if (pattern.test(normalized)) observations.push(label);
  const urgent =
    /severe (trouble )?breath|can('?|no)t breathe|unconscious|passed out|chest pressure|heavy bleeding|suicid|dificultad grave.*respir|no puedo respirar|inconsciente|sangrado abundante|自杀|无法呼吸|严重呼吸|失去意识|大量出血/i.test(
      normalized,
    );
  return {
    concern: description,
    onset: field(input.onset, 40),
    severity: Number.isInteger(input.severity)
      ? Math.min(10, Math.max(0, input.severity))
      : null,
    reporter: input.reporter === "caregiver" ? "caregiver" : "patient",
    observations,
    urgent,
  };
}
const registrationFields = () => ({
  fullName: "",
  birthDate: "",
  phone: "",
  address: "",
  coverage: "",
  insurerName: "",
  memberId: "",
  preferredLanguage: "en",
});
export function blank() {
  return {
    version: 3,
    lang: "en",
    day: 0,
    turns: [],
    tickets: [],
    releases: {},
    teach: {},
    rating: {},
    slot: null,
    attended: null,
    reminder: "none",
    reminderShown: false,
    registrations: [],
    registration: {
      status: "not-started",
      fields: registrationFields(),
      source: "manual",
      scanName: "",
      assisted: false,
      caregiverName: "",
      relationship: "",
      visitId: "",
      submittedAt: null,
      verifiedAt: null,
    },
    symptoms: {
      status: "not-started",
      description: "",
      onset: "",
      severity: 5,
      photoName: "",
      photoConsent: false,
      reporter: "patient",
      caregiverName: "",
      relationship: "",
      structured: null,
      submittedAt: null,
      reviewedAt: null,
    },
    wait: {
      status: "registration",
      estimate: null,
      note: "",
      updatedAt: null,
    },
  };
}
export function restore(raw) {
  try {
    const s = JSON.parse(raw);
    if (
      s?.version === 3 &&
      Object.hasOwn(languages, s.lang) &&
      Array.isArray(s.tickets) &&
      Array.isArray(s.turns) &&
      Array.isArray(s.registrations) &&
      s.releases &&
      s.teach &&
      s.rating &&
      Number.isInteger(s.day) &&
      s.day >= 0 &&
      s.day <= 15 &&
      (s.slot === null || (Number.isInteger(s.slot) && slots[s.slot]))
    ) {
      const base = blank();
      const registration = ["not-started", "submitted", "verified"].includes(
        s.registration?.status,
      )
        ? s.registration
        : {};
      const symptoms = ["not-started", "submitted", "reviewed"].includes(
        s.symptoms?.status,
      )
        ? s.symptoms
        : {};
      const wait = Object.hasOwn(waitStages, s.wait?.status) ? s.wait : {};
      const registrations = s.registrations
        .filter(
          (entry) =>
            entry?.visitId &&
            entry.fields?.fullName &&
            ["submitted", "verified"].includes(entry.status),
        )
        .slice(-100);
      return {
        ...base,
        ...s,
        registrations,
        registration: {
          ...base.registration,
          ...registration,
          fields: {
            ...base.registration.fields,
            ...(registration.fields || {}),
          },
        },
        symptoms: { ...base.symptoms, ...symptoms },
        wait: { ...base.wait, ...wait },
      };
    }
  } catch {}
  return blank();
}
function withTicket(s, kind, note, lang, owner) {
  const old = s.tickets.find(
    (q) =>
      q.kind === kind &&
      q.note === note &&
      q.lang === lang &&
      q.status === "open",
  );
  if (old) return s;
  return {
    ...s,
    tickets: [
      ...s.tickets,
      {
        id: "H-" + (101 + s.tickets.length),
        kind,
        note,
        lang,
        owner,
        status: "open",
        reply: "",
        day: s.day,
      },
    ],
  };
}
export function change(s, a) {
  switch (a.type) {
    case "hydrate":
      return a.saved;
    case "reset": {
      const next = blank();
      return { ...next, registrations: s.registrations };
    }
    case "lang":
      return Object.hasOwn(languages, a.lang) ? { ...s, lang: a.lang } : s;
    case "ask": {
      const text = String(a.text || "")
        .trim()
        .slice(0, 480);
      const result = classify(text);
      if (result.kind === "empty") return s;
      const next = {
        ...s,
        turns: [...s.turns, { text, lang: s.lang, ...result }],
      };
      return result.kind === "faq"
        ? next
        : withTicket(next, result.kind, text, s.lang, "nurse");
    }
    case "ticket":
      return withTicket(
        s,
        a.kind,
        String(a.note || "").slice(0, 480),
        s.lang,
        a.owner || "nurse",
      );
    case "reply": {
      const reply = String(a.reply || "")
        .trim()
        .slice(0, 480);
      if (!reply) return s;
      return {
        ...s,
        tickets: s.tickets.map((q) =>
          q.id === a.id && q.status === "open"
            ? { ...q, status: "resolved", reply, replyDay: s.day }
            : q,
        ),
      };
    }
    case "release": {
      if (
        s.releases[s.lang]?.version === visit.sourceVersion ||
        !a.checked ||
        !Array.isArray(a.rows) ||
        a.rows.length !== approvedPhrases[s.lang].length
      )
        return s;
      const rows = a.rows.map((x) => String(x).trim());
      if (rows.some((x) => !x || x.length > 320)) return s;
      return {
        ...s,
        releases: {
          ...s.releases,
          [s.lang]: {
            rows,
            version: visit.sourceVersion,
            clinician: visit.clinician,
            day: s.day,
          },
        },
      };
    }
    case "teach": {
      if (!s.releases[s.lang]) return s;
      const next = {
        ...s,
        teach: { ...s.teach, [s.lang]: a.ok ? "correct" : "clarify" },
      };
      return a.ok ? next : withTicket(next, "teach", "", s.lang, "nurse");
    }
    case "rate":
      return { ...s, rating: { ...s.rating, [a.key]: a.value } };
    case "submit-registration": {
      const raw = a.fields || {};
      const fields = {
        fullName: field(raw.fullName),
        birthDate: field(raw.birthDate, 10),
        phone: field(raw.phone, 40),
        address: field(raw.address, 220),
        coverage: Object.hasOwn(coverageOptions, raw.coverage)
          ? raw.coverage
          : "",
        insurerName: field(raw.insurerName, 120),
        memberId: field(raw.memberId, 80),
        preferredLanguage: Object.hasOwn(languages, raw.preferredLanguage)
          ? raw.preferredLanguage
          : s.lang,
      };
      if (
        !a.confirmed ||
        !fields.fullName ||
        !/^\d{4}-\d{2}-\d{2}$/.test(fields.birthDate) ||
        !fields.phone ||
        !fields.address ||
        !fields.coverage ||
        (fields.coverage !== "uninsured" &&
          (!fields.insurerName || !fields.memberId)) ||
        (a.assisted && (!field(a.caregiverName) || !a.caregiverAuthorized))
      )
        return s;
      const now = Date.now();
      const visitId =
        s.registration.visitId ||
        "HV-" +
          String(now).slice(-4) +
          String((s.registrations.length + 1) % 100).padStart(2, "0");
      const registration = {
        status: "submitted",
        fields,
        source: a.source === "scan" ? "scan" : "manual",
        scanName: field(a.scanName, 120),
        assisted: !!a.assisted,
        caregiverName: a.assisted ? field(a.caregiverName) : "",
        relationship: a.assisted ? field(a.relationship, 80) : "",
        visitId,
        submittedAt: now,
        verifiedAt: null,
      };
      const exists = s.registrations.some(
        (entry) => entry.visitId === visitId,
      );
      return {
        ...s,
        registration,
        registrations: exists
          ? s.registrations.map((entry) =>
              entry.visitId === visitId ? registration : entry,
            )
          : [...s.registrations, registration],
        wait: {
          ...s.wait,
          status: s.wait.status === "registration" ? "triage" : s.wait.status,
          estimate: s.wait.estimate ?? 35,
          updatedAt: now,
        },
      };
    }
    case "verify-registration": {
      const visitId = field(a.visitId || s.registration.visitId, 40);
      const entry = s.registrations.find(
        (registration) => registration.visitId === visitId,
      );
      if (!entry || entry.status !== "submitted") return s;
      const verified = { ...entry, status: "verified", verifiedAt: Date.now() };
      return {
        ...s,
        registrations: s.registrations.map((registration) =>
          registration.visitId === visitId ? verified : registration,
        ),
        registration:
          s.registration.visitId === visitId ? verified : s.registration,
      };
    }
    case "submit-symptoms": {
      const structured = structureSymptoms(a);
      if (
        s.registration.status !== "verified" ||
        !structured ||
        !a.consent ||
        !structured.onset ||
        (a.photoName && !a.photoConsent) ||
        (structured.reporter === "caregiver" &&
          (!field(a.caregiverName) || !a.caregiverAuthorized))
      )
        return s;
      const symptomReport = {
        status: "submitted",
        description: structured.concern,
        onset: structured.onset,
        severity: structured.severity,
        photoName: field(a.photoName, 120),
        photoConsent: !!a.photoConsent,
        reporter: structured.reporter,
        caregiverName:
          structured.reporter === "caregiver"
            ? field(a.caregiverName)
            : "",
        relationship:
          structured.reporter === "caregiver"
            ? field(a.relationship, 80)
            : "",
        structured,
        submittedAt: Date.now(),
        reviewedAt: null,
      };
      return {
        ...s,
        symptoms: symptomReport,
        registration: { ...s.registration, symptoms: symptomReport },
        registrations: s.registrations.map((registration) =>
          registration.visitId === s.registration.visitId
            ? { ...registration, symptoms: symptomReport }
            : registration,
        ),
        wait: {
          ...s.wait,
          status: ["registration", "triage"].includes(s.wait.status)
            ? "waiting"
            : s.wait.status,
          estimate: s.wait.estimate ?? 30,
          updatedAt: Date.now(),
        },
      };
    }
    case "review-symptoms": {
      if (s.symptoms.status !== "submitted") return s;
      const symptoms = {
        ...s.symptoms,
        status: "reviewed",
        reviewedAt: Date.now(),
      };
      return {
        ...s,
        symptoms,
        registration: { ...s.registration, symptoms },
        registrations: s.registrations.map((registration) =>
          registration.visitId === s.registration.visitId
            ? { ...registration, symptoms }
            : registration,
        ),
      };
    }
    case "book": {
      if (
        !Number.isInteger(a.index) ||
        !slots[a.index] ||
        s.attended !== null ||
        s.day >= slots[a.index].day
      )
        return s;
      return { ...s, slot: a.index, reminderShown: false };
    }
    case "reminder":
      return ["none", "text", "call", "paper"].includes(a.value)
        ? {
            ...s,
            reminder: a.value,
            reminderShown: s.reminder === a.value ? s.reminderShown : false,
          }
        : s;
    case "day": {
      if (!Number.isInteger(a.day) || a.day <= s.day || a.day > 15) return s;
      return { ...s, day: a.day };
    }
    case "attended":
      return s.slot !== null &&
        s.attended === null &&
        s.day === slots[s.slot].day
        ? { ...s, attended: s.day }
        : s;
    case "reminded":
      return dueReminder(s) ? { ...s, reminderShown: true } : s;
    default:
      return s;
  }
}
export function dueReminder(s) {
  return (
    s.slot !== null &&
    s.attended === null &&
    ["text", "call"].includes(s.reminder) &&
    s.day === slots[s.slot].day - 1 &&
    !s.reminderShown
  );
}
export function outreach(s) {
  if (s.attended !== null) return null;
  const hasBarrier = s.tickets.some(
    (q) => q.status === "open" && q.owner === "coord",
  );
  if (hasBarrier) return "barrier";
  if (s.slot !== null && s.day > slots[s.slot].day) return "missed";
  if (s.slot === null && s.day >= 3) return "unbooked";
  return null;
}

export function queuePriority(registration) {
  const symptoms = registration.symptoms;
  const severity = Number.isInteger(symptoms?.severity)
    ? symptoms.severity
    : null;
  const urgent = !!symptoms?.structured?.urgent;
  if (urgent)
    return { key: "urgent", rank: 4, severity, serviceMinutes: 30 };
  if (severity !== null && severity >= 8)
    return { key: "high", rank: 3, severity, serviceMinutes: 25 };
  if (severity !== null && severity >= 5)
    return { key: "moderate", rank: 2, severity, serviceMinutes: 20 };
  if (severity !== null)
    return { key: "standard", rank: 1, severity, serviceMinutes: 15 };
  return { key: "pending", rank: 0, severity: null, serviceMinutes: 10 };
}

export const existingQueuePatients = [
  {
    visitId: "ED-741205",
    status: "verified",
    submittedAt: 1,
    fields: { fullName: "Nora Patel" },
    symptoms: {
      status: "reviewed",
      severity: 7,
      structured: { urgent: true },
    },
  },
  {
    visitId: "ED-741219",
    status: "verified",
    submittedAt: 2,
    fields: { fullName: "Marcus Reed" },
    symptoms: {
      status: "reviewed",
      severity: 9,
      structured: { urgent: false },
    },
  },
  {
    visitId: "ED-741233",
    status: "verified",
    submittedAt: 3,
    fields: { fullName: "Elena Garcia" },
    symptoms: {
      status: "reviewed",
      severity: 6,
      structured: { urgent: false },
    },
  },
  {
    visitId: "ED-741248",
    status: "verified",
    submittedAt: 4,
    fields: { fullName: "David Chen" },
    symptoms: {
      status: "reviewed",
      severity: 3,
      structured: { urgent: false },
    },
  },
];

export function edQueue(s, { includeExisting = true } = {}) {
  const registrations = includeExisting
    ? [...existingQueuePatients, ...s.registrations]
    : s.registrations;
  const ordered = registrations
    .filter((registration) =>
      ["submitted", "verified"].includes(registration.status),
    )
    .map((registration) => ({
      ...registration,
      priority: queuePriority(registration),
    }))
    .sort(
      (a, b) =>
        b.priority.rank - a.priority.rank ||
        a.submittedAt - b.submittedAt ||
        a.visitId.localeCompare(b.visitId),
    );
  let workloadMinutes = 0;
  return ordered.map((registration, index) => {
    const result = {
      ...registration,
      position: index + 1,
      estimatedMinutes: registration.priority.key === "urgent" && index === 0
        ? 0
        : workloadMinutes,
    };
    workloadMinutes += registration.priority.serviceMinutes;
    return result;
  });
}
export const within14 = (s) =>
  s.attended !== null && s.attended <= 14 && s.slot !== null;
// Closed historical visits with at least 14 days of observation. No derived patient-level score.
export const auditVisits = [
  {
    lang: "en",
    days: [4, 7, 12, 10, null, null, null, null],
    coverage: [
      "commercial",
      "commercial",
      "medicare",
      "medicaid",
      "commercial",
      "medicare",
      "medicaid",
      "uninsured",
    ],
  },
  {
    lang: "es",
    days: [9, 12, null, null, null, null],
    coverage: [
      "medicaid",
      "commercial",
      "medicaid",
      "uninsured",
      "uninsured",
      "medicare",
    ],
  },
  {
    lang: "zh",
    days: [6, 13, null, null, null, null],
    coverage: [
      "commercial",
      "uninsured",
      "commercial",
      "medicaid",
      "medicare",
      "uninsured",
    ],
  },
];
export function auditCoverage(s) {
  const groups = Object.fromEntries(
    ["commercial", "medicaid", "medicare", "uninsured"].map((k) => [
      k,
      { coverage: k, completed: 0, total: 0 },
    ]),
  );
  for (const group of auditVisits) {
    group.days.forEach((day, i) => {
      const row = groups[group.coverage[i]];
      row.total++;
      if (day !== null && day <= 14) row.completed++;
    });
  }
  if (s.day >= 14) {
    groups.medicaid.total++;
    if (within14(s)) groups.medicaid.completed++;
  }
  return Object.values(groups);
}
export function audit(s) {
  return auditVisits.map(({ lang, days }) => {
    const registeredLanguage = Object.hasOwn(
      languages,
      s.registration?.fields?.preferredLanguage,
    )
      ? s.registration.fields.preferredLanguage
      : "es";
    const mature = s.day >= 14 && lang === registeredLanguage;
    return {
      lang,
      completed:
        days.filter((n) => n !== null && n <= 14).length +
        (mature && within14(s) ? 1 : 0),
      total: days.length + (mature ? 1 : 0),
    };
  });
}
