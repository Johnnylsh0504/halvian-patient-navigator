# Johnny and Mihir’s three-minute demo

**Proposed split** · Mihir 0:00–1:30, Johnny 1:30–2:55, team close 2:55–3:00. These times are for the joint competition presentation. Johnny’s 85-second segment comes in two editions. The reference edition has a prepared English voice track. The silent edition has the same screen actions and English cues for Johnny’s own narration. Use one patient journey through the handoff. Spanish is the recording example. The product also supports English and Chinese.

**Mihir’s handoff** · “The patient has checked in and received a wait update. Johnny will show what happens when the patient has a question and gets ready to go home.”

## Full six-feature walkthrough

For a full product presentation, keep the patient experience at `/patient/check-in/` and the hospital workspace at `/hospital/intake/` in separate browser tabs or windows. Enter the registration details in the patient form and submit them. The hospital Intake screen updates automatically; verify registration there. The patient tab then unlocks the remaining screens automatically. Continue to Symptoms and enter or dictate a description. Open the hospital Flow screen to show the live patient queue automatically reorder from warning signals, reported severity and arrival order. Continue with the multilingual assistant, discharge and follow-up sequence below. There is no role-switch control in either interface.

| Johnny’s clip | On screen | English narration |
| --- | --- | --- |
| 0:00–0:05 | Open the assistant and switch to Español. | The patient is leaving the ED. What happens next? |
| 0:05–0:13 | Select ¿Cómo pido un intérprete? | The patient asks for an interpreter in Spanish. The navigator finds a reviewed hospital answer. |
| 0:13–0:22 | Send ¿Puedo tomar más medicina? The nurse request appears. | When the patient asks about taking more medicine, the original question goes to the ED nurse. The patient can see who owns it. |
| 0:22–0:34 | Show the waiting state on the patient’s Discharge guide. In hospital Discharge, select the verified visit and choose Nurse or Attending physician. | There’s no note on the patient screen yet. In the hospital tab, I choose this visit and enter the discharge note. |
| 0:34–0:43 | Type a fictional note, such as “Bring this note to your follow-up visit.” Choose Sign and release note. Return to the patient tab. | I sign as the discharging clinician. The patient sees the words I just entered. |
| 0:43–0:51 | Click Download discharge note (.txt) and open the downloaded file. | The patient can download a copy and take it to the clinic. |
| 0:51–1:02 | Cita de seguimiento → 1 dic → Confirmar cita. Choose Llamada telefónica, then Necesito transporte → Pedir ayuda a coordinación. | The patient books December first, chooses a phone reminder, and reports that transportation might prevent attendance. |
| 1:02–1:12 | Open the separate hospital Requests screen in English. Reply to the ride request in Spanish. | The request goes to the care coordinator. The coordinator replies in Spanish, and the patient can see the response. |
| 1:12–1:19 | Outcomes → Day 6 → log reminder → Day 7 → Confirm attended visit. | The reminder is recorded. The visit counts when the clinic verifies attendance. |
| 1:19–1:25 | Day 14. Show both the numerator and denominator by language. | Halvian starts at forty percent. We compare verified completion by language. |

**Team close** · “Our pilot will measure whether more patients complete follow-up, and whether the gap between groups narrows.”

## Before recording

Open the extracted HTML on a computer or run the Next app. Choose **Start over** if you previously used the same browser. Start in English with check-in open. A patient can also flag a reviewed answer as confusing, try a language with no released guide, choose paper, or check an unresolved request. Use those branches for Q&A. The selected Spanish route in the video leaves time for genuine human feedback.

## Short answers for judges

**Where is the AI?** The assistant uses a local multilingual intent classifier to retrieve a reviewed answer. The discharge draft uses source-bound translation templates. A clinician can edit and must release each patient-facing language version. The follow-up rules explain exactly why a coordinator was notified.

**How does this improve equity?** A patient can choose a language, hear instructions where device voices are available, get paper instructions, request a phone call or report a ride barrier. The coordinator receives the barrier and can reply. The team can compare verified 14-day follow-up by preferred language and insurance coverage. The sample numbers illustrate measurement. The pilot would establish impact.

**What works in the application?** Check-in validation, caregiver authorization, cross-tab registration verification, local file selection, deterministic symptom structuring, staff review, wait-status updates, language changes, question matching, requests and replies, review gates, date selection, reminders and attendance calculations run in the browser. Selected documents are not uploaded. Human status updates persist when the page refreshes.

**What if the AI is wrong?** Patients can flag a confusing answer, and uncertain or clinical questions create an assigned nurse request. The signed original remains available for download. An unrecognized source requires a clinician to write a translated guide manually. The reviewer can correct the text against the signed source before release. Urgent cases have visible emergency instructions.
