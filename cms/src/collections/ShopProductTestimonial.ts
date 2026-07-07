import type { CollectionConfig } from 'payload';
import { requiredText } from '../lib/validators';

/** 商城商品精选评价 — 运营录入，前台标注「精选评价」 */
export const ShopProductTestimonial: CollectionConfig = {
  slug: 'shop-product-testimonials',
  labels: {
    singular: '商品精选评价',
    plural: '商品精选评价',
  },
  admin: {
    group: '商城',
    useAsTitle: 'author',
    defaultColumns: ['sku', 'author', 'rating', 'locale', 'enabled', 'sort'],
    description: '按 SKU 配置精选用户评价，显示在商品详情页。与用户真实评价（二期）分区展示。',
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
      validate: (value: unknown) => requiredText(value, '请填写 SKU'),
    },
    {
      name: 'author',
      type: 'text',
      label: '展示名',
      required: true,
      admin: { description: '可脱敏，如「李**」' },
      validate: (value: unknown) => requiredText(value, '请填写展示名'),
    },
    {
      name: 'rating',
      type: 'number',
      label: '星级',
      required: true,
      defaultValue: 5,
      min: 1,
      max: 5,
      admin: { step: 1 },
    },
    {
      name: 'body',
      type: 'textarea',
      label: '评价正文',
      required: true,
      validate: (value: unknown) => requiredText(value, '请填写评价正文'),
    },
    {
      name: 'avatar',
      type: 'upload',
      label: '头像（可选）',
      relationTo: 'media',
    },
    {
      name: 'locale',
      type: 'select',
      label: '语言',
      defaultValue: 'zh-CN',
      options: [{ label: '简体中文', value: 'zh-CN' }],
      admin: { position: 'sidebar' },
    },
    {
      name: 'sort',
      type: 'number',
      label: '排序（小在前）',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
    {
      name: 'enabled',
      type: 'checkbox',
      label: '启用',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: '取消勾选后不在前台展示',
      },
    },
  ],
};
