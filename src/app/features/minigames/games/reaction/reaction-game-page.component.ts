import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ReactionGameComponent } from './components/reaction-game.component';

@Component({
  selector: 'app-reaction-game-page',
  imports: [ ReactionGameComponent],
  templateUrl: './reaction-game-page.component.html',
  styleUrl: './reaction-game-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReactionGamePageComponent {}
