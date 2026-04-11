import { Injectable, inject } from '@angular/core';
import { rewardTables } from '../config/reward-tables';
import {
  RewardItemGrant,
  RewardResult,
  RewardTier,
} from '../models/reward.model';
import { InventoryStore } from '../store/inventory.store';
import { ItemType } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class RewardService {
  private readonly inventoryStore = inject(InventoryStore);

  private readonly rewardTypes: ItemType[] = [
    'food',
    'medicine',
    'cleaning',
    'toy',
  ];

  generateReward(tier: RewardTier): RewardResult | null {
    const catalog = this.inventoryStore.catalog();
    const grants: RewardItemGrant[] = [];

    for (const type of this.rewardTypes) {
      const chances = rewardTables[tier];
      const selectedRarity = this.pickRarity(chances);
      const pool = catalog.filter(
        (item) => item.type === type && item.rarity === selectedRarity,
      );

      if (pool.length === 0) {
        const fallbackPool = catalog.filter((item) => item.type === type);
        if (fallbackPool.length === 0) continue;

        const fallbackItem =
          fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
        grants.push({ itemId: fallbackItem.id, rarity: fallbackItem.rarity });
        continue;
      }

      const selectedItem = pool[Math.floor(Math.random() * pool.length)];
      grants.push({ itemId: selectedItem.id, rarity: selectedItem.rarity });
    }

    if (grants.length === 0) return null;

    return {
      tier,
      grants,
    };
  }

  grantReward(tier: RewardTier): RewardResult | null {
    const reward = this.generateReward(tier);

    if (!reward) return null;

    for (const grant of reward.grants) {
      this.inventoryStore.addItem(grant.itemId, 1);
    }

    return reward;
  }

  private pickRarity(
    chances: {
      rarity: 'common' | 'uncommon' | 'rare' | 'epic';
      chance: number;
    }[],
  ): 'common' | 'uncommon' | 'rare' | 'epic' {
    const roll = Math.random() * 100;
    let accumulated = 0;

    for (const entry of chances) {
      accumulated += entry.chance;
      if (roll <= accumulated) {
        return entry.rarity;
      }
    }

    return chances[chances.length - 1].rarity;
  }
}
