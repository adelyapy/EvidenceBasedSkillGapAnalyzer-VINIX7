export interface EvaluationResult {
  caseId: string;
  passed: boolean;
  matchRate: number;
  issues: string[];
}

export function evaluateGeminiResult(
  caseId: string,
  geminiOutput: { skills: any[] },
  groundTruth: { skills: any[] },
): EvaluationResult {
  const issues: string[] = [];
  let matches = 0;

  if (geminiOutput.skills.length !== groundTruth.skills.length) {
    issues.push(
      `Skill count mismatch: Expected ${groundTruth.skills.length}, got ${geminiOutput.skills.length}`,
    );
  }

  groundTruth.skills.forEach((expectedSkill) => {
    const foundSkill = geminiOutput.skills.find(
      (s) => s.skillId === expectedSkill.skillId,
    );

    if (!foundSkill) {
      issues.push(`Missing skill: ${expectedSkill.skillId}`);
    } else {
      // Jika skill ditemukan, cek level-nya
      if (foundSkill.level !== expectedSkill.level) {
        issues.push(
          `Skill ${expectedSkill.skillId}: Expected level ${expectedSkill.level}, got ${foundSkill.level}`,
        );
      } else {
        matches++;
      }
    }
  });

  geminiOutput.skills.forEach((geminiSkill) => {
    const isExpected = groundTruth.skills.find(
      (s) => s.skillId === geminiSkill.skillId,
    );
    if (!isExpected) {
      issues.push(
        `Hallucination detected: Gemini added unexpected skill ${geminiSkill.skillId}`,
      );
    }
  });

  const totalExpected =
    groundTruth.skills.length === 0 ? 1 : groundTruth.skills.length;
  const matchRate =
    groundTruth.skills.length === 0 && geminiOutput.skills.length === 0
      ? 1.0
      : matches / totalExpected;

  return {
    caseId,
    passed: issues.length === 0,
    matchRate: matchRate,
    issues,
  };
}
