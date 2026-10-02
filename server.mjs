// Serves the Skinder static app. No outbound requests: photos load in the
// viewer's browser straight from the ISIC Archive.
import express from "express";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.PORT || 8140);
const HOST = process.env.HOST || "0.0.0.0";
const app = express();

app.disable("x-powered-by");
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use(express.static(fileURLToPath(new URL("./public", import.meta.url)), { maxAge: 0 }));

app.listen(PORT, HOST, () => console.log(`skinder on ${HOST}:${PORT}`));
