import { modernPgn } from './modern';

export const games = {
  Modern: modernPgn,
  // We can add more categories later:
  // Sicilian: sicilianPgn,
  // French: frenchPgn,
  // etc.
} as const;

export type GameCategory = keyof typeof games; 