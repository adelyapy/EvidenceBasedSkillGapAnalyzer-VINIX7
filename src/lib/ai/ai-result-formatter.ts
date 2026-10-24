// src/lib/ai/ai-result-formatter.ts
import { validateAIOutput } from "./validation/ai-output-validator";
import { calculateSkillGap } from "../scoring/skill-gap-calculator"; // <-- TAMBAHKAN INI

const INDUSTRY_STANDARDS: Record<string, number> = {
  react: 3,
  typescript: 3,
  css: 2,
  javascript: 3,
  "rest-api": 2,
};

export function formatResponseForFrontend(rawData: any) {
  try {
    let validatedData: any;

    if (rawData && rawData.skillGaps && rawData.roadmap) {
      validatedData = rawData;
    } else {
      validatedData = validateAIOutput(rawData);
    }

    // --- TAMBAHKAN LOGIKA INI (JIKA DATA GAP BELUM ADA) ---
    if (!validatedData.skillGaps || validatedData.skillGaps.length === 0) {
      validatedData.skillGaps = (validatedData.skills || [])
        .map((skill: any) => {
          const reqLevel = INDUSTRY_STANDARDS[skill.skillId] || 3;
          const gapScore = calculateSkillGap(
            reqLevel,
            skill.level ?? skill.currentLevel ?? 0,
          ); // Panggil fungsi temanmu

          if (gapScore && gapScore > 0) {
            return {
              skillId: skill.skillId,
              skillName: skill.skillName || skill.skillId,
              currentLevel: skill.level ?? skill.currentLevel ?? 0,
              requiredLevel: reqLevel,
              gapScore: gapScore,
              priorityRank: gapScore >= 2 ? 1 : 2, // Prioritas tinggi jika gap >= 2
            };
          }
          return null;
        })
        .filter(Boolean); // Hapus yang null
    }
    // -----------------------------------------------------

    // 1. Format Skills
    const formattedSkills = (validatedData.skills || []).map((skill: any) => {
      const currentLevel = skill.level ?? skill.currentLevel ?? 0;
      const percentage = (currentLevel / 4) * 100;
      return {
        ...skill,
        percentage,
        uiBadgeColor:
          currentLevel >= 3 ? "green" : currentLevel === 2 ? "yellow" : "red",
      };
    });

    // 2. Format Skill Gaps
    const formattedSkillGaps = (validatedData.skillGaps || []).map(
      (gap: any, index: number) => {
        let priorityLabel = "Prioritas Rendah";
        let badgeColorClass = "bg-gray-200 text-gray-800";

        if (gap.priorityRank === 1 || gap.gapScore >= 2) {
          priorityLabel = "Prioritas Tinggi";
          badgeColorClass = "bg-pink-200 text-pink-800";
        } else if (gap.priorityRank === 2 || gap.gapScore === 1) {
          priorityLabel = "Prioritas Sedang";
          badgeColorClass = "bg-yellow-200 text-yellow-800";
        }

        return {
          rank: index + 1,
          skillName: gap.skillName || String(gap.skillId),
          gapText: `Selisih ${gap.gapScore ?? 0} level`,
          priorityLabel,
          badgeColorClass,
          rawData: gap,
        };
      },
    );

    // 3. Format Roadmap
    const formattedRoadmap = (validatedData.roadmap || []).map(
      (step: any, index: number) => {
        return {
          stepNumber: index + 1,
          title: step.title,
          duration: step.duration || "2-4 minggu",
          topics: step.topics || ["Materi belum tersedia"],
          buttonText: "Lihat Materi →",
          isMaterialAvailable: false,
        };
      },
    );

    return {
      analysisId: validatedData.analysisId,
      status: formattedSkills.length > 0 ? "completed" : "partial",
      processedAt: new Date().toISOString(),
      skills: formattedSkills,
      skillGaps: formattedSkillGaps,
      roadmap: formattedRoadmap,
      validationPassed: validatedData.validationPassed ?? true,
    };
  } catch (error) {
    console.error("[Formatter] Error formatting AI output:", error);
    return {
      analysisId: "unknown",
      status: "failed",
      processedAt: new Date().toISOString(),
      skills: [],
      skillGaps: [],
      roadmap: [],
      validationPassed: false,
      errorMessage:
        error instanceof Error ? error.message : "Failed to process AI output",
    };
  }
}
