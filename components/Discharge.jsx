"use client";
import React, { useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ClipboardCheck,
  HeartPulse,
  LockKeyhole,
  Pill,
  Printer,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";
import { useCare } from "./CareContext.jsx";
import { HelpAction, Listen } from "./Controls.jsx";
import { languages, planRows, visit } from "../lib/content.js";
import { Rating } from "./Rating.jsx";
import { approvedPhrases } from "../lib/content.js";
const rowIcons = [Pill, HeartPulse, CalendarDays];
export function Discharge() {
  const { s, t, action, move } = useCare(),
    [option, setOption] = useState("");
  const release = s.releases[s.lang];
  const result = s.teach[s.lang];
  if (!release)
    return (
      <section className="card pad">
        <div className="titleline">
          <div className="symbol">
            <LockKeyhole size={21} />
          </div>
          <h2>
            {t(
              "Awaiting clinician review",
              "Pendiente de revisión clínica",
              "等待医护人员审核",
            )}
          </h2>
        </div>
        <p>
          {t(
            "Your care team will check the guide in your chosen language before you can read or listen to it.",
            "El equipo revisará la guía en tu idioma antes de que puedas leerla o escucharla.",
            "医护团队审核你所选语言的版本后，你就能阅读或收听。",
          )}
        </p>
        <div className="details">
          <span>{t("Version requested", "Idioma solicitado", "待审语言")}</span>
          <strong>{languages[s.lang]}</strong>
        </div>
        <small className="subnote">
          {t(
            "The discharging clinician completes this review in the separate hospital workspace.",
            "El profesional de alta completa la revisión en el espacio hospitalario separado.",
            "出院医护人员将在独立的医院工作区完成审核。",
          )}
        </small>
      </section>
    );
  return (
    <>
      <section className="card pad printable">
        <div className="sectioncap">
          <div className="symbol">
            <BookOpenCheck size={20} />
          </div>
          <h2>
            {t(
              "Your approved instructions",
              "Tus instrucciones aprobadas",
              "已审核的出院说明",
            )}
          </h2>
        </div>
        <p className="verified">
          <ShieldCheck size={15} />
          {t("Reviewed by", "Revisada por", "审核人")} {release.clinician} ·{" "}
          {languages[s.lang]}
        </p>
        <div className="planrows">
          {release.rows.map((row, i) => {
            const I = rowIcons[i];
            return (
              <div key={i}>
                <I size={19} />
                <section>
                  <h3>{t(...planRows[i])}</h3>
                  <p>{row}</p>
                </section>
              </div>
            );
          })}
        </div>
        <div className="actions">
          <Listen value={release.rows.join(" ")} />
          <button className="light" onClick={() => window.print()}>
            <Printer size={15} />
            {t("Print guide", "Imprimir guía", "打印指南")}
          </button>
          <HelpAction kind="feedback" note={"Guide: " + visit.sourceVersion}>
            {t("Flag as confusing", "No está claro", "标记不清楚")}
          </HelpAction>
        </div>
        <Rating kind="discharge" />
      </section>
      {release.rows[2] === approvedPhrases[s.lang][2] && (
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
                  action({ type: "teach", ok: option === "correct" });
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
