"use client";

import React from "react";
import { UiCardType } from "../../types/chat";

import SkillLevelCard from "../cards/SkillLevelCard";
import GoalCard from "../cards/GoalCard";
import TimeAvailabilityCard from "../cards/TimeAvailabilityCard";
import LearningStyleCard from "../cards/LearningStyleCard";
import YouTubePrefsCard from "../cards/YouTubePrefsCard";
import ConstraintsCard from "../cards/ConstraintsCard";
import MotivationCard from "../cards/MotivationCard";
import SummaryCard from "../cards/SummaryCard";
import FinalConfirmationCard from "../cards/FinalConfirmationCard";

const components: Record<UiCardType, React.ComponentType<object>> = {

  skillLevel: SkillLevelCard,
  goal: GoalCard,
  timeAvailability: TimeAvailabilityCard,
  learningStyle: LearningStyleCard,
  youtubePrefs: YouTubePrefsCard,
  constraints: ConstraintsCard,
  motivation: MotivationCard,
  summary: SummaryCard,
  final_confirmation: FinalConfirmationCard, // used only from frontend, not LLM
};

export default function CardRenderer({ type }: { type: UiCardType }) {
  const Comp = components[type];
  if (!Comp) return null;
  return <Comp />;
}
