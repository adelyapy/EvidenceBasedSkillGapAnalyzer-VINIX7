# Milestone 5 — Five-question validation and competency evaluation

Decision: **PASS WITH CONDITIONS** for internal offline use.
**OFFLINE IMPLEMENTATION COMPLETE. LIVE VALIDATION NOT RUN (OPT_IN_DISABLED).**
Supabase/Auth/RLS live integration remains **BLOCKED / NOT VERIFIED**.

## 1. Purpose and workspace audit

M5 evaluates five submitted answers against the existing questions, a versioned
MVP rubric and safe M4 project evidence. It produces `ValidationEvaluationResult`
and provisional competence statuses. Answer quality, evidence alignment,
provisional competency and readiness are separate concepts. No final readiness,
numeric skill level, gap report or roadmap is produced.

The workspace already contained uncommitted M1–M4 source, docs, tests, scripts,
package.json and package-lock changes. They were preserved. M5 adds files and two
package scripts, without adding dependencies or changing the M1–M4 implementations.
The existing `@google/genai` 2.30.0 transport and M4 abstraction are reused.
No frontend, authentication, schema, RLS, migration, environment or public route was changed.
No commit, push or deployment was performed.

Contract audit: M3's server `AnalysisInput` is defined in `types/analysis-input.ts`;
the older browser type in `types/analysis.ts` is a different demo contract and is
not used here. Analysis/evidence/user IDs are UUIDs; benchmark skill IDs are exact
int8 strings. M4 candidate references carry evidenceId/fileRef/path/exact quote.
M4 prompt version is validated through its existing schema; its dataset version,
coverage and warnings are preserved separately from the new M5 prompt version.
Blocked/failed M4 cannot enter evaluation; partial coverage never becomes complete.

M4 did not attempt a new live request: its opt-in was disabled. Earlier 503/504
reports belong to M1 and are not new M4/M5 provider results.

## 2. Actual five questions and current UI limitations

Source of truth: `src/components/validation/questions.ts`. These texts are reused
by the server catalog without editing the UI.

| Order | Exact existing question | Evaluation purpose | Dimensions |
|---|---|---|---|
| 1 | Jelaskan arsitektur sistem yang Anda gunakan dalam project ini. Mengapa Anda memilih arsitektur tersebut? | Architecture and design rationale | Relevance, technical accuracy, evidence consistency |
| 2 | Apa peran dan tanggung jawab Anda dalam proyek ini? Jelaskan bagian yang Anda kerjakan sendiri. | Claimed role and contribution boundaries | Relevance, contribution clarity |
| 3 | Teknologi atau tools apa yang Anda gunakan dalam proyek ini? Jelaskan alasan Anda memilihnya. | Technology selection and rationale | Relevance, technical accuracy, evidence consistency |
| 4 | Apa kendala terbesar yang Anda hadapi selama mengerjakan proyek ini? Jelaskan langkah yang Anda lakukan untuk mengatasinya. | Problem solving and technical explanation | Relevance, technical accuracy, evidence consistency |
| 5 | Apa hasil dari proyek yang Anda kerjakan dan bagaimana Anda memastikan hasilnya sesuai tujuan? Berikan contoh pengujian atau umpan balik yang Anda terima. | Outcomes, verification and testing/feedback | Relevance, technical accuracy, evidence consistency |

Questions are static, ordered 1–5, not generated adaptively. `ValidationPage.tsx`
stores answers under numeric step keys in `sessionStorage` at
`buktiva.validation.answers`, without analysis ownership. It enforces a nonblank
current answer and textarea maxLength=1000, but no meaningful minimum word count.
Submitting step 5 sets `buktiva.validation.completed` without checking steps 1–4.
The dynamic route checks only whether the step is 1–5: opening step 5 directly is
possible. Demo results are not real M5 evaluation. M5's server entry point cannot
be bypassed with a fifth-only submission; the browser remains unchanged and is not
connected to this service.

PRD F-13/US-06 specifies five questions and temporary frontend answers. PRD/README
describe simulated results; they provide no official scoring rubric, weights or
verified level estimation. Consequently the new scale and status policy are
**proposed MVP assumptions requiring team review**, not approved competency standards.

