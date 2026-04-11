import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { InventoryStore } from '../../core/store/inventory.store';
import { PetStore } from '../../core/store/pet.store';
import { ItemEffect } from '../../core/models/item.model';

@Component({
  selector: 'app-inventory-page',
  imports: [RouterLink],
  templateUrl: './inventory-page.component.html',
  styleUrl: './inventory-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryPageComponent implements OnInit {
  private readonly inventoryStore = inject(InventoryStore);
  private readonly petStore = inject(PetStore);

  readonly items = this.inventoryStore.inventoryView;
  readonly pet = this.petStore.pet;
  readonly mood = this.petStore.mood;
  readonly statusMessage = this.petStore.statusMessage;
  readonly isTicking = this.petStore.isTicking;
  readonly isSleeping = this.petStore.isSleeping;
  readonly deathCount = this.petStore.deathCount;
  readonly activeDrawer = signal<
    'food' | 'medicine' | 'cleaning' | 'toy' | 'special'
  >('food');

  readonly petFace = computed(() => {
    if (this.isSleeping()) {
      return '(-_-) zZ';
    }

    switch (this.mood()) {
      case 'happy':
        return '✨(^‿^)✨';
      case 'sad':
        return '(╥﹏╥)';
      case 'sleepy':
        return '(-_-) zZ';
      case 'dirty':
        return '( ._. )';
      case 'sick':
        return '(×﹏×)';
      case 'dead':
        return '(✖╭╮✖)';
      default:
        return '(•ᴗ•)';
    }
  });

  readonly canSleep = computed(() => {
    const pet = this.pet();
    return !pet.isDead && pet.energy < 51;
  });

  readonly sleepButtonLabel = computed(() => {
    return this.isSleeping() ? 'Despertar' : 'Dormir';
  });

  readonly drawers = computed(() => {
    const items = this.items();

    return [
      {
        type: 'food' as const,
        label: 'Comida',
        items: items.filter((item) => item.type === 'food'),
      },
      {
        type: 'medicine' as const,
        label: 'Medicina',
        items: items.filter((item) => item.type === 'medicine'),
      },
      {
        type: 'cleaning' as const,
        label: 'Limpieza',
        items: items.filter((item) => item.type === 'cleaning'),
      },
      {
        type: 'toy' as const,
        label: 'Juguetes',
        items: items.filter((item) => item.type === 'toy'),
      },
      {
        type: 'special' as const,
        label: 'Especiales',
        items: items.filter((item) => item.type === 'special'),
      },
    ];
  });

  readonly selectedDrawer = computed(() => {
    return (
      this.drawers().find((drawer) => drawer.type === this.activeDrawer()) ??
      this.drawers()[0]
    );
  });

  ngOnInit(): void {
    this.petStore.startTicking();
  }

  selectDrawer(
    type: 'food' | 'medicine' | 'cleaning' | 'toy' | 'special',
  ): void {
    this.activeDrawer.set(type);
  }

  useItem(itemId: string): void {
    this.inventoryStore.useItem(itemId);
  }

  sleep(): void {
    this.petStore.sleep();
  }

  resetPet(): void {
    this.petStore.resetPet();
  }

  formatEffect(effect: ItemEffect): string {
    const parts: string[] = [];

    if (effect.food) parts.push(`comida ${formatSignedValue(effect.food)}`);
    if (effect.happiness)
      parts.push(`felicidad ${formatSignedValue(effect.happiness)}`);
    if (effect.energy)
      parts.push(`energía ${formatSignedValue(effect.energy)}`);
    if (effect.cleanliness)
      parts.push(`limpieza ${formatSignedValue(effect.cleanliness)}`);
    if (effect.health) parts.push(`salud ${formatSignedValue(effect.health)}`);

    return parts.join(' · ');
  }
}

function formatSignedValue(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}
