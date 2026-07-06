import type { CollectionConfig } from 'payload';

/** 商城 SKU 主图 — 在 CMS 媒体库上传后关联商品 SKU */
export const ShopProductMedia: CollectionConfig = {
  slug: 'shop-product-images',
  labels: {
    singular: '商品主图',
    plural: '商品主图',
  },
  admin: {
    group: '商城',
    useAsTitle: 'sku',
    description:
      '为 shop.orasage.com 商品配置主图。每条记录对应一个 SKU（须与运营后台「商品管理」中的 SKU 完全一致）。上传图片后约 1 分钟内在商城前台生效。',
    defaultColumns: ['sku', 'image', 'updatedAt'],
    listSearchableFields: ['sku'],
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
      unique: true,
      index: true,
      admin: {
        description: '例如 crystal-wood、report-bazi-basic。可在 admin.orasage.com/products 复制。',
      },
    },
    {
      name: 'image',
      type: 'upload',
      label: '主图',
      relationTo: 'media',
      required: true,
      admin: {
        description: '建议 1:1 或 4:5，JPG/PNG/WebP。可先上传到「媒体库」再在此选择。',
      },
    },
  ],
};
