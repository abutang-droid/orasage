import type { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';

/** 朝拜圣地 / 守护神 — 按宗教自动匹配 */
export const Sanctuaries: CollectionConfig = {
  slug: 'sanctuaries',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'nameZh',
    defaultColumns: ['code', 'nameZh', 'region', 'wpStatus', 'sortOrder'],
    description: '塔罗祈福圣地。关联宗教后，用户选择信仰即可看到匹配的圣地列表。',
  },
  fields: [
    {
      name: 'code',
      label: '代码 ID',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: '稳定标识，如 guanyin、mazu' },
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
      name: 'faiths',
      label: '关联宗教',
      type: 'relationship',
      relationTo: 'faiths',
      hasMany: true,
      required: true,
      admin: {
        description: '用户选择对应信仰时展示此圣地',
      },
    },
    {
      name: 'tradition',
      label: '传统圈',
      type: 'select',
      defaultValue: 'global',
      options: [
        { label: '拉丁美洲', value: 'latin' },
        { label: '东南亚', value: 'seasia' },
        { label: '全球', value: 'global' },
      ],
    },
    {
      name: 'region',
      label: '地区',
      type: 'text',
    },
    {
      name: 'domains',
      label: '护佑领域',
      type: 'array',
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      name: 'color',
      label: '主题色',
      type: 'text',
      defaultValue: '#b8943f',
    },
    {
      name: 'gradient',
      label: '渐变 CSS',
      type: 'text',
    },
    {
      name: 'imageUrl',
      label: '图片 URL',
      type: 'text',
      admin: {
        description: '塔罗静态资源路径，如 /gods/观音.webp；也可填 CDN 绝对地址',
      },
    },
    {
      name: 'image',
      label: '上传图片',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'blessingText',
      label: '祈福结语',
      type: 'textarea',
      admin: { description: '参拜完成后展示的指引文案' },
    },
    {
      name: 'content',
      label: '圣地介绍',
      type: 'richText',
      editor: lexicalEditor(),
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
