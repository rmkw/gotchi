import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { InventoryStore } from '../../core/store/inventory.store';
import { PetStore } from '../../core/store/pet.store';

@Component({
  selector: 'app-inventory-page',
  imports: [],
  templateUrl: './inventory-page.component.html',
  styleUrl: './inventory-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryPageComponent {
  private readonly inventoryStore = inject(InventoryStore);
  private readonly petStore = inject(PetStore);

  readonly items = this.inventoryStore.inventoryView;
  readonly pet = this.petStore.pet;

  useItem(itemId: string): void {
    this.inventoryStore.useItem(itemId);
  }
}
