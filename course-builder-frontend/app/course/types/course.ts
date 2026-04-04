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
  id?: string;
  user_id?: string;
  created_at?: string;
  summary: string;
  modules: CourseModule[];
  playlist: PlaylistItem[];
  metadata: CourseMetadata;
}
