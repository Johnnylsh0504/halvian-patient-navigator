"use client";
import React, { useState } from "react";
import {
  Activity,
  BarChart3,
  ClipboardCheck,
  Clock3,
  Compass,
  Headphones,
  Languages,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  UserCheck,
} from "lucide-react";
import { CareProvider, useCare } from "./CareContext.jsx";
import { CareTeam } from "./CareTeam.jsx";
import {
  languages,
  waitStages,
  coverageOptions,
  hospitalWorkspaces,
} from "../lib/content.js";

const workspaceContent = {
  intake: {
    icon: UserCheck,
    label: ["Intake", "Ingreso", "登记与症状"],
    title: ["Registration and triage", "Registro y triaje", "登记与分诊"],
    description: [
      "Verify registration details and review the patient’s original symptom report.",
      "Verifica el registro y revisa el informe original de síntomas.",
      "核实登记信息并审核患者的原始症状报告。",
    ],
  },
  flow: {
    icon: Clock3,
    label: ["ED flow", "Flujo", "候诊进度"],
    title: ["Wait-time operations", "Operaciones de espera", "候诊管理"],
    description: [
      "Monitor the automatically prioritized patient queue and calculated wait times.",
      "Supervisa la cola priorizada automáticamente y los tiempos de espera calculados.",
      "查看自动排序的患者队列和计算出的等候时间。",
    ],
  },
  discharge: {
    icon: ClipboardCheck,
    label: ["Discharge", "Alta", "出院审核"],
    title: ["Discharge language review", "Revisión del alta", "出院语言审核"],
    description: [
      "Compare the language draft with the signed source before release.",
      "Compara el borrador con la fuente firmada antes de publicarlo.",
      "发布前将语言草稿与已签署原文进行核对。",
    ],
  },
  requests: {
    icon: Headphones,
    label: ["Requests", "Solicitudes", "请求队列"],
    title: ["Patient requests", "Solicitudes del paciente", "患者请求"],
    description: [
      "Respond to clinical questions, access barriers, and clarification requests.",
      "Responde preguntas clínicas, barreras y solicitudes de aclaración.",
      "处理临床问题、就诊障碍和澄清请求。",
    ],
  },
  outcomes: {
    icon: BarChart3,
    label: ["Outcomes", "Resultados", "结果"],
    title: ["Verification and outcomes", "Verificación y resultados", "核实与结果"],
    description: [
      "Verify follow-up attendance and review workflow and equity measures.",
      "Verifica la asistencia y revisa las medidas de proceso y equidad.",
      "核实复诊到诊情况并查看流程与公平性指标。",
    ],
  },
};

