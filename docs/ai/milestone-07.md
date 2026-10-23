# Milestone 7 — Personalized learning roadmap engine

**PASS WITH CONDITIONS — OFFLINE ROADMAP ENGINE COMPLETE,
PERSONALIZED NUMERIC ROADMAP BLOCKED.**

Final review uses the user's explicit fifteen acceptance criteria supplied after
the original truncated attachment. All existing modules were retained. Minimal
corrections add explicit per-activity priorities, accountable catalog review metadata,
known-skill catalog validation, regression cases, and a structured Supabase mapping.
Production numeric scoring/roadmaps remain disabled while M6 policy is draft.

## 1. Scope and audit

Implement an internal, deterministic offline roadmap based on semantically validated
M6 `CompetencyScoringResult`, distinguishing learning gaps, unknown evidence and
review needs. No Gemini, public API, frontend/database/auth/environment changes.
The follow-up explicitly requires policy, catalog, eligibility resolver, resource
matcher, phase planner, success criteria builder, validator, service, tests and docs.
Blocked scoring must return blocked with reasons and no learning activity. The
current conservative implementation emits no activities of any kind when blocked.

M1–M6 uncommitted work was preserved. The installed configuration remains Next
16.4.0, React 19.3.0, TypeScript, Zod 4.6.7 and existing node:test/tsx scripts.
Only package.json adds `test:roadmap`; no dependency or package-lock change is made
for M7. Reviewed scoring contracts/policy/calculation/validation/priority groups,
M3–M5 contracts, roadmap UI/data/route/types, PRD/README, agent guidance and prior
milestone documentation/tests. Existing M1–M6 tests were rerun rather than assuming
their earlier reported 271 passes.

M6 actual fields include UUID analysis ID; exact int8 string skill/role IDs;
policyId/version/status; scoringStatus; nullable currentLevel/gapScore/readinessScore;
assessment status; source/skill coverage; learning/evidenceCollection/manualReview
priority groups; limitations, warnings and calculation metadata. Runtime policy is
draft 0.1.0. Numeric synthetic fixtures do not authorize runtime scoring or roadmap.

The existing demo has four cards: “Kuasai TypeScript”, “Tingkatkan Testing”,
“Pelajari CI/CD”, “Bangun Project Lanjutan”. `RoadmapStep` contains id/title/duration/
checklist; demo duration strings are 2–4, 2–4, 3–4 and 4+ weeks. Materials buttons
are disabled with “Materi belum tersedia”. The route renders that demo, not this
engine. SavedRoadmap is a browser prototype contract with career/step IDs and a
timestamp. None is the new server result or an approved curriculum.

The four new generic phases preserve four positions as a **proposal**, not the
four hardcoded skill deficiencies or their durations. No reviewed pedagogical phase
definition was found in PRD. No `roadmap_items` ERD/SQL column definition was found
in the workspace search; deployed mapping remains unverified, not guessed.

## 2. File structure

- `src/data/roadmap/roadmap-policy.draft.json`: roadmap policy 0.1.0, draft.
- `src/data/roadmap/learning-resources.json`: curated verified reference catalog 1.0.0.
- `src/types/learning-roadmap.ts`: strict server result, phase, activity/ref schemas.
- `src/lib/roadmap/roadmap-policy.ts`: policy schema and pinned runtime loader.
- `resource-catalog.ts`: strict resource URL/schema validation and pinned catalog.
- `roadmap-context.ts`: M6 semantic validation against original scoring context.
- `roadmap-eligibility-resolver.ts`: review/evidence/learning eligibility.
- `learning-resource-matcher.ts`: exact existing rubric alias/key matching.
- `success-criteria-builder.ts`: observable artifact/review criteria templates.
- `activity-builder.ts`: deterministic identities, objectives and provenance handles.
- `roadmap-phase-planner.ts`: four phases, dependencies, caps, omissions.
- `roadmap-calculation.ts`: deterministic result assembly, preservation of M6 state.
- `roadmap-output-validator.ts`: strict parsing and full semantic recomputation.
- `roadmap-service.ts`: runtime trust boundary; no external I/O.
- `errors.ts`: safe fixed error codes.
- `tests/roadmap/`: fixtures, golden cases, policy/resource/planning/output tests.

Module basenames above are under `src/lib/roadmap/`. Existing frontend roadmap types
are unchanged; a separate server contract avoids imposing duration/checklist demo
semantics on unknown evidence. File `src/data/roadmap.ts` coexists with the new
directory; the current UI still imports the demo file and is unchanged.

