"use client";
import React, { useEffect, useRef } from "react";
import {
  ArrowRight,
  ChevronRight,
  Languages,
  CalendarDays,
  Clock3,
  BookOpen,
  Headphones,
  MessageCircleQuestion,
  ShieldCheck,
} from "lucide-react";
import { useCare } from "./CareContext.jsx";
import { HelpAction, Composer, Listen } from "./Controls.jsx";
import { faq, idx, helpText } from "../lib/content.js";
import { Rating } from "./Rating.jsx";
const quickIcons = [Languages, CalendarDays, Clock3, BookOpen];
export function Assistant() {
  const { s, t, action, move } = useCare();
  const last = useRef(null),
    count = useRef(s.turns.length);
  useEffect(() => {
    if (s.turns.length > count.current)
      last.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    count.current = s.turns.length;
  }, [s.turns.length]);
  const ask = (text) => action({ type: "ask", text });
  return (
    <>
      <section className="card ask">
        <div className="titleline">
          <div className="symbol">
            <MessageCircleQuestion size={21} />
          </div>
          <h2>
            {t(
              "Ask your navigator",
              "Pregunta a tu navegador",
              "向导航助手提问",
            )}
          </h2>
        </div>
        <p className="intro">
          {t(
            "Choose a question or write your own. A care team member handles medical questions.",
            "Elige una pregunta o escribe la tuya. El equipo clínico responde las preguntas médicas.",
            "选择一个常见问题，或输入自己的问题。医疗问题由医护人员处理。",
          )}
        </p>
        <div className="quickgrid">
          {faq.map((item, i) => {
            const I = quickIcons[i];
            return (
              <button
                key={item.id}
                onClick={() => ask(item.examples[idx(s.lang)][0])}
              >
                <I size={17} />
                <span>{item.examples[idx(s.lang)][0]}</span>
                <ChevronRight size={15} />
              </button>
            );
          })}
        </div>
        {s.turns.length > 0 && (
          <div className="conversation" role="log" aria-live="polite">
            {s.turns.map((turn, i) => {
              const answer = faq.find((f) => f.id === turn.id);
              const body = answer
                ? t(...answer.response)
                : turn.kind === "clinical"
                  ? t(
                      "A nurse needs to answer this. Your question is in the ED nurse’s queue. For an emergency, get help now.",
                      "Enfermería debe responder. Tu pregunta está en su lista. Si es una emergencia, pide ayuda ahora.",
                      "这个问题需要护士回答，已提交给急诊护士。如遇紧急情况，请立即求助。",
                    )
                  : t(
                      "I couldn’t match that to a reviewed answer. Your original question was sent to the ED nurse.",
                      "No encontré una respuesta revisada. Tu pregunta se envió a enfermería.",
                      "我没有找到已审核的答案，已将原问题交给急诊护士。",
                    );
              return (
                <div
                  className="turn"
                  key={i}
                  ref={i === s.turns.length - 1 ? last : null}
                >
                  <div className="bubble patient">{turn.text}</div>
                  <div className={"answer " + (!answer ? "handoff" : "")}>
                    <div className="answerby">
                      {answer ? (
                        <ShieldCheck size={15} />
                      ) : (
                        <Headphones size={15} />
                      )}{" "}
                      {answer
                        ? t(
                            "Reviewed hospital information",
                            "Información revisada del hospital",
                            "已审核的医院流程信息",
                          )
                        : t(
                            "Handed to a person",
                            "Entregada al equipo",
                            "已转人工",
                          )}
                    </div>
                    <p>{body}</p>
                    {!answer && <p className="small">{t(...helpText)}</p>}
                    <div className="actions">
                      <Listen value={body} />
                      {answer && (
                        <HelpAction kind="feedback" note={turn.text}>
                          {t(
                            "Flag as confusing",
                            "No está claro",
                            "标记不清楚",
                          )}
                        </HelpAction>
                      )}
                      {answer?.id === "interpreter" && (
                        <HelpAction note={turn.text}>
                          {t("Ask staff", "Pedir ayuda", "联系工作人员")}
                        </HelpAction>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <Composer
          onSend={ask}
          label={t("Your question", "Tu pregunta", "你的问题")}
          placeholder={t(
            "Type a question about your visit…",
            "Escribe una pregunta sobre tu visita…",
            "输入关于就诊的问题…",
          )}
          caption={t(
            "Review dictated text before sending. Do not include information unrelated to your visit.",
            "Revisa el dictado antes de enviarlo. No incluyas información ajena a tu visita.",
            "发送前请核对语音转写内容，请勿填写与本次就诊无关的信息。",
          )}
        />
        {s.turns.length > 0 && <Rating kind="communication" />}
      </section>
      <button className="nextcard" onClick={() => move("discharge")}>
        <span className="symbol pale">
          <BookOpen size={20} />
        </span>
        <span>
          <small>{t("Next in your visit", "Siguiente paso", "下一步")}</small>
          <strong>
            {t("Open discharge guide", "Abrir guía de alta", "打开出院指南")}
          </strong>
        </span>
        <ArrowRight size={19} />
      </button>
    </>
  );
}