## 3. New files and changed files

- `src/types/validation-evaluation.ts`: strict Zod input, model and result contracts.
- `src/data/ai/validation-rubrics.json`: proposed version `1.0.0` rubric.
- `src/lib/ai/validation/question-catalog.ts`: canonical text and analysis-bound IDs.
- `rubrics.ts`, `errors.ts`: validated rubric and content-free error codes.
- `answer-preprocessor.ts`: five-answer checks and safety policy.
- `question-context-builder.ts`: M3/M4 reconciliation, safe evidence and reviewed mapping.
- `answer-prompt.ts`: trusted instructions/rubric and narrow provider JSON schema.
- `answer-evaluator.ts`: existing M4 Gemini adapter reuse.
- `answer-output-validator.ts`: structural and relational checks, deterministic subtotal.
- `competency-assessment.ts`: conservative provisional statuses, without skill levels.
- `validation-service.ts`: server-only orchestration, no persistence.
- `tests/validation/`: contracts/context/output/service/competency/live-guard tests,
  synthetic fixtures and `golden-cases.json`.
- `scripts/test-validation-live.mts`: manual opt-in diagnostic.

The module basenames above live in `src/lib/ai/validation/`.
Only existing `package.json` is edited for M5, adding `test:validation` and
`test:validation:live`. Existing package-lock modifications predate M5.

## 4. Question/answer contract and server boundary

`ValidationQuestion`: questionId UUID, analysisId UUID, order 1–5, questionText,
optional evidenceContext. `ValidationAnswer`: questionId and answerText.
`ValidationSubmission`: analysisId, exactly five questions and five answers.

Zod and the preprocessor reject duplicate/missing/unknown question IDs, duplicate
orders, duplicate answers, empty answers, wrong analysis relationships and extra
properties. Answers are limited before normalization to 1000 JavaScript UTF-16 code
units (matching the UI), 4000 UTF-8 bytes each and 20000 bytes total. Short technical
answers remain valid. CRLF/CR become LF and outer whitespace is trimmed; internal
indentation, spacing, code and punctuation are preserved. Length is not a score.

`createValidationQuestions(analysisId)` derives UUID v5 identities from the URL
namespace and `buktiva-validation-v1:<analysisId>:<order>`. IDs are stable within the
analysis and distinct across analyses. The server rechecks exact ID, order and
question text against this catalog. Client-supplied evidenceContext is rejected;
the optional field is reserved for a future authenticated question repository.
Database question UUIDs will require an explicit owned-row/catalog adapter later;
arbitrary database IDs are not silently accepted by this version.

This is an internal server library, not a new authenticated API. The caller must
authenticate through M3, verify analysis ownership, retain M4 results server-side,
and never trust a client-supplied userId, M4 snapshot or reviewed mapping. Equality
of analysis IDs is a relationship check, not proof of authorization. No DB writes
or reads occur in M5.

## 5. Rubric and scoring assumptions

Rubric version `1.0.0`, extraction dataset `buktiva-local-rubrics-1.0.0`, status
`mvp_proposed`. Strict Zod validates all four dimensions, exactly five question
purposes, level indicators 0–4, ranges, unique dimensions and fixed mappings.
Missing/malformed rubrics, fabricated weight fields or dataset mismatches block.
Each dimension defines its description, five level indicators and not-assessable rule.

The scale measures explanation quality only. Relevance considers whether the answer
addresses the question. Technical accuracy considers checkable technical reasoning.
Evidence consistency compares a specific claim to an actual excerpt. Contribution
clarity considers the claimed role's boundaries, not proof of authorship.
Question 2 intentionally excludes technical accuracy/evidence consistency, and its
authorship alignment is always insufficient_evidence.

No weights or cross-question total are defined. The raw per-question subtotal is
computed in code as the sum of assessed dimension scores; maxScore is four times
the assessed dimension count. Configured/assessed counts remain visible. All
not_assessable dimensions produce score=null and subtotal=null/maxScore=0; absence
of evidence is not a zero competency rating. Subtotals with different denominators
must not be compared as readiness percentages. A provider failure has no evaluations,
not five zero scores.

## 6. Context builder, evidence and reviewed skill mapping

