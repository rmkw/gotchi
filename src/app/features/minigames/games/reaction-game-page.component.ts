import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactionGameComponent } from './reaction-game.component';

@Component({
  selector: 'app-reaction-game-page',
  imports: [RouterLink, ReactionGameComponent],
  templateUrl: './reaction-game-page.component.html',
  styleUrl: './reaction-game-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReactionGamePageComponent {}
