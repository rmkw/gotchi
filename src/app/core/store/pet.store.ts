import { Injectable, computed, signal } from '@angular/core';
import { Pet, PetMood } from '../models/pet.model';
import { ItemEffect } from '../models/item.model';

const MAX_STAT = 100;
const MIN_STAT = 0;

const initialPet: Pet = {
  name: 'Gotchi',
  hunger: 45,
  happiness: 70,
  energy: 65,
  cleanliness: 80,
  health: 90,
  isDead: false,
};

@Injectable({ providedIn: 'root' })
export class PetStore {
  private tickIntervalId: ReturnType<typeof setInterval> | null = null;

  readonly pet = signal<Pet>(initialPet);
  readonly isTicking = signal(false);

  readonly mood = computed<PetMood>(() => {
    const pet = this.pet();

    if (pet.isDead) return 'dead';
    if (pet.health <= 30) return 'sick';
    if (pet.cleanliness <= 30) return 'dirty';
    if (pet.energy <= 25) return 'sleepy';
    if (pet.happiness <= 35 || pet.hunger >= 80) return 'sad';
    if (pet.happiness >= 75 && pet.hunger <= 45 && pet.energy >= 45)
      return 'happy';

    return 'neutral';
  });

  readonly statusMessage = computed(() => {
    const pet = this.pet();

    if (pet.isDead) {
      return 'Gotchi murió. Reiniciarlo crea una nueva vida y pierde la identidad de la anterior.';
    }

    switch (this.mood()) {
      case 'happy':
        return 'Está cómodo, brillante y con ganas de jugar.';
      case 'sad':
        return 'Se siente descuidado. Ya pide atención.';
      case 'sleepy':
        return 'Tiene sueño. Le urge descansar.';
      case 'dirty':
        return 'Está sucio. Toca limpiar antes de que empeore.';
      case 'sick':
        return 'Se ve mal. La salud ya está en zona delicada.';
      default:
        return 'Está estable, pero siempre puede estar mejor.';
    }
  });

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
    this.pet.set({ ...initialPet });
  }

  tick(): void {
    if (this.pet().isDead) return;

    this.updatePet((pet) => ({
      ...pet,
      hunger: pet.hunger + 4,
      happiness: pet.happiness - 2,
      energy: pet.energy - 3,
      cleanliness: pet.cleanliness - 4,
    }));
  }

  applyItemEffect(effect: ItemEffect): void {
    if (this.pet().isDead) return;

    this.updatePet((pet) => ({
      ...pet,
      hunger: pet.hunger + (effect.hunger ?? 0),
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
      hunger: clamp(pet.hunger),
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

    if (next.hunger >= 85) {
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

    if (next.health <= 0) {
      next.health = 0;
      next.isDead = true;
    }

    return next;
  }
}

function clamp(value: number): number {
  return Math.max(MIN_STAT, Math.min(MAX_STAT, value));
}
