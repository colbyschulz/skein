import path from "path";
import { buildApp } from "./app.js";

const port = Number(process.env.PORT ?? 5174);

// process.cwd() is /app in the Docker container, so apps/web/dist is always reachable.
const staticDir =
  process.env.NODE_ENV === "production"
    ? (process.env.STATIC_DIR ?? path.join(process.cwd(), "apps/web/dist"))
    : undefined;

const app = buildApp({ staticDir });

app.listen({ port, host: "0.0.0.0" }).catch((err) => {
  console.error(err);
  process.exit(1);
});
