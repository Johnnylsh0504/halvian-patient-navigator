"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Mic,
  Square,
  Volume2,
  Flag,
  HeartHandshake,
} from "lucide-react";
import { speechLang } from "../lib/content.js";
import { useCare } from "./CareContext.jsx";
export function Dictate({ onText }) {
  const { s, t } = useCare(),
    [listening, setListening] = useState(false),
    [msg, setMsg] = useState(""),
    rec = useRef(null);
  useEffect(
    () => () => {
      if (rec.current) {
        rec.current.onend = null;
        rec.current.abort();
      }
    },
    [s.lang],
  );
  function start() {
    if (listening) {
      rec.current?.stop();
      return;
    }
    const API = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!API) {
      setMsg(
        t(
          "Voice input is unavailable in this browser. Type your question below.",
          "Este navegador no admite dictado. Escribe tu pregunta.",
          "此浏览器无法语音输入，请打字。",
        ),
      );
      return;
    }
    const r = new API();
    rec.current = r;
    r.lang = speechLang[s.lang];
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (e) => {
      onText(e.results[0][0].transcript);
      setMsg(
        t(
          "Review the transcript before sending.",
          "Revisa el texto antes de enviarlo.",
          "请先核对语音转写，再发送。",
        ),
      );
    };
    r.onerror = () => {
      setListening(false);
      setMsg(
        t(
          "Microphone unavailable. You can type instead.",
          "Micrófono no disponible. Puedes escribir.",
          "麦克风不可用，请打字。",
        ),
      );
    };
    r.onend = () => setListening(false);
    try {
      r.start();
      setListening(true);
      setMsg(t("Listening…", "Escuchando…", "正在聆听…"));
    } catch {
      r.onerror();
    }
  }
  return (
    <span className="voice-group">
      <button
        type="button"
        className="iconbtn"
        onClick={start}
        title={t("Dictate", "Dictar", "语音输入")}
        aria-label={t("Dictate", "Dictar", "语音输入")}
      >
        {listening ? <Square size={17} /> : <Mic size={18} />}
      </button>
      {msg && <small role="status">{msg}</small>}
    </span>
  );
}
export function Composer({ onSend, label, placeholder, caption }) {
  const { t } = useCare(),
    [value, setValue] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSend(value.trim());
      setValue("");
    }
  };
  return (
    <form className="composer" onSubmit={submit}>
      <label className="fieldlabel" htmlFor="typed-message">
        {label}
      </label>
      <div className="inputrow">
        <input
          id="typed-message"
          autoComplete="off"
          maxLength={480}
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
        />
        <Dictate onText={setValue} />
        <button
          className="send"
          aria-label={t("Send", "Enviar", "发送")}
          disabled={!value.trim()}
        >
          <ArrowUp size={19} />
        </button>
      </div>
      {caption && <small>{caption}</small>}
    </form>
  );
}
export function Listen({ value }) {
  const { s, t } = useCare(),
    [msg, setMsg] = useState(""),
    [playing, setPlaying] = useState(false);
  useEffect(() => {
    setMsg("");
    setPlaying(false);
    return () => window.speechSynthesis?.cancel();
  }, [s.lang, value]);
  function speak() {
    if (playing) {
      window.speechSynthesis?.cancel();
      setPlaying(false);
      return;
    }
    if (!window.speechSynthesis) {
      setMsg(
        t(
          "Audio is unavailable here. You can read or print the text.",
          "No hay audio disponible. Puedes leer o imprimir el texto.",
          "此设备无法朗读，可阅读或打印文字。",
        ),
      );
      return;
    }
    const service = window.speechSynthesis,
      voices = service.getVoices();
    const voice = voices.find((v) => v.lang.toLowerCase().startsWith(s.lang));
    if (voices.length && !voice) {
      setMsg(
        t(
          "This device has no voice for this language. The full text is shown.",
          "Este dispositivo no tiene voz para este idioma. Puedes leer el texto.",
          "此设备未安装此语言的语音，可阅读完整文字。",
        ),
      );
      return;
    }
    const u = new SpeechSynthesisUtterance(value);
    u.lang = speechLang[s.lang];
    if (voice) u.voice = voice;
    u.onend = () => setPlaying(false);
    u.onerror = () => {
      setPlaying(false);
      setMsg(
        t(
          "Audio unavailable on this device.",
          "Audio no disponible en este dispositivo.",
          "此设备无法播放语音。",
        ),
      );
    };
    try {
      service.cancel();
      service.speak(u);
      setPlaying(true);
      setMsg("");
    } catch {
      u.onerror();
    }
  }
  return (
    <span className="inline-action">
      <button className="light" onClick={speak}>
        {playing ? <Square size={15} /> : <Volume2 size={16} />}{" "}
        {playing
          ? t("Stop", "Detener", "停止")
          : t("Listen", "Escuchar", "朗读")}
      </button>
      {msg && <small role="status">{msg}</small>}
    </span>
  );
}
export function HelpAction({
  kind = "staff",
  note = "",
  owner = "nurse",
  children,
}) {
  const { s, t, action } = useCare();
  const pending = s.tickets.find(
    (x) =>
      x.kind === kind &&
      x.note === note &&
      x.lang === s.lang &&
      x.status === "open",
  );
  return (
    <button
      className="textbtn"
      disabled={!!pending}
      onClick={() => action({ type: "ticket", kind, note, owner })}
    >
      {kind === "feedback" ? <Flag size={14} /> : <HeartHandshake size={15} />}{" "}
      {pending
        ? t("Sent to staff", "Enviado al equipo", "已通知工作人员")
        : children}
    </button>
  );
}
