import { RewardTier } from '../models/reward.model';
import { ItemRarity } from '../models/item.model';

export interface RewardChance {
  rarity: ItemRarity;
  chance: number;
}

export const rewardTables: Record<RewardTier, RewardChance[]> = {
  low: [{ rarity: 'common', chance: 100 }],
  mid: [
    { rarity: 'common', chance: 75 },
    { rarity: 'uncommon', chance: 25 },
  ],
  high: [
    { rarity: 'common', chance: 60 },
    { rarity: 'uncommon', chance: 30 },
    { rarity: 'rare', chance: 10 },
  ],
  perfect: [
    { rarity: 'uncommon', chance: 50 },
    { rarity: 'rare', chance: 35 },
    { rarity: 'epic', chance: 15 },
  ],
};
