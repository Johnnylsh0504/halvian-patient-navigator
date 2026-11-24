"use client";
import React from "react";
import {
  BookOpenCheck,
  CalendarDays,
  Compass,
  HeartHandshake,
  Languages,
  MessagesSquare,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  Users,
  LifeBuoy,
} from "lucide-react";
import { CareProvider, useCare } from "./CareContext.jsx";
import {
  screens,
  screeningLabels,
  languages,
  prettyDate,
  dayDate,
  visit,
  slots,
  issues,
  helpText,
} from "../lib/content.js";
import { Assistant } from "./Assistant.jsx";
import { Discharge } from "./Discharge.jsx";
import { FollowUp } from "./FollowUp.jsx";
import { CareTeam } from "./CareTeam.jsx";
import { HelpAction } from "./Controls.jsx";
export const icons = [MessagesSquare, BookOpenCheck, CalendarDays];
const heroText = {
  assistant: [
    ["How can we help?", "¿Cómo podemos ayudarte?", "有什么能帮到你？"],
    [
      "Ask about your visit in the language you’re most comfortable with.",
      "Pregunta sobre tu visita en el idioma que prefieras.",
      "用你最熟悉的语言，询问就诊安排。",
    ],
  ],
  discharge: [
    ["Your discharge guide", "Tu guía de alta", "你的出院指南"],
    [
      "Read or listen to the instructions your care team has reviewed.",
      "Lee o escucha las instrucciones revisadas por tu equipo.",
      "阅读或收听由医护团队审核的出院说明。",
    ],
  ],
  "follow-up": [
    ["Plan your next visit", "Planea tu próxima visita", "安排你的复诊"],
    [
      "Choose a time, set a reminder, or get help getting there.",
      "Elige un horario, configura un recordatorio o pide ayuda para llegar.",
      "选择时间、设置提醒，或申请交通协助。",
    ],
  ],
};
function Header() {
  const { s, t, language, screen, move, staff, toggleStaff } = useCare();
  return (
    <>
      <header className="mast">
        <div className="wrap top">
          <div className="brand">
            <div className="mark">
              <Compass size={28} strokeWidth={2} />
            </div>
            <div>
              <strong>Halvian</strong>
              <span>
                {t("Patient Navigator", "Navegador del paciente", "患者导航")}
              </span>
            </div>
          </div>
          <div className="mastactions">
            <label className="language">
              <Languages size={17} />
              <span className="sr-only">{t("Language", "Idioma", "语言")}</span>
              <select
                aria-label="Language / Idioma / 语言"
                value={s.lang}
                onChange={(e) => language(e.target.value)}
              >
                {Object.entries(languages).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <button
              className={"team-button " + (staff ? "selected" : "")}
              onClick={toggleStaff}
            >
              {staff ? <Users size={16} /> : <Stethoscope size={16} />}
              <span>
                {staff
                  ? t("Patient view", "Vista del paciente", "患者视图")
                  : t("Care team", "Equipo clínico", "医护团队")}
              </span>
            </button>
          </div>
        </div>
      </header>
      <div className="navwrap">
        <nav className="wrap tabs" aria-label="Navigator">
          {screens.map((key, i) => {
            const I = icons[i];
            return (
              <button
                className={!staff && screen === key ? "active" : ""}
                aria-current={!staff && screen === key ? "page" : undefined}
                key={key}
                onClick={() => move(key)}
              >
                <I size={18} />
                <span>{t(...screeningLabels[key])}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
function Hero() {
  const { t, screen, staff } = useCare();
  const I = staff ? Stethoscope : icons[screens.indexOf(screen)];
  return (
    <section className={"hero tone-" + (staff ? "staff" : screen)}>
      <div>
        <div className="eyebrow">
          {staff
            ? t("STAFF WORKSPACE", "ESPACIO DEL EQUIPO", "医护工作区")
            : t(
                "PATIENT COMMUNICATION",
                "COMUNICACIÓN CON EL PACIENTE",
                "患者沟通",
              )}
        </div>
        <h1>
          {staff
            ? t("Care team desk", "Mesa del equipo clínico", "医护工作台")
            : t(...heroText[screen][0])}
        </h1>
        <p>
          {staff
            ? t(
                "Review a guide, respond to a request, or verify a follow-up visit.",
                "Revisa una guía, responde a solicitudes o verifica una visita.",
                "审核出院说明、回复请求或核实复诊记录。",
              )
            : t(...heroText[screen][1])}
        </p>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="orbit o1" />
        <div className="orbit o2" />
        <div className="orbit o3" />
        <div className="stamp">
          <I size={42} strokeWidth={1.6} />
        </div>
        <i className="dot d1" />
        <i className="dot d2" />
      </div>
    </section>
  );
}
function Rail() {
  const { s, t, move, screen, staff } = useCare();
  const slot = s.slot !== null ? slots[s.slot] : null;
  return (
    <aside className="rail">
      <section className="card visit">
        <div className="eyebrow">
          {t("YOUR VISIT", "TU VISITA", "本次就诊")}
        </div>
        <div className="person">
          <div className="avatar">AR</div>
          <div>
            <strong>{visit.name}</strong>
            <small>
              {t("Demo patient", "Paciente ficticio", "虚构患者")} · {visit.id}
            </small>
          </div>
        </div>
        <div className="visitline">
          <span>{t("Care setting", "Servicio", "科室")}</span>
          <b>{t("Emergency department", "Urgencias", "急诊科")}</b>
        </div>
        <div className="visitline">
          <span>{t("Demo date", "Fecha simulada", "演示日期")}</span>
          <b>{prettyDate(dayDate(s.day), s.lang, true)}</b>
        </div>
        {slot && (
          <div className="visitline">
            <span>{t("Appointment", "Cita", "复诊")}</span>
            <b>{prettyDate(slot.iso, s.lang, true)}</b>
          </div>
        )}
      </section>
      <section className="card sidequeue">
        <div className="sectioncap">
          <HeartHandshake size={19} />
          <h2>{t("My requests", "Mis solicitudes", "我的请求")}</h2>
        </div>
        {s.tickets.length === 0 ? (
          <p>
            {t(
              "If you ask for staff help, you can track the response here.",
              "Si pides ayuda al equipo, podrás ver la respuesta aquí.",
              "向工作人员求助后，可在这里查看回复。",
            )}
          </p>
        ) : (
          <ul className="tickets">
            {s.tickets
              .slice(-4)
              .reverse()
              .map((q) => (
                <li key={q.id}>
                  <div>
                    <b>{t(...issues[q.kind])}</b>
                    <span
                      className={
                        "tag " + (q.status === "resolved" ? "green" : "amber")
                      }
                    >
                      {q.status === "resolved"
                        ? t("Replied", "Respondida", "已回复")
                        : t("Open", "Abierta", "待处理")}
                    </span>
                  </div>
                  <small>
                    {q.id} ·{" "}
                    {q.owner === "coord"
                      ? t("Coordinator", "Coordinación", "协调员")
                      : t("ED nurse", "Enfermería", "急诊护士")}
                  </small>
                  {q.reply && <p>{q.reply}</p>}
                </li>
              ))}
          </ul>
        )}
        {!staff && (
          <HelpAction>
            {t("Ask staff", "Pedir ayuda", "联系工作人员")}
          </HelpAction>
        )}
      </section>
      <section className="emergency">
        <LifeBuoy size={18} />
        <div>
          <strong>
            {t("Emergency help", "Ayuda en una emergencia", "紧急求助")}
          </strong>
          <p>{t(...helpText)}</p>
        </div>
      </section>
    </aside>
  );
}
function Shell() {
  const { s, t, screen, staff, reset, storageIssue } = useCare();
  return (
    <>
      <a className="skip" href="#content">
        {t("Skip to content", "Ir al contenido", "跳至正文")}
      </a>
      <Header />
      <main id="content" className="wrap main">
        <Hero />
        <div className="layout">
          <div
            className="column"
            key={(staff ? "staff" : screen) + "-" + s.lang}
          >
            {staff ? (
              <CareTeam />
            ) : screen === "assistant" ? (
              <Assistant />
            ) : screen === "discharge" ? (
              <Discharge />
            ) : (
              <FollowUp />
            )}
          </div>
          <Rail />
        </div>
        {storageIssue && (
          <p role="status">
            {t(
              "Browser storage is unavailable. This visit lasts only until you close or reload the page.",
              "El almacenamiento no está disponible. Esta visita dura hasta cerrar o recargar.",
              "浏览器存储不可用，关闭或刷新会清除此演示记录。",
            )}
          </p>
        )}
      </main>
      <footer className="wrap footer">
        <span>
          <ShieldCheck size={15} />{" "}
          {t(
            "Fictional visit · Competition demo",
            "Visita ficticia · Demo del concurso",
            "虚构就诊 · 比赛演示",
          )}
        </span>
        <button onClick={reset}>
          <RotateCcw size={13} />
          {t("Restart demo", "Reiniciar demo", "重新演示")}
        </button>
      </footer>
    </>
  );
}
export default function Navigator({
  initialScreen = "assistant",
  portable = false,
}) {
  return (
    <CareProvider initialScreen={initialScreen} portable={portable}>
      <Shell />
    </CareProvider>
  );
}
