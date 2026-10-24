// tests/ai/formatter.test.ts
import { describe, it } from "node:test";
import assert from "node:assert";
import { formatResponseForFrontend } from "@/lib/ai/ai-result-formatter";

describe("AI Result Formatter - Frontend Preparation", () => {
  it("Should format valid data and assign correct UI badge colors", () => {
    const validData = {
      analysisId: "analysis_001",
      skills: [
        {
          skillId: "react",
          skillName: "React",
          level: 3,
          confidence: 0.9,
          reason: "Good implementation",
          evidenceRefs: ["ev_1"],
        },
        {
          skillId: "css",
          skillName: "HTML & CSS",
          level: 1,
          confidence: 0.5,
          reason: "Basic styling",
          evidenceRefs: ["ev_1"],
        },
      ],
      validationPassed: true,
    };

    const result = formatResponseForFrontend(validData);

    assert.strictEqual(result.status, "completed");
    assert.strictEqual(result.skills.length, 2);
    assert.strictEqual(result.skills[0].uiBadgeColor, "green");
    assert.strictEqual(result.skills[1].uiBadgeColor, "red");
    assert.strictEqual(result.skills[0].percentage, 75);
  });

  it("Should return partial status if no skills are found", () => {
    const emptyData = {
      analysisId: "analysis_002",
      skills: [],
      validationPassed: false,
    };

    const result = formatResponseForFrontend(emptyData);

    assert.strictEqual(result.status, "partial");
    assert.strictEqual(result.skills.length, 0);
  });

  it("Should catch validation errors and return a safe failure state", () => {
    const invalidData = {
      analysisId: "analysis_003",
      skills: [
        {
          skillId: "react",
          skillName: "React",
          level: 99,
          confidence: 0.9,
          reason: "This reason is long enough",
          evidenceRefs: ["ev_1"],
        },
      ],
      validationPassed: true,
    };

    const result = formatResponseForFrontend(invalidData);

    assert.strictEqual(result.status, "failed");
    assert.strictEqual(result.analysisId, "unknown");
    assert.ok(result.errorMessage?.includes("Invalid AI Output"));
  });

  it("Should format Skill Gaps and Roadmap correctly (Figma Match)", () => {
    // DATA INI SUDAH DISESUAIKAN DENGAN SKEMA ZOD YANG BARU
    const dataWithGaps = {
      analysisId: "analysis_gap",
      skills: [
        {
          skillId: "typescript",
          skillName: "TypeScript",
          level: 2, // Tetap ada untuk memenuhi Zod skills
          confidence: 0.9,
          reason: "Good implementation",
          evidenceRefs: ["ev_1"],
        },
      ],
      skillGaps: [
        {
          skillId: "typescript",
          skillName: "TypeScript",
          currentLevel: 2,
          requiredLevel: 3,
          gapScore: 1, // Gap score untuk perhitungan
          priorityRank: 1, // Rank untuk warna badge
        },
      ],
      roadmap: [
        {
          step: 1,
          title: "Kuasai TypeScript",
          duration: "2-4 minggu",
          topics: ["Pahami dasar", "Latihan"],
        },
      ],
      validationPassed: true,
    };

    const result = formatResponseForFrontend(dataWithGaps);

    // Debugging: Jika Zod gagal, cetak errornya
    if (result.status === "failed") {
      console.log("=== ZOD MENOLAK DATA ===");
      console.log(result.errorMessage);
    }

    // Cek Skill Gap
    assert.strictEqual(result.skillGaps?.length, 1);
    assert.strictEqual(result.skillGaps?.[0].rank, 1);
    assert.strictEqual(result.skillGaps?.[0].skillName, "TypeScript");
    assert.strictEqual(result.skillGaps?.[0].gapText, "Selisih 1 level");
    assert.strictEqual(result.skillGaps?.[0].priorityLabel, "Prioritas Tinggi");
    assert.strictEqual(
      result.skillGaps?.[0].badgeColorClass,
      "bg-pink-200 text-pink-800",
    );

    // Cek Roadmap
    assert.strictEqual(result.roadmap?.length, 1);
    assert.strictEqual(result.roadmap?.[0].stepNumber, 1);
    assert.strictEqual(result.roadmap?.[0].title, "Kuasai TypeScript");
    assert.strictEqual(result.roadmap?.[0].duration, "2-4 minggu");
    assert.strictEqual(result.roadmap?.[0].topics.length, 2);
  });
});
