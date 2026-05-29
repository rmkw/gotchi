import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

type SpriteMood =
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'sleepy'
  | 'sleeping'
  | 'dirty'
  | 'sick';
type ScenePeriod = 'day' | 'night';

interface SpriteReviewItem {
  mood: SpriteMood;
  label: string;
  spriteSheetUrl: string;
  aspectRatio: string;
}

interface DeadReviewItem {
  period: ScenePeriod;
  label: string;
  imageUrl: string;
}

const GOTCHI_ASSET_BASE = 'assets/gotchi';

const sceneBackgrounds: Record<ScenePeriod, string> = {
  day: `${GOTCHI_ASSET_BASE}/escenario-dia.png`,
  night: `${GOTCHI_ASSET_BASE}/escenario-noche.png`,
};

@Component({
  selector: 'app-sprite-review-page',
  imports: [RouterLink],
  templateUrl: './sprite-review-page.component.html',
  styleUrl: './sprite-review-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpriteReviewPageComponent implements OnInit, OnDestroy {
  private spriteIntervalId: ReturnType<typeof setInterval> | null = null;

  readonly spriteFrameIndex = signal(0);
  readonly sceneBackgrounds = sceneBackgrounds;

  readonly spriteBackgroundPosition = computed(() => {
    const frame = this.spriteFrameIndex();
    const column = frame % 6;
    const row = Math.floor(frame / 6);

    return `${column * 20}% ${row * 20}%`;
  });

  readonly sprites: SpriteReviewItem[] = [
    {
      mood: 'neutral',
      label: 'neutral',
      spriteSheetUrl: `${GOTCHI_ASSET_BASE}/animation-sequence-neutral.png`,
      aspectRatio: '270 / 410',
    },
    {
      mood: 'happy',
      label: 'happy',
      spriteSheetUrl: `${GOTCHI_ASSET_BASE}/animation-sequence-happy.png`,
      aspectRatio: '322 / 419',
    },
    {
      mood: 'sad',
      label: 'sad / triste',
      spriteSheetUrl: `${GOTCHI_ASSET_BASE}/animation-sequence-triste.png`,
      aspectRatio: '292 / 404',
    },
    {
      mood: 'sleepy',
      label: 'sleepy / sueño',
      spriteSheetUrl: `${GOTCHI_ASSET_BASE}/animation-sequence-sueno.png`,
      aspectRatio: '463 / 411',
    },
    {
      mood: 'sleeping',
      label: 'sleeping / dormido',
      spriteSheetUrl: `${GOTCHI_ASSET_BASE}/animation-sequence-dormido.png`,
      aspectRatio: '398 / 458',
    },
    {
      mood: 'dirty',
      label: 'dirty / sucio',
      spriteSheetUrl: `${GOTCHI_ASSET_BASE}/animation-sequence-sucio.png`,
      aspectRatio: '494 / 421',
    },
    {
      mood: 'sick',
      label: 'sick / enfermo',
      spriteSheetUrl: `${GOTCHI_ASSET_BASE}/animation-sequence-enfermo.png`,
      aspectRatio: '393 / 436',
    },
  ];

  readonly deadItems: DeadReviewItem[] = [
    {
      period: 'day',
      label: 'dead / día',
      imageUrl: `${GOTCHI_ASSET_BASE}/dia-gameover.png`,
    },
    {
      period: 'night',
      label: 'dead / noche',
      imageUrl: `${GOTCHI_ASSET_BASE}/noche-gameover.png`,
    },
  ];

  ngOnInit(): void {
    this.spriteIntervalId = setInterval(() => {
      this.spriteFrameIndex.update((frame) => (frame + 1) % 36);
    }, 120);
  }

  ngOnDestroy(): void {
    if (this.spriteIntervalId) {
      clearInterval(this.spriteIntervalId);
      this.spriteIntervalId = null;
    }
  }
}
