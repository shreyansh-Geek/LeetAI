export interface ModuleVideo {
  title: string;
  url: string;
  duration?: string | number;
  whyChosen?: string;
  reason?: string;
  scoreExplanation?: string;
}


export interface CourseModule {
  title: string;
  description: string;
  duration: string;
  outcomes: string[];
  videos: ModuleVideo[];
}
