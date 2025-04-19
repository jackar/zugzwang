import { modernPgn } from './test';

export const games = {
  modern: {
    name: 'Modern Games',
    games: [modernPgn]
  }
};

export type GameCategory = keyof typeof games; 