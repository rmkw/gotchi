export type ItemType = 'food' | 'medicine' | 'toy' | 'cleaning' | 'special';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic';

export interface ItemEffect {
  hunger?: number;
  happiness?: number;
  energy?: number;
  cleanliness?: number;
  health?: number;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  description: string;
  effect: ItemEffect;
}
