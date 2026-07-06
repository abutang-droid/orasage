import type { CollectionConfig } from 'payload';
import { requiredText } from '../lib/validators';

/** 紫微合盘知识 — 十四主星在夫妻宫的断语（原 heming-knowledge.ts） */
export const ZiweiHemingStars: CollectionConfig = {
  slug: 'ziwei-heming-stars',
  labels: {
    singular: '合盘夫妻宫断语',
    plural: '合盘夫妻宫断语',
  },
  access: {
    read: () => true,
  },
  admin: {
    group: '紫微知识库',
    useAsTitle: 'starName',
    defaultColumns: ['code', 'starName', 'wpStatus'],
    description: '十四主星在夫妻宫的合盘断语，供 AI 解读与运营编辑参考。',
  },
  fields: [
    {
      name: 'code',
      label: '代码 ID',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: '拼音 slug，如 ziwei' },
      validate: (value: unknown) => requiredText(value, '请填写代码 ID'),
    },
    {
      name: 'starName',
      label: '主星名',
      type: 'text',
      required: true,
      validate: (value: unknown) => requiredText(value, '请填写主星名'),
    },
    {
      name: 'summary',
      label: '一句话核心',
      type: 'textarea',
      required: true,
      admin: { rows: 2 },
      validate: (value: unknown) => requiredText(value, '请填写核心断语'),
    },
    {
      name: 'good',
      label: '吉象',
      type: 'textarea',
      admin: { rows: 3 },
    },
    {
      name: 'bad',
      label: '凶象 / 注意',
      type: 'textarea',
      admin: { rows: 3 },
    },
    {
      name: 'spouseTraits',
      label: '配偶特质',
      type: 'textarea',
      admin: { rows: 3 },
    },
    {
      name: 'timing',
      label: '婚期建议',
      type: 'textarea',
      admin: { rows: 2 },
    },
    {
      name: 'niQuote',
      label: '倪师原话',
      type: 'textarea',
      admin: { rows: 2 },
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
