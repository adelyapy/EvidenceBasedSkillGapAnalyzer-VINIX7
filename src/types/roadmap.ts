export type RoadmapStep = {
  id: string;
  title: string;
  duration: string;
  checklist: string[];
};

export type SavedRoadmap = {
  version: 1;
  careerId: "frontend-developer";
  careerLabel: "Frontend Developer";
  stepIds: string[];
  savedAt: string;
  source: "prototype";
};
