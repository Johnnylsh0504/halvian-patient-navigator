# Johnny and Mihir’s three-minute demo

**Proposed split** · Mihir 0:00–1:30, Johnny 1:30–2:55, team close 2:55–3:00. These times are for the joint demo within the competition presentation. Johnny’s 85-second segment comes in two editions. The reference edition has a synthetic English voice. The silent edition has the same screen actions and English cues for Johnny’s own narration. Use one fictional patient, Alex Rivera, through the handoff. Spanish is the recording example. The product also supports English and Chinese.

**Mihir’s handoff** · “Alex has checked in and received a wait update. Johnny will show what happens when Alex has a question and gets ready to go home.”

| Johnny’s clip | On screen | English narration |
| --- | --- | --- |
| 0:00–0:05 | Open the assistant and switch to Español. | Alex is leaving the ED. What happens next? |
| 0:05–0:13 | Select ¿Cómo pido un intérprete? | Alex asks for an interpreter in Spanish. The navigator finds a reviewed hospital answer. |
| 0:13–0:22 | Send ¿Puedo tomar más medicina? The nurse request appears. | When Alex asks about taking more medicine, the original question goes to the ED nurse. Alex can see who owns it. |
| 0:22–0:34 | Guía de alta → Abrir revisión clínica → Preparar borrador. Inspect English source and Spanish draft. | At discharge, the Spanish guide stays locked. Jordan, the discharging nurse, checks the translation against Alex’s signed note. |
| 0:34–0:43 | Check the reviewer box, choose Aprobar y publicar, then Ver guía del paciente. | Jordan approves this version. Now Alex can read it, listen to it, or flag a confusing instruction. |
| 0:43–0:51 | Dentro de 14 días → Comprobar respuesta. | Alex checks that the clinic visit is due within fourteen days and that they should bring a medicine list. |
| 0:51–1:02 | Cita de seguimiento → 1 dic → Confirmar cita. Choose Llamada telefónica, then Necesito transporte → Pedir ayuda a coordinación. | Alex books December first, chooses a phone reminder, and tells us that getting a ride might keep them from going. |
| 1:02–1:12 | Staff desk → English → Requests. Reply to the ride request in Spanish. | The request goes to Sam, the coordinator. Sam replies in Spanish, and Alex can see the response. |
| 1:12–1:19 | Outcomes → Day 6 → log reminder → Day 7 → Confirm attended visit. | The reminder is simulated. The visit counts when the clinic verifies that Alex attended. |
| 1:19–1:25 | Day 14. Show both the numerator and denominator by language. | Halvian starts at forty percent. We compare verified completion by language. |

**Team close** · “Our pilot will measure whether more patients complete follow-up, and whether the gap between groups narrows.”

## Before recording

Open the extracted HTML on a computer or run the Next app. Choose Restart demo if you rehearsed on the same browser. Start in English with the assistant open. When presenting live, a patient can also flag a reviewed answer as confusing, try a language with no released guide, choose paper, or check an unresolved request. Use those branches for Q&A. The selected Spanish route in the video leaves time for genuine human feedback.

## Short answers for judges

**Where is the AI?** The assistant uses a local multilingual intent classifier to retrieve a reviewed answer. The discharge draft uses source-bound translation templates. A clinician can edit and must release each patient-facing language version. The follow-up rules explain exactly why a coordinator was notified.

**How does this improve equity?** A patient can choose a language, hear instructions where device voices are available, get paper instructions, request a phone call or report a ride barrier. The coordinator receives the barrier and can reply. The team can compare verified 14-day follow-up by preferred language and insurance coverage. The sample numbers illustrate measurement. The pilot would establish impact.

**What is real in the prototype?** Language changes, question matching, staff requests and replies, review gates, date selection, reminders and attendance calculations work against fictional data in one browser. The simulated clinic provides slots, staff identities and confirmation events. Human status updates persist when the page refreshes.

**What if the AI is wrong?** Patients can flag a confusing answer, and uncertain or clinical questions create an assigned nurse request. An unrecognized source note blocks the discharge draft. The reviewer can correct the text against the signed source before release. Urgent cases have visible emergency instructions.
