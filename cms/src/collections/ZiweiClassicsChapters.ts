import type { CollectionConfig } from 'payload';
import { requiredText } from '../lib/validators';

/** 紫微古籍原典 — 章节与段落（JSON 存储段落列表，供 ziwei /library 渲染） */
export const ZiweiClassicsChapters: CollectionConfig = {
  slug: 'ziwei-classics-chapters',
  labels: {
    singular: '紫微古籍章节',
    plural: '紫微古籍章节',
  },
  access: {
    read: () => true,
  },
  admin: {
    group: '紫微知识库',
    useAsTitle: 'title',
    defaultColumns: ['code', 'title', 'book', 'chapterIndex', 'wpStatus'],
    description: '古籍章节原文。段落以 JSON 数组存储（id、idx、text、translation、niNote）。',
  },
  fields: [
    {
      name: 'code',
      label: '代码 ID',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: '如 gusuifu-0（书目 code + 章节序号）' },
      validate: (value: unknown) => requiredText(value, '请填写代码 ID'),
    },
    {
      name: 'book',
      label: '所属书目',
      type: 'relationship',
      relationTo: 'ziwei-classics-books',
      required: true,
      admin: { description: '关联的古籍书目' },
    },
    {
      name: 'chapterIndex',
      label: '章节序号',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: { description: '从 0 开始，与 ziwei /library/[book]/[chapter] 一致' },
    },
    {
      name: 'title',
      label: '章节标题',
      type: 'text',
      required: true,
      validate: (value: unknown) => requiredText(value, '请填写章节标题'),
    },
    {
      name: 'subtitle',
      label: '副标题',
      type: 'text',
    },
    {
      name: 'paragraphs',
      label: '段落列表',
      type: 'json',
      required: true,
      admin: {
        description:
          'JSON 数组：[{ "id": "gsf-1-1", "idx": 1, "text": "原文…", "translation": "可选", "niNote": "可选" }]',
      },
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
