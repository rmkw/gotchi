import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { PetStore } from './core/store/pet.store';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly petStore = inject(PetStore);

  readonly pet = this.petStore.pet;
  readonly mood = this.petStore.mood;
  readonly statusMessage = this.petStore.statusMessage;
  readonly isTicking = this.petStore.isTicking;

  readonly petFace = computed(() => {
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

  ngOnInit(): void {
    this.petStore.startTicking();
  }

  ngOnDestroy(): void {
    this.petStore.stopTicking();
  }

  feed(): void {
    this.petStore.feed();
  }

  play(): void {
    this.petStore.play();
  }

  sleep(): void {
    this.petStore.sleep();
  }

  clean(): void {
    this.petStore.clean();
  }

  resetPet(): void {
    this.petStore.resetPet();
  }
}
