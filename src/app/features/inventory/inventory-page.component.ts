import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { InventoryStore } from '../../core/store/inventory.store';
import { PetStore } from '../../core/store/pet.store';
import { ItemEffect } from '../../core/models/item.model';
import { GotchiAiService } from '../../core/ai/gotchi-ai.service';
import { GotchiAiProvider } from '../../core/ai/gotchi-ai.types';
import { PetMood } from '../../core/models/pet.model';

type ScenePeriod = 'day' | 'night';
type SceneMood = PetMood | 'sleeping';
const PET_NAME_STORAGE_KEY = 'gotchi-pet-name';
const MAX_PET_NAME_LENGTH = 25;

interface PetScene {
  mood: SceneMood;
  period: ScenePeriod;
  label: string;
  imageUrl: string | null;
  spriteSheetUrl: string | null;
  spriteAspectRatio: string | null;
  backgroundUrl: string;
  usesSpriteSheet: boolean;
}

interface SpriteSheetConfig {
  url: string;
  aspectRatio: string;
}

const GOTCHI_ASSET_BASE = '/assets/gotchi';

const sceneBackgrounds: Record<ScenePeriod, string> = {
  day: `${GOTCHI_ASSET_BASE}/escenario-dia.png`,
  night: `${GOTCHI_ASSET_BASE}/escenario-noche.png`,
};

const spriteSheets: Partial<Record<SceneMood, SpriteSheetConfig>> = {
  neutral: {
    url: `${GOTCHI_ASSET_BASE}/animation-sequence-neutral.png`,
    aspectRatio: '270 / 410',
  },
  happy: {
    url: `${GOTCHI_ASSET_BASE}/animation-sequence-happy.png`,
    aspectRatio: '322 / 419',
  },
  sad: {
    url: `${GOTCHI_ASSET_BASE}/animation-sequence-triste.png`,
    aspectRatio: '292 / 404',
  },
  sleepy: {
    url: `${GOTCHI_ASSET_BASE}/animation-sequence-sueno.png`,
    aspectRatio: '463 / 411',
  },
  sleeping: {
    url: `${GOTCHI_ASSET_BASE}/animation-sequence-dormido.png`,
    aspectRatio: '398 / 458',
  },
  dirty: {
    url: `${GOTCHI_ASSET_BASE}/animation-sequence-sucio.png`,
    aspectRatio: '494 / 421',
  },
  sick: {
    url: `${GOTCHI_ASSET_BASE}/animation-sequence-enfermo.png`,
    aspectRatio: '393 / 436',
  },
};

const sceneImages: Record<ScenePeriod, Partial<Record<SceneMood, string>>> = {
  day: {
    dead: `${GOTCHI_ASSET_BASE}/dia-gameover.png`,
  },
  night: {
    dead: `${GOTCHI_ASSET_BASE}/noche-gameover.png`,
  },
};

