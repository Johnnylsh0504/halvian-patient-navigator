import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("..", import.meta.url));
const bundle = async (entryPoint) => {
  const result = await build({
    absWorkingDir: root,
    entryPoints: [entryPoint],
    write: false,
    bundle: true,
    minify: true,
    jsx: "automatic",
    legalComments: "none",
    define: { "process.env.NODE_ENV": '"production"' },
  });
  return result.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
};
const css = await readFile(
  new URL("../app/globals.css", import.meta.url),
  "utf8",
);
const faces = await Promise.all(
  [400, 500, 600, 700].map(async (weight) => {
    const filename = "dm-sans-latin-" + weight + "-normal.woff2";
    const b = await readFile(
      new URL(
        "../node_modules/@fontsource/dm-sans/files/" + filename,
        import.meta.url,
      ),
    );
    return (
      "@font-face{font-family:'DM Sans';font-style:normal;font-weight:" +
      weight +
      ";font-display:swap;src:url(data:font/woff2;base64," +
      b.toString("base64") +
      ") format('woff2')}"
    );
  }),
);
const makePage = (script, title, description) =>
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="' +
  description +
  '"><title>' +
  title +
  "</title><style>" +
  faces.join("") +
  css +
  '</style></head><body><div id="root"></div><script>' +
  script +
  "</script></body></html>";
const [patientScript, hospitalScript] = await Promise.all([
  bundle("scripts/portable-entry.jsx"),
  bundle("scripts/portable-hospital-entry.jsx"),
]);
const patientPage = makePage(
  patientScript,
  "Halvian | Patient Experience",
  "Emergency department patient experience",
);
const hospitalPage = makePage(
  hospitalScript,
  "Halvian | Hospital Workspace",
  "Emergency department hospital operations workspace",
);
const output = new URL("../dist/", import.meta.url);
await mkdir(output, { recursive: true });
await Promise.all([
  writeFile(new URL("Halvian-Patient.html", output), patientPage),
  writeFile(new URL("Halvian-Hospital.html", output), hospitalPage),
]);
console.log("Built separate patient and hospital portable files in dist/");
