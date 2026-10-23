import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

test("manual live script stops before imports/network when opt-in is disabled", () => {
  const output = execFileSync(process.execPath, ["--conditions=react-server", "--import", "tsx",
    "scripts/test-skill-extraction-live.mts"], {
    cwd: process.cwd(), timeout: 10_000, encoding: "utf8",
    env: { ...process.env, BUKTIVA_RUN_LIVE_GEMINI_TEST: "0", GEMINI_API_KEY: "", GEMINI_MODEL: "" },
  });
  assert.deepEqual(JSON.parse(output.trim()), { status: "LIVE_GENERATION_BLOCKED", reason: "OPT_IN_DISABLED" });
});
