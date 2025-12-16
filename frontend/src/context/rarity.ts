export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export const rarityColors = {
  common: '#636E72',
  rare: '#0984E3',
  epic: '#6C5CE7',
  legendary: '#FDCB6E',
} as const;

export const getRarityColor = (rarity?: Rarity) =>
  rarityColors[rarity ?? 'common'];
