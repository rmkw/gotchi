export type PetMood =
  | 'happy'
  | 'neutral'
  | 'sad'
  | 'sleepy'
  | 'sick'
  | 'dirty'
  | 'dead';

export interface Pet {
  name: string;
  food: number;
  happiness: number;
  energy: number;
  cleanliness: number;
  health: number;
  isDead: boolean;
}
