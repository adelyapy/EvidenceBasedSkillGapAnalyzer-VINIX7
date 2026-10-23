import "server-only";
export class RoadmapError extends Error {
  constructor(public readonly code: "INVALID_POLICY" | "UNTRUSTED_POLICY" | "INVALID_CATALOG" | "UNTRUSTED_CATALOG" | "INVALID_SCORING" | "SIMULATION_NOT_ALLOWED" | "INVALID_OUTPUT") {
    super(`Roadmap rejected: ${code}`); this.name="RoadmapError";
  }
}
