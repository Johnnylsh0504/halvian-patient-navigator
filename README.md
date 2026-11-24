# Halvian Patient Navigator

A working Next.js application for the complete six-feature **Patient Communication & Follow-Up** journey. It covers check-in, hospital verification, symptom intake, wait updates, multilingual questions, discharge and follow-up.

## Open the application

Open **demo/Halvian-Patient.html** for the patient experience and **demo/Halvian-Hospital.html** for the hospital workspace. They are separate offline applications with no role-switch control. Typed chat, translated guides and follow-up actions work without internet or a key. Recording and playback of speech depend on browser permissions, available voices and device services. Use the keyboard and the printed guide when voice is unavailable. A browser may use its own speech service for dictation. Do not enter sensitive information when running the application locally.

For development, install Node.js 22 LTS or another supported Node release at least 20.9, open the project folder containing package.json, and run:

```bash
npm ci
npm run dev
```

Open http://localhost:3000. Stop the server with Ctrl+C.

### Patient-facing routes

| Route | Feature | What to demonstrate |
| --- | --- | --- |
| /patient/check-in/ | 1 · Check-in | Enter registration details, optionally select a document and record caregiver assistance. |
| /patient/symptoms/ | 2 · Symptom intake | Describe symptoms by text or voice and optionally select a photo with consent. |
| /patient/wait/ | 3 · Wait updates | See the current stage and estimate, request help or report worsening symptoms. |
| /patient/assistant/ | 4 · Assistant | Ask in English, Spanish or Chinese; clinical and uncertain questions enter the hospital queue. |
| /patient/discharge/ | 5 · Discharge | Read, listen to or print only the language version released by the clinician. |
| /patient/follow-up/ | 6 · Follow-up | Book a clinic slot, choose a reminder and report access barriers. |

### Hospital-facing routes

| Route | Workspace | What staff can do |
| --- | --- | --- |
| /hospital/intake/ | Registration and triage | Review the registration queue, open and verify a patient record, download verified insurance information and review submitted symptom reports. |
| /hospital/flow/ | ED flow | Monitor a live queue that recalculates from active registrations, warning signals, reported severity and arrival order. |
| /hospital/discharge/ | Discharge review | Prepare, edit, attest to and release each language version. |
| /hospital/requests/ | Requests | Respond to clinical questions, access barriers and clarification requests. |
| /hospital/outcomes/ | Outcomes | Verify attendance and review workflow, communication and equity measures. |

### Link directly to a stage

Each stage is an ordinary link. The optional language is en, es or zh. Omitting it keeps the existing browser preference. A visit ID is generated when the patient submits registration.

```jsx
import Link from "next/link";

<Link href="/patient/check-in/?lang=es">Start patient journey</Link>
```

The root route opens patient check-in. Patient and hospital experiences have completely separate navigation and no role-switch control. When opened under the same origin, both route trees use the same browser-local visit so hospital verification and updates appear in the patient experience automatically. Patient routes remain locked until hospital registration verifies the submission.

## How the prototype works

| Part | Implementation | Human owner |
| --- | --- | --- |
| Self check-in | A blank registration form collects patient-entered details. Optional local document selection records the filename for staff review. Submissions accumulate in the hospital registration queue; staff open and verify each patient record. | Registration staff own identity and insurance verification. |
| Symptom intake | Text, optional browser dictation, severity, onset, caregiver reporting and optional photo consent are preserved with a deterministic structured summary. Warning terms prompt immediate staff notification without assigning a diagnosis or acuity. | An ED nurse owns triage and reviews the original words. |
| Wait updates | The ED queue automatically orders active patients using warning signals, reported severity and arrival time, then calculates queue position and estimated wait from the workload ahead. Patients can request waiting-area help or alert a nurse that symptoms worsened. | Trained clinical staff retain responsibility for formal triage and immediate intervention. |
| Multilingual assistant | A local nearest-example intent classifier retrieves a reviewed answer. It checks clinical terms first, abstains on unfamiliar vocabulary and ambiguous matches, and preserves the original query in the worklist. Four administrative topics have English, Spanish and Chinese examples. Feedback creates a trackable request. | ED nurse owns clinical and uncertain questions. |
| Discharge | Controlled example-based translation maps the signed source clauses to reviewed language templates, preserving the emergency number, clinic and follow-up interval. Uncovered source content blocks draft generation. The patient only sees the reviewed language version. The reviewer can edit it, and an edit clears the approval attestation. | Discharging clinician owns the final wording and release for each language. |
| Follow-up | Scheduling, reminder delivery, access-barrier tickets, replies and verified attendance use shared visit state. Transparent rules suggest human outreach for a reported barrier, no booking by day 3, or a missed visit. | Coordinator owns outreach. Clinic staff verify actual attendance. |

