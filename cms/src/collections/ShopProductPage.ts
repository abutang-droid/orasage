import type { CollectionConfig } from 'payload';
import { cmsAccessForSlug } from '../lib/cmsStaffAccess';
import { requiredText } from '../lib/validators';

const LOCALE_OPTIONS = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en' },
  { label: 'Português', value: 'pt-BR' },
] as const;

const STATUS_OPTIONS = [
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' },
] as const;

const SECTION_TYPE_OPTIONS = [
  { label: '正文', value: 'richText' },
  { label: '规格参数', value: 'specList' },
  { label: '佩戴/使用指南', value: 'guide' },
  { label: '推荐语', value: 'quote' },
  { label: '常见问题', value: 'faq' },
  { label: '相关商品', value: 'relatedSkus' },
] as const;

/** 商城商品详情落地页 — 多图 + 区块化长内容；一 SKU 多语言文档 */
export const ShopProductPage: CollectionConfig = {
  slug: 'shop-product-pages',
  labels: {
    singular: '商品详情页',
    plural: '商品详情页',
  },
  admin: {
    group: '商城',
    useAsTitle: 'sku',
    defaultColumns: ['sku', 'status', 'locale', 'updatedAt'],
    description:
      '商品 PDP：详情轮播/视频按语言存储；某语言未设置时前台按 英语→简体 回退。列表缩略图用「商品主图」（全语言共用）。',
  },
  access: cmsAccessForSlug('shop-product-pages'),
  fields: [
    {
      name: 'sku',
      type: 'text',
      label: '商品 SKU',
      required: true,
      index: true,
      admin: {
        description: '与 auth-service products.sku 一致，例如 crystal-wood',
      },
      validate: (value: unknown) => requiredText(value, '请填写 SKU'),
    },
    {
      name: 'locale',
      type: 'select',
      label: '语言',
      required: true,
      defaultValue: 'zh-CN',
      options: [...LOCALE_OPTIONS],
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      label: '发布状态',
      required: true,
      defaultValue: 'draft',
      options: [...STATUS_OPTIONS],
      admin: {
        position: 'sidebar',
        description:
          '已发布优先展示。若本语言仅有「带文案的草稿」、没有已发布版，前台仍会展示该草稿，避免英文页误回退到中文。',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      label: '副标题 / 一句话卖点',
      admin: {
        description: '显示在商品名称下方；随本文档「语言」字段独立存储，每种语言各写一份',
      },
    },
    {
      name: 'seoTitle',
      type: 'text',
      label: 'SEO 标题',
      admin: { description: '留空则使用商品名称' },
    },
    {
      name: 'seoDescription',
      type: 'textarea',
      label: 'SEO 描述',
    },
    {
      name: 'galleryVideoUrl',
      type: 'text',
      label: '主图视频 URL',
      admin: {
        description:
          '可选。建议 1:1 或 16:9 MP4。未填时前台回退：英语 → 简体中文。',
      },
    },
    {
      name: 'sceneVideoUrl',
      type: 'text',
      label: '场景视频 URL',
      admin: {
        description: '可选。建议 16:9 MP4。未填时前台回退：英语 → 简体中文。',
      },
    },
    {
      name: 'heroImages',
      label: '详情轮播图',
      type: 'array',
      minRows: 0,
      admin: {
        description:
          '建议 1:1 或 4:5。为空时前台回退英语→简体轮播。列表缩略图仍用「商品主图」。',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          label: '图片',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
          label: '替代文字',
        },
        {
          name: 'sort',
          type: 'number',
          label: '排序（小在前）',
          defaultValue: 0,
        },
      ],
    },
    {
      name: 'sections',
      label: '详情区块',
      type: 'array',
      admin: {
        description: '按顺序渲染在详情页购买区下方',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          label: '区块类型',
          required: true,
          options: [...SECTION_TYPE_OPTIONS],
        },
        {
          name: 'title',
          type: 'text',
          label: '标题',
          admin: {
            condition: (_data, siblingData) =>
              ['specList', 'guide', 'faq'].includes(String(siblingData?.type ?? '')),
          },
        },
        {
          name: 'body',
          type: 'textarea',
          label: '正文',
          admin: {
            condition: (_data, siblingData) =>
              ['richText', 'guide'].includes(String(siblingData?.type ?? '')),
          },
        },
        {
          name: 'quote',
          type: 'textarea',
          label: '推荐语',
          admin: {
            condition: (_data, siblingData) => siblingData?.type === 'quote',
          },
        },
        {
          name: 'attribution',
          type: 'text',
          label: '出处 / 署名',
          admin: {
            condition: (_data, siblingData) => siblingData?.type === 'quote',
          },
        },
        {
          name: 'specItems',
          label: '规格项',
          type: 'array',
          admin: {
            condition: (_data, siblingData) => siblingData?.type === 'specList',
          },
          fields: [
            { name: 'label', type: 'text', label: '名称', required: true },
            { name: 'value', type: 'text', label: '值', required: true },
          ],
        },
        {
          name: 'faqItems',
          label: '问答',
          type: 'array',
          admin: {
            condition: (_data, siblingData) => siblingData?.type === 'faq',
          },
          fields: [
            { name: 'question', type: 'text', label: '问题', required: true },
            { name: 'answer', type: 'textarea', label: '回答', required: true },
          ],
        },
        {
          name: 'relatedSkus',
          label: '相关 SKU',
          type: 'array',
          admin: {
            condition: (_data, siblingData) => siblingData?.type === 'relatedSkus',
          },
          fields: [
            {
              name: 'sku',
              type: 'text',
              label: 'SKU',
              required: true,
            },
          ],
        },
      ],
    },
  ],
};
