import type { CollectionConfig } from 'payload';
import { requiredText } from '../lib/validators';

/** 紫微十四主星百科简介 — 对应 ziwei /knowledge 首页星曜卡片 */
export const ZiweiKnowledgeStars: CollectionConfig = {
  slug: 'ziwei-knowledge-stars',
  labels: {
    singular: '紫微主星百科',
    plural: '紫微主星百科',
  },
  access: {
    read: () => true,
  },
  admin: {
    group: '紫微知识库',
    useAsTitle: 'starName',
    defaultColumns: ['code', 'starName', 'wpStatus', 'sortOrder'],
    description: '十四主星一句话简介与属性标签，供紫微知识库首页展示。',
  },
  fields: [
    {
      name: 'code',
      label: 'URL Slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: '拼音 slug，如 ziwei、tianji，与 /knowledge/{slug}/overview 一致' },
      validate: (value: unknown) => requiredText(value, '请填写 URL Slug'),
    },
    {
      name: 'starName',
      label: '主星名',
      type: 'text',
      required: true,
      validate: (value: unknown) => requiredText(value, '请填写主星名'),
    },
    {
      name: 'brief',
      label: '一句话简介',
      type: 'textarea',
      required: true,
      admin: { rows: 3 },
      validate: (value: unknown) => requiredText(value, '请填写简介'),
    },
    {
      name: 'keywords',
      label: '关键词',
      type: 'text',
      admin: { description: '逗号分隔，如「帝星,尊贵,领导」' },
    },
    {
      name: 'nature',
      label: '阴阳五行',
      type: 'text',
      admin: { description: '如「阳土」' },
    },
    {
      name: 'element',
      label: '化气',
      type: 'text',
      admin: { description: '如「尊」' },
    },
    {
      name: 'sortOrder',
      label: '排序（小在前）',
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
