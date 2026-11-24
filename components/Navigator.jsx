"use client";
import React from "react";
import {
  BookOpenCheck,
  CalendarDays,
  ClipboardList,
  Compass,
  Activity,
  Clock3,
  HeartHandshake,
  Languages,
  MessagesSquare,
  RotateCcw,
  ShieldCheck,
  LifeBuoy,
} from "lucide-react";
import { CareProvider, useCare } from "./CareContext.jsx";
import {
  screens,
  screeningLabels,
  languages,
  prettyDate,
  dayDate,
  slots,
  issues,
  helpText,
  waitStages,
} from "../lib/content.js";
import { CheckIn } from "./CheckIn.jsx";
import { SymptomIntake } from "./SymptomIntake.jsx";
import { WaitTime } from "./WaitTime.jsx";
import { Assistant } from "./Assistant.jsx";
import { Discharge } from "./Discharge.jsx";
import { FollowUp } from "./FollowUp.jsx";
import { HelpAction } from "./Controls.jsx";
export const icons = [
  ClipboardList,
  Activity,
  Clock3,
  MessagesSquare,
  BookOpenCheck,
  CalendarDays,
];
const heroText = {
  "check-in": [
    ["Let’s get you checked in", "Completa tu registro", "开始登记"],
    [
      "Confirm your details yourself or with help from a caregiver.",
      "Confirma tus datos por tu cuenta o con ayuda de un acompañante.",
      "请自行确认个人信息，也可由陪护人员协助。",
    ],
  ],
  symptoms: [
    ["Tell us what’s going on", "Cuéntanos qué ocurre", "告诉我们你的情况"],
    [
      "Use text, voice, or an optional photo to prepare a report for the nurse.",
      "Usa texto, voz o una foto opcional para preparar un informe para enfermería.",
      "可通过文字、语音或可选照片向护士描述症状。",
    ],
  ],
  wait: [
    ["Know what happens next", "Conoce el siguiente paso", "了解下一步"],
    [
      "See your visit status, estimated wait, and explanations for changes.",
      "Consulta el estado de tu visita, la espera estimada y los cambios.",
      "查看就诊进度、预计等候时间及变化说明。",
    ],
  ],
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
  const { s, t, language, screen, move } = useCare();
  const unlocked = s.registration.status === "verified";
  const activeScreen = unlocked ? screen : "check-in";
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
          </div>
        </div>
      </header>
      <div className="navwrap">
        <nav className="wrap tabs" aria-label="Navigator">
          {screens.map((key, i) => {
            const I = icons[i];
            return (
              <button
                className={activeScreen === key ? "active" : ""}
                aria-current={activeScreen === key ? "page" : undefined}
                key={key}
                disabled={key !== "check-in" && !unlocked}
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
  const { s, t, screen } = useCare();
  const activeScreen =
    s.registration.status === "verified" ? screen : "check-in";
  const I = icons[screens.indexOf(activeScreen)];
  return (
    <section className={"hero tone-" + activeScreen}>
      <div>
        <div className="eyebrow">
          {t(
            "PATIENT EXPERIENCE",
            "EXPERIENCIA DEL PACIENTE",
            "患者服务",
          )}
        </div>
        <h1>{t(...heroText[activeScreen][0])}</h1>
        <p>{t(...heroText[activeScreen][1])}</p>
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
  const { s, t } = useCare();
  const slot = s.slot !== null ? slots[s.slot] : null;
  const patientName =
    s.registration.fields.fullName || t("Patient", "Paciente", "患者");
  const initials = s.registration.fields.fullName
    ? s.registration.fields.fullName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "P";
  return (
    <aside className="rail">
      <section className="card visit">
        <div className="eyebrow">
          {t("YOUR VISIT", "TU VISITA", "本次就诊")}
        </div>
        <div className="person">
          <div className="avatar">{initials}</div>
          <div>
            <strong>{patientName}</strong>
            <small>
              {s.registration.visitId ||
                t("Visit ID pending", "ID de visita pendiente", "就诊编号待生成")}
            </small>
          </div>
        </div>
        <div className="visitline">
          <span>{t("Care setting", "Servicio", "科室")}</span>
          <b>{t("Emergency department", "Urgencias", "急诊科")}</b>
        </div>
        <div className="visitline">
          <span>{t("Visit date", "Fecha de la visita", "就诊日期")}</span>
          <b>{prettyDate(dayDate(s.day), s.lang, true)}</b>
        </div>
        <div className="visitline">
          <span>{t("Visit status", "Estado", "就诊状态")}</span>
          <b>{t(...waitStages[s.wait.status])}</b>
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
        <HelpAction>
          {t("Ask staff", "Pedir ayuda", "联系工作人员")}
        </HelpAction>
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
  const { s, t, ready, screen, move, reset, storageIssue } = useCare();
  const unlocked = s.registration.status === "verified";
  const activeScreen = unlocked ? screen : "check-in";
  React.useEffect(() => {
    if (ready && !unlocked && screen !== "check-in") move("check-in");
  }, [ready, unlocked, screen]);
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
            key={activeScreen + "-" + s.lang}
          >
            {activeScreen === "check-in" ? (
              <CheckIn />
            ) : activeScreen === "symptoms" ? (
              <SymptomIntake />
            ) : activeScreen === "wait" ? (
              <WaitTime />
            ) : activeScreen === "assistant" ? (
              <Assistant />
            ) : activeScreen === "discharge" ? (
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
              "浏览器存储不可用，关闭或刷新后本次就诊记录将不会保留。",
            )}
          </p>
        )}
      </main>
      <footer className="wrap footer">
        <span>
          <ShieldCheck size={15} />{" "}
          {t(
            "Secure patient experience",
            "Experiencia segura del paciente",
            "安全患者服务",
          )}
        </span>
        <button onClick={reset}>
          <RotateCcw size={13} />
          {t("Start over", "Comenzar de nuevo", "重新开始")}
        </button>
      </footer>
    </>
  );
}
export default function Navigator({
  initialScreen = "check-in",
  portable = false,
}) {
  return (
    <CareProvider initialScreen={initialScreen} portable={portable}>
      <Shell />
    </CareProvider>
  );
}
