import * as migration_20260701_135144_initial from './20260701_135144_initial';
import * as migration_20260702_120000_wp_import_fields from './20260702_120000_wp_import_fields';

export const migrations = [
  {
    up: migration_20260701_135144_initial.up,
    down: migration_20260701_135144_initial.down,
    name: '20260701_135144_initial'
  },
  {
    up: migration_20260702_120000_wp_import_fields.up,
    down: migration_20260702_120000_wp_import_fields.down,
    name: '20260702_120000_wp_import_fields'
  },
];
