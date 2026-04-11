import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-minigames-page',
  imports: [RouterLink],
  templateUrl: './minigames-page.component.html',
  styleUrl: './minigames-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MinigamesPageComponent {}
