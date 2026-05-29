import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InventoryStore } from '../../core/store/inventory.store';
import { Item } from '../../core/models/item.model';

const DAILY_SPECIAL_CLAIM_KEY = 'gotchi-daily-special-claim-date';
const DAY_IN_MS = 86_400_000;

@Component({
  selector: 'app-minigames-page',
  imports: [RouterLink],
  templateUrl: './minigames-page.component.html',
  styleUrl: './minigames-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MinigamesPageComponent {
  private readonly inventoryStore = inject(InventoryStore);

  readonly claimedDate = signal(localStorage.getItem(DAILY_SPECIAL_CLAIM_KEY));
  readonly todayKey = getLocalDateKey(new Date());

  readonly specialItems = computed(() =>
    this.inventoryStore.catalog().filter((item) => item.type === 'special'),
  );

  readonly dailySpecial = computed<Item | null>(() => {
    const items = this.specialItems();
    if (items.length === 0) return null;

    return items[getLocalDayIndex(new Date()) % items.length];
  });

  readonly hasClaimedDailySpecial = computed(
    () => this.claimedDate() === this.todayKey,
  );

  readonly dailySpecialEffect = computed(() => {
    const item = this.dailySpecial();
    if (!item) return '';

    return formatEffect(item.effect);
  });

  claimDailySpecial(): void {
    const item = this.dailySpecial();

    if (!item || this.hasClaimedDailySpecial()) return;

    this.inventoryStore.addItem(item.id, 1);
    localStorage.setItem(DAILY_SPECIAL_CLAIM_KEY, this.todayKey);
    this.claimedDate.set(this.todayKey);
  }
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getLocalDayIndex(date: Date): number {
  const localMidnight = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  return Math.floor(localMidnight.getTime() / DAY_IN_MS);
}

function formatEffect(effect: Item['effect']): string {
  const parts: string[] = [];

  if (effect.food) parts.push(`comida ${formatSignedValue(effect.food)}`);
  if (effect.happiness)
    parts.push(`felicidad ${formatSignedValue(effect.happiness)}`);
  if (effect.energy) parts.push(`energía ${formatSignedValue(effect.energy)}`);
  if (effect.cleanliness)
    parts.push(`limpieza ${formatSignedValue(effect.cleanliness)}`);
  if (effect.health) parts.push(`salud ${formatSignedValue(effect.health)}`);

  return parts.join(' · ');
}

function formatSignedValue(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}
