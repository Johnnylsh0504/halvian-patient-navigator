import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("..", import.meta.url));
const js = await build({
  absWorkingDir: root,
  entryPoints: ["scripts/portable-entry.jsx"],
  write: false,
  bundle: true,
  minify: true,
  jsx: "automatic",
  legalComments: "none",
  define: { "process.env.NODE_ENV": '"production"' },
});
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
const script = js.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const page =
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Fictional patient communication and follow-up demo"><title>Halvian | Patient Navigator</title><style>' +
  faces.join("") +
  css +
  '</style></head><body><div id="root"></div><script>' +
  script +
  "</script></body></html>";
const output = new URL("../dist/", import.meta.url);
await mkdir(output, { recursive: true });
await writeFile(new URL("Halvian-Demo.html", output), page);
console.log("Built dist/Halvian-Demo.html");
