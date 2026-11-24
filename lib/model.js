import { faq, approvedPhrases, slots, languages, visit } from "./content.js";
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
export function blank() {
  return {
    version: 1,
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
  };
}
export function restore(raw) {
  try {
    const s = JSON.parse(raw);
    if (
      s?.version === 1 &&
      Object.hasOwn(languages, s.lang) &&
      Array.isArray(s.tickets) &&
      Array.isArray(s.turns) &&
      s.releases &&
      s.teach &&
      s.rating &&
      Number.isInteger(s.day) &&
      s.day >= 0 &&
      s.day <= 15 &&
      (s.slot === null || (Number.isInteger(s.slot) && slots[s.slot]))
    )
      return { ...blank(), ...s };
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
    case "reset":
      return blank();
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
export const within14 = (s) =>
  s.attended !== null && s.attended <= 14 && s.slot !== null;
// Fictional closed visits, all with at least 14 days of observation. No derived patient-level score.
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
    const mature = s.day >= 14 && lang === "es"; // Preferred language at registration is fixed for this fictional visit.
    return {
      lang,
      completed:
        days.filter((n) => n !== null && n <= 14).length +
        (mature && within14(s) ? 1 : 0),
      total: days.length + (mature ? 1 : 0),
    };
  });
}
