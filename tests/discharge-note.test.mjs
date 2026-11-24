import test from "node:test";
import assert from "node:assert/strict";
import { noteDownload, noteLimit, readNote, updateNote } from "../lib/discharge.js";

const example = {
  type: "sign", author: "nurse", language: "en",
  text: "Your visit summary is ready.\n\nBring this note to your follow-up. 复诊。",
};

test("an encounter has no patient note or download before a clinician signs", () => {
  assert.equal(noteDownload(null), null);
  for (const edit of [
    { type: "draft" }, { type: "guide", reviewed: true },
    { author: "" }, { author: "patient" }, { language: "bad" },
    { text: "  \n" }, { text: "x".repeat(noteLimit + 1) },
  ]) assert.equal(updateNote(null, "HV-A", { ...example, ...edit }), null);
  assert.equal(updateNote(null, "", example), null);
  assert.equal(readNote(JSON.stringify({ en: { rows: ["Previously approved template"] } }), "HV-A"), null);
});

test("either clinician role can release the exact note and download it after reload", () => {
  for (const author of ["nurse", "attending"]) {
    const signed = updateNote(null, "HV-A", { ...example, author });
    const restored = readNote(JSON.stringify(signed), "HV-A");
    assert.deepEqual(restored, signed);
    assert.equal(restored.author, author);
    const file = noteDownload(restored);
    assert.equal(file.filename, "Halvian-discharge-HV-A.txt");
    assert.equal(decodeURIComponent(file.href.split(",")[1]), example.text);
    assert.equal(updateNote(signed, "HV-A", { ...example, text: "Other text" }), signed);
  }
});

test("same-day patients and separately reviewed languages keep distinct records", () => {
  const a = updateNote(null, "HV-A", example);
  const b = updateNote(null, "HV-B", { ...example, author: "attending", text: "A different visit." });
  assert.equal(readNote(JSON.stringify(a), "HV-B"), null);
  const guide = { type: "guide", author: "attending", language: "zh", text: "这是为本次就诊写的指南。", reviewed: true };
  assert.equal(updateNote(a, "HV-B", guide), a);
  assert.equal(updateNote(a, "HV-A", { ...guide, reviewed: false }), a);
  const updated = updateNote(a, "HV-A", guide);
  assert.equal(updated.guides.zh.text, guide.text);
  assert.deepEqual(b.guides, {});
  assert.equal(updated.guides.es, undefined);
  assert.equal(noteDownload(updated).href, noteDownload(a).href);
  assert.equal(updateNote(updated, "HV-A", { type: "teach", language: "zh", correct: true }).teach.zh, "correct");
});
