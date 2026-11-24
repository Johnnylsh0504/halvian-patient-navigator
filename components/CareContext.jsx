"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { blank, change, restore } from "../lib/model.js";
import { pick, screens } from "../lib/content.js";
const Care = createContext(null);
const key = "halvian.navigator.visit.v1";
export const useCare = () => useContext(Care);
export function CareProvider({ initialScreen, portable = false, children }) {
  const [s, dispatch] = useReducer(change, undefined, blank);
  const [ready, setReady] = useState(false),
    [screen, setScreen] = useState(initialScreen);
  const [staff, setStaff] = useState(false),
    [storageIssue, setStorageIssue] = useState(false);
  function action(a) {
    dispatch(a);
  }
  useEffect(() => {
    let saved;
    try {
      saved = restore(window.localStorage.getItem(key));
    } catch {
      saved = blank();
      setStorageIssue(true);
    }
    const handoffLanguage = new URLSearchParams(window.location.search).get(
      "lang",
    );
    if (["en", "es", "zh"].includes(handoffLanguage))
      saved = { ...saved, lang: handoffLanguage };
    dispatch({ type: "hydrate", saved });
    // Synchronize back/forward on both the portable file and the Next.js route.
    const readScreen = () => {
      const part = portable
        ? window.location.hash.slice(1)
        : window.location.pathname.split("/").filter(Boolean).at(-1);
      setScreen(screens.includes(part) ? part : initialScreen);
      setStaff(false);
    };
    readScreen();
    window.addEventListener("popstate", readScreen);
    setReady(true);
    return () => window.removeEventListener("popstate", readScreen);
  }, [initialScreen, portable]);
  useEffect(() => {
    if (ready) {
      try {
        window.localStorage.setItem(key, JSON.stringify(s));
      } catch {
        setStorageIssue(true);
      }
    }
  }, [s, ready]);
  useEffect(() => {
    if (ready)
      document.documentElement.lang = s.lang === "zh" ? "zh-CN" : s.lang;
  }, [s.lang, ready]);
  const t = (en, es, zh) => pick(s.lang, en, es, zh);
  function move(next) {
    if (!screens.includes(next)) return;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (next !== screen)
      window.history.pushState(
        {},
        "",
        portable ? "#" + next : "/navigator/" + next + "/",
      );
    setScreen(next);
    setStaff(false);
    window.scrollTo(0, 0);
  }
  function toggleStaff() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setStaff(!staff);
    window.scrollTo(0, 0);
  }
  function language(value) {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    action({ type: "lang", lang: value });
  }
  function reset() {
    if (
      window.confirm(
        t(
          "Restart this fictional visit and clear its demo activity?",
          "¿Reiniciar esta visita ficticia y borrar su actividad?",
          "重新开始这次虚构就诊并清除演示记录？",
        ),
      )
    ) {
      action({ type: "reset" });
      move("assistant");
    }
  }
  return (
    <Care.Provider
      value={{
        s,
        t,
        action,
        ready,
        screen,
        move,
        staff,
        toggleStaff,
        language,
        reset,
        storageIssue,
      }}
    >
      {children}
    </Care.Provider>
  );
}