## 3. Policy, trusted input and approval

Roadmap policy defines identity/version/status/role, four activity types, eligibility,
resource selection, phase order, priorities, success criteria, approval requirements,
fallbacks, limits and warning rules. The only runtime policy is pinned draft 0.1.0;
client claims of approved or schema-valid changed settings cannot replace it. No
environment approval switch or synthetic production policy import exists. M6's
draft is neither changed nor promoted. No production numeric-learning path is enabled.

```ts
generateLearningRoadmap(scoringResult, {
  analysisInput, skillExtraction, validationEvaluation, scoringPolicy?
}, { roadmapPolicy?, resourceCatalog? }?)
```

This is an internal server function, not authentication. Caller must verify the
session/analysis owner and supply trusted server-held M3–M6 snapshots. It pins the
scoring policy using M6's loader, reconstructs the M6 context, and invokes M6's
semantic output validator. Merely parsing a schema-valid client result is not enough.
Foreign analyses, forged priorities, levels, readiness, policy digests and source
references reject. M6's original-answer and default-preparation-budget limitations
remain: the engine does not reauthenticate full M5 answers or invent missing context.

Runtime rejects synthetic approved scoring policies. The internal test kernel can
produce synthetic_simulation plans, always with SIMULATION_ONLY. Roadmap policy
still stays draft; a successful synthetic plan is not human approval.

## 4. Eligibility and the four proposed phases

1. **Review:** manual review for contradictions, uncertain evidence or policy pending.
2. **Development:** evidence collection for unknowns, or verified-resource learning
   only for a valid positive numerical gap in internal synthetic simulation.
3. **Verification:** document relevant expected/observed behavior, artifacts and limits.
4. **Reassessment:** conditional request to reassess after artifacts/review and policy
   prerequisites; it never runs an evaluator, marks completion or changes a score.

Review -> reassessment forms a two-item chain. Evidence/learning -> verification ->
reassessment forms a three-item chain. Empty phases remain present, not padded with
irrelevant advanced projects. Zero-gap skills do not automatically receive work.
Blocked input returns four empty phases, no resources and explicit
SCORING_INPUT_BLOCKED / UPSTREAM_NOT_READY reason codes where applicable.

Unknown is not low ability. Policy pending routes to review, not a demand for new
evidence. Contradictions keep manual review and their M6 limitations. Partial source
or validation coverage remains partial. Input readiness/current/gap values are copied
unchanged; no new level, gap or readiness is calculated. Duration is always null,
not copied from demo or inferred from resource length.

Within groups the planner preserves M6 ordering and exact IDs. Review is considered
before evidence collection before learning. Caps are 20 selected skills and 80 total
activities; complete per-skill chains are selected atomically. Omitted IDs and
PLAN_TRUNCATED are explicit. Activity IDs bind canonical scoring data, roadmap version,
skill and template. Dependencies only point to earlier phases/items, with stable order.

## 5. Verified learning resource catalog

Official pages were opened during M7; catalog records verification date 2026-10-22,
publisher, language en, version scope and no duration. These links are curated
references, not a reviewed complete curriculum or a promise of mastery:

