import { CourseModule } from "./module";

export interface PlaylistItem {
  title: string;
  url: string;
  channel: string;
  duration?: string | number; // FIXED
}


export interface CourseMetadata {
  totalTime: string;
  difficultyCurve: string;
  version: string;
}

export interface CourseBuildResponse {
  summary: string;
  modules: CourseModule[];
  playlist: PlaylistItem[];
  metadata: CourseMetadata;
}
