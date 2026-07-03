import * as migration_20260701_135144_initial from './20260701_135144_initial';
import * as migration_20260702_120000_wp_import_fields from './20260702_120000_wp_import_fields';
import * as migration_20260702_140000_add_daozang_publish_sections from './20260702_140000_add_daozang_publish_sections';
import * as migration_20260703_045532_faiths_sanctuaries from './20260703_045532_faiths_sanctuaries';
import * as migration_20260703_150000_home_hero_global from './20260703_150000_home_hero_global';
import * as migration_20260703_180000_bazi_feed from './20260703_180000_bazi_feed';
import * as migration_20260703_181000_bazi_feed_locked_docs_rels from './20260703_181000_bazi_feed_locked_docs_rels';
import * as migration_20260703_190000_bazi_home_hero_global from './20260703_190000_bazi_home_hero_global';
import * as migration_20260703_191000_bazi_home_hero_locked_docs_rels from './20260703_191000_bazi_home_hero_locked_docs_rels';

export const migrations = [
  {
    up: migration_20260701_135144_initial.up,
    down: migration_20260701_135144_initial.down,
    name: '20260701_135144_initial',
  },
  {
    up: migration_20260702_120000_wp_import_fields.up,
    down: migration_20260702_120000_wp_import_fields.down,
    name: '20260702_120000_wp_import_fields',
  },
  {
    up: migration_20260702_140000_add_daozang_publish_sections.up,
    down: migration_20260702_140000_add_daozang_publish_sections.down,
    name: '20260702_140000_add_daozang_publish_sections',
  },
  {
    up: migration_20260703_045532_faiths_sanctuaries.up,
    down: migration_20260703_045532_faiths_sanctuaries.down,
    name: '20260703_045532_faiths_sanctuaries'
  },
  {
    up: migration_20260703_150000_home_hero_global.up,
    down: migration_20260703_150000_home_hero_global.down,
    name: '20260703_150000_home_hero_global',
  },
  {
    up: migration_20260703_180000_bazi_feed.up,
    down: migration_20260703_180000_bazi_feed.down,
    name: '20260703_180000_bazi_feed',
  },
  {
    up: migration_20260703_181000_bazi_feed_locked_docs_rels.up,
    down: migration_20260703_181000_bazi_feed_locked_docs_rels.down,
    name: '20260703_181000_bazi_feed_locked_docs_rels',
  },
  {
    up: migration_20260703_190000_bazi_home_hero_global.up,
    down: migration_20260703_190000_bazi_home_hero_global.down,
    name: '20260703_190000_bazi_home_hero_global',
  },
  {
    up: migration_20260703_191000_bazi_home_hero_locked_docs_rels.up,
    down: migration_20260703_191000_bazi_home_hero_locked_docs_rels.down,
    name: '20260703_191000_bazi_home_hero_locked_docs_rels',
  },
];
