// Serves the Worth a Look static app. No outbound requests: photos load in the
// viewer's browser straight from the ISIC Archive.
import express from "express";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.PORT || 8140);
const HOST = process.env.HOST || "0.0.0.0";
const app = express();

app.disable("x-powered-by");
app.get("/health", (_req, res) => res.json({ ok: true }));
const dir = (d) => fileURLToPath(new URL(d, import.meta.url));
app.use(express.static(dir("./public"), { maxAge: 0 }));
// The project page, laid out the way GitHub Pages serves it: page at /about/, game at /about/play/.
app.use("/about/play", express.static(dir("./public"), { maxAge: 0 }));
app.use("/about", express.static(dir("./site"), { maxAge: 0 }));

app.listen(PORT, HOST, () => console.log(`worth-a-look on ${HOST}:${PORT}`));