function HospitalHeader({ workspace, portable, onNavigate }) {
  const { s, t, language } = useCare();
  return (
    <>
      <header className="mast hospitalmast">
        <div className="wrap top">
          <div className="brand">
            <div className="mark clinicalmark"><Stethoscope size={25} /></div>
            <div>
              <strong>Halvian</strong>
              <span>{t("Hospital workspace", "Espacio hospitalario", "医院工作区")}</span>
            </div>
          </div>
          <label className="language">
            <Languages size={17} />
            <span className="sr-only">{t("Language", "Idioma", "语言")}</span>
            <select aria-label="Language / Idioma / 语言" value={s.lang} onChange={(e) => language(e.target.value)}>
              {Object.entries(languages).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </label>
        </div>
      </header>
      <div className="navwrap hospitalnavwrap">
        <nav className="wrap hospitaltabs" aria-label={t("Hospital workspace", "Espacio hospitalario", "医院工作区")}>
          {hospitalWorkspaces.map((key) => {
            const item = workspaceContent[key];
            const Icon = item.icon;
            const contents = (
              <>
                <Icon size={17} />
                <span>{t(...item.label)}</span>
              </>
            );
            return portable ? (
              <button key={key} onClick={() => onNavigate(key)} className={workspace === key ? "active" : ""} aria-current={workspace === key ? "page" : undefined}>{contents}</button>
            ) : (
              <a key={key} href={`/hospital/${key}/`} className={workspace === key ? "active" : ""} aria-current={workspace === key ? "page" : undefined}>{contents}</a>
            );
          })}
        </nav>
      </div>
    </>
  );
}

function HospitalRail() {
  const { s, t } = useCare();
  const openRequests = s.tickets.filter((q) => q.status === "open").length;
  const patientName =
    s.registration.fields.fullName || t("No patient registered", "Ningún paciente registrado", "尚无患者登记");
  const initials = s.registration.fields.fullName
    ? s.registration.fields.fullName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "—";
  return (
    <aside className="rail">
      <section className="card visit">
        <div className="eyebrow">{t("ACTIVE VISIT", "VISITA ACTIVA", "当前就诊")}</div>
        <div className="person">
          <div className="avatar">{initials}</div>
          <div><strong>{patientName}</strong><small>{s.registration.visitId || t("Visit ID pending", "ID de visita pendiente", "就诊编号待生成")} · {t("Emergency department", "Urgencias", "急诊科")}</small></div>
        </div>
        <div className="visitline"><span>{t("Registration", "Registro", "登记")}</span><b>{s.registration.status === "verified" ? t("Verified", "Verificado", "已核实") : s.registration.status === "submitted" ? t("Submitted", "Enviado", "已提交") : t("Not submitted", "No enviado", "未提交")}</b></div>
        <div className="visitline"><span>{t("Symptom intake", "Síntomas", "症状报告")}</span><b>{s.symptoms.status === "reviewed" ? t("Reviewed", "Revisado", "已审核") : s.symptoms.status === "submitted" ? t("Submitted", "Enviado", "已提交") : t("Not submitted", "No enviado", "未提交")}</b></div>
        <div className="visitline"><span>{t("ED status", "Estado", "急诊进度")}</span><b>{t(...waitStages[s.wait.status])}</b></div>
        <div className="visitline"><span>{t("Open requests", "Solicitudes abiertas", "待处理请求")}</span><b>{openRequests}</b></div>
        <div className="visitline"><span>{t("Coverage", "Cobertura", "保险")}</span><b>{s.registration.fields.insurerName || (s.registration.fields.coverage ? t(...coverageOptions[s.registration.fields.coverage]) : "—")}</b></div>
      </section>
      <section className="clinicalnotice">
        <ShieldCheck size={18} />
        <div><strong>{t("Clinical workspace", "Espacio clínico", "临床工作区")}</strong><p>{t("Hospital staff own verification, patient-facing updates, and escalation responses.", "El personal hospitalario controla la verificación, las actualizaciones y las respuestas.", "医院工作人员负责信息核实、患者通知和升级响应。")}</p></div>
      </section>
    </aside>
  );
}

function HospitalShell({ workspace, portable = false, onNavigate }) {
  const { s, t, reset, storageIssue } = useCare();
  const item = workspaceContent[workspace] || workspaceContent.intake;
  const Icon = item.icon;
  return (
    <>
      <a className="skip" href="#hospital-content">{t("Skip to content", "Ir al contenido", "跳至正文")}</a>
      <HospitalHeader workspace={workspace} portable={portable} onNavigate={onNavigate} />
      <main id="hospital-content" className="wrap main">
        <section className="hero tone-staff">
          <div><div className="eyebrow">{t("HOSPITAL OPERATIONS", "OPERACIONES HOSPITALARIAS", "医院运营")}</div><h1>{t(...item.title)}</h1><p>{t(...item.description)}</p></div>
          <div className="hero-art" aria-hidden="true"><div className="orbit o1" /><div className="orbit o2" /><div className="orbit o3" /><div className="stamp"><Icon size={42} strokeWidth={1.6} /></div><i className="dot d1" /><i className="dot d2" /></div>
        </section>
        <div className="layout">
          <div className="column" key={`${workspace}-${s.lang}`}><CareTeam view={workspace} /></div>
          <HospitalRail />
        </div>
        {storageIssue && <p role="status">{t("Browser storage is unavailable. This record will not persist after reload.", "El almacenamiento no está disponible. El registro no persistirá.", "浏览器存储不可用，刷新后记录不会保留。")}</p>}
      </main>
      <footer className="wrap footer">
        <span><Compass size={15} /> {t("Hospital operations workspace", "Espacio de operaciones hospitalarias", "医院运营工作区")}</span>
        <button onClick={reset}><RotateCcw size={13} /> {t("Clear visit", "Borrar visita", "清除就诊记录")}</button>
      </footer>
    </>
  );
}

export default function Hospital({ workspace = "intake", portable = false }) {
  const [portableWorkspace, setPortableWorkspace] = useState(workspace);
  const activeWorkspace = portable ? portableWorkspace : workspace;
  return <CareProvider initialScreen="check-in" portable={portable}><HospitalShell workspace={activeWorkspace} portable={portable} onNavigate={setPortableWorkspace} /></CareProvider>;
}
