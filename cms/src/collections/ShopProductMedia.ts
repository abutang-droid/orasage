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
    description: '为 shop.orasage.com 商品配置主图。SKU 须与 auth-service 商品目录一致。',
    defaultColumns: ['sku', 'image', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'sku',
      type: 'text',
      label: '商品 SKU',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'image',
      type: 'upload',
      label: '主图',
      relationTo: 'media',
      required: true,
    },
  ],
};