`buildQuestionContext` revalidates M3/M4/question schemas and equal analysis IDs,
requires usable M4 status, loads matching versions, and reconstructs M4's safe
Evidence Index using `prepareEvidence`. M4 skill IDs and citations are revalidated
against the input/index with M4's existing semantic validator. Coverage and warnings
must reproduce exactly; a partial reconstructed source cannot claim completed M4.
If M4 used tighter budgets, supply the same trusted `evidenceLimits` to reproduce
the snapshot. Missing evidence or stale/forged snapshots block evaluation.

Original evidenceId, canonical paths, fileRefs, origin/revision and partial coverage
are retained. Two repositories with the same relative path remain distinct.
M4 limits remain 12 files, 12 KiB per file and 64 KiB total content. Only prepared
safe evidence is sent; repository code is never executed.

There is no approved question-to-skill mapping in the workspace. By default every
question has empty relatedSkillIds. Optional `reviewedMapping` is trusted server
configuration, explicitly labelled `reviewed-server-mapping`, with unique orders
and official IDs. It must be reviewed for the actual evidence/question context,
not copied from the synthetic fixture. Question 2 cannot be assigned a skill.
Model/submission attempts to introduce mapping are rejected. Generic answers can
still be evaluated against project evidence without inventing a skill association.

## 7. Preprocessor, prompt and provider

Known secret/credential patterns, email addresses, private user/analysis identifiers,
known prompt injection phrases, unsafe control/bidi characters and lone surrogates
cause rejection of the entire submission before provider invocation. Raw answers
are not logged. This is a heuristic gate, not a complete PII/secret detector.

Prompt version `buktiva-validation-1.0.0`. System rules and trusted rubric are
separate from JSON labelled `UNTRUSTED_ANSWERS_AND_PROJECT_DATA`. The data includes
official question texts, answerText/answerRef, reviewed skill associations, safe M4
candidates/references and bounded evidence. CV, userId and analysisId are excluded.
answerRef is a truncated SHA-256 digest binding questionId to the normalized answer;
it is an internal consistency handle, not an anonymization guarantee or signature.

Instructions distinguish contradicted claims from missing evidence, prohibit
authorship/mastery assumptions and length/style bias, and require plain-text feedback.
Exact answer excerpts bind feedback to an answer. The prompt budget is 160 KiB
including rubric, repeated M4 citations, contents and response schema; oversized
requests block before calling the provider. A bounded valid M4 result can still
exceed the M5 prompt budget; this is explicit rather than silent truncation.

The M4 provider abstraction invokes the same M1 `gemini.ts` and official installed
SDK, using application/json and responseJsonSchema. The narrow manual JSON schema
avoids exporting int8 transforms to provider schemas; local Zod remains authoritative.
No second SDK or fallback model is added. Default: 30 seconds per attempt, two
attempts for 503/504 only, 250 ms backoff (approximately 60.25 seconds for requests,
excluding local processing). 429/permanent/empty/oversized errors do not retry.
Blocked provider text without a result maps to a safe failure; the current M1
transport does not expose a distinct safety-block enum. No fictional score is emitted.

## 8. Output and deterministic validation

Provider JSON has exactly five `evaluations`, each containing questionId,
answerRef, answerQuote, configured dimensions, evidenceAlignment, relatedSkillIds,
evidenceRefs and feedback. Each dimension has dimensionId, assessed/not_assessable,
integer score 0–4 or null, literal maxScore=4 and reason.

Strict Zod and semantic checks reject the entire output for unknown/duplicate/missing
questions, changed answerRef, absent answer excerpt, wrong dimension set/range/max,
unapproved skill mapping, fabricated evidence/ref/path or a nonmatching project quote.
References match the prepared file's original evidence identity. Both answer/project
quotes use exact substring after defined newline normalization. References are deduplicated;
question and dimension order is deterministic. Totals/levels/readiness extra fields fail.
The application calculates answerQuality and rechecks it in the final schema.

