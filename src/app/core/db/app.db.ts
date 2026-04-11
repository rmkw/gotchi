import Dexie, { Table } from 'dexie';
import { Pet } from '../models/pet.model';
import { InventoryItem } from '../models/inventory-item.model';

export interface AppStateRecord {
  key: string;
  deathCount: number;
  updatedAt: number;
}

export class AppDb extends Dexie {
  pet!: Table<Pet, string>;
  inventory!: Table<InventoryItem, string>;
  appState!: Table<AppStateRecord, string>;

  constructor() {
    super('GotchiDB');

    this.version(1).stores({
      pet: 'name',
      inventory: 'itemId',
      appState: 'key',
    });
  }
}

export const db = new AppDb();
