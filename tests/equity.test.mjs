import test from "node:test";
import assert from "node:assert/strict";
import { audit, auditCoverage, blank, change } from "../lib/model.js";
test("both equity views describe the same eligible people and completions", () => {
  let s = blank();
  for (const action of [
    { type: "book", index: 0 },
    { type: "day", day: 7 },
    { type: "attended" },
    { type: "day", day: 14 },
  ]) {
    s = change(s, action);
    const totals = (rows) =>
      rows.reduce((a, r) => [a[0] + r.completed, a[1] + r.total], [0, 0]);
    assert.deepEqual(totals(audit(s)), totals(auditCoverage(s)));
  }
  assert.deepEqual(
    auditCoverage(s).find((r) => r.coverage === "medicaid"),
    { coverage: "medicaid", completed: 3, total: 6 },
  );
});