The classifier and controlled translations run locally. This release does not call a generative LLM. The case-note template covers this example. Unrestricted clinical translation would require additional evaluation, clinician workflows and language-specific validation.

Local browser storage preserves the visit across refreshes. The patient and hospital route trees share this browser record and synchronize changes between tabs, but never expose controls that switch between roles. Selected ID, insurance and symptom-photo files never leave the browser; only the filename is recorded. OCR, multiuser identity, access control, EHR integration, appointment booking and message delivery require hospital integrations. **Start over** clears the visit after confirmation. Storage changes in one browser do not reach another browser or device.

### Measurement

Halvian’s case baseline is **40%** of discharged patients scheduling **and attending** follow-up within 14 days. For the demonstration, the denominator is discharged visits with 14 full days of observation. Count a completed visit once after clinic verification. The example appointment is December 1, seven days after the November 24 discharge. Use the staff clock’s **Day 6** to preview a reminder, **Day 7** to verify attendance, then **Day 14** for cohort inclusion.

The historical fixture has 20 visits and 8 completions. The current patient enters preferred language and coverage during registration. Switching the display language does not move the patient between groups. The Outcomes screen shows numerators, denominators, rates and the largest absolute group difference for language and insurance coverage. Cohort counts illustrate the calculation and provide no evidence of clinical effectiveness. The patient can also rate communication and discharge instructions, and the hospital view counts clarification requests.

For a pilot, record baseline ratings, clarification requests per 100 discharges and rates by preferred language and coverage. Discuss low response rates and small group sizes before interpreting a difference. A source-based proposal is to target **55% overall by Month 18** and halve a measured completion gap, subject to a pilot baseline and team agreement. These are proposed targets. The case supplies the 40% overall baseline only.

### Architecture for the team’s strategy slide

The application uses clinical content fixtures in `lib/content.js`, local intake, intent, wait and visit logic in `lib/model.js`, a constrained translation function in `lib/discharge.js`, and responsive React components. Features 1–3 preserve the source entry and require staff verification or ownership. Feature 5 freezes the text reviewed by a person. Feature 6 records booking, reminder and attendance as separate events.

A hospital pilot would read a signed discharge plan and encounter language from approved EHR exports, import scheduling availability, route tasks to an authenticated staff inbox and reconcile attended appointments back from the clinic. Keep the discharging clinician accountable for each released language version. Use a qualified interpreter to review translated material where needed. Staff, phone and paper routes cover a device outage or a patient without a smartphone. Before live use the hospital must establish secure authentication, role authorization, audit logs, retention, a language-review process and a staffed escalation response. The ED nurse manager can be proposed as the overall operational owner.

## Build and verify

```bash
npm test
npm run build
npm run portable
```

The Next production export is written under `out/`. Host its contents at the root of a static host that supports directory indexes. The portable rebuild writes separate `dist/Halvian-Patient.html` and `dist/Halvian-Hospital.html` files. Replace the release copies under `demo/` after changing the project. Automated checks cover check-in, caregiver authorization, hospital verification, symptom structuring, wait updates, release gates, patient feedback, request ownership, reminders, attendance, state restoration and equity denominators.

## Presentation and design references

The three-minute presentation plan and English speaking cues are in [docs/DEMO.md](docs/DEMO.md). The official case’s **Working MVP, Option A** asks for patient-facing next steps, clear emergency guidance, a confusing-answer flag and an interactive working application. The separate hospital workspace demonstrates human ownership without exposing staff tools in the patient interface.

- AHRQ describes asking patients to explain their next actions in their own words. The demo has a short comprehension check and a route to a nurse for fuller teach-back. [AHRQ Teach-Back](https://www.ahrq.gov/teamstepps-program/curriculum/communication/tools/teachback.html)
- HHS describes offering language assistance and communicating its availability in a patient's preferred language. [National CLAS Standards](https://thinkculturalhealth.hhs.gov/clas/standards)
- MedlinePlus lists difficulty breathing and loss of consciousness among signs of an emergency. The National 911 Program explains emergency calling in the United States. [MedlinePlus](https://medlineplus.gov/ency/article/001927.htm) · [911.gov](https://www.911.gov/calling-911/)
