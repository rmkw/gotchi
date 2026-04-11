import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { RewardService } from '../../../core/services/reward.service';
import { RewardResult, RewardTier } from '../../../core/models/reward.model';
import { InventoryStore } from '../../../core/store/inventory.store';

@Component({
  selector: 'app-reaction-game',
  imports: [RouterLink],
  templateUrl: './reaction-game.component.html',
  styleUrl: './reaction-game.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReactionGameComponent {
  private readonly rewardService = inject(RewardService);
  private readonly inventoryStore = inject(InventoryStore);

  private targetShowTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private targetHideTimeoutId: ReturnType<typeof setTimeout> | null = null;

  readonly score = signal(0);
  readonly round = signal(0);
  readonly maxRounds = 9;
  readonly isRunning = signal(false);
  readonly isTargetVisible = signal(false);
  readonly reward = signal<RewardResult | null>(null);
  readonly tier = signal<RewardTier | null>(null);
  readonly targetOffsetX = signal(0);
  readonly targetOffsetY = signal(0);
  readonly targetSize = signal(160);

  readonly currentDifficulty = computed(() => {
    const round = this.round();
    if (round <= 2) return 'alta';
    if (round <= 5) return 'muy alta';
    return 'extrema';
  });

  readonly rewardDetails = computed(() => {
    const reward = this.reward();
    if (!reward) return [];

    return reward.grants.map((grant) => {
      const item = this.inventoryStore
        .catalog()
        .find((entry) => entry.id === grant.itemId);
      return {
        itemId: grant.itemId,
        rarity: grant.rarity,
        name: item?.name ?? grant.itemId,
        description: item?.description ?? '',
      };
    });
  });

  readonly statusText = computed(() => {
    if (!this.isRunning() && this.round() === 0) {
      return 'Presiona iniciar y reacciona rápido cuando aparezca la señal.';
    }

    if (this.isRunning()) {
      return this.isTargetVisible()
        ? '¡Ahora! Haz click rápido.'
        : `Espera la señal... dificultad ${this.currentDifficulty()}`;
    }

    return 'Partida terminada. Ya tienes reward.';
  });

  startGame(): void {
    this.clearTimers();
    this.score.set(0);
    this.round.set(0);
    this.reward.set(null);
    this.tier.set(null);
    this.isRunning.set(true);
    this.isTargetVisible.set(false);
    this.scheduleNextRound();
  }

  hitTarget(): void {
    if (!this.isRunning() || !this.isTargetVisible()) return;

    this.score.update((value) => value + 1);
    this.clearHideTimer();
    this.isTargetVisible.set(false);
    this.advanceRound();
  }

  missTarget(): void {
    if (!this.isRunning() || this.isTargetVisible()) return;

    this.score.update((value) => Math.max(0, value - 2));
    this.advanceRound();
  }

  private advanceRound(): void {
    this.round.update((value) => value + 1);

    if (this.round() >= this.maxRounds) {
      this.finishGame();
      return;
    }

    this.scheduleNextRound();
  }

  private scheduleNextRound(): void {
    this.clearTimers();
    this.isTargetVisible.set(false);

    const currentRound = this.round();
    const baseShowDelay = Math.max(120, 520 - currentRound * 45);
    const showDelay = baseShowDelay + Math.floor(Math.random() * 150);

    const baseVisibleDuration = Math.max(120, 520 - currentRound * 55);
    const visibleDuration =
      baseVisibleDuration + Math.floor(Math.random() * 90);

    const baseSize = Math.max(88, 150 - currentRound * 8);
    this.targetSize.set(baseSize);

    const maxOffset = Math.min(130, 25 + currentRound * 14);
    this.targetOffsetX.set(
      Math.floor(Math.random() * (maxOffset * 2 + 1)) - maxOffset,
    );
    this.targetOffsetY.set(
      Math.floor(Math.random() * (maxOffset * 2 + 1)) - maxOffset,
    );

    this.targetShowTimeoutId = setTimeout(() => {
      if (!this.isRunning()) return;

      this.isTargetVisible.set(true);

      this.targetHideTimeoutId = setTimeout(() => {
        if (!this.isRunning() || !this.isTargetVisible()) return;

        this.isTargetVisible.set(false);
        this.score.update((value) => Math.max(0, value - 1));
        this.advanceRound();
      }, visibleDuration);
    }, showDelay);
  }

  private finishGame(): void {
    this.clearTimers();
    this.isRunning.set(false);
    this.isTargetVisible.set(false);
    this.targetOffsetX.set(0);
    this.targetOffsetY.set(0);
    this.targetSize.set(160);

    const tier = this.resolveTier(this.score());
    this.tier.set(tier);
    this.reward.set(this.rewardService.grantReward(tier));
  }

  private clearTimers(): void {
    if (this.targetShowTimeoutId) {
      clearTimeout(this.targetShowTimeoutId);
      this.targetShowTimeoutId = null;
    }

    this.clearHideTimer();
  }

  private clearHideTimer(): void {
    if (this.targetHideTimeoutId) {
      clearTimeout(this.targetHideTimeoutId);
      this.targetHideTimeoutId = null;
    }
  }

  private resolveTier(score: number): RewardTier {
    if (score <= 1) return 'low';
    if (score <= 4) return 'mid';
    if (score <= 7) return 'high';
    return 'perfect';
  }
}