@Component({
  selector: 'app-inventory-page',
  imports: [RouterLink],
  templateUrl: './inventory-page.component.html',
  styleUrl: './inventory-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryPageComponent implements OnInit, OnDestroy {
  private readonly inventoryStore = inject(InventoryStore);
  private readonly petStore = inject(PetStore);
  private readonly gotchiAiService = inject(GotchiAiService);
  private clockIntervalId: ReturnType<typeof setInterval> | null = null;
  private spriteIntervalId: ReturnType<typeof setInterval> | null = null;

  readonly items = this.inventoryStore.inventoryView;
  readonly totalItemCount = computed(() =>
    this.items().reduce((total, item) => total + item.quantity, 0),
  );
  readonly pet = this.petStore.pet;
  readonly mood = this.petStore.mood;
  readonly statusMessage = this.petStore.statusMessage;
  readonly isTicking = this.petStore.isTicking;
  readonly isSleeping = this.petStore.isSleeping;
  readonly deathCount = this.petStore.deathCount;
  readonly openDrawer = signal<
    'food' | 'medicine' | 'cleaning' | 'toy' | 'special' | null
  >(null);

  readonly talkInput = signal('');
  readonly userLastMessage = signal('');
  readonly gotchiReply = signal('¡Woof, woof!');
  readonly isTalking = signal(false);
  readonly isConfigModalOpen = signal(false);
  readonly activeAiProvider = signal<GotchiAiProvider>('gemini');
  readonly aiConfigProvider = signal<GotchiAiProvider | null>(null);
  readonly geminiApiKey = signal('');
  readonly minimaxApiKey = signal('');
  readonly aiTestMessage = signal('');
  readonly geminiConfigReady = signal(false);
  readonly isNameModalOpen = signal(false);
  readonly petNameInput = signal('');
  readonly petNameError = signal('');
  readonly isPetNameReady = signal(hasStoredPetName());
  readonly currentTime = signal(new Date());
  readonly spriteFrameIndex = signal(0);

  readonly scenePeriod = computed<ScenePeriod>(() => {
    const hour = this.currentTime().getHours();
    return hour >= 6 && hour < 19 ? 'day' : 'night';
  });

  readonly scenePeriodLabel = computed(() =>
    this.scenePeriod() === 'day' ? 'día' : 'noche',
  );

  readonly currentClockLabel = computed(() => {
    const date = this.currentTime();
    const hours = date.getHours();
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return `${displayHours.toString().padStart(2, '0')}:${minutes} ${period}`;
  });

  readonly petNameCharactersLeft = computed(
    () => MAX_PET_NAME_LENGTH - this.petNameInput().length,
  );

  readonly activeAiProviderLabel = computed(() =>
    this.activeAiProvider() === 'gemini' ? 'Gemini' : 'MiniMax',
  );

  readonly aiStatusLabel = computed(() => {
    const provider = this.aiConfigProvider();

    if (!provider) {
      return 'configurar ia';
    }

    return provider === 'gemini' ? 'gemini listo' : 'minimax listo';
  });

  readonly activeAiProviderBlocked = computed(() => {
    const configuredProvider = this.aiConfigProvider();
    return !!configuredProvider && configuredProvider !== this.activeAiProvider();
  });

  readonly connectedAiProviderLabel = computed(() => {
    const provider = this.aiConfigProvider();
    if (!provider) return '';
    return provider === 'gemini' ? 'Gemini' : 'MiniMax';
  });

  readonly sceneMood = computed<SceneMood>(() => {
    if (this.isSleeping()) {
      return 'sleeping';
    }

    return this.mood();
  });

  readonly activePetScene = computed<PetScene>(() => {
    const period = this.scenePeriod();
    const mood = this.sceneMood();
    const imageUrl = sceneImages[period][mood] ?? null;
    const spriteSheet = imageUrl ? null : (spriteSheets[mood] ?? null);

    return {
      mood,
      period,
      label: `${mood} · ${this.scenePeriodLabel()}`,
      imageUrl,
      spriteSheetUrl: spriteSheet?.url ?? null,
      spriteAspectRatio: spriteSheet?.aspectRatio ?? null,
      backgroundUrl: sceneBackgrounds[period],
      usesSpriteSheet: !!spriteSheet,
    };
  });

  readonly spriteBackgroundPosition = computed(() => {
    const frame = this.spriteFrameIndex();
    const column = frame % 6;
    const row = Math.floor(frame / 6);

    return `${column * 20}% ${row * 20}%`;
  });

  readonly canSleep = computed(() => {
    const pet = this.pet();
    return !pet.isDead && pet.energy < 51;
  });

  readonly sleepButtonLabel = computed(() => {
    return this.isSleeping() ? 'Despertar ⏰' : 'Dormir 💤';
  });

  readonly drawers = computed(() => {
    const items = this.items();

    return [
      {
        type: 'food' as const,
        label: 'Comida',
        icon: '🍕',
        accent: 'rose',
        items: items.filter((item) => item.type === 'food'),
      },
      {
        type: 'medicine' as const,
        label: 'Medicina',
        icon: '💉',
        accent: 'emerald',
        items: items.filter((item) => item.type === 'medicine'),
      },
      {
        type: 'cleaning' as const,
        label: 'Limpieza',
        icon: '🧼',
        accent: 'sky',
        items: items.filter((item) => item.type === 'cleaning'),
      },
      {
        type: 'toy' as const,
        label: 'Juguetes',
        icon: '🧸',
        accent: 'amber',
        items: items.filter((item) => item.type === 'toy'),
      },
      {
        type: 'special' as const,
        label: 'Especiales',
        icon: '✨',
        accent: 'fuchsia',
        items: items.filter((item) => item.type === 'special'),
      },
    ];
  });

  ngOnInit(): void {
    if (this.isPetNameReady()) {
      this.petStore.startTicking();
    } else {
      this.openNameModal();
      this.petStore.stopTicking();
    }

    const aiConfig = this.gotchiAiService.getConfig();
    this.geminiConfigReady.set(!!aiConfig?.apiKey);
    this.aiConfigProvider.set(aiConfig?.provider ?? null);
    this.activeAiProvider.set(aiConfig?.provider ?? 'gemini');
    this.clockIntervalId = setInterval(() => {
      this.currentTime.set(new Date());
    }, 60000);
    this.spriteIntervalId = setInterval(() => {
      this.spriteFrameIndex.update((frame) => (frame + 1) % 36);
    }, 120);
  }

  ngOnDestroy(): void {
    if (this.clockIntervalId) {
      clearInterval(this.clockIntervalId);
      this.clockIntervalId = null;
    }

    if (this.spriteIntervalId) {
      clearInterval(this.spriteIntervalId);
      this.spriteIntervalId = null;
    }
  }

  toggleDrawer(
    type: 'food' | 'medicine' | 'cleaning' | 'toy' | 'special',
  ): void {
    this.openDrawer.update((current) => (current === type ? null : type));
  }

  useItem(itemId: string): void {
    this.inventoryStore.useItem(itemId);
  }

  sleep(): void {
    this.petStore.sleep();
  }

  resetPet(): void {
    this.petStore.resetPet();
    localStorage.removeItem(PET_NAME_STORAGE_KEY);
    this.isPetNameReady.set(false);
    this.petStore.stopTicking();
    this.openNameModal();
  }

  openNameModal(): void {
    this.petNameInput.set('');
    this.petNameError.set('');
    this.isNameModalOpen.set(true);
  }

  savePetName(): void {
    const name = sanitizePetName(this.petNameInput());

    if (!name) {
      this.petNameError.set('Escribe un nombre para tu cachorrito.');
      return;
    }

    this.petStore.renamePet(name);
    this.isPetNameReady.set(true);
    this.isNameModalOpen.set(false);
    this.petNameInput.set('');
    this.petNameError.set('');
    this.petStore.startTicking();
  }

  openTalk(): void {
    this.isConfigModalOpen.set(true);
  }

  closeConfigModal(): void {
    this.isConfigModalOpen.set(false);
    this.aiTestMessage.set('');
  }

  selectAiProvider(provider: GotchiAiProvider): void {
    this.activeAiProvider.set(provider);
    this.aiTestMessage.set('');
  }

  disconnectAiProvider(): void {
    this.gotchiAiService.clearConfig();
    this.geminiConfigReady.set(false);
    this.aiConfigProvider.set(null);
    this.aiTestMessage.set('IA desconectada. Ahora puedes conectar otro proveedor.');
  }

  async testAiConnection(): Promise<void> {
    if (this.activeAiProviderBlocked()) {
      this.aiTestMessage.set(
        `Desconecta ${this.connectedAiProviderLabel()} antes de activar otra IA.`,
      );
      return;
    }

    this.aiTestMessage.set('Probando conexión...');
    const provider = this.activeAiProvider();
    const apiKey =
      provider === 'gemini' ? this.geminiApiKey() : this.minimaxApiKey();

    const result = await this.gotchiAiService.testConnection(
      apiKey,
      provider,
    );
    this.aiTestMessage.set(result.message);

    if (result.ok) {
      this.gotchiAiService.saveConfig(apiKey, provider);
      this.geminiConfigReady.set(true);
      this.aiConfigProvider.set(provider);
      this.closeConfigModal();
    }
  }

  async sendTalkMessage(): Promise<void> {
    const message = this.talkInput().trim();
    if (!message) return;

    if (!this.geminiConfigReady()) {
      this.isConfigModalOpen.set(true);
      return;
    }

    this.userLastMessage.set(message);
    this.isTalking.set(true);
    this.gotchiReply.set('Pensando...');

    try {
      const reply = await this.gotchiAiService.sendMessage(message, {
        name: this.pet().name,
        mood: this.mood(),
        statusMessage: this.statusMessage(),
        health: this.pet().health,
        food: this.pet().food,
        happiness: this.pet().happiness,
        energy: this.pet().energy,
        cleanliness: this.pet().cleanliness,
        isSleeping: this.isSleeping(),
        isDead: this.pet().isDead,
      });

      this.gotchiReply.set(reply);
      this.talkInput.set('');
    } catch (error: any) {
      this.gotchiReply.set(error?.message || 'No pude responder ahorita.');
    } finally {
      this.isTalking.set(false);
    }
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

function hasStoredPetName(): boolean {
  return sanitizePetName(localStorage.getItem(PET_NAME_STORAGE_KEY) ?? '').length > 0;
}

function sanitizePetName(name: string): string {
  return name.trim().slice(0, MAX_PET_NAME_LENGTH);
}
