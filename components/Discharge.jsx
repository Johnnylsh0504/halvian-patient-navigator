"use client";
import React, { useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  Download,
  CheckCircle2,
  ClipboardCheck,
  LockKeyhole,
  Printer,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";
import { useCare } from "./CareContext.jsx";
import { HelpAction, Listen } from "./Controls.jsx";
import { languages, approvedPhrases } from "../lib/content.js";
import { dischargeAuthors, noteDownload } from "../lib/discharge.js";
import { useDischargeNote } from "./useDischargeNote.js";
import { Rating } from "./Rating.jsx";

export function Discharge() {
  const { s, t, action, move } = useCare(),
    [option, setOption] = useState("");
  const { note, save, error } = useDischargeNote(s.registration.status === "verified" ? s.registration.visitId : "", s.registration.verifiedAt);
  if (!note) {
    return (
      <section className="card pad" aria-live="polite">
        <div className="titleline">
          <div className="symbol"><LockKeyhole size={21} /></div>
          <h2>{t("Waiting for your discharge note", "Esperando tu nota de alta", "等待出院记录")}</h2>
        </div>
        <p>{error
          ? t("Allow browser storage and reopen this page to load your note.", "Permite el almacenamiento del navegador y vuelve a abrir la página para cargar tu nota.", "请开启浏览器存储并重新打开页面，以读取出院记录。")
          : t("Your nurse or attending physician will write and sign your note. It will appear here automatically when it is ready.", "Tu enfermero o médico tratante escribirá y firmará tu nota. Aparecerá aquí automáticamente cuando esté lista.", "护士或主治医生填写并签署后，你的出院记录会自动出现在这里。")}</p>
      </section>
    );
  }
  const guide = note.guides[s.lang];
  const result = note.teach[s.lang];
  const download = noteDownload(note);
  return (
    <>
      <section className="card pad printable">
        <div className="sectioncap">
          <div className="symbol"><BookOpenCheck size={20} /></div>
          <h2>{t("Your signed discharge note", "Tu nota de alta firmada", "已签署的出院记录")}</h2>
        </div>
        <p className="verified"><ShieldCheck size={15} />
          {t("Signed by", "Firmada por", "签署人")} {dischargeAuthors[note.author].name} · {t(...dischargeAuthors[note.author].role)} · {languages[note.language]}
        </p>
        <p className="discharge-note-body" lang={note.language}>{note.text}</p>
        <div className="actions">
          <a className="primary discharge-download" download={download.filename} href={download.href}>
            <Download size={16} />{t("Download discharge note (.txt)", "Descargar nota de alta (.txt)", "下载出院记录（.txt）")}
          </a>
          {s.lang === note.language && <Listen value={note.text} />}
          <button className="light" onClick={() => window.print()}><Printer size={15} />{t("Print", "Imprimir", "打印")}</button>
          <HelpAction kind="feedback" note={"Guide: " + note.visitId}>
            {t("Flag as confusing", "No está claro", "标记不清楚")}
          </HelpAction>
        </div>
        {guide && (
          <section className="discharge-guide">
            <h3>{t("Your reviewed guide", "Tu guía revisada", "已审核的患者指南")} · {languages[s.lang]}</h3>
            <p className="small">{t("Reviewed by", "Revisada por", "审核人")} {dischargeAuthors[guide.author].name}</p>
            <p className="discharge-note-body" lang={s.lang}>{guide.text}</p>
            <Listen value={guide.text} />
          </section>
        )}
        <Rating kind="discharge" />
      </section>
      {guide?.text === approvedPhrases[s.lang].join("\n\n") && (
        <section className="card pad">
          <div className="titleline">
            <div className="symbol peach">
              <ClipboardCheck size={20} />
            </div>
            <h2>
              {t(
                "Check your next step",
                "Repasa el siguiente paso",
                "确认你理解的下一步",
              )}
            </h2>
          </div>
          <p>
            {t(
              "When does your guide say to visit the family clinic?",
              "Según tu guía, ¿cuándo debes acudir a la clínica?",
              "根据这份指南，你应该什么时候到家庭诊所复诊？",
            )}
          </p>
          {result === "correct" ? (
            <div className="callout good" role="status">
              <CheckCircle2 size={18} />
              {t(
                "That’s right. Bring your medicine list.",
                "Así es. Lleva tu lista de medicamentos.",
                "正确。请带上用药清单。",
              )}
            </div>
          ) : (
            <>
              <div className="choice-row">
                {[
                  [
                    "correct",
                    t("Within 14 days", "Dentro de 14 días", "14 天内"),
                  ],
                  [
                    "unsure",
                    t("I’m not sure", "No lo tengo claro", "我不确定"),
                  ],
                ].map(([key, v]) => (
                  <button
                    key={key}
                    className={"choice " + (option === key ? "chosen" : "")}
                    aria-pressed={option === key}
                    onClick={() => {
                      setOption(key);
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <button
                className="light"
                disabled={!option}
                onClick={() => {
                  save({ type: "teach", language: s.lang, correct: option === "correct" });
                  if (option !== "correct") action({ type: "ticket", kind: "teach", note: "Discharge note " + note.visitId });
                }}
              >
                {t("Check answer", "Comprobar respuesta", "确认答案")}
              </button>
              {result === "clarify" && (
                <p className="callout" role="status">
                  {t(
                    "We asked your nurse to explain this step. You can try again.",
                    "Pedimos a enfermería que te explique este paso. Puedes intentarlo otra vez.",
                    "已请护士解释这一步，你也可以再试一次。",
                  )}
                </p>
              )}
            </>
          )}
        </section>
      )}
      <button className="nextcard" onClick={() => move("follow-up")}>
        <span className="symbol pale">
          <CalendarDays size={20} />
        </span>
        <span>
          <small>{t("Next in your visit", "Siguiente paso", "下一步")}</small>
          <strong>
            {t("Arrange a follow-up", "Organizar seguimiento", "安排复诊")}
          </strong>
        </span>
        <ArrowRight size={19} />
      </button>
    </>
  );
}
