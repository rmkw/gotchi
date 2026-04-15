import { Routes } from '@angular/router';

import { MinigamesPageComponent } from './features/minigames/minigames-page.component';
import { ReactionGamePageComponent } from './features/minigames/games/reaction-game-page.component';
import { InventoryPageComponent2 } from './features/inventory/i';
import { InventoryPageComponent3 } from './features/inventory/i2';
import { InventoryPageComponent4 } from './features/inventory/i3';
import { InventoryPageComponent } from './features/inventory/inventory-page.component';

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
