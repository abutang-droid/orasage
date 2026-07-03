import type { CollectionConfig } from 'payload';

/** 全球宗教 taxonomy — 与塔罗 FaithPicker 的 code 对齐 */
export const Faiths: CollectionConfig = {
  slug: 'faiths',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'nameZh',
    defaultColumns: ['code', 'nameZh', 'nameEn', 'rank', 'wpStatus'],
    description: '宗教分类。code 与塔罗 App 信仰 ID 一致，圣地通过关联自动匹配。',
  },
  fields: [
    {
      name: 'code',
      label: '代码 ID',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: '稳定标识，如 christianity、buddhism、taoism',
      },
    },
    {
      name: 'nameZh',
      label: '中文名',
      type: 'text',
      required: true,
    },
    {
      name: 'nameEn',
      label: '英文名',
      type: 'text',
      required: true,
    },
    {
      name: 'emoji',
      type: 'text',
    },
    {
      name: 'rank',
      label: '排序（信众规模）',
      type: 'number',
      defaultValue: 50,
      admin: { position: 'sidebar' },
    },
    {
      name: 'adherentsM',
      label: '信众（百万）',
      type: 'number',
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
