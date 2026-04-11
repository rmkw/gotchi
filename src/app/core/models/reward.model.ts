export type RewardTier = 'low' | 'mid' | 'high' | 'perfect';

export interface RewardItemGrant {
  itemId: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
}

export interface RewardResult {
  tier: RewardTier;
  grants: RewardItemGrant[];
}
