export type Emoji = {
  id: string;
  emoji: string;
  title: string;
  difficulty: number;
};

export type RewardType = 'free_game' | 'coffee' | 'cash_prize';

export type StageRequirement = {
  id: number;
  stage_number: number;
  score: number;
  reward_type: RewardType;
  description?: string;
};

export type GameConfig = {
  rewardThresholds: Record<string, number>;
  stageRequirements: Record<number, StageRequirement>;
  maxStage: number;
};