supported/contradicted require concrete project references and an actual answer
excerpt. insufficient_evidence requires evidence_consistency not_assessable/null.
Contradicted consistency scores must be 0–1; supported consistency scores must be 2–4.
These are explicit proposed rubric constraints, not empirical accuracy claims.
Question 2 cannot assert verified authorship. Known unsupported mastery/level/readiness
claims, HTML/URL payloads, secrets and instruction markers in feedback/reasons reject.
Future UI must render these fields as text, never HTML or untrusted Markdown.

The final result wraps analysisId, status, model, M5 prompt/rubric version, M4 dataset
version, evaluations, competencies, coverage, extractionWarnings, M5 warnings and safe
error metadata. Invalid input can throw a fixed INVALID_INPUT before an analysis
identity exists. Other rejected submissions return blocked; invalid provider output
or provider errors return failed with no scores. Unassessable dimensions or partial
M4 coverage yield partial. Completed means the requested processing finished, not
verified personal competence.

## 9. Provisional competency policy

`conservative_status_only_v1` is a **proposed, unapproved** review-routing policy:

- `contradicted`: a reviewed linked evaluation contradicts a claim using a concrete
  reference to a file cited for that M4 skill.
- `insufficient_evidence`: no reviewed linked concrete support for that skill;
  this does not mean low ability.
- `needs_review`: one linked answer, partial evidence, observed technology alone,
  or other mixed/uncertain evidence.
- `validation_supported`: complete implementation evidence plus at least two
  distinct reviewed linked answers, all linked answers supported and dimensions
  assessable. This is support for further review, never proof of mastery.

Each decision includes a fixed reasonCode, relevant question IDs and concrete
references. No numeric skill level or score threshold is invented. There is no
approved skill-level estimator in this workspace. Team approval/calibration remains
required before real-user decision making, and the result always warns
MVP_RUBRIC_NOT_APPROVED. No reviewed mapping warns NO_REVIEWED_SKILL_MAPPING.

## 10. Actual validated synthetic example and golden cases

The offline service fixture was executed and its complete result passed
`validationEvaluationResultSchema`. The following is an **excerpt of that mock
result**, not the complete result schema and not a live Gemini response:

```json
{
  "status": "completed",
  "model": "mock-validation",
  "firstQuestionId": "25915006-cce2-5336-aa4c-add318917cdd",
  "answerRef": "answer_24c547d7eed293c7a77a14e7",
  "evidenceAlignment": "supported",
  "answerQuality": {"score": 9, "maxScore": 12, "assessedDimensions": 3, "configuredDimensions": 3},
  "fileRef": "file_0794897769b3d7079fefd0e8",
  "skillId": "9007199254740995",
  "provisionalStatus": "validation_supported",
  "warnings": ["MVP_RUBRIC_NOT_APPROVED"]
}
```

Evidence is the synthetic `src/identity.ts` function returning its generic input
unchanged. Golden cases include a strong rationale, weak technology-only answer,
irrelevant gardening answer, and false claim that identity converts numbers to
strings. `golden-cases.json` stores reviewer expectations separately from the
hand-authored mock responses in `competency.test.ts`. These cases test contracts,
provenance, arithmetic and status routing. They do **not** measure a real model's
semantic judgment, bias, calibration or accuracy.

## 11. Tests and actual results

Run from the workspace using PowerShell npm.cmd/npx.cmd:

```powershell
node --test scripts/test-gemini-server.mjs
npm.cmd run test:ingestion
npm.cmd run test:analysis
npm.cmd run test:ai
npm.cmd run test:validation
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
npm.cmd audit --omit=dev
```

Actual results in this implementation run:

| Check | Result |
|---|---|
| M1 | 7/7 passed |
| M2 ingestion/security | 44/44 passed |
| M3 analysis | 31/31 passed |
| M4 AI offline | 49/49 passed |
| M5 validation offline | 74/74 passed |
| Total automated tests | 205/205 passed |
| ESLint | Passed |
| TypeScript noEmit | Passed |
| Production build | Passed |
| npm audit --omit=dev | 0 vulnerabilities |
| M5 manual live diagnostic | NOT_RUN / OPT_IN_DISABLED |

On this Windows runner tsx OS-user lookup requires an approved execution outside
the sandbox. Those approved test runs use synthetic mocks and do not call Gemini.
No dependency install or audit fix was performed. Git status/diff/check were reviewed;
existing untracked changes remain visible because they predate this milestone.

