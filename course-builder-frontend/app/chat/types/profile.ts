// app/chat/types/profile.ts

export type SkillLevel =
  | "absolute-beginner"
  | "beginner"
  | "intermediate"
  | "advanced";

export type GoalType =
  | "job"
  | "projects"
  | "college"
  | "freelance"
  | "startup"
  | "hobby"
  | "other";

export type LearningStyle = "project-first" | "theory-first" | "balanced";

export type VideoLengthPreference = "short" | "long" | "mixed";

export type StructurePreference = "strict" | "flexible";

export type Profile = {
  // ⭐ NEW FIELD (first in pipeline)
  topic: string | null;

  skillLevel: SkillLevel | null;
  goalType: GoalType | null;
  goalDetail: string;
  hoursPerDay: number | null;
  daysPerWeek: number | null;
  durationPreference: string;
  learningStyle: LearningStyle | null;
  videoLength: VideoLengthPreference | null;
  wantsQuizzes: boolean | null;
  wantsProjects: boolean | null;
  favoriteChannels: string;
  avoidChannels: string;
  language: string;
  needsSubtitles: boolean | null;
  hardwareConstraints: string;
  motivation: number | null;
  structurePreference: StructurePreference | null;
};
