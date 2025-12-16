export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlockedAt?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}