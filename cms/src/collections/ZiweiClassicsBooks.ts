import type { CollectionConfig } from 'payload';
import { requiredText } from '../lib/validators';

/** 紫微古籍原典 — 书目元数据（骨髓赋、紫微斗数全集、全书等） */
export const ZiweiClassicsBooks: CollectionConfig = {
  slug: 'ziwei-classics-books',
  labels: {
    singular: '紫微古籍',
    plural: '紫微古籍书目',
  },
  access: {
    read: () => true,
  },
  admin: {
    group: '紫微知识库',
    useAsTitle: 'title',
    defaultColumns: ['code', 'title', 'dynasty', 'wpStatus', 'sortOrder'],
    description: '紫微斗数古籍原典书目。章节内容在「紫微古籍章节」中维护。',
  },
  fields: [
    {
      name: 'code',
      label: '代码 ID',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: '稳定标识，与 ziwei /library URL 一致，如 gusuifu、quanji' },
      validate: (value: unknown) => requiredText(value, '请填写代码 ID'),
    },
    {
      name: 'title',
      label: '书名',
      type: 'text',
      required: true,
      validate: (value: unknown) => requiredText(value, '请填写书名'),
    },
    {
      name: 'dynasty',
      label: '朝代',
      type: 'text',
      admin: { description: '如「明代」' },
    },
    {
      name: 'author',
      label: '作者',
      type: 'text',
    },
    {
      name: 'intro',
      label: '简介',
      type: 'textarea',
      admin: { rows: 4 },
    },
    {
      name: 'wordCount',
      label: '总字数（约）',
      type: 'number',
      admin: { position: 'sidebar' },
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
