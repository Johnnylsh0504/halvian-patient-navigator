import { approvedPhrases, idx } from "./content.js";
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
