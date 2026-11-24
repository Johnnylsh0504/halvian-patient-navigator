import { approvedPhrases, idx, languages } from "./content.js";

export const noteLimit = 8000;
export const dischargeAuthors = {
  nurse: { name: "Jordan Lee, RN", role: ["Nurse", "Enfermería", "护士"] },
  attending: { name: "Sam Chen, MD", role: ["Attending physician", "Médico tratante", "主治医生"] },
};

function validText(text) {
  return typeof text === "string" && text.trim().length > 0 && text.length <= noteLimit;
}

export function readNote(raw, visitId) {
  try {
    const note = JSON.parse(raw);
    if (note?.visitId === visitId && visitId && validText(note.text) &&
        note.guides && typeof note.guides === "object" && note.teach && typeof note.teach === "object" &&
        Object.hasOwn(dischargeAuthors, note.author) && Object.hasOwn(languages, note.language)) {
      return note;
    }
  } catch {}
  return null;
}

// Only a signed original becomes patient-visible. A guide is a separately reviewed version.
export function updateNote(note, visitId, event) {
  if (!visitId) return note;
  if (event.type === "sign") {
    if (note || !validText(event.text) || !Object.hasOwn(dischargeAuthors, event.author) ||
        !Object.hasOwn(languages, event.language)) return note;
    return { visitId, text: event.text, author: event.author, language: event.language, guides: {}, teach: {} };
  }
  if (!note || note.visitId !== visitId || !Object.hasOwn(languages, event.language)) return note;
  const guide = note.guides[event.language];
  if (event.type === "guide" && !guide && event.reviewed && validText(event.text) &&
      Object.hasOwn(dischargeAuthors, event.author)) {
    return { ...note, guides: { ...note.guides, [event.language]: { text: event.text, author: event.author } } };
  }
  if (event.type === "teach" && guide) {
    return { ...note, teach: { ...note.teach, [event.language]: event.correct ? "correct" : "clarify" } };
  }
  return note;
}

export function noteDownload(note) {
  if (!note) return null;
  return {
    filename: "Halvian-discharge-" + note.visitId + ".txt",
    href: "data:text/plain;charset=utf-8," + encodeURIComponent(note.text.toWellFormed?.() ?? note.text),
  };
}
// Constrained example-based translation. Only source clauses covered by the tiny reviewed
// translation memory can produce a draft. An uncovered or duplicate statement blocks release.
const patterns = [
  /^Medication reconciliation: No new prescriptions were issued at discharge\.$/iu,
  /^Return precautions: In the event of a medical emergency, call (911)\.$/iu,
  /^Follow-up: Schedule and attend a visit at (Halvian Family Clinic) within (\d{1,2}) days of discharge\. Bring the medication list\.$/iu,
];
export function draftPlan(source, lang) {
  if (!Array.isArray(source) || source.length !== 3 || idx(lang) < 0)
    return null;
  const segments = patterns.map((re) =>
    source.map((s) => re.exec(s)).filter(Boolean),
  );
  if (segments.some((matches) => matches.length !== 1)) return null;
  const days = Number(segments[2][0][2]);
  if (days < 1 || days > 30) return null;
  const rows = [...approvedPhrases[lang]];
  rows[2] = rows[2].replace("14", String(days));
  return rows;
}
