import { Routes } from '@angular/router';
import { InventoryPageComponent } from './features/inventory/inventory-page.component';
import { MinigamesPageComponent } from './features/minigames/minigames-page.component';
import { ReactionGamePageComponent } from './features/minigames/games/reaction-game-page.component';
import { InventoryPageComponent2 } from './features/inventory/i';
import { InventoryPageComponent3 } from './features/inventory/i2';
import { InventoryPageComponent4 } from './features/inventory/i3';

export const routes: Routes = [
  {
    path: '',
    component: InventoryPageComponent,
  },
  {
    path: 'i',
    component: InventoryPageComponent2,
  },
  {
    path: 'i2',
    component: InventoryPageComponent3,
  },
  {
    path: 'i3',
    component: InventoryPageComponent4,
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
