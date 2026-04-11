import { Injectable, computed, inject, signal } from '@angular/core';
import { InventoryItem } from '../models/inventory-item.model';
import { Item } from '../models/item.model';
import { PetStore } from './pet.store';

const itemCatalog: Item[] = [
  {
    id: 'apple-basic',
    name: 'Manzana',
    type: 'food',
    rarity: 'common',
    description: 'Baja un poco el hambre.',
    effect: { hunger: -12 },
  },
  {
    id: 'soap-basic',
    name: 'Jabón',
    type: 'cleaning',
    rarity: 'common',
    description: 'Mejora la limpieza.',
    effect: { cleanliness: 18 },
  },
  {
    id: 'toy-ball',
    name: 'Pelota',
    type: 'toy',
    rarity: 'common',
    description: 'Sube felicidad.',
    effect: { happiness: 10, energy: -4 },
  },
  {
    id: 'pill-basic',
    name: 'Medicina simple',
    type: 'medicine',
    rarity: 'uncommon',
    description: 'Recupera salud.',
    effect: { health: 15 },
  },
];

const initialInventory: InventoryItem[] = [
  { itemId: 'apple-basic', quantity: 3 },
  { itemId: 'soap-basic', quantity: 2 },
  { itemId: 'toy-ball', quantity: 1 },
  { itemId: 'pill-basic', quantity: 1 },
];

@Injectable({ providedIn: 'root' })
export class InventoryStore {
  private readonly petStore = inject(PetStore);

  readonly catalog = signal<Item[]>(itemCatalog);
  readonly inventory = signal<InventoryItem[]>(initialInventory);

  readonly inventoryView = computed(() => {
    const catalog = this.catalog();
    const inventory = this.inventory();

    return inventory
      .map((entry) => {
        const item = catalog.find(
          (catalogItem) => catalogItem.id === entry.itemId,
        );

        if (!item) return null;

        return {
          ...item,
          quantity: entry.quantity,
        };
      })
      .filter((item): item is Item & { quantity: number } => item !== null);
  });

  addItem(itemId: string, quantity = 1): void {
    this.inventory.update((items) => {
      const found = items.find((item) => item.itemId === itemId);

      if (found) {
        return items.map((item) =>
          item.itemId === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [...items, { itemId, quantity }];
    });
  }

  useItem(itemId: string): boolean {
    const item = this.catalog().find((entry) => entry.id === itemId);

    if (!item || this.petStore.pet().isDead) {
      return false;
    }

    let used = false;

    this.inventory.update((items) => {
      const found = items.find((entry) => entry.itemId === itemId);

      if (!found || found.quantity <= 0) {
        return items;
      }

      used = true;

      return items
        .map((entry) =>
          entry.itemId === itemId
            ? { ...entry, quantity: entry.quantity - 1 }
            : entry,
        )
        .filter((entry) => entry.quantity > 0);
    });

    if (used) {
      this.petStore.applyItemEffect(item.effect);
    }

    return used;
  }
}
