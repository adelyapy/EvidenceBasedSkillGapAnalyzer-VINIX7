# Milestone 6 — Competency scoring and skill gap engine

**PASS WITH CONDITIONS — OFFLINE SCORING ENGINE COMPLETE,
SCORING POLICY PENDING APPROVAL.**

There is no approved production scoring policy. Real-user numerical levels, gaps
and readiness are not available. This milestone adds a deterministic internal
engine and explicitly labelled artificial-rule simulations, not a learning roadmap.

## 1. Workspace audit and M1–M5 status

The workspace already had uncommitted M1–M5 source, tests, docs and package changes.
They were preserved. M6 adds scoring modules/config/tests/docs and a package script;
it changes no frontend, result page, question, auth, environment, schema or RLS.
Existing lockfile changes predate M6. No dependencies were added.

M3 `AnalysisInput` has UUID analysis/user/evidence IDs, decimal-string int8 role,
benchmark and skill IDs, targetRole, official benchmarks, normalized evidence,
processingStatus and warnings. `requiredLevel` and priority accept numbers 0–100
or nonempty strings; that transport contract does not establish a 0–4 competency
scale. M6 accepts integer numbers 0–4 or exact strings `0`–`4` as level transport
equivalents only; labels such as `advanced`, percentages, fractions, `03`, and
strings with whitespace become unknown. Required level 0 is valid for gap but
invalid as a readiness ratio denominator. Invalid levels never default to zero.

M4 `SkillExtractionResult` contains candidate IDs, observed_technology /
implementation_evidence / insufficient_evidence, exact evidence citations,
completed/partial/blocked/failed, coverage, warnings and prompt/dataset versions.
M5 `ValidationEvaluationResult` contains five question evaluations, per-dimension
answer-quality scores, evidence alignment, provisional statuses, versions and
coverage. Provisional statuses are validation_supported, needs_review,
insufficient_evidence and contradicted. None is an approved numerical skill level.

M5's rubric 0–4 v1.0.0 remains proposed. Reviewed question-to-skill mapping defaults
to empty. No approved evidence-to-level method, priority weights or readiness formula
was found in PRD/README. `src/data/analysis-result.ts` contains demo score 78 and
skill percentages; `src/data/skill-gap.ts` contains demo 50/80 etc. They are not
benchmarks or input for M6 and remain unchanged.

M1–M5 regressions were rerun: 205/205 passed. Prior live 503/504 reports belong to
M1. M4/M5 live diagnostics previously reported OPT_IN_DISABLED, not new failures.
M6 performs no Gemini request or Supabase query and does not resolve live limitations.

## 2. Files and internal entry point

- `src/data/scoring/scoring-policy.draft.json`: proposed production policy 0.1.0.
- `src/types/competency-scoring.ts`: strict Zod result/skill/coverage contracts.
- `src/lib/scoring/scoring-policy.ts`: policy schema, digest and pinned registry.
- `scoring-context.ts`: M3–M5 reconciliation and provenance validation.
- `competency-level-resolver.ts`: null-safe required/current level resolution.
- `skill-gap-calculator.ts`: exact nonnegative integer difference.
- `coverage-evaluator.ts`: separate source and skill counts/ratios.
- `readiness-calculator.ts`: gated synthetic rational arithmetic.
- `priority-ranker.ts`: learning, evidence collection and manual review groups.
- `scoring-calculation.ts`: internal deterministic calculation kernel.
- `scoring-output-validator.ts`: strict parsing plus full recomputation.
- `competency-scoring-service.ts`: runtime entry point and policy trust boundary.
- `errors.ts`: safe fixed error codes.
- `tests/scoring/`: synthetic policy, golden rule oracles, full snapshot and tests.

Module basenames above are in `src/lib/scoring/`. Existing `package.json` adds
`test:scoring`; M1–M5 implementations are unchanged.

```ts
calculateCompetencyGaps(analysisInput, skillExtraction, validationEvaluation, scoringPolicy?)
```

This synchronous server-only library consumes already authenticated/authorized M3
input and trusted server-held M4/M5 snapshots. It does not establish ownership by
accepting client JSON. There is no public route, Server Action, SDK client, network
call or persistence in scoring. Invalid inputs raise safe `ScoringError` codes.
Legitimate blocked/failed upstream results produce a blocked result with null levels.

## 3. Scoring policy and approval security

Policy includes identity/version/status/scope, supported role, scale, indicators,
evidence/validation/coverage requirements, explicit priority mapping, gap/readiness
methods, weights/mandatory skill IDs, rounding and optional approval metadata.
Strict Zod rejects unknown fields, invalid scales/weights, duplicate mappings,
missing version, incomplete five-level descriptions and inconsistent approval state.
Statuses: draft, under_review, approved, retired. Approved policy must identify a
reviewer, approval reference/date and matching approved version. Those fields alone
do not prove approval.

