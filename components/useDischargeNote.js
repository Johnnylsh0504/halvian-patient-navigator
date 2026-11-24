"use client";
import { useCallback, useEffect, useState } from "react";
import { readNote, updateNote } from "../lib/discharge.js";

// Each encounter has its own signed record, independent of the shared intake state.
const updates = "halvian-discharge-change";
const storageKey = (visitId, verifiedAt) => "halvian.discharge.v1." + visitId + "." + verifiedAt;

export function useDischargeNote(visitId, verifiedAt) {
  const key = visitId && verifiedAt ? storageKey(visitId, verifiedAt) : "";
  const [snapshot, setSnapshot] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    setError(false);
    if (!key) { setSnapshot(null); return; }
    function read() {
      try {
        setSnapshot({ key, note: readNote(window.localStorage.getItem(key), visitId) });
        setError(false);
      } catch { setSnapshot(null); setError(true); }
    }
    function onStorage(event) {
      if (event.key === key || event.key === null) read();
    }
    function onUpdate(event) {
      if (event.detail === key) read();
    }
    read();
    window.addEventListener("storage", onStorage);
    window.addEventListener(updates, onUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(updates, onUpdate);
    };
  }, [key, visitId]);
  const save = useCallback(async (event) => {
    if (!key) return;
    function write() {
      const original = readNote(window.localStorage.getItem(key), visitId);
      const next = updateNote(original, visitId, event);
      if (next !== original) window.localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(updates, { detail: key }));
    }
    try {
      if (navigator.locks) await navigator.locks.request(key, write);
      else write();
      setError(false);
    } catch { setError(true); }
  }, [key, visitId]);
  // A previously selected patient's snapshot can never be displayed while the new one loads.
  return { note: snapshot?.key === key ? snapshot.note : null, save, error };
}
