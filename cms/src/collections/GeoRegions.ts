import type { CollectionConfig } from 'payload';
import { cmsAccessForSlug } from '../lib/cmsStaffAccess';
import { requiredText } from '../lib/validators';

/** 大洲 — 祈福地图选路第一层 */
export const GeoRegions: CollectionConfig = {
  slug: 'geo-regions',
  labels: {
    singular: '大洲',
    plural: '大洲',
  },
  access: cmsAccessForSlug('geo-regions'),
  admin: {
    group: '祈福地理',
    useAsTitle: 'nameZh',
    defaultColumns: ['code', 'nameZh', 'nameEn', 'sortOrder', 'wpStatus'],
    description: '世界地图大洲热点。mapX/mapY 为 SVG 视图坐标（0–100）。',
  },
  fields: [
    {
      name: 'code',
      label: '代码',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: '如 asia、europe、americas、africa、oceania' },
      validate: (value: unknown) => requiredText(value, '请填写代码'),
    },
    {
      name: 'nameZh',
      label: '中文名',
      type: 'text',
      required: true,
      validate: (value: unknown) => requiredText(value, '请填写中文名'),
    },
    {
      name: 'nameEn',
      label: '英文名',
      type: 'text',
      required: true,
      validate: (value: unknown) => requiredText(value, '请填写英文名'),
    },
    {
      name: 'mapX',
      label: '地图 X（%）',
      type: 'number',
      required: true,
      min: 0,
      max: 100,
      admin: { description: 'SVG 世界地图横坐标 0–100' },
    },
    {
      name: 'mapY',
      label: '地图 Y（%）',
      type: 'number',
      required: true,
      min: 0,
      max: 100,
      admin: { description: 'SVG 世界地图纵坐标 0–100' },
    },
    {
      name: 'sortOrder',
      label: '排序',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
    {
      name: 'wpStatus',
      label: '发布状态',
      type: 'select',
      defaultValue: 'publish',
      options: [
        { label: '已发布', value: 'publish' },
        { label: '草稿', value: 'draft' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
};
