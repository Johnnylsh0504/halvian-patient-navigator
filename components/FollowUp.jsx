"use client";
import React, { useState } from "react";
import {
  Bell,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  MapPin,
  Phone,
  Printer,
} from "lucide-react";
import { useCare } from "./CareContext.jsx";
import { asTime, barriers, prettyDate, slots } from "../lib/content.js";
export function FollowUp() {
  const { s, t, action } = useCare(),
    [selection, setSelection] = useState(null),
    [editing, setEditing] = useState(false),
    [barrier, setBarrier] = useState("");
  const booked = s.slot === null ? null : slots[s.slot],
    done = s.attended !== null;
  const available = slots
    .map((slot, index) => ({ slot, index }))
    .filter(({ slot }) => slot.day > s.day);
  return (
    <>
      <section className="card pad printable">
        <div className="titleline">
          <div className="symbol">
            <CalendarDays size={21} />
          </div>
          <h2>
            {t(
              "Your clinic appointment",
              "Tu cita en la clínica",
              "你的门诊预约",
            )}
          </h2>
        </div>
        <div className="location">
          <MapPin size={17} />
          <span>Halvian Family Clinic</span>
          <span className="tag">
            {t("By Dec 8", "Hasta el 8 dic", "最迟 12 月 8 日")}
          </span>
        </div>
        {booked && !editing ? (
          <>
            <div className="booking">
              <CheckCircle2 size={25} />
              <div>
                <strong>
                  {done
                    ? t("Visit completed", "Visita completada", "已完成复诊")
                    : t("Appointment booked", "Cita reservada", "已预约")}
                </strong>
                <p>
                  {prettyDate(booked.iso, s.lang)} · {asTime(booked, s.lang)}
                </p>
              </div>
            </div>
            {!done && available.some(({ index }) => index !== s.slot) && (
              <button
                className="light"
                onClick={() => {
                  setSelection(s.slot);
                  setEditing(true);
                }}
              >
                {t("Change time", "Cambiar hora", "更改时间")}
              </button>
            )}
          </>
        ) : (
          <>
            <p>
              {t(
                "Choose a time within 14 days of discharge.",
                "Elige una cita dentro de 14 días del alta.",
                "请选择出院后 14 天内的复诊时间。",
              )}
            </p>
            <div className="slotgrid">
              {available.map(({ slot, index }) => (
                <button
                  className={"slot " + (selection === index ? "chosen" : "")}
                  key={slot.iso}
                  aria-pressed={selection === index}
                  onClick={() => setSelection(index)}
                >
                  <span>{prettyDate(slot.iso, s.lang, true)}</span>
                  <b>{asTime(slot, s.lang)}</b>
                </button>
              ))}
            </div>
            {available.length > 0 ? (
              <div className="actions">
                <button
                  className="primary"
                  disabled={
                    selection === null ||
                    !available.some((x) => x.index === selection)
                  }
                  onClick={() => {
                    action({ type: "book", index: selection });
                    setEditing(false);
                  }}
                >
                  <CalendarCheck size={16} />
                  {t("Confirm appointment", "Confirmar cita", "确认预约")}
                </button>
                {editing && (
                  <button className="light" onClick={() => setEditing(false)}>
                    {t("Cancel", "Cancelar", "取消")}
                  </button>
                )}
              </div>
            ) : (
              <p>
                {t(
                  "These appointment times have passed. A coordinator can help below.",
                  "Estos horarios ya pasaron. Pide ayuda abajo.",
                  "这些预约时间已过。可在下方请求协调员协助。",
                )}
              </p>
            )}
          </>
        )}
        {booked && (
          <div className="reminders">
            <label htmlFor="reminder">
              <Bell size={16} />
              {t(
                "Reminder preference",
                "Preferencia de recordatorio",
                "提醒偏好",
              )}
            </label>
            <select
              id="reminder"
              value={s.reminder}
              onChange={(e) =>
                action({ type: "reminder", value: e.target.value })
              }
            >
              {[
                ["none", t("No reminder", "Sin recordatorio", "不需要提醒")],
                ["text", t("Text message", "Mensaje de texto", "短信提醒")],
                ["call", t("Phone call", "Llamada telefónica", "电话提醒")],
                [
                  "paper",
                  t(
                    "Printed appointment card",
                    "Tarjeta impresa",
                    "纸质预约卡",
                  ),
                ],
              ].map(([k, n]) => (
                <option value={k} key={k}>
                  {n}
                </option>
              ))}
            </select>
            {s.reminder === "paper" ? (
              <button className="light" onClick={() => window.print()}>
                <Printer size={15} />
                {t("Print card", "Imprimir tarjeta", "打印预约卡")}
              </button>
            ) : (
              s.reminder !== "none" && (
                <small>
                  {t(
                    "Reminder scheduled for one day before the appointment.",
                    "Recordatorio programado un día antes de la cita.",
                    "提醒安排在预约前一天发送。",
                  )}
                </small>
              )
            )}
            {["text", "call"].includes(s.reminder) && (
              <p className="reminder-preview">
                {t("Reminder preview", "Vista previa", "提醒预览")} ·{" "}
                {t(
                  "Your visit at Halvian Family Clinic is on",
                  "Tu cita en Halvian Family Clinic es el",
                  "你在 Halvian 家庭诊所的复诊时间为",
                )}{" "}
                {prettyDate(booked.iso, s.lang)} {asTime(booked, s.lang)}.
              </p>
            )}
          </div>
        )}
      </section>
      <section className="card pad">
        <div className="titleline">
          <div className="symbol peach">
            <HeartHandshake size={21} />
          </div>
          <h2>{t("I need help", "Necesito ayuda", "我需要帮助")}</h2>
        </div>
        <p>
          {t(
            "What might get in the way of your visit? Your coordinator can help.",
            "¿Qué te dificulta acudir? Coordinación puede ayudarte.",
            "有什么困难可能影响你复诊？协调员可以协助。",
          )}
        </p>
        <div className="choice-row">
          {Object.entries(barriers).map(([k, v]) => (
            <button
              aria-pressed={barrier === k}
              className={"choice " + (barrier === k ? "chosen" : "")}
              key={k}
              onClick={() => {
                setBarrier(k);
              }}
            >
              {t(...v)}
            </button>
          ))}
        </div>
        <button
          className="primary"
          disabled={
            !barrier ||
            s.tickets.some(
              (q) =>
                q.kind === barrier && q.status === "open" && q.lang === s.lang,
            )
          }
          onClick={() => {
            action({ type: "ticket", kind: barrier, owner: "coord" });
          }}
        >
          <HeartHandshake size={16} />
          {t(
            "Request coordinator help",
            "Pedir ayuda a coordinación",
            "请求协调员协助",
          )}
        </button>
        {barrier &&
          s.tickets.some(
            (q) =>
              q.kind === barrier && q.lang === s.lang && q.status === "open",
          ) && (
            <p role="status" className="verified">
              <CheckCircle2 size={15} />
              {t(
                "Request received. Track the reply in My requests.",
                "Solicitud recibida. Revisa Mis solicitudes.",
                "请求已接收，请在「我的请求」查看回复。",
              )}
            </p>
          )}
      </section>
    </>
  );
}
