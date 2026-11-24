"use client";
import React, { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarCheck,
  Check,
  ChevronRight,
  ClipboardCheck,
  FilePenLine,
  Headphones,
  Route,
  ShieldCheck,
  Sparkles,
  Activity,
  Clock3,
  UserCheck,
  X,
  BadgeCheck,
  Download,
} from "lucide-react";
import { useCare } from "./CareContext.jsx";
import {
  languages,
  issues,
  planRows,
  visit,
  slots,
  prettyDate,
  dayDate,
  coverageOptions,
} from "../lib/content.js";
import {
  audit,
  auditCoverage,
  dueReminder,
  edQueue,
  outreach,
  within14,
} from "../lib/model.js";
import { draftPlan } from "../lib/discharge.js";

const elapsed = (start, end) =>
  start && end ? Math.max(0, Math.round((end - start) / 60000)) : null;

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

function downloadInsurance(registration) {
  const confirmedOn = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(registration.verifiedAt || registration.submittedAt));
  const coverage = coverageOptions[registration.fields.coverage]?.[0] || "";
  const rows = [
    ["Patient", registration.fields.fullName],
    ["Visit ID", registration.visitId],
    ["Insurance provider", registration.fields.insurerName],
    ["Coverage type", coverage],
    ["Member ID", registration.fields.memberId],
    ["Insurance status", "Information confirmed"],
    ["Confirmed on", confirmedOn],
  ];
  const document = `<!doctype html><html><head><meta charset="utf-8"><title>Insurance information</title><style>body{font-family:Arial,sans-serif;color:#182d31;margin:48px;max-width:760px}h1{font-size:28px;margin-bottom:6px}p{color:#4c6265}.status{display:inline-block;background:#e2efdd;color:#195e38;padding:7px 11px;border-radius:999px;font-weight:700;margin:12px 0 24px}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:12px;border-bottom:1px solid #d8e2db}th{width:34%;color:#4c6265}footer{margin-top:30px;font-size:12px;color:#4c6265}</style></head><body><h1>Insurance information</h1><p>Halvian Patient Navigator</p><div class="status">Insurance information confirmed</div><table>${rows.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join("")}</table><footer>Generated from the hospital registration record.</footer></body></html>`;
  const url = URL.createObjectURL(
    new Blob([document], { type: "text/html;charset=utf-8" }),
  );
  const link = window.document.createElement("a");
  link.href = url;
  link.download = `insurance-information-${registration.visitId}.html`;
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function IntakeDesk() {
  const { s, t, action } = useCare();
  const [selectedId, setSelectedId] = useState(null);
  const registrations = s.registrations
    .slice()
    .sort(
      (a, b) =>
        Number(a.status === "verified") - Number(b.status === "verified") ||
        b.submittedAt - a.submittedAt,
    );
  const selected = s.registrations.find(
    (registration) => registration.visitId === selectedId,
  );
  const insuranceConfirmed =
    !!selected &&
    selected.fields.coverage !== "uninsured" &&
    !!selected.fields.insurerName &&
    !!selected.fields.memberId;
  const symptoms = s.symptoms;
  React.useEffect(() => {
    if (!selectedId) return;
    const close = (event) => {
      if (event.key === "Escape") setSelectedId(null);
    };
    document.addEventListener("keydown", close);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", close);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedId]);
  return (
    <>
      <section className="card pad">
        <div className="sectioncap">
          <div className="symbol"><UserCheck size={20} /></div>
          <h2>{t("Registration queue", "Cola de registros", "登记队列")}</h2>
          <b className="count">{registrations.length}</b>
        </div>
        <p>{t("Select a patient name to review and verify their registration.", "Selecciona el nombre de un paciente para revisar y verificar su registro.", "选择患者姓名以审核并确认登记信息。")}</p>
        {registrations.length === 0 ? (
          <p className="emptyqueue">{t("No registrations are waiting.", "No hay registros pendientes.", "当前没有登记记录。")}</p>
        ) : (
          <div className="tablewrap">
            <table className="registrationtable">
              <thead><tr><th>{t("Patient", "Paciente", "患者")}</th><th>{t("Visit ID", "ID de visita", "就诊编号")}</th><th>{t("Coverage", "Cobertura", "保险")}</th><th>{t("Status", "Estado", "状态")}</th></tr></thead>
              <tbody>
                {registrations.map((registration) => (
                  <tr key={registration.visitId}>
                    <td><button className="patientlink" onClick={() => setSelectedId(registration.visitId)}>{registration.fields.fullName}</button></td>
                    <td>{registration.visitId}</td>
                    <td>{registration.fields.insurerName || t(...coverageOptions[registration.fields.coverage])}</td>
                    <td><span className={"tag " + (registration.status === "verified" ? "green" : "amber")}>{registration.status === "verified" ? t("Verified", "Verificado", "已核实") : t("Awaiting verification", "Pendiente", "等待核实")}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {selected && (
        <div className="modalbackdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedId(null); }}>
          <section className="registrationmodal" role="dialog" aria-modal="true" aria-labelledby="registration-review-title">
            <div className="modalhead">
              <div><span className="eyebrow">{selected.visitId}</span><h2 id="registration-review-title">{t("Verify registration", "Verificar registro", "核实登记信息")}</h2></div>
              <button className="iconbtn" aria-label={t("Close", "Cerrar", "关闭")} onClick={() => setSelectedId(null)}><X size={19} /></button>
            </div>
            <p className="verified"><ShieldCheck size={15} /> {selected.status === "verified" ? t("Verified by registration staff", "Verificado por registro", "登记人员已核实") : t("Review all details before verification.", "Revisa todos los datos antes de verificar.", "核实前请审核所有信息。")}</p>
            <dl className="summarygrid">
              <div><dt>{t("Patient", "Paciente", "患者")}</dt><dd>{selected.fields.fullName}</dd></div>
              <div><dt>{t("Date of birth", "Fecha de nacimiento", "出生日期")}</dt><dd>{selected.fields.birthDate}</dd></div>
              <div><dt>{t("Phone", "Teléfono", "电话")}</dt><dd>{selected.fields.phone}</dd></div>
              <div><dt>{t("Address", "Dirección", "地址")}</dt><dd>{selected.fields.address}</dd></div>
              <div><dt>{t("Coverage", "Cobertura", "保险")}</dt><dd>{t(...coverageOptions[selected.fields.coverage])}</dd></div>
              {selected.fields.insurerName && <div><dt>{t("Insurance provider", "Proveedor de seguro", "保险提供方")}</dt><dd>{selected.fields.insurerName}</dd></div>}
              <div><dt>{t("Member ID", "Número de miembro", "保险编号")}</dt><dd>{selected.fields.memberId || "—"}</dd></div>
              <div><dt>{t("Preferred language", "Idioma preferido", "首选语言")}</dt><dd>{languages[selected.fields.preferredLanguage]}</dd></div>
              <div><dt>{t("Entry method", "Método de ingreso", "录入方式")}</dt><dd>{selected.source === "scan" ? t("Document provided", "Documento proporcionado", "已提供证件") : t("Manual entry", "Ingreso manual", "手动录入")}</dd></div>
              {selected.scanName && <div><dt>{t("Document", "Documento", "文件")}</dt><dd>{selected.scanName}</dd></div>}
            </dl>
            {insuranceConfirmed && (
              <div className="insuranceverified">
                <div><BadgeCheck size={20} /><span><b>{t("Insurance information confirmed", "Información del seguro confirmada", "保险信息已确认")}</b><small>{selected.fields.insurerName} · {selected.fields.memberId}</small></span></div>
                <button className="light" onClick={() => downloadInsurance(selected)}><Download size={16} /> {t("Download insurance info", "Descargar información del seguro", "下载保险信息")}</button>
              </div>
            )}
            {selected.assisted && <p className="callout"><span><b>{t("Caregiver-assisted entry", "Ingreso con ayuda de acompañante", "陪护协助录入")}</b><br />{selected.caregiverName} · {selected.relationship || "—"}</span></p>}
            <div className="actions modalactions">
              <button className="light" onClick={() => setSelectedId(null)}>{t("Close", "Cerrar", "关闭")}</button>
              <button className="primary" disabled={selected.status === "verified"} onClick={() => action({ type: "verify-registration", visitId: selected.visitId })}><UserCheck size={16} /> {selected.status === "verified" ? t("Registration verified", "Registro verificado", "登记已核实") : t("Verify registration", "Verificar registro", "确认登记信息")}</button>
            </div>
          </section>
        </div>
      )}
      <section className="card pad">
        <div className="sectioncap">
          <div className="symbol peach"><Activity size={20} /></div>
          <h2>{t("Symptom intake review", "Revisión de síntomas", "审核症状信息")}</h2>
        </div>
        {symptoms.status === "not-started" ? (
          <p>{t("No symptom report has been submitted.", "No se ha enviado un informe de síntomas.", "尚未提交症状报告。")}</p>
        ) : (
          <>
            {symptoms.structured?.urgent && <div className="callout warn"><b>{t("Warning terms detected—assess now", "Se detectaron términos de alerta—evaluar ahora", "检测到警示词——请立即评估")}</b></div>}
            <div className="structured">
              <div><span>{t("Patient’s original words", "Palabras originales", "患者原话")}</span><p>“{symptoms.description}”</p></div>
              <div><span>{t("Structured intake", "Ingreso estructurado", "结构化信息")}</span><ul><li>{t("Onset", "Inicio", "开始时间")}: {symptoms.onset}</li><li>{t("Severity", "Intensidad", "严重程度")}: {symptoms.severity}/10</li><li>{t("Reporter", "Informante", "报告人")}: {symptoms.reporter === "caregiver" ? symptoms.caregiverName : t("Patient", "Paciente", "患者")}</li>{symptoms.photoName && <li>{t("Photo consent recorded", "Consentimiento de foto registrado", "已记录图片授权")} · {symptoms.photoName}</li>}</ul></div>
            </div>
            <button className="primary" disabled={symptoms.status === "reviewed"} onClick={() => action({ type: "review-symptoms" })}><ClipboardCheck size={16} /> {t("Mark nurse review complete", "Marcar revisión completa", "标记护士审核完成")}</button>
          </>
        )}
      </section>
    </>
  );
}

function FlowDesk() {
  const { s, t } = useCare();
  const queue = edQueue(s);
  const priorityLabels = {
    urgent: t("Urgent warning", "Alerta urgente", "紧急警示"),
    high: t("High priority", "Prioridad alta", "高优先级"),
    moderate: t("Moderate priority", "Prioridad media", "中等优先级"),
    standard: t("Standard priority", "Prioridad estándar", "常规优先级"),
    pending: t("Assessment pending", "Evaluación pendiente", "等待评估"),
  };
  const assessed = queue.filter((entry) => entry.priority.rank > 0);
  const averageWait = queue.length
    ? Math.round(
        queue.reduce((sum, entry) => sum + entry.estimatedMinutes, 0) /
          queue.length,
      )
    : 0;
  return (
    <>
      <section className="queueoverview">
        <div><small>{t("Waiting patients", "Pacientes en espera", "等候患者")}</small><strong>{queue.length}</strong></div>
        <div><small>{t("Assessed", "Evaluados", "已评估")}</small><strong>{assessed.length}</strong></div>
        <div><small>{t("Average estimated wait", "Espera media estimada", "平均预计等候")}</small><strong>{averageWait}<span>{t(" min", " min", " 分钟")}</span></strong></div>
      </section>
      <section className="card pad">
        <div className="sectioncap">
          <div className="symbol"><Clock3 size={20} /></div>
          <h2>{t("Live ED queue", "Cola de urgencias en vivo", "实时急诊队列")}</h2>
          <b className="count">{queue.length}</b>
        </div>
        <p>{t("The queue recalculates automatically from active registrations, warning signals, reported severity, and arrival time.", "La cola se recalcula automáticamente según registros activos, alertas, intensidad informada y hora de llegada.", "队列会根据当前登记、警示信号、患者报告的严重程度和到达时间自动重新计算。")}</p>
        <div className="callout warn queuesafety">
          <Activity size={18} />
          <p>{t("Queue priority supports operations; trained clinical staff remain responsible for formal triage and immediate intervention.", "La prioridad de la cola apoya las operaciones; el personal clínico capacitado sigue siendo responsable del triaje y la intervención inmediata.", "队列优先级用于辅助运营；正式分诊和紧急干预仍由受过培训的临床人员负责。")}</p>
        </div>
        {queue.length === 0 ? (
          <p className="emptyqueue">{t("No patients are currently waiting.", "No hay pacientes esperando.", "当前没有患者等候。")}</p>
        ) : (
          <div className="tablewrap">
            <table className="flowtable">
              <thead><tr><th>#</th><th>{t("Patient", "Paciente", "患者")}</th><th>{t("Priority", "Prioridad", "优先级")}</th><th>{t("Reported severity", "Intensidad informada", "报告严重程度")}</th><th>{t("Status", "Estado", "状态")}</th><th>{t("Estimated wait", "Espera estimada", "预计等候")}</th></tr></thead>
              <tbody>
                {queue.map((entry) => (
                  <tr key={entry.visitId} className={entry.priority.key === "urgent" ? "urgentrow" : ""}>
                    <td><b className="queueposition">{entry.position}</b></td>
                    <td><b>{entry.fields.fullName}</b><small>{entry.visitId}</small></td>
                    <td><span className={"prioritypill " + entry.priority.key}><i />{priorityLabels[entry.priority.key]}</span></td>
                    <td>{entry.priority.severity === null ? "—" : `${entry.priority.severity}/10`}</td>
                    <td>{entry.status !== "verified" ? t("Registration review", "Revisión de registro", "登记审核") : !entry.symptoms ? t("Symptom intake pending", "Síntomas pendientes", "等待症状填报") : t("Waiting for clinician", "Espera al profesional", "等待临床人员")}</td>
                    <td><b>{entry.estimatedMinutes === 0 ? t("Next", "Siguiente", "下一位") : `~${entry.estimatedMinutes} ${t("min", "min", "分钟")}`}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
function Review() {
  const { s, t, action } = useCare(),
    [rows, setRows] = useState(null),
    [checked, setChecked] = useState(false),
    [error, setError] = useState("");
  const release = s.releases[s.lang];
  return (
    <section className="card pad">
      <div className="sectioncap">
        <div className="symbol">
          <FilePenLine size={20} />
        </div>
        <h2>{t("Discharge review", "Revisión de alta", "审核出院说明")}</h2>
      </div>
      <p className="small">
        {t("Discharging clinician", "Profesional de alta", "出院医护人员")} ·{" "}
        {visit.clinician} · {languages[s.lang]}
      </p>
      {release ? (
        <>
          <div className="callout good">
            <ShieldCheck size={18} />
            {t(
              "This language version is approved and visible to the patient.",
              "Esta versión está aprobada y visible para el paciente.",
              "该语言版本已审核，患者现在可以查看。",
            )}
          </div>
          <p className="small">
            {t(
              "The approved version is now available in the separate patient experience.",
              "La versión aprobada ya está disponible en la experiencia separada del paciente.",
              "已审核版本现已在独立患者端提供。",
            )}
          </p>
        </>
      ) : (
        <>
          <details className="source" open={rows ? true : undefined}>
            <summary>
              {t(
                "Signed source note",
                "Nota original firmada",
                "已签署的原始记录",
              )}{" "}
              · v1
            </summary>
            <ul lang="en">
              {visit.source.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </details>
          {!rows ? (
            <button
              className="primary"
              onClick={() => {
                const draft = draftPlan(visit.source, s.lang);
                setRows(draft);
                if (!draft)
                  setError(
                    t(
                      "Source needs manual review.",
                      "La fuente requiere revisión manual.",
                      "原始记录需人工审核。",
                    ),
                  );
              }}
            >
              <Sparkles size={16} />
              {t(
                "Prepare language draft",
                "Preparar borrador",
                "生成本语言草稿",
              )}
            </button>
          ) : (
            <>
              <div className="draftfields">
                {rows.map((row, i) => (
                  <label key={i}>
                    <span>{t(...planRows[i])}</span>
                    <textarea
                      rows={2}
                      maxLength={320}
                      value={row}
                      onChange={(e) => {
                        setRows(
                          rows.map((v, j) => (j === i ? e.target.value : v)),
                        );
                        setChecked(false);
                      }}
                    />
                  </label>
                ))}
              </div>
              <label className="checkrow">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                />
                <span>
                  {t(
                    "I reviewed the wording and translation against the signed source.",
                    "Revisé el texto y la traducción con la nota firmada.",
                    "我已对照签署的原文核实措辞和翻译。",
                  )}
                </span>
              </label>
              <button
                className="primary"
                disabled={!checked || rows.some((v) => !v.trim())}
                onClick={() => action({ type: "release", rows, checked })}
              >
                <ShieldCheck size={16} />
                {t("Approve and release", "Aprobar y publicar", "审核并发布")}
              </button>
            </>
          )}
          {error && <p role="alert">{error}</p>}
        </>
      )}
    </section>
  );
}
function Ticket({ q }) {
  const { t, action } = useCare(),
    [reply, setReply] = useState("");
  return (
    <article className="workticket">
      <div className="tickethead">
        <strong>{t(...issues[q.kind])}</strong>
        <span className={"tag " + (q.status === "open" ? "amber" : "green")}>
          {q.status === "open"
            ? t("Open", "Abierta", "待处理")
            : t("Replied", "Respondida", "已回复")}
        </span>
      </div>
      <small>
        {q.id} · {languages[q.lang]} ·{" "}
        {q.owner === "coord"
          ? visit.coordinator + " · " + t("Coordinator", "Coordinación", "协调员")
          : visit.clinician}
      </small>
      {q.note && <p>“{q.note}”</p>}
      {q.status === "resolved" ? (
        <p>{q.reply}</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            action({ type: "reply", id: q.id, reply });
          }}
        >
          <label className="fieldlabel" htmlFor={"reply-" + q.id}>
            {t(
              "Reply in the patient’s language",
              "Responder en el idioma del paciente",
              "使用患者的语言回复",
            )}
          </label>
          <input
            id={"reply-" + q.id}
            value={reply}
            maxLength={480}
            onChange={(e) => setReply(e.target.value)}
            placeholder={t(
              "Write a response for the patient…",
              "Escribe una respuesta…",
              "给患者留言…",
            )}
          />
          <button className="light" disabled={!reply.trim()}>
            {t("Send reply", "Enviar respuesta", "发送回复")}
            <ArrowRight size={14} />
          </button>
        </form>
      )}
    </article>
  );
}
function Queue() {
  const { s, t } = useCare(),
    reason = outreach(s);
  return (
    <section className="card pad">
      <div className="sectioncap">
        <div className="symbol peach">
          <Headphones size={20} />
        </div>
        <h2>
          {t("Staff requests", "Solicitudes al equipo", "工作人员请求队列")}
        </h2>
        <b className="count">
          {s.tickets.filter((q) => q.status === "open").length}
        </b>
      </div>
      {reason && (
        <div className="callout warn">
          <Route size={19} />
          <div>
            <b>
              {t("Outreach suggested", "Se sugiere contacto", "建议主动联系")}
            </b>
            <p>
              {reason === "barrier"
                ? t(
                    "The patient reported a barrier. The care coordinator owns outreach.",
                    "El paciente indicó una barrera. Coordinación se encarga del contacto.",
                    "患者报告了复诊障碍，由护理协调员联系。",
                  )
                : reason === "unbooked"
                  ? t(
                      "No appointment booked by day three. Coordinator to offer scheduling help.",
                      "Sin cita al tercer día. Coordinación ofrecerá ayuda.",
                      "到第 3 天尚未预约，建议协调员主动联系。",
                    )
                  : t(
                      "The scheduled visit passed without attendance confirmation. Verify with the clinic.",
                      "La cita pasó sin confirmación de asistencia. Verifica con la clínica.",
                      "预约日期已过但尚未确认到诊，请联系诊所核实。",
                    )}
            </p>
          </div>
        </div>
      )}
      {s.tickets.length ? (
        s.tickets
          .slice()
          .reverse()
          .map((q) => <Ticket key={q.id} q={q} />)
      ) : (
        <p>
          {t(
            "There are no patient requests yet.",
            "Todavía no hay solicitudes.",
            "目前没有患者请求。",
          )}
        </p>
      )}
    </section>
  );
}
function Verify() {
  const { s, t, action } = useCare();
  const slot = s.slot !== null ? slots[s.slot] : null;
  const nextDays = Array.from(
    new Set([3, ...(slot ? [slot.day - 1, slot.day] : []), 14, 15]),
  )
    .filter((x) => x > s.day)
    .sort((a, b) => a - b);
  return (
    <section className="card pad">
      <div className="sectioncap">
        <div className="symbol">
          <CalendarCheck size={20} />
        </div>
        <h2>
          {t(
            "Follow-up verification",
            "Verificación de seguimiento",
            "核实复诊",
          )}
        </h2>
      </div>
      <p>
        {t(
          "The clinic verifies attendance. Booking alone leaves the outcome open.",
          "La clínica confirma la asistencia. Una reserva deja el resultado pendiente.",
          "由诊所确认实际到诊。仅预约时，结果仍为待确认。",
        )}
      </p>
      <div className="details">
        <span>
          {t(
            "Visit timeline",
            "Cronología de la visita",
            "就诊时间线",
          )}
        </span>
        <strong>
          {prettyDate(dayDate(s.day), s.lang, true)} · {t("Day", "Día", "第")}{" "}
          {s.day}
        </strong>
      </div>
      <div className="choice-row">
        {nextDays.map((day) => (
          <button
            className="light"
            key={day}
            onClick={() => action({ type: "day", day })}
          >
            {t("Day", "Día", "第")} {day}
            <ChevronRight size={14} />
          </button>
        ))}
      </div>
      {dueReminder(s) && (
        <div className="callout">
          <Bell size={17} />
          <div>
            <b>{t("Reminder due", "Recordatorio pendiente", "该发提醒了")}</b>
            <p>
              {t("Tomorrow’s clinic visit", "Cita de mañana", "明天的复诊")} ·{" "}
              {prettyDate(slot.iso, s.lang)} ·{" "}
              {s.reminder === "text"
                ? t("Text", "Texto", "短信")
                : t("Phone call", "Llamada", "电话")}
            </p>
            <button
              className="light"
              onClick={() => action({ type: "reminded" })}
            >
              {t(
                "Log reminder",
                "Registrar recordatorio",
                "记录提醒",
              )}
            </button>
          </div>
        </div>
      )}
      {s.reminderShown && (
        <p className="verified">
          <Check size={15} />
          {t(
            "Reminder logged",
            "Recordatorio registrado",
            "已记录提醒",
          )}
        </p>
      )}
      <button
        className="primary"
        disabled={!slot || s.day !== slot.day || s.attended !== null}
        onClick={() => action({ type: "attended" })}
      >
        <ClipboardCheck size={16} />
        {t("Confirm attended visit", "Confirmar asistencia", "确认已到诊")}
      </button>
      <small className="subnote">
        {within14(s)
          ? t(
              "Verified attendance within 14 days.",
              "Asistencia verificada dentro de 14 días.",
              "已核实 14 天内完成复诊。",
            )
          : slot
            ? t(
                "Available on the scheduled day.",
                "Disponible el día de la cita.",
                "预约当天可确认。",
              )
            : t(
                "No appointment has been booked.",
                "No se ha reservado una cita.",
                "尚无预约。",
              )}
      </small>
    </section>
  );
}
function Equity() {
  const { s, t } = useCare();
  const rows = audit(s);
  const coverages = auditCoverage(s);
  const coverageNames = {
    commercial: t("Commercial", "Comercial", "商业保险"),
    medicaid: "Medicaid",
    medicare: "Medicare",
    uninsured: t("Uninsured", "Sin seguro", "无保险"),
  };
  const coverageRates = coverages.map((r) => (100 * r.completed) / r.total);
  const rates = rows.map((x) => (100 * x.completed) / x.total);
  return (
    <section className="card pad">
      <div className="sectioncap">
        <div className="symbol">
          <BarChart3 size={20} />
        </div>
        <h2>
          {t(
            "14-day follow-up check",
            "Seguimiento a 14 días",
            "14 天复诊指标",
          )}
        </h2>
      </div>
      <p>
        {t(
          "Case baseline: 40% of discharged patients scheduled and attended within 14 days.",
          "Referencia del caso: el 40% reservó y acudió dentro de 14 días.",
          "案例基线为 40%，指出院患者在 14 天内预约并实际到诊。",
        )}
      </p>
      <table>
        <caption>
          {t(
            "Follow-up cohort · by preferred language at registration",
            "Cohorte de seguimiento · idioma de registro",
            "复诊队列 · 按登记时的首选语言",
          )}
        </caption>
        <thead>
          <tr>
            <th>{t("Language", "Idioma", "语言")}</th>
            <th>
              {t(
                "Completed / eligible",
                "Realizadas / elegibles",
                "完成 / 符合条件",
              )}
            </th>
            <th>{t("Rate", "Tasa", "完成率")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.lang}>
              <td>{languages[r.lang]}</td>
              <td>
                {r.completed} / {r.total}
              </td>
              <td>{rates[i].toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="small">
        {t("Largest gap", "Mayor diferencia", "最大差距")}{" "}
        <b>
          {(Math.max(...rates) - Math.min(...rates)).toFixed(1)}{" "}
          {t("percentage points", "puntos porcentuales", "个百分点")}
        </b>
        .{" "}
        {t(
          "Only visits with 14 days of observation enter the denominator. Review small groups carefully before interpreting differences.",
          "Se incluyen visitas con 14 días de observación. Revisa con cuidado los grupos pequeños antes de interpretar diferencias.",
          "仅统计已观察满 14 天的就诊。解读差异前请谨慎评估小样本分组。",
        )}
      </p>
      <details className="source">
        <summary>
          {t(
            "Compare by insurance coverage",
            "Comparar por cobertura médica",
            "按保险类型比较",
          )}
        </summary>
        <table>
          <caption>
            {t(
              "Same follow-up cohort · by coverage at registration",
              "Misma cohorte de seguimiento · cobertura de registro",
              "同一复诊队列 · 按登记时保险分组",
            )}
          </caption>
          <thead>
            <tr>
              <th>{t("Coverage", "Cobertura", "保险")}</th>
              <th>
                {t(
                  "Completed / eligible",
                  "Realizadas / elegibles",
                  "完成 / 符合条件",
                )}
              </th>
              <th>{t("Rate", "Tasa", "完成率")}</th>
            </tr>
          </thead>
          <tbody>
            {coverages.map((r, i) => (
              <tr key={r.coverage}>
                <td>{coverageNames[r.coverage]}</td>
                <td>
                  {r.completed} / {r.total}
                </td>
                <td>{coverageRates[i].toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          {t("Largest gap", "Mayor diferencia", "最大差距")} ·{" "}
          {(Math.max(...coverageRates) - Math.min(...coverageRates)).toFixed(1)}{" "}
          {t("percentage points", "puntos porcentuales", "个百分点")}
        </p>
      </details>
      <details className="source">
        <summary>
          {t(
            "Arrival workflow measures for this visit",
            "Medidas del proceso de llegada",
            "本次就诊的到院流程指标",
          )}
        </summary>
        <p>
          {t("Registration turnaround", "Tiempo de registro", "登记处理时间")} ·{" "}
          {elapsed(s.registration.submittedAt, s.registration.verifiedAt) ??
            t("Pending verification", "Verificación pendiente", "等待核实")}
          {s.registration.verifiedAt ? ` ${t("minutes", "minutos", "分钟")}` : ""}
        </p>
        <p>
          {t("Symptom review time", "Tiempo de revisión de síntomas", "症状审核时间")} ·{" "}
          {elapsed(s.symptoms.submittedAt, s.symptoms.reviewedAt) ??
            t("Pending nurse review", "Revisión pendiente", "等待护士审核")}
          {s.symptoms.reviewedAt ? ` ${t("minutes", "minutos", "分钟")}` : ""}
        </p>
        <p>
          {t("Left before being seen", "Se retiró antes de la consulta", "就诊前离开")} ·{" "}
          {s.wait.status === "left" ? t("Yes", "Sí", "是") : t("No", "No", "否")}
        </p>
        <p>
          {t("Wait-update ratings", "Valoraciones de la espera", "等候信息评分数")} ·{" "}
          {Object.keys(s.rating).filter((x) => x.startsWith("wait-")).length}
        </p>
      </details>
      <details className="source">
        <summary>
          {t(
            "Communication measures for this visit",
            "Medidas de comunicación de esta visita",
            "本次就诊沟通指标",
          )}
        </summary>
        <p>
          {t(
            "Nurse or doctor communication ratings",
            "Valoraciones de comunicación clínica",
            "医护沟通评分数",
          )}{" "}
          ·{" "}
          {
            Object.keys(s.rating).filter((x) => x.startsWith("communication-"))
              .length
          }
        </p>
        <p>
          {t(
            "Discharge instruction ratings",
            "Valoraciones de las instrucciones",
            "出院说明评分数",
          )}{" "}
          ·{" "}
          {
            Object.keys(s.rating).filter((x) => x.startsWith("discharge-"))
              .length
          }
        </p>
        <p>
          {t(
            "Discharge clarification requests",
            "Solicitudes de aclaración del alta",
            "出院说明澄清请求",
          )}{" "}
          ·{" "}
          {
            s.tickets.filter(
              (q) => q.kind === "teach" || q.note.startsWith("Guide:"),
            ).length
          }
        </p>
      </details>
    </section>
  );
}
export function CareTeam({ view = "intake" }) {
  if (view === "flow") return <FlowDesk />;
  if (view === "discharge") return <Review />;
  if (view === "requests") return <Queue />;
  if (view === "outcomes")
    return (
      <>
        <Verify />
        <Equity />
      </>
    );
  return <IntakeDesk />;
}