The only runtime registry entry is the checked-in **draft** policy. `loadScoringPolicy`
parses supplied JSON and accepts it only if its parsed digest equals that entry.
An approved object supplied through a request, function argument, synthetic fixture,
environment flag, or invented human-review metadata cannot install a policy. No
environment approval switch exists. Tests passing do not change approval status.
Returned policies are fresh parsed copies; mutation does not modify the registry.

No approved production artifact exists. Future activation requires human review of
the exact version/digest and an accessible approval artifact, a reviewed registry
change, agreed methods and security verification. Merely editing the JSON status
does not enable production numerical scoring: the current kernel can issue numbers
only with synthetic_test scope and labels every such result synthetic_simulation.
An approved production object produces no numbers even through the internal kernel.

`tests/scoring/synthetic-policy.fixture.json` is intentionally approved only in the
artificial test sense. Its reviewer/reference explicitly state synthetic scope.
Runtime modules never import test fixtures. Tests call the internal kernel directly
to exercise arithmetic; the production service rejects that fixture policy.
Neither the JSON schema nor a policy hash is a digital signature or auth mechanism.

## 4. Proposed level indicators and evidence requirements

Draft indicators cover the ten M4 local keys: TypeScript, JavaScript, React, Next.js,
HTML, CSS, testing, Git, CI/CD and Tailwind. Each has five skill-specific descriptions.
They are review proposals, not an official industry standard. Broad progression:

| Level | Proposed interpretation; exact skill criteria are in draft JSON |
|---|---|
| 0 | Concrete demonstration that the basic defined contract is not met |
| 1 | Correct basic implementation for a bounded task |
| 2 | Contextual design/implementation including relevant boundaries |
| 3 | Integration, failure cases and meaningful verification |
| 4 | Reviewed trade-offs, complex interactions and regression verification |

Missing evidence is never level 0. Project size, line count, dependency count and
answer length are not level indicators. Repository ownership or convincing answers
do not establish authorship. All production levelRules are empty: there is no approved
operational mapping from these descriptions to observations, so currentLevel remains
null. M4 validation_supported does not automatically promote a skill.

The synthetic policy has explicit artificial exact-quote rules for TypeScript. A
specific marker is its level-0 fixture, a generic declaration level 1, the exact
identity contract level 2, an assertion example level 3, and a separate type-guard
example with stronger reviewed answer predicates level 4. These are test predicates,
not scientifically meaningful real-world skill criteria. Rule matches require
M4 implementation evidence/citations, M5 supported linked references, the exact
approved synthetic question mapping and per-dimension predicates. No average of
the five answer scores determines a level. Only matching rules are considered;
the highest eligible rule wins. Concrete contradiction or partial evidence blocks
numeric assessment even in simulation.

## 5. Context validation and level resolver

M3/M4/M5 are parsed using their existing schemas. All analysis IDs, target role,
usable dataset/rubric versions, official skill IDs and canonical question identities
are checked. M4 citations are revalidated via M5's context builder against M4's
reconstructed safe Evidence Index, including origin/path/fileRef/quote relationships.
The current reconstruction supports the default M4 preparation budget; snapshots
prepared with custom tighter limits cannot be silently reconstructed and may reject.
A future trusted limits parameter/versioned preparation record is needed for those.

M5 question/dimension sets, quotes, score bounds, subtotal arithmetic, evidence
alignment and references are rechecked with its validator. Provisional assessments
are recomputed and compared. M5 coverage and extraction warnings must match M4.
Unknown IDs, foreign analysis, fabricated evidence/status/coverage or mismatched
versions reject. Successful M5 paired with blocked M4 rejects as inconsistent.

Important boundary: M6 receives M5 answer excerpts and hashes, **not original full
answers**. It can revalidate the supplied excerpt/ref/rubric relationships, but
cannot reauthenticate answer hashes or prove an excerpt came from the original
submission. M5's declared reviewed mapping is not independently proven human approval.
Therefore only a trusted server-held M5 snapshot is acceptable; do not expose the
four-argument function as an API accepting client snapshots. Synthetic numeric
resolution additionally compares mapping against the explicit test policy.

Per-skill output retains official ID/name, normalized requiredLevel, currentLevel,
assessmentStatus, evidenceRefs, validationRefs, explanation, priority and limitations.
Statuses: assessed, not_assessable, needs_review, contradictory_evidence,
policy_pending_approval. Source/validation partialness, missing mappings/rules,
contradictions and policy limitations remain visible. M4/M5 raw explanations/feedback
are not copied into the scoring explanation; engine explanations are fixed text.

## 6. Gap, coverage and readiness

Gap is `max(0, requiredLevel - currentLevel)` only for assessed values on the same
integer 0–4 scale. Unknown required or current level gives gapScore=null. Negative,
fractional, NaN, infinite and outside-scale arguments reject. No gap rounding is
needed. Current level above the requirement yields zero gap, not a negative number.

