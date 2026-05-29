import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Pet, PetMood } from '../models/pet.model';
import { ItemEffect } from '../models/item.model';
import { PersistenceService } from '../services/persistence.service';

const MAX_STAT = 100;
const MIN_STAT = 0;
const PET_NAME_STORAGE_KEY = 'gotchi-pet-name';

const initialPet: Pet = {
  name: 'OpenGotchii',
  food: 55,
  happiness: 70,
  energy: 45,
  cleanliness: 80,
  health: 90,
  isDead: false,
};

@Injectable({ providedIn: 'root' })
export class PetStore {
  private readonly persistence = inject(PersistenceService);

  private tickIntervalId: ReturnType<typeof setInterval> | null = null;
  private sleepTickIntervalId: ReturnType<typeof setInterval> | null = null;

  readonly pet = signal<Pet>(initialPet);
  readonly isTicking = signal(false);
  readonly isSleeping = signal(false);
  readonly deathCount = signal(0);
  readonly isHydrated = signal(false);

  readonly mood = computed<PetMood>(() => {
    const pet = this.pet();

    if (pet.isDead) return 'dead';
    if (this.isSleeping()) return 'sleepy';
    if (pet.health <= 30) return 'sick';
    if (pet.cleanliness <= 30) return 'dirty';
    if (pet.energy <= 25) return 'sleepy';
    if (pet.happiness <= 35 || pet.food <= 20) return 'sad';
    if (pet.happiness >= 75 && pet.food >= 55 && pet.energy >= 45)
      return 'happy';

    return 'neutral';
  });

  readonly statusMessage = computed(() => {
    const pet = this.pet();

    if (pet.isDead) {
      return 'Tu cachorrito terminó su aventura. Puedes comenzar una nueva y crear más recuerdos.';
    }

    if (this.isSleeping()) {
      return 'Está descansando y soñando cosas bonitas.';
    }

    switch (this.mood()) {
      case 'happy':
        return '¡El cachorrito está saltando de alegría!';
      case 'sad':
        return 'Tu cachorrito quiere compañía.';
      case 'sleepy':
        return 'Está buscando un lugar cómodo para dormir.';
      case 'dirty':
        return 'Se ensució jugando en el parque.';
      case 'sick':
        return 'Tu cachorrito necesita descansar un poquito.';
      default:
        return 'Está atento a lo que sucede a su alrededor.';
    }
  });

  constructor() {
    this.hydrate();

    effect(() => {
      if (!this.isHydrated()) return;
      void this.persistence.savePet(this.pet());
    });

    effect(() => {
      if (!this.isHydrated()) return;
      void this.persistence.saveDeathCount(this.deathCount());
    });
  }

  async hydrate(): Promise<void> {
    const [savedPet, savedDeathCount] = await Promise.all([
      this.persistence.loadPet(),
      this.persistence.loadDeathCount(),
    ]);

    if (savedPet) {
      this.pet.set({
        ...savedPet,
        name: loadStoredPetName() ?? savedPet.name,
      });
    } else {
      this.pet.set({
        ...initialPet,
        name: loadStoredPetName() ?? initialPet.name,
      });
    }

    this.deathCount.set(savedDeathCount);
    this.isHydrated.set(true);
  }

  startTicking(): void {
    if (this.tickIntervalId) return;

    this.isTicking.set(true);
    this.tickIntervalId = setInterval(() => {
      this.tick();
    }, 4000);
  }

  stopTicking(): void {
    if (this.tickIntervalId) {
      clearInterval(this.tickIntervalId);
      this.tickIntervalId = null;
    }

    this.isTicking.set(false);
  }

  resetPet(): void {
    if (this.pet().isDead) {
      this.deathCount.update((count) => count + 1);
    }

    this.stopSleeping();
    this.pet.set({ ...initialPet });
    this.startTicking();
  }

  renamePet(name: string): void {
    const nextName = sanitizePetName(name);
    if (!nextName) return;

    localStorage.setItem(PET_NAME_STORAGE_KEY, nextName);
    this.pet.update((pet) => ({
      ...pet,
      name: nextName,
    }));
  }

  tick(): void {
    if (this.pet().isDead || this.isSleeping()) return;

    this.updatePet((pet) => ({
      ...pet,
      food: pet.food - 4,
      happiness: pet.happiness - 2,
      energy: pet.energy - 3,
      cleanliness: pet.cleanliness - 4,
    }));
  }

  sleep(): void {
    const pet = this.pet();

    if (pet.isDead) return;

    if (this.isSleeping()) {
      this.stopSleeping();
      return;
    }

    if (pet.energy >= 51) return;

    this.isSleeping.set(true);
    this.sleepTickIntervalId = setInterval(() => {
      this.updatePet((current) => ({
        ...current,
        energy: current.energy + 8,
        food: current.food - 4,
        happiness: current.happiness + 2,
      }));

      if (this.pet().energy >= 100 || this.pet().food <= 0) {
        this.stopSleeping();
      }
    }, 1500);
  }

  stopSleeping(): void {
    if (this.sleepTickIntervalId) {
      clearInterval(this.sleepTickIntervalId);
      this.sleepTickIntervalId = null;
    }

    this.isSleeping.set(false);
  }

  applyItemEffect(effect: ItemEffect): void {
    if (this.pet().isDead || this.isSleeping()) return;

    this.updatePet((pet) => ({
      ...pet,
      food: pet.food + (effect.food ?? 0),
      happiness: pet.happiness + (effect.happiness ?? 0),
      energy: pet.energy + (effect.energy ?? 0),
      cleanliness: pet.cleanliness + (effect.cleanliness ?? 0),
      health: pet.health + (effect.health ?? 0),
    }));
  }

  private updatePet(recipe: (pet: Pet) => Pet): void {
    this.pet.update((current) => this.applyRules(recipe(current)));
  }

  private applyRules(pet: Pet): Pet {
    const next = {
      ...pet,
      food: clamp(pet.food),
      happiness: clamp(pet.happiness),
      energy: clamp(pet.energy),
      cleanliness: clamp(pet.cleanliness),
      health: clamp(pet.health),
      isDead: pet.isDead,
    };

    if (next.isDead) {
      next.health = 0;
      return next;
    }

    if (next.food <= 15) {
      next.health = clamp(next.health - 8);
      next.happiness = clamp(next.happiness - 6);
    }

    if (next.cleanliness <= 20) {
      next.health = clamp(next.health - 10);
    }

    if (next.energy <= 15) {
      next.happiness = clamp(next.happiness - 6);
    }

    if (next.happiness <= 20) {
      next.health = clamp(next.health - 4);
    }

    if (next.energy >= 100) {
      next.energy = 100;
      this.stopSleeping();
    }

    if (next.health <= 0) {
      next.health = 0;
      next.isDead = true;
      this.stopSleeping();
      this.stopTicking();
    }

    return next;
  }
}

function clamp(value: number): number {
  return Math.max(MIN_STAT, Math.min(MAX_STAT, value));
}

function loadStoredPetName(): string | null {
  const name = sanitizePetName(localStorage.getItem(PET_NAME_STORAGE_KEY) ?? '');
  return name || null;
}

function sanitizePetName(name: string): string {
  return name.trim().slice(0, 25);
}