| Key | Verified primary reference |
|---|---|
| typescript | [TypeScript Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) |
| javascript | [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) |
| react | [React Quick Start](https://react.dev/learn) |
| nextjs | [Next.js Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages) |
| html | [MDN Structuring content](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content) |
| css | [MDN CSS styling basics](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics) |
| testing | [Node.js 24.12.0 test runner](https://nodejs.org/download/release/v24.12.0/docs/api/test.html) |
| git | [Pro Git, second edition](https://git-scm.com/book/en/v2) |
| cicd | [GitHub Actions](https://docs.github.com/en/actions) |
| tailwind | [Tailwind utility classes](https://tailwindcss.com/docs/styling-with-utility-classes) |

The current React page identifies 19.3, Next.js page 16.4.2 and Tailwind page 4.3;
these are resource version scopes, not upgrades to project dependencies. Check
compatibility with the learner's actual project. A Node testing reference is not a
mandate to replace another project's test framework. No time/cost/certification
claims are made. English material may not meet every learner's needs; no language,
accessibility, schedule or personal preference profile is available in M6.

Matcher uses exact existing M4 rubric aliases to catalog keys, not fuzzy matching or
invented skill IDs. At most one resource is selected for each learning activity.
Missing relevant material falls back to review, with RESOURCE_UNAVAILABLE, no fake
URL, and no silently substituted unrelated technology. Runtime catalog is pinned;
an arbitrary URL on an allowed domain is not accepted as verified catalog content.
Strict HTTPS URLs prohibit credentials, ports, query/hash and hostname impersonation.
No resource fetch occurs inside the engine; no API request is made by generating a
plan. Verification is point-in-time and must be revisited when the catalog changes.

## 6. Success criteria and output validation

Each activity has an objective, two observable success criteria, reason code, skill
ID, explicit inherited priority, provenance handles, conditional activation,
prerequisite IDs and proposed status. Priority includes the M6 source group, its
one-based group order, the raw benchmark priority and nullable approved benchmark
rank. Null rank is preserved under draft mapping; no new weight is invented.
Verification/reassessment inherit the same skill priority. A missing-resource
fallback keeps its original M6 source group while its type becomes manual review;
source group is audit provenance, not a new claim that learning is authorized.
Criteria request artifacts, observed results, reviewer decisions and explicit limits,
never a guaranteed skill-level increase, completion date or automatic policy approval.
The engine does not execute source code/tests, follow instructions inside evidence,
or fetch learner URLs. Proposed verification is work for the authorized learner and
reviewer; it is not reported as already performed.

The strict result preserves role/analysis identity, both policy states/versions,
M6 scoring status/coverage/warnings/readiness/reasons, summarized source skills,
four phases, used resources, omissions, and deterministic calculation metadata.
Source quotes and answer content are omitted: only evidenceId/fileRef/path and
question IDs are retained for traceability. No userId, CV, token or raw answer is
needed in the result. Future UI must render fields as text and must not treat
proposed items as completed, approved or executed.

Schema checks enforce IDs, dependencies, phase order, counts and draft/nonnumeric
gates. Semantic validator recomputes the complete plan from the verified context and
compares it structurally, catching schema-valid altered objectives/criteria, paths,
resources, readiness, counts, omissions and policy state. Independent golden cases
also test intended contract behavior; shared-code recomputation alone is not proof
of learning effectiveness or semantic assessment accuracy.

## 7. Examples and actual final checks

Complete generated synthetic snapshot: `tests/roadmap/learning-roadmap.fixture.json`.
It is explicitly labelled a reproducibility snapshot, not an independent oracle.
`golden-cases.json` separately declares hand-specified activity/status expectations.

Validated runtime example excerpt (synthetic input, not the full result schema):

```json
{
  "skillId": "9007199254740995",
  "type": "manual_review",
  "priority": {
    "sourceGroup": "manual_review",
    "groupOrder": 1,
    "benchmarkPriority": "high",
    "benchmarkRank": null
  },
  "reasonCode": "POLICY_REVIEW",
  "durationMinutes": null,
  "status": "proposed",
  "activation": "reviewer_required"
}
```

Reason codes are stable explanations for recommendation: POLICY_REVIEW means M6
policy is awaiting approval; CONTRADICTION_REVIEW means contradictory source claims;
ASSESSMENT_REVIEW means uncertain/partial assessment; MISSING_EVIDENCE means unknown
evidence rather than low ability; VALIDATED_GAP is a verified synthetic gap only;
RESOURCE_UNAVAILABLE requires review rather than invented material;
EVIDENCE_VERIFICATION requests an observable artifact check; REASSESS_AFTER_CHANGES
defers evaluation until changes/prerequisites are reviewed.

| Scenario | Activities |
|---|---|
| Runtime draft, policy pending | manual review -> conditional reassessment |
| Unknown skill | collect evidence -> verify -> conditional reassessment |
| Partial/contradictory source | manual review -> conditional reassessment |
| Blocked M6 | none; blocked reasons returned |
| Internal synthetic gap | learning with catalog resource -> verify -> reassess |
| Internal synthetic zero gap | none; no forced advanced project |

Commands used:

```powershell
node --test scripts/test-gemini-server.mjs
npm.cmd run test:ingestion
npm.cmd run test:analysis
npm.cmd run test:ai
npm.cmd run test:validation
npm.cmd run test:scoring
npm.cmd run test:roadmap
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
npm.cmd audit --omit=dev
git diff --check
git status --short
git diff --stat
```

Actual checks rerun during final review:

| Check | Result |
|---|---|
| M1/M2/M3/M4/M5/M6 regressions | 7/44/31/49/74/66 passed; total 271 |
| M7 including priority/review regressions and full snapshot | 66/66 passed |
| Total executed tests | 337/337 passed |
| TypeScript / lint | Passed |
| Production build | Passed |
| Production dependency audit | 0 vulnerabilities |

tsx execution on this Windows runner uses approved commands outside the sandbox for
OS-user lookup; tests remain offline and synthetic. No new library was installed.
No commit/push/deploy or database write occurred.

## 8. Supabase roadmap_items mapping and integration boundaries

No local `roadmap_items` DDL/ERD column definition was found. No authoritative
column mapping is asserted. The prior M3 specification names the table but does not
list its columns. The following is the explicit **proposed mapping contract**, not
a claim that these candidate column names/types exist in deployed Supabase:

| M7 source | Proposed roadmap_items destination; backend must confirm columns/types |
|---|---|
| analysisId | Owned analysis foreign key, candidate `analysis_id` |
| Verified server session user; never request JSON | Ownership field, candidate `user_id` |
| activity.skillId | Official skill foreign key, candidate `skill_id`; preserve int8 precision |
| activity.activityId | Application idempotency reference, candidate metadata `activity_ref`; not automatically a database UUID |
| phase.order / phaseId | Phase position/identity, candidate `phase_order` and metadata `phase_id` |
| Activity array position within its phase | Stable item order, candidate `item_order` |
| activity.title / objective | Display title/objective, candidate `title` / `description` |
| activity.type | Explicit learning/evidence_collection/manual_review/reassessment discriminator; verify enum or metadata support |
| activity.priority | Preserve sourceGroup/groupOrder/raw priority/null rank together; verify `priority` and metadata format |
| activity.reasonCode / successCriteria | Auditable recommendation reason and observable checklist; candidate metadata fields |
| activity.resourceIds -> result.resources | Resolve only pinned catalog records; candidate `resource_id` / `resource_url`, if present |
| activity.durationMinutes | Unknown null duration; candidate `duration_minutes` or equivalent, never invented weeks or zero |
| activity.status | Proposed only; candidate `status` after checking enum compatibility, never completed by generation |
| dependsOn / activation | Dependency references and conditional activation metadata; not actual task execution |
| sourceEvidenceRefs / validationRefs | Traceability metadata, without source quotes or private answers |
| Roadmap/scoring policy identity, version, status and digest | Versioned audit metadata; preserve both draft states |
| metadata.executionMode | Integration gate: reject synthetic_simulation for real-user persistence |
| blockingReasons / warnings / coverage / omissions | Plan-level audit record in a backend-approved representation, not silently discarded per item |

Blocked/no_actions plans emit no item rows. Backend must agree how to store plan-level
metadata without inventing placeholder activities. If the actual schema cannot retain
unknown duration, activity kinds, priorities, provenance or dependency metadata, record
that limitation and agree an adapter/schema change separately. Do not replace null
with 0 or strip policy state. No migration or database update is part of M7.

The existing browser SavedRoadmap/sessionStorage IDs are not authorized database
identities. A reviewed adapter and authenticated persistence would be separate work.
No UI wiring, auth/RLS change, public route, migration or Supabase read/write is made.
Supabase live/two-account RLS and private ZIP Storage limitations remain unresolved.
Gemini live is NOT RUN in M7 and the engine does not call Gemini. Source verification
used browser tools for official documentation, not learner project data or model APIs.

Learning resources may change; exact skill aliases do not prove pedagogical fit.
M6/M5 judgments remain uncalibrated and cannot prove authorship or mastery. The four
phases, templates, caps and catalog are review proposals under a draft policy.
Activity completion must not automatically update scoring or approval state.

Production conditions remain: approve/calibrate scoring and roadmap policies,
review pedagogical fit, verify actual roadmap_items schema and null/enum support,
implement authenticated owned persistence and demonstrate cross-account RLS. Live
Gemini and Supabase success are not claimed. These conditions block production numeric
personalization while the offline evidence/review engine satisfies this review scope.

## 9. Final file-by-file review

| File under src/lib/roadmap/ unless qualified | Final finding and disposition |
|---|---|
| roadmap-policy.ts | Versioned pinned draft, exact ordering/types and no request approval; retained |
| src/data/roadmap/roadmap-policy.draft.json | Four proposed phase positions, bounded fallbacks, draft preserved; retained |
| resource-catalog.ts | HTTPS/pinned resources, unique IDs/keys; added known rubric-key and review metadata validation |
| src/data/roadmap/learning-resources.json | Ten official pages reopened in final review; added explicit source-review/pedagogy-pending record |
| roadmap-context.ts | M6 semantic recomputation and role/catalog matching, retained |
| roadmap-eligibility-resolver.ts | Blocked empty, unknown evidence, review, positive synthetic gap gates, retained |
| learning-resource-matcher.ts | Exact existing aliases/keys; no generated URL or fuzzy skill, retained |
| success-criteria-builder.ts | Observable artifacts/review; no level/time guarantee, retained |
| activity-builder.ts | Stable identity, objective/reason/criteria/provenance; added explicit inherited activity priority |
| roadmap-phase-planner.ts | Four phases, no padding, atomic bounded chains, explicit omissions, retained |
| roadmap-calculation.ts | Preserves M6 levels/gap/readiness/coverage/draft; no score generation, retained |
| roadmap-output-validator.ts | Full expected-plan recomputation rejects altered priority and all other output fields, retained |
| roadmap-service.ts | Pins runtime policy/catalog and rejects synthetic runtime input, retained |
| errors.ts | Fixed safe error codes; retained |
| src/types/learning-roadmap.ts | Strict schemas/dependency gates; added required activity priority contract |
| tests/roadmap/output-service.test.ts | Added forged priority/group/order/rank, duplicate resources, completed/date rejection and inheritance tests |
| tests/roadmap/policy-resources.test.ts | Added review-state and unknown-key rejection regressions |
| tests/roadmap/learning-roadmap.fixture.json | Preserved input snapshots; refreshed generated expected activities with priority metadata |
| tests/roadmap/planning.test.ts | Checked blocked, unknown, partial/contradictory, resource fallback, empty-phase and synthetic gates; retained |
| tests/roadmap/golden-cases.json and golden.test.ts | Independent expected contract scenarios unchanged |
| tests/roadmap/fixtures.ts and snapshot.test.ts | Existing mock-only construction/full reproducibility checks retained |
| docs/ai/milestone-07.md | Updated final decision, examples, results, mapping, review record and acceptance matrix |

Catalog review status is `source_verified_pedagogy_pending`, performed by
`codex_source_verification` using official-page opening and skill-scope checks on
2026-10-22, with `humanCurriculumApproval: null`. This is an accountable source
verification record, not a claim of teacher/team approval or learning effectiveness.
Catalog 1.0.0 is still the unreleased M7 catalog; the review adds provenance metadata
without changing resource URLs/IDs. English-only material, version fit and narrow
topic coverage require review before real learning recommendations.

## 10. Fifteen acceptance criteria and final decision

| Criterion | Review evidence / result |
|---|---|
| 1. Versioned roadmap policy honors M6 draft | Both states/versions retained; runtime values remain null |
| 2. Valid catalog, exact skill mapping, accountable review | Ten official sources; known keys, pinned entries, source-reviewed/pedagogy-pending status |
| 3. Distinct eligibility groups | Separate review/evidence/learning paths; tests cover each |
| 4. Unknown is not a proven deficit | Null retained and evidence collection only; no weak-skill inference |
| 5. Four phases, no fictitious empty-phase work | Four-position proposal retains empty arrays; zero-gap and blocked tests |
| 6. Objective, priority, reason, checkable criteria | Explicit activity priority added; fixed reason/criteria and prerequisites |
| 7. Catalog-only resources | Exact matching, pinned catalog, absent resource -> review |
| 8. Semantic output rejection | Fake IDs/resources, priorities, duplicates, learning under draft all rejected |
| 9. No invented dates/durations/completion | Null duration, proposed status; completed/date injection regressions |
| 10. Synthetic approved test scope only | Runtime policy loader rejects fixture; internal simulation labelled |
| 11. Actual M6 contract | Existing schema and full M6 semantic validator reused |
| 12. Examples, limits, tests, Supabase mapping | Sections 7–8; database mapping explicitly proposed/unverified |
| 13. Full checks | 337/337, lint, TypeScript and production build passed |
| 14. Protected application/config modules unchanged | SHA-256 baseline verification covers 219 protected files; no frontend/auth/DB/env/Gemini edits |
| 15. No commit/push/deploy | None performed |

The four generic phases are a draft interpretation of the four-position UI structure,
not a claim that the skill-specific demo card names define an approved curriculum.
Readiness/levels remain M6's values, not learning outcome predictions.

**Final: PASS WITH CONDITIONS — OFFLINE ROADMAP ENGINE COMPLETE,
PERSONALIZED NUMERIC ROADMAP BLOCKED.**
