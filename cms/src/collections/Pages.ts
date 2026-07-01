import type { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';

/**
 * 内容页面（骨架）：用于主门户 / 各命理 App 的文章、FAQ、公告等内容管理。
 * 后续可按需拆分为更细的 Collection（如 Articles / Announcements）。
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'appSource',
      type: 'select',
      options: ['main', 'bazi', 'ziwei', 'tarot', 'shop'],
      defaultValue: 'main',
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor(),
    },
  ],
};
