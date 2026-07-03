import type { CollectionConfig } from 'payload';

/** 紫微首页滚动信息流 — 订单动态与用户评价，供 ziwei.orasage.com 计算器展示 */
export const ZiweiFeed: CollectionConfig = {
  slug: 'ziwei-feed',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'message',
    defaultColumns: ['kind', 'message', 'locale', 'sort', 'enabled'],
    description: '紫微计算器下方的滚动信息流。kind=order 显示为订单动态，kind=review 显示为用户评价。',
  },
  fields: [
    {
      name: 'kind',
      label: '类型',
      type: 'select',
      required: true,
      defaultValue: 'order',
      options: [
        { label: '订单动态', value: 'order' },
        { label: '用户评价', value: 'review' },
      ],
    },
    {
      name: 'message',
      label: '展示文案',
      type: 'text',
      required: true,
      admin: {
        description: '滚动条中显示的完整句子，如「张** 刚刚完成了紫微排盘」',
      },
    },
    {
      name: 'locale',
      label: '语言',
      type: 'select',
      defaultValue: 'zh-CN',
      options: [
        { label: '简体中文', value: 'zh-CN' },
        { label: '繁体中文', value: 'zh-TW' },
        { label: 'English', value: 'en' },
        { label: 'Português', value: 'pt-BR' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'sort',
      label: '排序（小在前）',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
    {
      name: 'enabled',
      label: '启用',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
};
