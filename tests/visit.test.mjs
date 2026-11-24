import test from "node:test";
import assert from "node:assert/strict";
import {
  blank,
  change,
  restore,
  classify,
  dueReminder,
  outreach,
  within14,
  audit,
} from "../lib/model.js";
import { draftPlan } from "../lib/discharge.js";
import { faq, visit, approvedPhrases } from "../lib/content.js";
const apply = (s, ...actions) => actions.reduce(change, s);
test("all three languages retrieve every reviewed hospital FAQ", () => {
  for (const f of faq)
    for (const group of f.examples)
      for (const example of group)
        assert.deepEqual(classify(example), { kind: "faq", id: f.id });
  assert.deepEqual(classify("How do I book my follow up"), {
    kind: "faq",
    id: "follow",
  });
  assert.deepEqual(classify("How do I book my follow up visit"), {
    kind: "faq",
    id: "follow",
  });
});
test("clinical, compound, and unfamiliar requests go to staff with the original words", () => {
  for (const text of [
    "Can I take more medicine?",
    "¿Puedo tomar más medicina?",
    "我还能再吃药吗？",
    "How do I book my follow-up and can I take aspirin?",
  ])
    assert.equal(classify(text).kind, "clinical");
  for (const text of [
    "Does this floor have a library?",
    "Where are my discharge instructions for my rash?",
    "我想买咖啡",
  ])
    assert.equal(classify(text).kind, "unsure");
  const text = "Does this floor have a library?";
  const s = apply(blank(), { type: "ask", text }, { type: "ask", text });
  assert.equal(s.tickets.length, 1);
  assert.equal(s.tickets[0].note, text);
  assert.equal(s.tickets[0].owner, "nurse");
});
test("the translation memory uses signed source facts, accepts reordered clauses, and abstains outside coverage", () => {
  for (const lang of ["en", "es", "zh"])
    assert.deepEqual(
      draftPlan([...visit.source].reverse(), lang),
      approvedPhrases[lang],
    );
  assert.match(
    draftPlan(
      visit.source.map((line) => line.replace("14 days", "7 days")),
      "es",
    )[2],
    /7 días/,
  );
  assert.equal(
    draftPlan([...visit.source, "Additional unreviewed instruction"], "en"),
    null,
  );
  assert.equal(
    draftPlan([visit.source[0], visit.source[0], visit.source[2]], "zh"),
    null,
  );
  assert.equal(
    draftPlan(
      visit.source.map((line) => line.replace("911", "112")),
      "es",
    ),
    null,
  );
});
test("approval is language-specific, requires attestation and complete text, and keeps reviewed edits", () => {
  const rows = [...approvedPhrases.es];
  rows[0] += " ";
  const start = change(blank(), { type: "lang", lang: "es" });
  assert.deepEqual(
    change(start, { type: "release", checked: false, rows }).releases,
    {},
  );
  assert.deepEqual(
    change(start, { type: "release", checked: true, rows: ["", "", ""] })
      .releases,
    {},
  );
  const s = apply(
    start,
    { type: "release", checked: true, rows },
    { type: "lang", lang: "zh" },
  );
  assert.equal(s.releases.zh, undefined);
  assert.equal(s.releases.es.rows[0], rows[0].trim());
  assert.equal(change(s, { type: "teach", ok: true }).teach.zh, undefined);
});
test("teach-back uncertainty and a confusing answer create separate nurse requests", () => {
  const s = apply(
    blank(),
    { type: "release", checked: true, rows: approvedPhrases.en },
    { type: "teach", ok: false },
    { type: "teach", ok: false },
    { type: "ticket", kind: "feedback", note: "Guide: v1" },
  );
  assert.deepEqual(
    s.tickets.map((q) => q.kind),
    ["teach", "feedback"],
  );
  assert.equal(change(s, { type: "teach", ok: true }).teach.en, "correct");
});
test("an access barrier reaches a coordinator who can reply and close the request", () => {
  const a = apply(blank(), {
    type: "ticket",
    kind: "transport",
    owner: "coord",
  });
  assert.equal(outreach(a), "barrier");
  assert.equal(
    change(a, { type: "reply", id: a.tickets[0].id, reply: " " }).tickets[0]
      .status,
    "open",
  );
  const b = change(a, {
    type: "reply",
    id: a.tickets[0].id,
    reply: "Te llamaré.",
  });
  assert.equal(outreach(b), null);
  assert.equal(b.tickets[0].reply, "Te llamaré.");
});
test("appointments, reminder preferences, due reminders, attendance and outcomes are distinct", () => {
  let s = apply(
    blank(),
    { type: "book", index: 0 },
    { type: "reminder", value: "call" },
  );
  assert.equal(within14(s), false);
  assert.equal(dueReminder(s), false);
  assert.equal(change(s, { type: "attended" }).attended, null);
  s = change(s, { type: "day", day: 6 });
  assert.equal(dueReminder(s), true);
  s = change(s, { type: "reminded" });
  assert.equal(dueReminder(s), false);
  s = apply(s, { type: "day", day: 7 }, { type: "attended" });
  assert.equal(within14(s), true);
  assert.equal(change(s, { type: "book", index: 2 }).slot, 0);
});
test("missed visits trigger outreach and remain absent from the numerator", () => {
  assert.equal(outreach(change(blank(), { type: "day", day: 3 })), "unbooked");
  const s = apply(
    blank(),
    { type: "book", index: 0 },
    { type: "day", day: 8 },
    { type: "attended" },
  );
  assert.equal(outreach(s), "missed");
  assert.equal(within14(s), false);
  assert.equal(change(s, { type: "book", index: 0 }).slot, 0);
});
test("the cohort matures at day 14 and the registration language stays fixed when UI language switches", () => {
  const base = audit(blank());
  assert.equal(
    base.reduce((n, r) => n + r.total, 0),
    20,
  );
  let s = apply(
    blank(),
    { type: "book", index: 0 },
    { type: "day", day: 7 },
    { type: "attended" },
    { type: "lang", lang: "zh" },
  );
  assert.deepEqual(audit(s), base);
  s = change(s, { type: "day", day: 14 });
  assert.deepEqual(audit(s)[1], { lang: "es", completed: 3, total: 7 });
  const missed = change(blank(), { type: "day", day: 15 });
  assert.deepEqual(audit(missed)[1], { lang: "es", completed: 2, total: 7 });
});
test("reload, reset and invalid saved state", () => {
  const s = apply(
    blank(),
    { type: "lang", lang: "es" },
    { type: "ticket", kind: "phone", owner: "coord" },
  );
  assert.deepEqual(restore(JSON.stringify(s)), s);
  assert.deepEqual(restore("broken"), blank());
  assert.deepEqual(change(s, { type: "reset" }), blank());
});
