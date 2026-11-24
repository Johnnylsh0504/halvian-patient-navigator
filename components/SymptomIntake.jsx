"use client";
import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Camera,
  ClipboardCheck,
  ShieldCheck,
} from "lucide-react";
import { useCare } from "./CareContext.jsx";
import { Dictate } from "./Controls.jsx";

const observationNames = {
  chest: ["Chest mentioned", "Menciona el pecho", "提到胸部"],
  head: ["Head mentioned", "Menciona la cabeza", "提到头部"],
  abdomen: ["Abdomen mentioned", "Menciona el abdomen", "提到腹部"],
  breathing: ["Breathing mentioned", "Menciona la respiración", "提到呼吸"],
  bleeding: ["Bleeding mentioned", "Menciona sangrado", "提到出血"],
  dizziness: ["Dizziness mentioned", "Menciona mareo", "提到头晕"],
  fever: ["Fever mentioned", "Menciona fiebre", "提到发烧"],
};

export function SymptomIntake() {
  const { s, t, action, move } = useCare();
  const report = s.symptoms;
  const [editing, setEditing] = useState(report.status === "not-started");
  const [description, setDescription] = useState(report.description);
  const [onset, setOnset] = useState(report.onset);
  const [severity, setSeverity] = useState(report.severity ?? 5);
  const [photoName, setPhotoName] = useState(report.photoName);
  const [photoConsent, setPhotoConsent] = useState(report.photoConsent);
  const [reporter, setReporter] = useState(report.reporter);
  const [caregiverName, setCaregiverName] = useState(report.caregiverName);
  const [relationship, setRelationship] = useState(report.relationship);
  const [caregiverAuthorized, setCaregiverAuthorized] = useState(false);
  const [consent, setConsent] = useState(false);

  if (!editing && report.status !== "not-started") {
    const summary = report.structured;
    return (
      <>
        <section className="card pad">
          <div className="titleline">
            <div className="symbol"><ClipboardCheck size={21} /></div>
            <h2>
              {report.status === "reviewed"
                ? t("Symptom report reviewed", "Síntomas revisados", "症状报告已审核")
                : t("Symptom report received", "Síntomas recibidos", "症状报告已提交")}
            </h2>
          </div>
          <p>
            {t(
              "The original description stays with the structured summary for the nurse.",
              "La descripción original permanece junto al resumen estructurado para enfermería.",
              "原始描述会与结构化摘要一同提供给护士。",
            )}
          </p>
          {summary?.urgent && (
            <div className="callout warn">
              <AlertTriangle size={19} />
              <div>
                <b>{t("Tell ED staff now", "Avisa al personal ahora", "请立即告知急诊工作人员")}</b>
                <p>{t("Warning words were detected. This tool does not diagnose or determine urgency.", "Se detectaron palabras de alerta. Esta herramienta no diagnostica ni determina la urgencia.", "检测到警示词。本工具不能诊断或判断紧急程度。")}</p>
              </div>
            </div>
          )}
          <div className="structured">
            <div>
              <span>{t("Original description", "Descripción original", "原始描述")}</span>
              <p>“{report.description}”</p>
            </div>
            <div>
              <span>{t("Structured details", "Datos estructurados", "结构化信息")}</span>
              <ul>
                <li>{t("Started", "Comenzó", "开始时间")}: {report.onset}</li>
                <li>{t("Severity", "Intensidad", "严重程度")}: {report.severity}/10</li>
                <li>{t("Reported by", "Informado por", "报告人")}: {report.reporter === "caregiver" ? report.caregiverName : t("Patient", "Paciente", "患者")}</li>
                {summary?.observations?.map((item) => <li key={item}>{t(...observationNames[item])}</li>)}
                {report.photoName && <li>{t("Photo attached for review", "Foto adjunta para revisión", "已附照片供审核")}: {report.photoName}</li>}
              </ul>
            </div>
          </div>
          <div className="actions">
            {report.status !== "reviewed" && <button className="light" onClick={() => setEditing(true)}>{t("Update report", "Actualizar informe", "更新报告")}</button>}
            <button className="primary" onClick={() => move("wait")}>
              {t("See wait status", "Ver estado de espera", "查看等候进度")} <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </>
    );
  }

  return (
    <section className="card pad">
      <div className="titleline">
        <div className="symbol"><Activity size={21} /></div>
        <h2>{t("Tell us what brings you in", "Cuéntanos qué te ocurre", "请描述你的症状")}</h2>
      </div>
      <p>{t("Describe symptoms in your own words. A nurse—not this tool—determines urgency and care.", "Describe los síntomas con tus propias palabras. Enfermería, no esta herramienta, determina la urgencia y la atención.", "请用自己的话描述症状。紧急程度和诊疗安排由护士判断，本工具不会自动分诊。")}</p>
      {s.registration.status !== "verified" && (
        <div className="callout">
          <ShieldCheck size={18} />
          <div>
            <b>{t("Registration is not verified", "El registro no está verificado", "登记尚未核实")}</b>
            <p>{t("Hospital registration must verify your information before symptom intake opens.", "El registro del hospital debe verificar tu información antes de abrir el ingreso de síntomas.", "医院登记处核实你的信息后，症状填报才会开放。")}</p>
            <button className="light" onClick={() => move("check-in")}>{t("Open check-in", "Abrir registro", "打开登记")}</button>
          </div>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          action({ type: "submit-symptoms", description, onset, severity: Number(severity), photoName, photoConsent, reporter, caregiverName, relationship, caregiverAuthorized, consent });
          if (s.registration.status === "verified" && description.trim() && onset && consent && (!photoName || photoConsent) && (reporter !== "caregiver" || (caregiverName && caregiverAuthorized))) setEditing(false);
        }}
      >
        <label className="field symptomtext">
          <span>{t("Symptom description", "Descripción de síntomas", "症状描述")}</span>
          <textarea required rows={5} maxLength={1000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("Example: I have felt dizzy since this morning…", "Ejemplo: Me siento mareado desde esta mañana…", "例如：我从今天早上开始感到头晕……")} />
          <Dictate onText={setDescription} />
        </label>
        <div className="formgrid">
          <label className="field">
            <span>{t("When did it start?", "¿Cuándo comenzó?", "何时开始？")}</span>
            <select required value={onset} onChange={(e) => setOnset(e.target.value)}>
              <option value="">{t("Choose one", "Elige una opción", "请选择")}</option>
              <option value={t("Today", "Hoy", "今天")}>{t("Today", "Hoy", "今天")}</option>
              <option value={t("Yesterday", "Ayer", "昨天")}>{t("Yesterday", "Ayer", "昨天")}</option>
              <option value={t("2–7 days ago", "Hace 2–7 días", "2–7 天前")}>{t("2–7 days ago", "Hace 2–7 días", "2–7 天前")}</option>
              <option value={t("More than a week ago", "Hace más de una semana", "一周以前")}>{t("More than a week ago", "Hace más de una semana", "一周以前")}</option>
            </select>
          </label>
          <label className="field">
            <span>{t("How severe is it?", "¿Qué tan intenso es?", "症状有多严重？")} <b>{severity}/10</b></span>
            <input type="range" min="0" max="10" value={severity} onChange={(e) => setSeverity(Number(e.target.value))} />
          </label>
          <label className="field">
            <span>{t("Who is reporting?", "¿Quién informa?", "由谁描述？")}</span>
            <select value={reporter} onChange={(e) => setReporter(e.target.value)}>
              <option value="patient">{t("Patient", "Paciente", "患者")}</option>
              <option value="caregiver">{t("Caregiver or companion", "Acompañante", "陪护人员")}</option>
            </select>
          </label>
        </div>
        {reporter === "caregiver" && (
          <div className="formgrid inset">
            <label className="field"><span>{t("Caregiver name", "Nombre del acompañante", "陪护人姓名")}</span><input required value={caregiverName} onChange={(e) => setCaregiverName(e.target.value)} /></label>
            <label className="field"><span>{t("Relationship", "Relación", "与患者关系")}</span><input value={relationship} onChange={(e) => setRelationship(e.target.value)} /></label>
            <label className="checkrow wide"><input type="checkbox" required checked={caregiverAuthorized} onChange={(e) => setCaregiverAuthorized(e.target.checked)} /><span>{t("The patient authorized this person to report symptoms.", "El paciente autorizó a esta persona a informar los síntomas.", "患者已授权该人员描述症状。")}</span></label>
          </div>
        )}
        <div className="scanbox compact">
          <Camera size={22} />
          <div>
            <strong>{t("Optional visible-symptom photo", "Foto opcional de un síntoma visible", "可选：上传可见症状照片")}</strong>
            <small>{t("The prototype records only the filename; it does not upload the image.", "El prototipo registra solo el nombre del archivo; no carga la imagen.", "原型仅记录文件名，不会上传图片。")}</small>
          </div>
          <label className="light filebutton">{t("Choose photo", "Elegir foto", "选择照片")}<input type="file" accept="image/*" onChange={(e) => { setPhotoName(e.target.files?.[0]?.name || ""); setPhotoConsent(false); }} /></label>
          {photoName && <label className="checkrow wide"><input type="checkbox" required checked={photoConsent} onChange={(e) => setPhotoConsent(e.target.checked)} /><span>{t("I consent to sharing this image with the care team.", "Autorizo compartir esta imagen con el equipo clínico.", "我同意与医护团队共享此图片。")}</span></label>}
        </div>
        <label className="checkrow"><input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} /><span>{t("Send this report to the ED nurse for review.", "Enviar este informe a enfermería para revisión.", "将此报告发送给急诊护士审核。")}</span></label>
        <button className="primary" disabled={s.registration.status !== "verified"}><ShieldCheck size={16} /> {t("Submit symptom report", "Enviar síntomas", "提交症状报告")}</button>
      </form>
    </section>
  );
}
