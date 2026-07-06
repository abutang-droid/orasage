import type { CollectionConfig } from 'payload';
import { requiredText } from '../lib/validators';

/** 国家/地区 — ISO 3166-1 alpha-2 */
export const GeoCountries: CollectionConfig = {
  slug: 'geo-countries',
  labels: {
    singular: '国家/地区',
    plural: '国家/地区',
  },
  access: {
    read: () => true,
  },
  admin: {
    group: '祈福地理',
    useAsTitle: 'nameZh',
    defaultColumns: ['code', 'nameZh', 'region', 'sortOrder', 'wpStatus'],
    description: '国家与所属大洲。主流信仰在「国家主流信仰」集合维护。',
  },
  fields: [
    {
      name: 'code',
      label: 'ISO 代码',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'ISO 3166-1 alpha-2，如 BR、TH、TW' },
      validate: (value: unknown) => requiredText(value, '请填写 ISO 代码'),
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
      name: 'region',
      label: '所属大洲',
      type: 'relationship',
      relationTo: 'geo-regions',
      required: true,
      index: true,
    },
    {
      name: 'sortOrder',
      label: '排序',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: '同大洲内列表排序' },
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
