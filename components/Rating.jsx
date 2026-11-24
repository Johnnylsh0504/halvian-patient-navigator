"use client";
import React from "react";
import { Check, MessageCircleHeart } from "lucide-react";
import { useCare } from "./CareContext.jsx";
export function Rating({ kind }) {
  const { s, t, action } = useCare(),
    key = kind + "-" + s.lang;
  const options = [
    t("Unclear", "Poco claro", "不清楚"),
    t("Mostly clear", "Bastante claro", "基本清楚"),
    t("Very clear", "Muy claro", "很清楚"),
  ];
  return (
    <div className="rating">
      <span>
        <MessageCircleHeart size={15} />
        {kind === "communication"
          ? t(
              "How clear was communication with your nurse or doctor?",
              "¿Qué tan clara fue la comunicación con enfermería o tu médico?",
              "护士或医生与你沟通得清楚吗？",
            )
          : t(
              "How clear were the medicine and follow-up instructions?",
              "¿Qué tan claras fueron las instrucciones de medicamentos y seguimiento?",
              "用药与复诊说明清楚吗？",
            )}
      </span>
      <div>
        {options.map((name, i) => (
          <button
            aria-pressed={s.rating[key] === i}
            className={s.rating[key] === i ? "selected" : ""}
            key={name}
            onClick={() => action({ type: "rate", key, value: i })}
          >
            {s.rating[key] === i && <Check size={12} />} {name}
          </button>
        ))}
      </div>
    </div>
  );
}
