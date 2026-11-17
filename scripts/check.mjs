// Quick checks run in CI and before a release: `npm run check`.
// Fails if a data file is not valid JSON, a script has a syntax error,
// a local link or asset in the HTML is missing, or the server does not start.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { execFileSync, spawn } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const fail = (msg) => failures.push(msg);

// 1. JSON data and manifest parse
for (const f of [
  ...readdirSync(join(root, "public/data")).filter((n) => n.endsWith(".json")).map((n) => `public/data/${n}`),
  "public/manifest.webmanifest",
]) {
  try { JSON.parse(readFileSync(join(root, f), "utf8")); }
  catch (e) { fail(`${f}: invalid JSON (${e.message})`); }
}

// 2. JavaScript syntax
for (const f of ["public/app.js", "public/notes.js", "server.mjs", "scripts/check.mjs"]) {
  try { execFileSync(process.execPath, ["--check", join(root, f)], { stdio: "pipe" }); }
  catch (e) { fail(`${f}: syntax error\n${e.stderr}`); }
}

// 3. Local links and assets in the HTML. site/ is served with public/ at play/, as on GitHub Pages.
const pages = { "public/index.html": "public", "public/checklist.html": "public", "site/index.html": "site" };
for (const [page, base] of Object.entries(pages)) {
  const html = readFileSync(join(root, page), "utf8");
  for (const [, ref] of html.matchAll(/(?:href|src)="([^"#?]+)/g)) {
    if (/^[a-z]+:/i.test(ref) || ref.startsWith("//")) continue;
    let target = join(root, base, ref);
    if (base === "site" && ref.startsWith("play/")) target = join(root, "public", ref.slice(5));
    if (ref.endsWith("/")) target = join(target, "index.html");
    if (!existsSync(target)) fail(`${page}: links to ${ref}, which does not exist`);
  }
}

// 4. The server starts and serves the game, the project page and /health
const port = 18000 + Math.floor(Math.random() * 1000);
const server = spawn(process.execPath, [join(root, "server.mjs")], {
  env: { ...process.env, PORT: String(port), HOST: "127.0.0.1" },
  stdio: "ignore",
});
try {
  let up = false;
  for (let i = 0; i < 50 && !up; i++) {
    await new Promise((r) => setTimeout(r, 100));
    up = await fetch(`http://127.0.0.1:${port}/health`).then((r) => r.ok, () => false);
  }
  if (!up) fail("server did not answer /health within 5 seconds");
  else {
    for (const path of ["/", "/checklist.html", "/about/", "/about/play/"]) {
      const res = await fetch(`http://127.0.0.1:${port}${path}`);
      if (!res.ok) fail(`server: ${path} returned ${res.status}`);
    }
  }
} finally {
  server.kill();
}

if (failures.length) {
  console.error(`${failures.length} check(s) failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log("All checks passed.");