## 12. Live Gemini status

`npm.cmd run test:validation:live` was invoked with the existing environment. It
returned `LIVE_VALIDATION_NOT_RUN`, reason `OPT_IN_DISABLED`, before provider/fixture
imports. No new live request was sent; no new 503/504 failure is claimed.
Tests/build/install never opt into live calls. Manual future opt-in:

```powershell
$env:BUKTIVA_RUN_LIVE_VALIDATION_TEST = '1'
npm.cmd run test:validation:live
Remove-Item Env:BUKTIVA_RUN_LIVE_VALIDATION_TEST
```

Review synthetic fixtures and API-tier/privacy terms first. The script requires an
existing configured key/model and sends synthetic answers/evidence only. It makes
at most one M5 request with a 30-second transport timeout, no retry or alternative
model, without changing production configuration. Its M4 snapshot is explicitly
mocked: even a future successful M5 diagnostic would not prove live M4 extraction.
It prints model/status/duration/schema validation and safe error codes, not raw
answers/request/response or a key. Actual successful valid output prints
LIVE_VALIDATION_PASS; actual failure prints LIVE_VALIDATION_FAILED with safe status.

## 13. Database mapping and next integration boundary

Supabase live/Auth/RLS with two real accounts remains **BLOCKED / NOT VERIFIED**.
ZIP private Storage remains STORAGE_READER_NOT_READY. M5 does not resolve these
limitations or unsupported PDF/CV/GitLab/website/deployment ingestion.

Mapping for a future authenticated persistence adapter (deployed columns/types and
constraints must be verified before use):

| Contract | Future table field |
|---|---|
| ValidationQuestion.questionId | validation_questions.id, through an owned-row/catalog binding |
| analysisId | validation_questions.analysis_id |
| verified session user | validation_questions.user_id; never a trusted client field |
| order / questionText / evidenceContext | question_order / question_text / evidence_context |
| ValidationAnswer.questionId / answerText | validation_answers.question_id / answer_text |
| verified session user | validation_answers.user_id |
| Answer row ID | validation_answers.id generated/resolved by persistence layer |
| QuestionEvaluation.answerQuality.score | candidate evaluated_score mapping, only after scale/denominator agreement |
| QuestionEvaluation.feedback | feedback, plain text |

Do not store the raw subtotal alone as an interpretable score: its assessed/configured
denominator, rubric version and not-assessable state must be retained through an
agreed supported format. The provided ERD does not establish columns for that extra
metadata, so this mapping is a design contract, not a completed DB implementation.
Null/unassessable and provider failure must never become zero through persistence.

Future integration must verify a server session, query owned analysis/questions
using analysisId AND userId, read answers only for those owned question IDs and
the verified user, enforce five unique orders/answers, bind exact official texts,
load a trusted M4 snapshot, evaluate, and persist only validated results. Actual
schema/RLS and cross-account isolation must be demonstrated before real use.

The existing browser's numeric sessionStorage keys and completion flag need an
authenticated adapter; they are not DB identities or sufficient authorization.
No M5 frontend or database integration was performed.

## 14. Risks and readiness for the next milestone

Exact excerpts prove membership/provenance, not the logical correctness of a model's
interpretation, real project execution, authorship or a user's actual contribution.
One real file can support an irrelevant quote; runtime/history/feedback claims often
remain unverifiable. Feedback checks and safety filters are heuristics, not exhaustive
semantic truth/PII detection. Prompt injection can be obfuscated. Human review and
real-model golden-case evaluation/calibration are still necessary.

Answers and repository origins/paths can be private; SHA handles are not encryption.
Confirm the actual Gemini tier, applicable terms, consent and retention before real
data. Existing M4 documentation links the official Google structured-output and
privacy terms. No private answers, CVs or credentials were sent during this milestone.

M5 is ready as an offline internal contract for the next milestone. Real-user
deployment depends on team rubric/policy approval, evidence-specific reviewed mapping,
successful live Gemini evaluation, verified Auth/RLS, owned question persistence and
frontend wiring. Final readiness, gap and roadmap remain outside M5 and unimplemented.
