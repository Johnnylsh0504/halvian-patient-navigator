"use client";
import React, { useState } from "react";
import { FilePenLine, ShieldCheck, Sparkles } from "lucide-react";
import { useCare } from "./CareContext.jsx";
import { useDischargeNote } from "./useDischargeNote.js";
import { languages } from "../lib/content.js";
import { dischargeAuthors, draftPlan, noteLimit } from "../lib/discharge.js";

function AuthorSelect({ value, onChange }) {
  const { t } = useCare();
  return (
    <label className="field">
      <span>{t("Signing clinician", "Profesional que firma", "签署人员")}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} required>
        <option value="">{t("Choose a clinician", "Elige un profesional", "选择医护人员")}</option>
        {Object.entries(dischargeAuthors).map(([key, author]) => (
          <option key={key} value={key}>{t(...author.role)} · {author.name}</option>
        ))}
      </select>
    </label>
  );
}

function LanguageSelect({ label, value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {Object.entries(languages).map(([key, name]) => <option key={key} value={key}>{name}</option>)}
      </select>
    </label>
  );
}

function SourceEditor({ save }) {
  const { s, t } = useCare();
  const [author, setAuthor] = useState("");
  const [language, setLanguage] = useState(s.lang);
  const [text, setText] = useState("");
  return (
    <form className="discharge-form" onSubmit={(e) => {
      e.preventDefault();
      save({ type: "sign", author, language, text });
    }}>
      <div className="formgrid">
        <AuthorSelect value={author} onChange={setAuthor} />
        <LanguageSelect label={t("Note language", "Idioma de la nota", "记录语言")} value={language} onChange={setLanguage} />
      </div>
      <label className="field">
        <span>{t("Discharge note", "Nota de alta", "出院记录")}</span>
        <textarea rows={6} maxLength={noteLimit} value={text} required
          placeholder={t("Write the discharge note for this visit.", "Escribe la nota de alta de esta visita.", "填写本次就诊的出院记录。")}
          onChange={(e) => setText(e.target.value)} />
      </label>
      <p className="small">{t("When you sign, the patient can read and download these exact words.", "Al firmar, el paciente podrá leer y descargar este mismo texto.", "签署后，患者即可阅读并下载这份原文。")}</p>
      <button className="primary" disabled={!author || !text.trim()} type="submit">
        <ShieldCheck size={16} />{t("Sign and release note", "Firmar y publicar la nota", "签署并发布记录")}
      </button>
    </form>
  );
}

function GuideEditor({ note, language, save }) {
  const { t } = useCare();
  const [author, setAuthor] = useState(note.author);
  const [text, setText] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const released = note.guides[language];
  const draft = note.language === "en" ? draftPlan(note.text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean), language) : null;
  if (released) return <p className="verified"><ShieldCheck size={16} />{languages[language]} · {dischargeAuthors[released.author].name}</p>;
  return (
    <form className="discharge-form" onSubmit={(e) => {
      e.preventDefault();
      save({ type: "guide", author, language, text, reviewed });
    }}>
      {draft && <button type="button" className="light" onClick={() => { setText(draft.join("\n\n")); setReviewed(false); }}>
        <Sparkles size={16} />{t("Prepare language draft", "Preparar borrador", "生成语言草稿")}
      </button>}
      <label className="field">
        <span>{t("Patient guide", "Guía para el paciente", "患者指南")} · {languages[language]}</span>
        <textarea rows={4} maxLength={noteLimit} value={text} onChange={(e) => { setText(e.target.value); setReviewed(false); }} required />
      </label>
      <AuthorSelect value={author} onChange={(value) => { setAuthor(value); setReviewed(false); }} />
      <label className="checkrow"><input type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} />
        <span>{t("I checked this wording against the signed note.", "Comprobé este texto con la nota firmada.", "我已对照签署的出院原文核实这份指南。")}</span>
      </label>
      <button className="light" type="submit" disabled={!reviewed || !text.trim() || !author}>
        {t("Release patient guide", "Publicar guía", "发布患者指南")}
      </button>
    </form>
  );
}

function EncounterNote({ registration }) {
  const { t } = useCare();
  const { note, save, error } = useDischargeNote(registration.visitId, registration.verifiedAt);
  const [guideLanguage, setGuideLanguage] = useState(registration.fields.preferredLanguage || "en");
  return (
    <>
      {note ? (
        <>
          <div className="callout good" role="status"><ShieldCheck size={18} />
            {t("Released to", "Publicada para", "已发布给")} {registration.fields.fullName} · {dischargeAuthors[note.author].name}
          </div>
          <p className="discharge-note-body" lang={note.language}>{note.text}</p>
          <details className="source">
            <summary>{t("Add a plain-language or translated guide", "Añadir una guía en lenguaje sencillo u otro idioma", "添加通俗版或其他语言的指南")}</summary>
            <div className="discharge-form">
              <LanguageSelect label={t("Guide language", "Idioma de la guía", "指南语言")} value={guideLanguage} onChange={setGuideLanguage} />
              <GuideEditor key={guideLanguage} note={note} language={guideLanguage} save={save} />
            </div>
          </details>
        </>
      ) : <SourceEditor save={save} />}
      {error && <p role="alert">{t("The note could not be saved or loaded. Allow browser storage and try again.", "No se pudo guardar o cargar la nota. Habilita el almacenamiento del navegador y vuelve a intentarlo.", "记录未能保存或读取，请允许浏览器存储后重试。")}</p>}
    </>
  );
}

export function HospitalDischarge() {
  const { s, t } = useCare();
  const [picked, setPicked] = useState("");
  const verified = s.registrations.filter((entry) => entry.status === "verified");
  const selected = verified.find((entry) => entry.visitId === picked)
    || verified.find((entry) => entry.visitId === s.registration.visitId) || verified.at(-1);
  return (
    <section className="card pad">
      <div className="sectioncap"><div className="symbol"><FilePenLine size={20} /></div>
        <h2>{t("Discharge note", "Nota de alta", "出院记录")}</h2>
      </div>
      {selected ? (
        <>
          <label className="field discharge-patient">
            <span>{t("Patient and visit", "Paciente y visita", "患者和就诊编号")}</span>
            <select value={selected.visitId} onChange={(e) => setPicked(e.target.value)}>
              {verified.map((entry) => <option key={entry.visitId} value={entry.visitId}>{entry.fields.fullName} · {entry.visitId}</option>)}
            </select>
          </label>
          <EncounterNote key={selected.visitId} registration={selected} />
        </>
      ) : <p>{t("Verify a patient's registration in Intake to write their discharge note.", "Verifica el registro de un paciente en Ingreso para escribir su nota de alta.", "请先到「登记与分诊」核实患者身份，再为该患者填写出院记录。")}</p>}
    </section>
  );
}
