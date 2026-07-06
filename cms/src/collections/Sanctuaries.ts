import type { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { SANCTUARY_IMAGE_SPEC } from '../lib/media-specs';
import { requiredText } from '../lib/validators';

/** 朝拜圣地 / 守护神 — 按宗教自动匹配 */
export const Sanctuaries: CollectionConfig = {
  slug: 'sanctuaries',
  labels: {
    singular: '祈福圣地',
    plural: '祈福圣地',
  },
  access: {
    read: () => true,
  },
  admin: {
    group: '祈福地理',
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
      validate: (value: unknown) => requiredText(value, '请填写代码 ID'),
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
      name: 'faiths',
      label: '关联宗教',
      type: 'relationship',
      relationTo: 'faiths',
      hasMany: true,
      required: true,
      admin: {
        description: '用户选择对应信仰时展示此圣地，至少选择一项',
      },
      validate: (value: unknown) => {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          return '请至少关联一个宗教分类';
        }
        return true;
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
      admin: {
        description: '如「中国东南沿海」「印度」',
      },
    },
    {
      name: 'domains',
      label: '护佑领域',
      type: 'array',
      labels: {
        singular: '领域',
        plural: '护佑领域',
      },
      admin: {
        description: '如健康、姻缘、出行等，将显示在圣地卡片上',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: '领域名称',
          required: true,
        },
      ],
    },
    {
      name: 'color',
      label: '主题色',
      type: 'text',
      defaultValue: '#b8943f',
      admin: {
        description: '十六进制色值，如 #b8943f（品牌金色）',
      },
    },
    {
      name: 'gradient',
      label: '渐变 CSS',
      type: 'text',
      admin: {
        description: '卡片背景渐变，如 linear-gradient(135deg, #1a1a2e, #16213e)',
      },
    },
    {
      name: 'imageUrl',
      label: '图片 URL',
      type: 'text',
      admin: {
        description: '塔罗静态资源路径，如 /gods/观音.webp；也可填 CDN 绝对地址。与下方上传二选一',
      },
    },
    {
      name: 'image',
      label: '上传图片',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: SANCTUARY_IMAGE_SPEC,
      },
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
      admin: {
        position: 'sidebar',
        description: '数值越小排序越靠前',
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
