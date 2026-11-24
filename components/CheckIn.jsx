"use client";
import React, { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  FileScan,
  ShieldCheck,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { useCare } from "./CareContext.jsx";
import { coverageOptions, languages } from "../lib/content.js";

export function CheckIn() {
  const { s, t, action, move } = useCare();
  const record = s.registration;
  const [editing, setEditing] = useState(record.status === "not-started");
  const [fields, setFields] = useState(record.fields);
  const [source, setSource] = useState(record.source);
  const [scanName, setScanName] = useState(record.scanName);
  const [assisted, setAssisted] = useState(record.assisted);
  const [caregiverName, setCaregiverName] = useState(record.caregiverName);
  const [relationship, setRelationship] = useState(record.relationship);
  const [caregiverAuthorized, setCaregiverAuthorized] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const update = (key, value) => setFields({ ...fields, [key]: value });

  if (!editing && record.status !== "not-started")
    return (
      <>
        <section className="card pad">
          <div className="titleline">
            <div className="symbol">
              <BadgeCheck size={21} />
            </div>
            <h2>
              {record.status === "verified"
                ? t("Registration verified", "Registro verificado", "登记已核实")
                : t("Registration received", "Registro recibido", "登记已提交")}
            </h2>
          </div>
          <p>
            {record.status === "verified"
              ? t(
                  "Registration is complete. You can now continue through your visit.",
                  "El registro está completo. Ya puedes continuar con tu visita.",
                  "登记已完成。你现在可以继续后续就诊流程。",
                )
              : t(
                  "Your information has been sent to hospital registration for verification.",
                  "Tu información se envió al registro del hospital para verificación.",
                  "你的信息已发送至医院登记处等待核实。",
                )}
          </p>
          <dl className="summarygrid">
            <div>
              <dt>{t("Patient", "Paciente", "患者")}</dt>
              <dd>{record.fields.fullName}</dd>
            </div>
            <div>
              <dt>{t("Date of birth", "Fecha de nacimiento", "出生日期")}</dt>
              <dd>{record.fields.birthDate}</dd>
            </div>
            <div>
              <dt>{t("Phone", "Teléfono", "电话")}</dt>
              <dd>{record.fields.phone}</dd>
            </div>
            <div>
              <dt>{t("Coverage", "Cobertura", "保险")}</dt>
              <dd>{t(...coverageOptions[record.fields.coverage])}</dd>
            </div>
            {record.fields.insurerName && (
              <div>
                <dt>{t("Insurance provider", "Proveedor de seguro", "保险提供方")}</dt>
                <dd>{record.fields.insurerName}</dd>
              </div>
            )}
            <div>
              <dt>{t("Preferred language", "Idioma preferido", "首选语言")}</dt>
              <dd>{languages[record.fields.preferredLanguage]}</dd>
            </div>
            <div>
              <dt>{t("Visit ID", "ID de visita", "就诊编号")}</dt>
              <dd>{record.visitId}</dd>
            </div>
            <div>
              <dt>{t("Entry method", "Método de ingreso", "录入方式")}</dt>
              <dd>
                {record.source === "scan"
                  ? t("Document provided", "Documento proporcionado", "已提供证件")
                  : t("Manual entry", "Ingreso manual", "手动录入")}
              </dd>
            </div>
          </dl>
          <div className="actions">
            {record.status !== "verified" && (
              <button className="light" onClick={() => setEditing(true)}>
                {t("Edit information", "Editar información", "修改信息")}
              </button>
            )}
            {record.status === "verified" ? (
              <button className="primary" onClick={() => move("symptoms")}>
                {t("Continue to symptoms", "Continuar a síntomas", "继续填写症状")}
                <ArrowRight size={16} />
              </button>
            ) : (
              <span className="pendingstatus" role="status">
                {t(
                  "Waiting for hospital verification. This page updates automatically.",
                  "Esperando la verificación del hospital. Esta página se actualiza automáticamente.",
                  "正在等待医院核实。本页面会自动更新。",
                )}
              </span>
            )}
          </div>
        </section>
      </>
    );

  return (
    <section className="card pad">
      <div className="titleline">
        <div className="symbol">
          <UserRoundCheck size={21} />
        </div>
        <h2>{t("Confirm your information", "Confirma tus datos", "确认个人信息")}</h2>
      </div>
      <p>
        {t(
          "Enter your registration details. You may also provide an ID or insurance document for staff review.",
          "Ingresa tus datos de registro. También puedes proporcionar un documento de identidad o seguro para revisión.",
          "请输入登记信息。你也可以提供身份证件或保险文件供工作人员审核。",
        )}
      </p>
      <div className="scanbox">
        <FileScan size={24} />
        <div>
          <strong>{t("ID or insurance document", "Documento de identidad o seguro", "身份证件或保险文件")}</strong>
          <small>
            {t(
              "Optional. The document name is added to the registration record for staff review.",
              "Opcional. El nombre del documento se agrega al registro para revisión.",
              "可选。文件名会添加到登记记录中供工作人员审核。",
            )}
          </small>
        </div>
        <label className="light filebutton">
          {t("Choose file", "Elegir archivo", "选择文件")}
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => {
              const name = e.target.files?.[0]?.name || "";
              setScanName(name);
              setSource(name ? "scan" : "manual");
            }}
          />
        </label>
        {scanName && <small className="wide">{scanName}</small>}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          action({
            type: "submit-registration",
            fields,
            source,
            scanName,
            assisted,
            caregiverName,
            relationship,
            caregiverAuthorized,
            confirmed,
          });
          if (
            confirmed &&
            fields.fullName &&
            fields.birthDate &&
            fields.phone &&
            fields.address &&
            fields.coverage &&
            (fields.coverage === "uninsured" ||
              (fields.insurerName && fields.memberId)) &&
            (!assisted || (caregiverName && caregiverAuthorized))
          )
            setEditing(false);
        }}
      >
        <div className="formgrid">
          <label className="field">
            <span>{t("Full name", "Nombre completo", "姓名")}</span>
            <input required value={fields.fullName} onChange={(e) => update("fullName", e.target.value)} />
          </label>
          <label className="field">
            <span>{t("Date of birth", "Fecha de nacimiento", "出生日期")}</span>
            <input type="date" required value={fields.birthDate} onChange={(e) => update("birthDate", e.target.value)} />
          </label>
          <label className="field">
            <span>{t("Phone", "Teléfono", "电话")}</span>
            <input required value={fields.phone} onChange={(e) => update("phone", e.target.value)} />
          </label>
          <label className="field">
            <span>{t("Street address", "Dirección", "地址")}</span>
            <input required value={fields.address} onChange={(e) => update("address", e.target.value)} />
          </label>
          <label className="field">
            <span>{t("Insurance coverage", "Cobertura médica", "保险类型")}</span>
            <select required value={fields.coverage} onChange={(e) => update("coverage", e.target.value)}>
              <option value="">{t("Select coverage", "Selecciona cobertura", "选择保险类型")}</option>
              {Object.entries(coverageOptions).map(([key, names]) => (
                <option key={key} value={key}>{t(...names)}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t("Insurance provider", "Proveedor de seguro", "保险提供方")}</span>
            <input required={fields.coverage !== "uninsured"} disabled={!fields.coverage || fields.coverage === "uninsured"} value={fields.insurerName} onChange={(e) => update("insurerName", e.target.value)} />
          </label>
          <label className="field">
            <span>{t("Member ID", "Número de miembro", "保险编号")}</span>
            <input required={fields.coverage !== "uninsured"} disabled={!fields.coverage || fields.coverage === "uninsured"} value={fields.memberId} onChange={(e) => update("memberId", e.target.value)} />
          </label>
          <label className="field">
            <span>{t("Preferred language", "Idioma preferido", "首选语言")}</span>
            <select value={fields.preferredLanguage} onChange={(e) => update("preferredLanguage", e.target.value)}>
              {Object.entries(languages).map(([key, name]) => <option key={key} value={key}>{name}</option>)}
            </select>
          </label>
        </div>
        <label className="checkrow">
          <input type="checkbox" checked={assisted} onChange={(e) => setAssisted(e.target.checked)} />
          <span><Users size={15} /> {t("A caregiver is helping with check-in", "Un acompañante ayuda con el registro", "由陪护人员协助登记")}</span>
        </label>
        {assisted && (
          <div className="formgrid inset">
            <label className="field">
              <span>{t("Caregiver name", "Nombre del acompañante", "陪护人姓名")}</span>
              <input required value={caregiverName} onChange={(e) => setCaregiverName(e.target.value)} />
            </label>
            <label className="field">
              <span>{t("Relationship", "Relación", "与患者关系")}</span>
              <input value={relationship} onChange={(e) => setRelationship(e.target.value)} />
            </label>
            <label className="checkrow wide">
              <input type="checkbox" required checked={caregiverAuthorized} onChange={(e) => setCaregiverAuthorized(e.target.checked)} />
              <span>{t("The patient authorized this assistance.", "El paciente autorizó esta ayuda.", "患者已授权此项协助。")}</span>
            </label>
          </div>
        )}
        <label className="checkrow">
          <input type="checkbox" required checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
          <span>{t("I reviewed these details and they are correct.", "Revisé estos datos y son correctos.", "我已核对以上信息，确认无误。")}</span>
        </label>
        <button className="primary">
          <ShieldCheck size={16} />
          {t("Submit for staff verification", "Enviar para verificación", "提交工作人员核实")}
        </button>
      </form>
    </section>
  );
}
