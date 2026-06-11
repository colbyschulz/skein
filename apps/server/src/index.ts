import path from "path";
import { fileURLToPath } from "url";
import { buildApp } from "./app.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT ?? 5174);

// In production the bundle is at apps/server/dist/index.js, so
// ../../apps/web/dist resolves to the Vite build output.
const staticDir =
  process.env.NODE_ENV === "production"
    ? (process.env.STATIC_DIR ?? path.join(__dirname, "../../apps/web/dist"))
    : undefined;

const app = buildApp({ staticDir });

app.listen({ port, host: "0.0.0.0" }).catch((err) => {
  console.error(err);
  process.exit(1);
});
