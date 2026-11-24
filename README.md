# Halvian Patient Navigator

A working Next.js prototype for the **Patient Communication & Follow-Up** focus of the AI Hack the Case competition. Johnny owns features 4–6. Mihir can connect the end of his wait-time screen to the multilingual assistant. All visits, people, availability, outreach and attendance shown here are fictional.

## Open the demo

For rehearsal, double-click **demo/Halvian-Demo.html** in an extracted copy of the handoff package on a computer. It opens in a browser and contains the same components as the Next.js app. Typed chat, translated guides, the simulated staff desk and follow-up actions work without internet or a key. Recording and playback of speech depend on browser permissions, available voices and device services. Use the keyboard and the printed guide when voice is unavailable. A browser may use its own speech service for dictation. Use fictional text.

For development, install Node.js 22 LTS or another supported Node release at least 20.9, open the project folder containing package.json, and run:

```bash
npm ci
npm run dev
```

Open http://localhost:3000. Stop the server with Ctrl+C.

| Route | Owner | What to demonstrate |
| --- | --- | --- |
| /navigator/assistant/ | Johnny · 4 | Switch language. Ask about an interpreter. Ask a clinical or unrecognized question. The original words and language appear on the nurse’s worklist. |
| /navigator/discharge/ | Johnny · 5 | Open clinician review, generate a translation draft, check it against the signed source, approve, and open the patient copy. Listen, print, flag confusion or check the next step. |
| /navigator/follow-up/ | Johnny · 6 | Book a synthetic clinic slot, choose a phone/text reminder or a print card, request a ride, and see the coordinator’s reply. Verify attendance from the staff desk. |

### Connect Mihir’s screens

The handoff is an ordinary link. Use this in the final screen of features 1–3. The optional language is en, es or zh. Omitting it keeps the existing browser preference. The example visit has a fixed synthetic ID, HV-2048.

```jsx
import Link from "next/link";

<Link href="/navigator/assistant/?lang=es">Continue to patient navigator</Link>
```

Mihir can add his routes under `app/` on a separate branch and change `app/page.jsx` to open his check-in screen. Keep the three routes above and their common `components/` and `lib/` folders. A single repository, browser and demo visit are sufficient for the three-minute joint recording.

## How the prototype works

| Part | Implementation | Human owner |
| --- | --- | --- |
| Multilingual assistant | A local nearest-example intent classifier retrieves a reviewed answer. It checks clinical terms first, abstains on unfamiliar vocabulary and ambiguous matches, and preserves the original query in the worklist. Four administrative topics have English, Spanish and Chinese examples. Feedback creates a trackable request. | ED nurse owns clinical and uncertain questions. |
| Discharge | Controlled example-based translation maps the signed source clauses to reviewed language templates, preserving the emergency number, clinic and follow-up interval. Uncovered source content blocks draft generation. The patient only sees the reviewed language version. The reviewer can edit it, and an edit clears the approval attestation. | Discharging clinician owns the final wording and release for each language. |
| Follow-up | Scheduling, reminder preview, simulated delivery, access-barrier tickets, replies and verified attendance use shared visit state. Transparent rules suggest human outreach for a reported barrier, no booking by day 3, or a missed visit. | Coordinator owns outreach. Clinic staff verify actual attendance. |

The classifier and controlled translations run locally. This release does not call a generative LLM. The case-note template covers this example. Unrestricted clinical translation would require additional evaluation, clinician workflows and language-specific validation.

The demo role switch is available for judging. Local browser storage preserves the synthetic visit across refreshes. Patient and staff views share this browser record. Real multiuser identity, access control, EHR integration, appointment booking and message delivery are future hospital integrations. **Restart demo** clears the fictional scenario after confirmation. Storage changes in one browser do not reach another.

### Measurement

Halvian’s case baseline is **40%** of discharged patients scheduling **and attending** follow-up within 14 days. For the demonstration, the denominator is discharged visits with 14 full days of observation. Count a completed visit once after clinic verification. The example appointment is December 1, seven days after the November 24 discharge. Use the staff clock’s **Day 6** to preview a reminder, **Day 7** to verify attendance, then **Day 14** for cohort inclusion.

The historical fixture has 20 fictional visits, 8 completions. The simulated patient’s registration preference is Spanish and their coverage is Medicaid. Switching the display language does not move the patient between groups. The Outcomes tab shows numerators, denominators, rates and the largest absolute group difference for language and insurance coverage. Cohort counts are for illustrating the calculation. They provide no evidence of clinical effectiveness. The patient can also rate communication and their discharge instructions, and the staff view counts clarification requests.

For a pilot, record baseline ratings, clarification requests per 100 discharges and rates by preferred language and coverage. Discuss low response rates and small group sizes before interpreting a difference. A source-based proposal is to target **55% overall by Month 18** and halve a measured completion gap, subject to a pilot baseline and team agreement. These are proposed targets. The case supplies the 40% overall baseline only.

### Architecture for the team’s strategy slide

The demo uses signed source fixtures in `lib/content.js`, local intent and visit logic in `lib/model.js`, a constrained translation function in `lib/discharge.js`, and responsive React components. Feature 5 freezes the text reviewed by a person. Feature 6 records booking, reminder and attendance as separate events.

A hospital pilot would read a signed discharge plan and encounter language from approved EHR exports, import scheduling availability, route tasks to an authenticated staff inbox and reconcile attended appointments back from the clinic. Keep the discharging clinician accountable for each released language version. Use a qualified interpreter to review translated material where needed. Staff, phone and paper routes cover a device outage or a patient without a smartphone. Before live use the hospital must establish secure authentication, role authorization, audit logs, retention, a language-review process and a staffed escalation response. The ED nurse manager can be proposed as the overall operational owner.

## Build and verify

```bash
npm test
npm run build
npm run portable
```

The Next production export is written under `out/`. Host its contents at the root of a static host that supports directory indexes. The portable rebuild writes `dist/Halvian-Demo.html`. Replace the release copy under `demo/` after changing the project. Eleven automated checks cover routing, release gates, missing source coverage, patient feedback, request ownership, reminders, attendance, state restoration and equity denominators.

## Presentation and design references

The three-minute demo plan and English speaking cues are in [docs/DEMO.md](docs/DEMO.md). The official case’s **Working MVP Demo, Option A** asks for patient-facing next steps, clear emergency guidance, a confusing-answer flag and an interactive prototype with fictional data. The staff desk exists to demonstrate human ownership within that patient navigation flow.

- AHRQ describes asking patients to explain their next actions in their own words. The demo has a short comprehension check and a route to a nurse for fuller teach-back. [AHRQ Teach-Back](https://www.ahrq.gov/teamstepps-program/curriculum/communication/tools/teachback.html)
- HHS describes offering language assistance and communicating its availability in a patient's preferred language. [National CLAS Standards](https://thinkculturalhealth.hhs.gov/clas/standards)
- MedlinePlus lists difficulty breathing and loss of consciousness among signs of an emergency. The National 911 Program explains emergency calling in the United States. [MedlinePlus](https://medlineplus.gov/ency/article/001927.htm) · [911.gov](https://www.911.gov/calling-911/)
