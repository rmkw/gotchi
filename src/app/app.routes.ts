import { Routes } from '@angular/router';
import { InventoryPageComponent } from './features/inventory/inventory-page.component';
import { MinigamesPageComponent } from './features/minigames/minigames-page.component';
import { ReactionGamePageComponent } from './features/minigames/games/reaction-game-page.component';

export const routes: Routes = [
  {
    path: '',
    component: InventoryPageComponent,
  },
  {
    path: 'minigames',
    component: MinigamesPageComponent,
  },
  {
    path: 'minigames/reaction',
    component: ReactionGamePageComponent,
  },
];