Coverage separately reports benchmark/assessed/unassessed skill counts, not-assessable,
review, contradictory and pending-policy counts, plus an exact `assessed/benchmarks`
ratio. Sources report complete/partial/blocked/failed/unsupported counts independently
of M4 file/byte coverage. Upstream statuses and limitations remain visible. Model
confidence is not used. All-unknown skill coverage is zero even if available files
were completely sent. Any unmeasured benchmark or partial upstream makes coverage
incomplete. No ratio is a readiness estimate.

Runtime draft readiness is always null with reason codes, including
POLICY_NOT_APPROVED, METHOD_DISABLED, MISSING_LEVEL_INDICATORS,
QUESTION_SKILL_MAPPING_NOT_APPROVED, INSUFFICIENT_SKILL_COVERAGE,
INVALID_BENCHMARK, EVIDENCE_REQUIRES_REVIEW, INVALID_WEIGHTS or
MANDATORY_SKILL_UNKNOWN as applicable. Reasons can coexist.

The **synthetic-only** candidate formula is:

`100 * sum(weight_i * min(current_i / required_i, 1)) / sum(weight_i)`

All benchmark skills must be assessed, regardless of a lower configured threshold;
unknown skills are neither zero-filled nor dropped from the denominator. Mandatory
unknowns block. Weights must be positive bounded integers and match every benchmark
exactly once. Required level must be 1–4; no zero denominator. Readiness stays within
0–100. The calculation uses BigInt rational arithmetic (LCM=12 for denominators 1–4)
and a single half-up rounding to two decimal places. This formula is a candidate
test method, not approved BUKTIVA readiness or a validated career prediction.

## 7. Priority ranking

Raw M3 benchmark priority is retained. Approved mapping is required before categories
or numeric values receive ranks. Draft mappings are empty/unapproved; there is no
guessed high/medium/low weight. Test fixture mappings are explicit artificial rules.

- Learning: assessed positive gaps with an explicitly mapped rank; rank ascending,
  gap descending, then exact numeric int8 ID ascending.
- Evidence collection: unknown skills without a review/policy-pending status; mapped
  rank ascending, unmapped last, then exact numeric int8 ID ascending.
- Manual review: contradictory evidence first, then other review/policy-pending
  items; rank then int8 ID. Pending policy does not request needless new evidence.

Unknown skills are not treated as the largest learning gap. Groups prepare an order
of needs only, without activities, schedule, roadmap or fabricated learning advice.

## 8. Output schema and semantic validator

`CompetencyScoringResult` includes analysis/role identity, policy identity/version/
status, scoringStatus, per-skill results, coverage, nullable readiness/status/reasons,
three priority groups, warnings and calculationMetadata. Metadata includes engine
version, policy digest, executionMode, M4/M5 prompt/dataset/rubric versions and
upstream warnings. No timestamp/randomness is inserted: same snapshots/policy yield
serializable, reproducible results. int8 IDs remain strings.

Strict Zod rejects extra fields, duplicate IDs, invalid level/gap relationships,
inconsistent coverage and numeric output under an unapproved policy. In addition,
`validateScoringOutput` recomputes the entire result from validated context and
compares it structurally: required/current levels, evidence and validation refs,
gaps, coverage, readiness, priorities, explanations and policy metadata must agree.
Thus schema-valid forged arithmetic/status changes also reject. Golden independent
rule/arithmetic oracles complement this shared-code consistency check; recomputation
alone would not prove the algorithm is correct.

## 9. Complete synthetic fixture and independent golden cases

`tests/scoring/competency-scoring.fixture.json` contains full synthetic AnalysisInput,
M4 result, M5 result, synthetic approved policy, simulationExpected and runtimeExpected.
It is a generated, schema-validated reproducibility snapshot, explicitly labelled
**not an independent oracle**. `snapshot.test.ts` verifies both modes. All identities,
answers and repositories are synthetic; no provider/network is used.

| Same synthetic input | Internal fixture simulation | Runtime service |
|---|---|---|
| Policy | Synthetic approved 1.0.0 | Production draft 0.1.0 |
| Required TypeScript level | 3 | 3 |
| Current level | 2 | null |
| Gap | 1 | null |
| Skill coverage | 1/1 | 0/1 |
| Readiness | 66.67, SIMULATION_ONLY | null |
| Status | completed / synthetic_simulation | policy_pending_approval / non_numeric |

`golden-cases.json` separately declares artificial rule expectations before comparison:
identity contract -> level 2/gap 1/66.67; generic declaration -> level 1/gap 2/33.33;
explicit zero marker -> level 0/gap 3/0; unknown implementation -> all unknown
numeric fields; assertion example -> level 3/gap 0/100. The 100 is only a single-skill
artificial fixture, never real-user readiness. Tests additionally block false 100
when another benchmark is unknown and verify a hand-calculated weighted example
`(1*100 + 3*50)/4 = 62.5`. Assertions do not establish scientific competency validity.

