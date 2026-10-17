export type SkillComparison = {
  name: string;
  skillKamu: number;
  kebutuhanIndustri: number;
};

export type SkillGapPriority = {
  skillName: SkillComparison["name"];
  level: "Tinggi" | "Sedang";
};
