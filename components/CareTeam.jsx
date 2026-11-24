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
} from "../lib/content.js";
import {
  audit,
  auditCoverage,
  dueReminder,
  outreach,
  within14,
} from "../lib/model.js";
import { draftPlan } from "../lib/discharge.js";
function Review() {
  const { s, t, action, move } = useCare(),
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
          <button className="primary" onClick={() => move("discharge")}>
            {t("View patient guide", "Ver guía del paciente", "查看患者指南")}
            <ArrowRight size={15} />
          </button>
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
          ? "Sam Park · " + t("Coordinator", "Coordinación", "协调员")
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
                    "The patient reported a barrier. Sam Park owns outreach.",
                    "El paciente indicó una barrera. Sam Park se encarga del contacto.",
                    "患者报告了复诊障碍，由协调员 Sam Park 联系。",
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
            "Fictional visit clock",
            "Reloj de la visita ficticia",
            "虚构就诊时钟",
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
                "Log simulated reminder",
                "Registrar recordatorio simulado",
                "记录模拟提醒",
              )}
            </button>
          </div>
        </div>
      )}
      {s.reminderShown && (
        <p className="verified">
          <Check size={15} />
          {t(
            "Simulated reminder logged",
            "Recordatorio simulado registrado",
            "已记录模拟提醒",
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
            "Fictional cohort · by preferred language at registration",
            "Cohorte ficticia · idioma de registro",
            "虚构队列 · 按登记时的首选语言",
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
          "Only visits with 14 days of observation enter the denominator. These small fictional groups illustrate the calculation.",
          "Se incluyen visitas con 14 días de observación. Los grupos ficticios ilustran el cálculo.",
          "仅统计已观察满 14 天的就诊。小样本虚构分组仅展示算法。",
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
              "Same fictional cohort · by coverage at registration",
              "Misma cohorte ficticia · cobertura de registro",
              "同一虚构队列 · 按登记时保险分组",
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
export function CareTeam() {
  const { t, screen } = useCare();
  const [tab, setTab] = useState(screen === "discharge" ? "review" : "queue");
  return (
    <>
      <div className="worktabs">
        {[
          ["review", t("Review", "Revisión", "审核")],
          ["queue", t("Requests", "Solicitudes", "请求队列")],
          ["measure", t("Outcomes", "Resultados", "结果")],
        ].map(([id, n]) => (
          <button
            key={id}
            aria-pressed={tab === id}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
          >
            {n}
          </button>
        ))}
      </div>
      {tab === "review" ? (
        <Review />
      ) : tab === "queue" ? (
        <Queue />
      ) : (
        <>
          <Verify />
          <Equity />
        </>
      )}
    </>
  );
}