## 10. Supabase mapping contract; no persistence

| M6 value | Future destination / requirement |
|---|---|
| skills.skillId + analysisId | skill_gaps.skill_id / analysis_id |
| verified server session | user_id in all writes; not trusted from a request |
| currentLevel, requiredLevel, gapScore, priority, explanation | skill_gaps corresponding columns, after policy and schema review |
| Authorized numerical currentLevel | analysis_skill_results.estimated_level only after production approval |
| Evidence references and limitations | evidence_summary through an agreed safe serialization contract |
| confidence_score | M6 produces no calibrated confidence; do not invent a value |
| Authorized readinessScore | analyses.readiness_score only after production approval |
| scoringStatus and limitations | analyses.status/summary through a reviewed mapping |

Actual deployed column types/nullability, constraints and RLS are unverified. If
estimated_level/current_level/required_level/gap_score/readiness_score cannot store
null, backend must provide an unknown-state design before integration; never replace
null with 0. Category priority and internal ranks are not automatically compatible
with a DB priority enum. Policy digest/version, coverage, reasons and limitations
need an agreed auditable storage representation; do not discard them when persisting
a number. Future persistence must verify owned analysis/user relationships, trusted
snapshots and production approval before any write. No query/migration/RLS change
or insert/update is performed in M6.

## 11. Commands and actual checks

```powershell
node --test scripts/test-gemini-server.mjs
npm.cmd run test:ingestion
npm.cmd run test:analysis
npm.cmd run test:ai
npm.cmd run test:validation
npm.cmd run test:scoring
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
npm.cmd audit --omit=dev
git status --short
git diff --stat
git diff --check
```

| Check | Actual result |
|---|---|
| M1 | 7/7 passed |
| M2 | 44/44 passed |
| M3 | 31/31 passed |
| M4 | 49/49 passed |
| M5 | 74/74 passed |
| M6 | 66/66 passed |
| Total | 271/271 passed |
| ESLint / TypeScript / production build | Passed |
| Production dependency audit | 0 vulnerabilities |

Windows tsx tests used approved execution outside the sandbox due OS-user lookup
restrictions. No test needs Gemini API keys, real users or Supabase. Unit/fixture
tests do not imply approval or empirical calibration. No install, audit fix,
commit, push or deploy was performed.

## 12. Required team policy review and calibration

Still awaiting documented human decisions:

1. Per-skill level 0–4 definitions and valid evidence for explicit level 0.
2. Minimum implementation, complexity and verification evidence for each level.
3. Relationship and limitations of M4 candidates and M5 answer evaluation.
4. Reviewed five-question-to-skill mapping for the actual project/role.
5. Handling contradictions and manual review resolution.
6. Official benchmark required levels and their scale/provenance.
7. Category/numeric priorities and any readiness weights.
8. Source/skill coverage thresholds and mandatory-skill gates.
9. Readiness method, interpretation, rounding and permitted use.
10. Agreement, fairness, calibration and change-management procedures.

No human approval artifact, approved level estimator or calibration dataset is
present. Recommend blinded independent reviewer ratings on the same consented
examples, adjudication of disagreement and an appropriate inter-rater agreement
measure (e.g. weighted kappa for ordinal levels with two raters; see
[Cohen's original weighted-kappa paper](https://pubmed.ncbi.nlm.nih.gov/19673146/)). Assess agreement,
subgroup bias, abstention and false confidence before release. No statistic or
scientific validity is claimed without actual reviewer data and analysis.

## 13. Live status, limitations and Milestone 7

Gemini live was **NOT RUN in M6**; scoring needs no provider call. No new 503/504
failure or successful generation is claimed. Supabase live/Auth/RLS with two real
accounts remains **NOT VERIFIED**. ZIP private Storage remains
STORAGE_READER_NOT_READY; unsupported evidence adapters remain unsupported.

Exact quotes and references validate provenance, not semantic truth, authorship,
real execution or personal mastery. Existing secret/PII/injection filters remain
heuristic. Partial projects, generic questions, AI judgment and selection bias can
produce misleading certainty. Scoring does not execute project code or use source
size/answer length as ability proxies. No CV, key, email or private user record is
included in the synthetic fixture or sent to a provider by M6.

M7 may use the stable nonnumeric contract, reason codes, coverage and priority
groups for internal integration work. Real-user numerical scoring must remain
disabled until policy/level/mapping approval, reviewer calibration, live Gemini
validation, owned snapshot persistence and Auth/RLS verification are complete.
Production numerical activation is deliberately not implemented by this milestone.
No learning roadmap or production UI integration has been created.
