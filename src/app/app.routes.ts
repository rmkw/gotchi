import { Routes } from '@angular/router';

import { MinigamesPageComponent } from './features/minigames/minigames-page.component';
import { ReactionGamePageComponent } from './features/minigames/games/reaction/reaction-game-page.component';
import { InventoryPageComponent } from './features/inventory/inventory-page.component';
import { SpriteReviewPageComponent } from './features/sprite-review/sprite-review-page.component';

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
  {
    path: 'revisarsprite',
    component: SpriteReviewPageComponent,
  },
];
