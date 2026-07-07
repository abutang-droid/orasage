import type { CollectionConfig } from 'payload';
import { requiredText } from '../lib/validators';

const LOCALE_OPTIONS = [{ label: '简体中文', value: 'zh-CN' }] as const;

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

/** 商城商品详情落地页 — 多图 + 区块化长内容（方案 C，首期 zh-CN） */
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
      '商品 PDP 内容：详情轮播多图与区块化文案。列表缩略图仍用「商品主图」集合；此处 heroImages 仅用于详情页。',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
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
        description: '草稿不会在商城详情页展示（将降级为简版 PDP）',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      label: '副标题 / 一句话卖点',
      admin: { description: '显示在商品名称下方' },
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
        description: '可选。占用一个主图位（最多 4 图 + 1 视频），建议 1:1 或 16:9 MP4',
      },
    },
    {
      name: 'sceneVideoUrl',
      type: 'text',
      label: '场景视频 URL',
      admin: {
        description: '可选。展示在详情内容区的场景视频，建议 16:9 MP4',
      },
    },
    {
      name: 'heroImages',
      label: '详情轮播图',
      type: 'array',
      minRows: 0,
      admin: {
        description: '建议 1:1 或 4:5，首张为详情页默认主图。列表缩略图仍使用「商品主图」。',
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
