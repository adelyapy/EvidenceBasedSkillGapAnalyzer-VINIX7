import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

test("M5 live script requires a separate explicit opt-in and never reads a key without it", () => {
  const output = execFileSync(process.execPath, ["--conditions=react-server", "--import", "tsx", "scripts/test-validation-live.mts"], {
    cwd: process.cwd(), timeout: 10_000, encoding: "utf8",
    env: { ...process.env, BUKTIVA_RUN_LIVE_VALIDATION_TEST: "0", BUKTIVA_RUN_LIVE_GEMINI_TEST: "1", GEMINI_API_KEY: "", GEMINI_MODEL: "" },
  });
  assert.deepEqual(JSON.parse(output.trim()), { status: "LIVE_VALIDATION_NOT_RUN", reason: "OPT_IN_DISABLED" });
});
