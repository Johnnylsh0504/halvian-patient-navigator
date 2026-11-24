"use client";
import React from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Clock3,
  HelpCircle,
  MessagesSquare,
} from "lucide-react";
import { useCare } from "./CareContext.jsx";
import { waitStages } from "../lib/content.js";
import { edQueue } from "../lib/model.js";
import { Rating } from "./Rating.jsx";

const ordered = ["registration", "triage", "waiting", "room", "clinician", "complete"];

export function WaitTime() {
  const { s, t, action, move } = useCare();
  const current = s.wait.status;
  const currentIndex = ordered.indexOf(current);
  const queue = edQueue(s);
  const queueEntry = queue.find(
    (entry) => entry.visitId === s.registration.visitId,
  );
  const estimatedWait = queueEntry?.estimatedMinutes ?? s.wait.estimate;
  const pendingHelp = s.tickets.some((q) => q.kind === "wait-help" && q.status === "open");
  const pendingClinical = s.tickets.some((q) => q.kind === "clinical" && q.note === "Symptoms worsened while waiting" && q.status === "open");
  return (
    <>
      <section className="card pad">
        <div className="titleline">
          <div className="symbol"><Clock3 size={21} /></div>
          <h2>{t("Your visit status", "Estado de tu visita", "就诊进度")}</h2>
        </div>
        <p>{t("Estimates can change as the team responds to the most urgent needs. Staff can correct this update at any time.", "Los tiempos pueden cambiar mientras el equipo atiende las necesidades más urgentes. El personal puede corregir esta actualización.", "医护团队会优先处理紧急情况，因此预计时间可能变化。工作人员可随时更正进度。")}</p>
        {current === "left" ? (
          <div className="callout warn"><AlertTriangle size={18} /><div><b>{t(...waitStages.left)}</b><p>{t("This status must be confirmed by staff. If you still need care, speak with the front desk.", "El personal debe confirmar este estado. Si aún necesitas atención, habla con recepción.", "此状态需由工作人员确认。如仍需诊疗，请联系前台。")}</p></div></div>
        ) : (
          <div className="waitoverview">
            <div className="estimate">
              <small>{t("Current estimate", "Tiempo estimado", "当前预计")}</small>
              <strong>{estimatedWait === null ? "—" : estimatedWait}</strong>
              <span>{estimatedWait === null ? t("Ask staff", "Consulta al personal", "请咨询工作人员") : t("minutes", "minutos", "分钟")}</span>
            </div>
            <div>
              <span className="tag green">{t(...waitStages[current])}</span>
              <p>{s.wait.note || t("Your place in the care process is shown below.", "Tu lugar en el proceso de atención aparece abajo.", "你当前所处的就诊环节如下。")}</p>
              {queueEntry && <small className="queuepositionnote">{t("Queue position", "Posición en la cola", "队列位置")} {queueEntry.position} {t("of", "de", "/")} {queue.length}</small>}
              {queueEntry && <small className="queuepositionnote">{t("Calculated from the current ED queue", "Calculado a partir de la cola actual de urgencias", "根据当前急诊队列计算")}</small>}
            </div>
          </div>
        )}
        <ol className="statussteps">
          {ordered.map((stage, index) => (
            <li key={stage} className={index < currentIndex || current === "complete" ? "done" : index === currentIndex ? "current" : ""}>
              <span>{index < currentIndex || current === "complete" ? <Check size={13} /> : index + 1}</span>
              <b>{t(...waitStages[stage])}</b>
            </li>
          ))}
        </ol>
        <div className="actions waitactions">
          <button className="light" disabled={pendingHelp} onClick={() => action({ type: "ticket", kind: "wait-help", note: "Waiting-area assistance", owner: "nurse" })}>
            <HelpCircle size={16} />
            {pendingHelp ? t("Help requested", "Ayuda solicitada", "已请求帮助") : t("I need help while waiting", "Necesito ayuda mientras espero", "等候期间需要帮助")}
          </button>
          <button className="urgentbutton" disabled={pendingClinical} onClick={() => action({ type: "ticket", kind: "clinical", note: "Symptoms worsened while waiting", owner: "nurse" })}>
            <AlertTriangle size={16} />
            {pendingClinical ? t("Nurse alerted", "Enfermería avisada", "已通知护士") : t("My symptoms are worse", "Mis síntomas empeoraron", "我的症状加重了")}
          </button>
        </div>
        <small className="subnote">{t("For severe trouble breathing or loss of consciousness, alert ED staff immediately.", "Ante dificultad grave para respirar o pérdida de conocimiento, avisa al personal de inmediato.", "如有严重呼吸困难或失去意识，请立即通知急诊工作人员。")}</small>
        <Rating kind="wait" />
      </section>
      <button className="nextcard" onClick={() => move("assistant")}>
        <span className="symbol pale"><MessagesSquare size={20} /></span>
        <span><small>{t("Questions while you wait", "Preguntas durante la espera", "等候期间有问题")}</small><strong>{t("Open multilingual assistant", "Abrir asistente multilingüe", "打开多语言助手")}</strong></span>
        <ArrowRight size={19} />
      </button>
    </>
  );
}
