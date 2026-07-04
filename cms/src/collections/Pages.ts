import type { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { requiredText } from '../lib/validators';

export const PUBLISH_SECTION_OPTIONS = [
  { label: '主站 · 道藏精选', value: 'daozang' },
  { label: '主站 · 名人案例', value: 'famous' },
  { label: '主站 · 通用内容', value: 'main' },
  { label: '八字 App', value: 'bazi' },
  { label: '紫微 App', value: 'ziwei' },
  { label: '塔罗 App', value: 'tarot' },
  { label: '商城', value: 'shop' },
] as const;

/**
 * 内容页面：主门户与各命理 App 的文章、知识库、公告等。
 * `appSource` 决定内容发布到哪个前台栏目。
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: '内容页面',
    plural: '内容页面',
  },
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'appSource', 'wpType', 'wpStatus', 'locale', 'updatedAt'],
    description: '「发布栏目」决定内容出现在哪个前台位置。WordPress 导入正文见「原文预览」。',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '标题',
      required: true,
      validate: (value: unknown) => requiredText(value, '请填写页面标题'),
    },
    {
      name: 'slug',
      type: 'text',
      label: 'URL 别名（slug）',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: '前台 URL 路径，仅小写字母、数字与连字符，例如 daozang-intro',
      },
      validate: (value: unknown) => {
        const required = requiredText(value, '请填写 URL 别名');
        if (required !== true) return required;
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value))) {
          return '别名仅允许小写字母、数字与连字符（-）';
        }
        return true;
      },
    },
    {
      name: 'appSource',
      label: '发布栏目',
      type: 'select',
      required: true,
      defaultValue: 'daozang',
      options: [...PUBLISH_SECTION_OPTIONS],
      admin: {
        description: '选择该内容在前台的展示位置（主站道藏、名人案例，或各命理 App）',
        position: 'sidebar',
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
      admin: {
        description: '草稿不会出现在主站与各 App 列表中',
        position: 'sidebar',
      },
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
          label: '原文预览',
          admin: {
            components: {
              Field: '/components/LegacyHtmlPreview#LegacyHtmlPreview',
            },
          },
        },
        {
          name: 'legacyHtml',
          type: 'textarea',
          label: '原始 HTML',
          admin: {
            description: '从 c2.pub WordPress 迁移的原始 HTML。主站道藏页与各 /view 路由会渲染此字段。',
            rows: 12,
          },
        },
        {
          name: 'sourceUrl',
          type: 'text',
          label: '原站链接',
          admin: { readOnly: true },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'wpType',
              type: 'select',
              label: 'WP 类型',
              options: [
                { label: '知识库 (doc)', value: 'doc' },
                { label: '文章 (post)', value: 'post' },
                { label: '页面 (page)', value: 'page' },
              ],
              admin: { readOnly: true, width: '50%' },
            },
            {
              name: 'wpId',
              type: 'number',
              label: 'WP 文章 ID',
              index: true,
              admin: { readOnly: true, width: '50%' },
            },
          ],
        },
        {
          name: 'locale',
          type: 'text',
          label: '原站语言',
          admin: { readOnly: true },
        },
      ],
    },
    {
      name: 'content',
      type: 'richText',
      label: '富文本正文',
      editor: lexicalEditor(),
      admin: {
        description: 'CMS 富文本（新内容用此字段；WordPress 导入的正文在上方「原文预览」）',
      },
    },
  ],
};
