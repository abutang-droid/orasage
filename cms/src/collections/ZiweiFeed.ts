import type { CollectionConfig } from 'payload';
import { requiredText } from '../lib/validators';

/** 紫微首页滚动信息流 — 订单动态与用户评价，供 ziwei.orasage.com 计算器展示 */
export const ZiweiFeed: CollectionConfig = {
  slug: 'ziwei-feed',
  labels: {
    singular: '紫微信息流',
    plural: '紫微首页信息流',
  },
  access: {
    read: () => true,
  },
  admin: {
    group: false,
    useAsTitle: 'message',
    defaultColumns: ['kind', 'message', 'locale', 'sort', 'enabled'],
    description:
      '紫微计算器下方的滚动信息流。「订单动态」与「用户评价」交替展示；取消「启用」后该条不显示。',
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
      validate: (value: unknown) => requiredText(value, '请填写展示文案'),
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
      admin: {
        position: 'sidebar',
        description: '取消勾选后该条不会出现在前台滚动条',
      },
    },
  ],
};
