// Entry point. The app itself lives in server/ — see server/index.ts for the
// wiring and server/functions/ for the capability surface.
import { startServer } from "./server/index";

startServer().catch((e) => {
  console.error("Carrier Hub startup failed:", e);
  process.exit(1);
});
