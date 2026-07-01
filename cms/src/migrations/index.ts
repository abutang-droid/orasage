import * as migration_20260701_135144_initial from './20260701_135144_initial';

export const migrations = [
  {
    up: migration_20260701_135144_initial.up,
    down: migration_20260701_135144_initial.down,
    name: '20260701_135144_initial'
  },
];
