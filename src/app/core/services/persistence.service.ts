import { Injectable } from '@angular/core';
import { db } from '../db/app.db';
import { Pet } from '../models/pet.model';
import { InventoryItem } from '../models/inventory-item.model';

const PET_KEY = 'Gotchi';
const APP_STATE_KEY = 'main';

@Injectable({ providedIn: 'root' })
export class PersistenceService {
  async savePet(pet: Pet): Promise<void> {
    await db.pet.put({ ...pet, name: PET_KEY });
  }

  async loadPet(): Promise<Pet | undefined> {
    return db.pet.get(PET_KEY);
  }

  async saveInventory(items: InventoryItem[]): Promise<void> {
    await db.inventory.clear();
    await db.inventory.bulkPut(items);
  }

  async loadInventory(): Promise<InventoryItem[]> {
    return db.inventory.toArray();
  }

  async saveDeathCount(deathCount: number): Promise<void> {
    await db.appState.put({
      key: APP_STATE_KEY,
      deathCount,
      updatedAt: Date.now(),
    });
  }

  async loadDeathCount(): Promise<number> {
    const state = await db.appState.get(APP_STATE_KEY);
    return state?.deathCount ?? 0;
  }
}
