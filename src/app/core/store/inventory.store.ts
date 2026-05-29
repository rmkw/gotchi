import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { InventoryItem } from '../models/inventory-item.model';
import { Item } from '../models/item.model';
import { PetStore } from './pet.store';
import { PersistenceService } from '../services/persistence.service';

const itemCatalog: Item[] = [
  {
    id: 'apple-basic',
    name: 'Manzanas',
    type: 'food',
    rarity: 'common',
    description: 'Sube un poco la comida.',
    effect: { food: 12 },
  },
  {
    id: 'cookie-basic',
    name: 'Galletas',
    type: 'food',
    rarity: 'uncommon',
    description: 'Suben comida y dan un poco de energía.',
    effect: { food: 10, energy: 6 },
  },
  {
    id: 'can-premium',
    name: 'Lata premium',
    type: 'food',
    rarity: 'rare',
    description: 'Comida potente que también anima al cachorrito.',
    effect: { food: 20, happiness: 8 },
  },
  {
    id: 'pill-basic',
    name: 'Medicina simple',
    type: 'medicine',
    rarity: 'common',
    description: 'Recupera un poco de salud.',
    effect: { health: 12 },
  },
  {
    id: 'med-kit',
    name: 'Kit médico',
    type: 'medicine',
    rarity: 'uncommon',
    description: 'Recuperación fuerte para casos delicados.',
    effect: { health: 22 },
  },
  {
    id: 'vitamin-shot',
    name: 'Inyección vitamínica',
    type: 'medicine',
    rarity: 'rare',
    description: 'Mejora salud con empuje extra de energía.',
    effect: { health: 20, energy: 10 },
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
    id: 'wipes-soft',
    name: 'Toallitas',
    type: 'cleaning',
    rarity: 'uncommon',
    description: 'Limpieza ligera con pequeño confort extra.',
    effect: { cleanliness: 12, happiness: 3 },
  },
  {
    id: 'bubble-bath',
    name: 'Baño de burbujas',
    type: 'cleaning',
    rarity: 'rare',
    description: 'Limpieza profunda con mejora de ánimo.',
    effect: { cleanliness: 22, happiness: 6 },
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
    id: 'toy-deluxe',
    name: 'Juguete deluxe',
    type: 'toy',
    rarity: 'uncommon',
    description: 'Sube bastante la felicidad.',
    effect: { happiness: 16 },
  },
  {
    id: 'mini-console',
    name: 'Mini consola',
    type: 'toy',
    rarity: 'rare',
    description: 'Sube felicidad bastante, pero consume un poco de energía.',
    effect: { happiness: 18, energy: -6 },
  },
  {
    id: 'legend-snack',
    name: 'Snack legendario',
    type: 'special',
    rarity: 'epic',
    description: 'Sube mucho la comida y mejora el ánimo.',
    effect: { food: 30, happiness: 8 },
  },
  {
    id: 'emotional-chip',
    name: 'Chip emocional',
    type: 'special',
    rarity: 'epic',
    description: 'Eleva bastante la felicidad.',
    effect: { happiness: 25, health: 5 },
  },
  {
    id: 'energy-crystal',
    name: 'Cristal de energía',
    type: 'special',
    rarity: 'epic',
    description: 'Recarga energía en situaciones críticas.',
    effect: { energy: 30, happiness: 5 },
  },
  {
    id: 'purifier-mist',
    name: 'Neblina purificadora',
    type: 'special',
    rarity: 'epic',
    description: 'Limpieza profunda con mejora ligera a salud.',
    effect: { cleanliness: 28, health: 4 },
  },
  {
    id: 'vital-core',
    name: 'Núcleo vital',
    type: 'special',
    rarity: 'epic',
    description: 'Recupera salud y algo de energía.',
    effect: { health: 30, energy: 8 },
  },
];

const initialInventory: InventoryItem[] = [
  { itemId: 'apple-basic', quantity: 10 },
  { itemId: 'cookie-basic', quantity: 10 },
  { itemId: 'can-premium', quantity: 10 },
  { itemId: 'pill-basic', quantity: 10 },
  { itemId: 'med-kit', quantity: 10 },
  { itemId: 'vitamin-shot', quantity: 10 },
  { itemId: 'soap-basic', quantity: 10 },
  { itemId: 'wipes-soft', quantity: 10 },
  { itemId: 'bubble-bath', quantity: 10 },
  { itemId: 'toy-ball', quantity: 10 },
  { itemId: 'toy-deluxe', quantity: 10 },
  { itemId: 'mini-console', quantity: 10 },
  { itemId: 'legend-snack', quantity: 10 },
  { itemId: 'emotional-chip', quantity: 10 },
  { itemId: 'energy-crystal', quantity: 10 },
  { itemId: 'purifier-mist', quantity: 10 },
  { itemId: 'vital-core', quantity: 10 },
];

@Injectable({ providedIn: 'root' })
export class InventoryStore {
  private readonly petStore = inject(PetStore);
  private readonly persistence = inject(PersistenceService);

  readonly catalog = signal<Item[]>(itemCatalog);
  readonly inventory = signal<InventoryItem[]>(initialInventory);
  readonly isHydrated = signal(false);

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

  constructor() {
    this.hydrate();

    effect(() => {
      if (!this.isHydrated()) return;
      void this.persistence.saveInventory(this.inventory());
    });
  }

  async hydrate(): Promise<void> {
    const savedInventory = await this.persistence.loadInventory();

    if (savedInventory.length > 0) {
      this.inventory.set(savedInventory);
    }

    this.isHydrated.set(true);
  }

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

    if (!item || this.petStore.pet().isDead || this.petStore.isSleeping()) {
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
