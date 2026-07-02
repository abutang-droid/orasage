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
    defaultColumns: ['title', 'wpType', 'wpStatus', 'appSource', 'updatedAt'],
    description: '导入的 WordPress 正文在「原文预览」中查看；公开预览：/view/[...slug]',
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
      type: 'collapsible',
      label: 'WordPress 迁移信息',
      admin: {
        initCollapsed: false,
        condition: (data) => Boolean(data?.legacyHtml || data?.sourceUrl || data?.wpId),
      },
      fields: [
        {
          name: 'legacyPreview',
          type: 'ui',
          admin: {
            components: {
              Field: '/components/LegacyHtmlPreview#LegacyHtmlPreview',
            },
          },
        },
        {
          name: 'legacyHtml',
          type: 'textarea',
          admin: {
            description: '从 c2.pub WordPress 迁移的原始 HTML。公开页 /view/[slug] 会渲染此字段。',
            rows: 12,
          },
        },
        {
          name: 'sourceUrl',
          type: 'text',
          admin: { readOnly: true },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'wpType',
              type: 'select',
              options: [
                { label: '知识库 (doc)', value: 'doc' },
                { label: '文章 (post)', value: 'post' },
                { label: '页面 (page)', value: 'page' },
              ],
              admin: { readOnly: true, width: '33%' },
            },
            {
              name: 'wpStatus',
              type: 'select',
              options: [
                { label: '已发布', value: 'publish' },
                { label: '草稿', value: 'draft' },
              ],
              admin: { readOnly: true, width: '33%' },
            },
            {
              name: 'wpId',
              type: 'number',
              index: true,
              admin: { readOnly: true, width: '33%' },
            },
          ],
        },
        {
          name: 'locale',
          type: 'text',
          admin: { readOnly: true },
        },
      ],
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor(),
      admin: {
        description: 'CMS 富文本（新内容用此字段；WordPress 导入的正文在上方「原文预览」）',
      },
    },
  ],
};
