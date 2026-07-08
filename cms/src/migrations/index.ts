import * as migration_20260701_135144_initial from './20260701_135144_initial';
import * as migration_20260702_120000_wp_import_fields from './20260702_120000_wp_import_fields';
import * as migration_20260702_140000_add_daozang_publish_sections from './20260702_140000_add_daozang_publish_sections';
import * as migration_20260703_045532_faiths_sanctuaries from './20260703_045532_faiths_sanctuaries';
import * as migration_20260703_150000_home_hero_global from './20260703_150000_home_hero_global';
import * as migration_20260703_180000_bazi_feed from './20260703_180000_bazi_feed';
import * as migration_20260703_181000_bazi_feed_locked_docs_rels from './20260703_181000_bazi_feed_locked_docs_rels';
import * as migration_20260703_190000_bazi_home_hero_global from './20260703_190000_bazi_home_hero_global';
import * as migration_20260703_191000_bazi_home_hero_locked_docs_rels from './20260703_191000_bazi_home_hero_locked_docs_rels';
import * as migration_20260703_200000_ziwei_home_hero_global from './20260703_200000_ziwei_home_hero_global';
import * as migration_20260703_201000_ziwei_home_hero_locked_docs_rels from './20260703_201000_ziwei_home_hero_locked_docs_rels';
import * as migration_20260703_210000_ziwei_feed from './20260703_210000_ziwei_feed';
import * as migration_20260704_050000_shop_home_hero_global from './20260704_050000_shop_home_hero_global';
import * as migration_20260704_051000_shop_home_hero_locked_docs_rels from './20260704_051000_shop_home_hero_locked_docs_rels';
import * as migration_20260704_140000_users_orasage_user_id from './20260704_140000_users_orasage_user_id';
import * as migration_20260705_110000_media_alt_nullable from './20260705_110000_media_alt_nullable';
import * as migration_20260705_120000_home_hero_locked_docs_rels from './20260705_120000_home_hero_locked_docs_rels';
import * as migration_20260705_130000_tarot_home_hero_global from './20260705_130000_tarot_home_hero_global';
import * as migration_20260705_131000_tarot_home_hero_locked_docs_rels from './20260705_131000_tarot_home_hero_locked_docs_rels';
import * as migration_20260706_100000_geo_faith from './20260706_100000_geo_faith';
import * as migration_20260706_120000_worship_facing from './20260706_120000_worship_facing';
import * as migration_20260706_140000_shop_product_images from './20260706_140000_shop_product_images';
import * as migration_20260707_100000_shop_product_pages from './20260707_100000_shop_product_pages';
import * as migration_20260707_150000_shop_product_video from './20260707_150000_shop_product_video';
import * as migration_20260708_090000_daozang_taxonomy from './20260708_090000_daozang_taxonomy';

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
  {
    up: migration_20260703_200000_ziwei_home_hero_global.up,
    down: migration_20260703_200000_ziwei_home_hero_global.down,
    name: '20260703_200000_ziwei_home_hero_global',
  },
  {
    up: migration_20260703_201000_ziwei_home_hero_locked_docs_rels.up,
    down: migration_20260703_201000_ziwei_home_hero_locked_docs_rels.down,
    name: '20260703_201000_ziwei_home_hero_locked_docs_rels',
  },
  {
    up: migration_20260703_210000_ziwei_feed.up,
    down: migration_20260703_210000_ziwei_feed.down,
    name: '20260703_210000_ziwei_feed',
  },
  {
    up: migration_20260704_050000_shop_home_hero_global.up,
    down: migration_20260704_050000_shop_home_hero_global.down,
    name: '20260704_050000_shop_home_hero_global',
  },
  {
    up: migration_20260704_051000_shop_home_hero_locked_docs_rels.up,
    down: migration_20260704_051000_shop_home_hero_locked_docs_rels.down,
    name: '20260704_051000_shop_home_hero_locked_docs_rels',
  },
  {
    up: migration_20260704_140000_users_orasage_user_id.up,
    down: migration_20260704_140000_users_orasage_user_id.down,
    name: '20260704_140000_users_orasage_user_id',
  },
  {
    up: migration_20260705_110000_media_alt_nullable.up,
    down: migration_20260705_110000_media_alt_nullable.down,
    name: '20260705_110000_media_alt_nullable',
  },
  {
    up: migration_20260705_120000_home_hero_locked_docs_rels.up,
    down: migration_20260705_120000_home_hero_locked_docs_rels.down,
    name: '20260705_120000_home_hero_locked_docs_rels',
  },
  {
    up: migration_20260705_130000_tarot_home_hero_global.up,
    down: migration_20260705_130000_tarot_home_hero_global.down,
    name: '20260705_130000_tarot_home_hero_global',
  },
  {
    up: migration_20260705_131000_tarot_home_hero_locked_docs_rels.up,
    down: migration_20260705_131000_tarot_home_hero_locked_docs_rels.down,
    name: '20260705_131000_tarot_home_hero_locked_docs_rels',
  },
  {
    up: migration_20260706_100000_geo_faith.up,
    down: migration_20260706_100000_geo_faith.down,
    name: '20260706_100000_geo_faith',
  },
  {
    up: migration_20260706_120000_worship_facing.up,
    down: migration_20260706_120000_worship_facing.down,
    name: '20260706_120000_worship_facing',
  },
  {
    up: migration_20260706_140000_shop_product_images.up,
    down: migration_20260706_140000_shop_product_images.down,
    name: '20260706_140000_shop_product_images',
  },
  {
    up: migration_20260707_100000_shop_product_pages.up,
    down: migration_20260707_100000_shop_product_pages.down,
    name: '20260707_100000_shop_product_pages',
  },
  {
    up: migration_20260707_150000_shop_product_video.up,
    down: migration_20260707_150000_shop_product_video.down,
    name: '20260707_150000_shop_product_video',
  },
  {
    up: migration_20260708_090000_daozang_taxonomy.up,
    down: migration_20260708_090000_daozang_taxonomy.down,
    name: '20260708_090000_daozang_taxonomy',
  },
];
