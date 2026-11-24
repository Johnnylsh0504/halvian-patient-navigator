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
  edQueue,
  structureSymptoms,
} from "../lib/model.js";
import { draftPlan } from "../lib/discharge.js";
import { faq, visit, approvedPhrases } from "../lib/content.js";
const apply = (s, ...actions) => actions.reduce(change, s);
const registrationFields = {
  fullName: "Jordan Morgan",
  birthDate: "1987-06-15",
  phone: "555-0104",
  address: "100 Main Street",
  coverage: "medicaid",
  insurerName: "Community Health Plan",
  memberId: "M-1042",
  preferredLanguage: "es",
};
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
    {
      type: "submit-registration",
      fields: registrationFields,
      confirmed: true,
    },
    { type: "verify-registration" },
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
    {
      type: "submit-registration",
      fields: registrationFields,
      confirmed: true,
    },
    { type: "verify-registration" },
    { type: "book", index: 0 },
    { type: "day", day: 7 },
    { type: "attended" },
    { type: "lang", lang: "zh" },
  );
  assert.deepEqual(audit(s), base);
  s = change(s, { type: "day", day: 14 });
  assert.deepEqual(audit(s)[1], { lang: "es", completed: 3, total: 7 });
  const missed = apply(
    blank(),
    {
      type: "submit-registration",
      fields: registrationFields,
      confirmed: true,
    },
    { type: "verify-registration" },
    { type: "day", day: 15 },
  );
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
test("check-in requires confirmation and supports staff verification", () => {
  assert.equal(blank().registration.fields.fullName, "");
  assert.equal(blank().registration.fields.coverage, "");
  const fields = registrationFields;
  assert.equal(
    change(blank(), { type: "submit-registration", fields }).registration
      .status,
    "not-started",
  );
  assert.equal(
    change(blank(), {
      type: "submit-registration",
      fields: { ...fields, insurerName: "" },
      confirmed: true,
    }).registration.status,
    "not-started",
  );
  let s = change(blank(), {
    type: "submit-registration",
    fields,
    confirmed: true,
    source: "scan",
    scanName: "insurance-card.png",
  });
  assert.equal(s.registration.status, "submitted");
  assert.match(s.registration.visitId, /^HV-\d{6}$/);
  assert.equal(s.registrations.length, 1);
  assert.equal(s.registration.source, "scan");
  assert.equal(s.wait.status, "triage");
  s = change(s, { type: "verify-registration" });
  assert.equal(s.registration.status, "verified");
  assert.ok(s.registration.verifiedAt >= s.registration.submittedAt);
});

test("registration queue keeps multiple patients and verifies the selected visit", () => {
  let s = change(blank(), {
    type: "submit-registration",
    fields: registrationFields,
    confirmed: true,
  });
  const firstId = s.registration.visitId;
  s = change(s, { type: "reset" });
  assert.equal(s.registration.status, "not-started");
  assert.equal(s.registrations.length, 1);
  s = change(s, {
    type: "submit-registration",
    fields: { ...registrationFields, fullName: "Casey Nguyen" },
    confirmed: true,
  });
  const secondId = s.registration.visitId;
  assert.notEqual(firstId, secondId);
  assert.deepEqual(
    s.registrations.map((entry) => entry.fields.fullName),
    ["Jordan Morgan", "Casey Nguyen"],
  );
  s = change(s, { type: "verify-registration", visitId: firstId });
  assert.equal(
    s.registrations.find((entry) => entry.visitId === firstId).status,
    "verified",
  );
  assert.equal(s.registration.status, "submitted");
  s = change(s, { type: "verify-registration", visitId: secondId });
  assert.equal(s.registration.status, "verified");
});

test("ED queue recalculates from warning signals, reported severity, and arrival order", () => {
  const existing = edQueue(blank());
  assert.deepEqual(
    existing.map((entry) => entry.fields.fullName),
    ["Nora Patel", "Marcus Reed", "Elena Garcia", "David Chen"],
  );
  const addPatient = (state, name, description, severity) => {
    let next = change(state, {
      type: "submit-registration",
      fields: { ...registrationFields, fullName: name },
      confirmed: true,
    });
    next = change(next, { type: "verify-registration" });
    return change(next, {
      type: "submit-symptoms",
      description,
      onset: "Today",
      severity,
      consent: true,
    });
  };
  let s = addPatient(blank(), "Patient One", "Mild ankle pain", 3);
  s = addPatient(change(s, { type: "reset" }), "Patient Two", "Severe back pain", 9);
  s = addPatient(change(s, { type: "reset" }), "Patient Three", "I cannot breathe", 2);
  const queue = edQueue(s, { includeExisting: false });
  assert.deepEqual(
    queue.map((entry) => entry.fields.fullName),
    ["Patient Three", "Patient Two", "Patient One"],
  );
  assert.deepEqual(
    queue.map((entry) => entry.priority.key),
    ["urgent", "high", "standard"],
  );
  assert.deepEqual(
    queue.map((entry) => entry.estimatedMinutes),
    [0, 30, 55],
  );
});

test("caregiver-assisted check-in requires authorization", () => {
  const action = {
    type: "submit-registration",
    fields: registrationFields,
    confirmed: true,
    assisted: true,
    caregiverName: "Taylor Rivera",
  };
  assert.equal(change(blank(), action).registration.status, "not-started");
  const s = change(blank(), { ...action, caregiverAuthorized: true });
  assert.equal(s.registration.caregiverName, "Taylor Rivera");
});

test("symptom intake preserves original words, structures details, and requires consent", () => {
  const structured = structureSymptoms({
    description: "I have chest pressure and cannot breathe",
    onset: "Today",
    severity: 9,
  });
  assert.equal(structured.urgent, true);
  assert.ok(structured.observations.includes("chest"));
  const ready = change(blank(), {
    type: "submit-registration",
    fields: registrationFields,
    confirmed: true,
  });
  assert.equal(
    change(ready, {
      type: "submit-symptoms",
      description: structured.concern,
      onset: "Today",
      severity: 9,
      consent: true,
    }).symptoms.status,
    "not-started",
  );
  const verified = change(ready, { type: "verify-registration" });
  assert.equal(
    change(verified, {
      type: "submit-symptoms",
      description: structured.concern,
      onset: "Today",
      severity: 9,
    }).symptoms.status,
    "not-started",
  );
  let s = change(verified, {
    type: "submit-symptoms",
    description: structured.concern,
    onset: "Today",
    severity: 9,
    consent: true,
  });
  assert.equal(s.symptoms.status, "submitted");
  assert.equal(s.symptoms.description, structured.concern);
  assert.equal(s.wait.status, "waiting");
  s = change(s, { type: "review-symptoms" });
  assert.equal(s.symptoms.status, "reviewed");
});
