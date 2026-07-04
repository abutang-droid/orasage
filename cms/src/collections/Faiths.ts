import type { CollectionConfig } from 'payload';
import { requiredText } from '../lib/validators';
import { SANCTUARY_IMAGE_SPEC } from '../lib/media-specs';

/** 全球宗教 taxonomy — 与塔罗 FaithPicker 的 code 对齐 */
export const Faiths: CollectionConfig = {
  slug: 'faiths',
  labels: {
    singular: '宗教分类',
    plural: '宗教分类',
  },
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'nameZh',
    defaultColumns: ['code', 'nameZh', 'nameEn', 'rank', 'wpStatus'],
    description: '宗教分类。code 与塔罗 App 信仰 ID 一致，圣地通过关联自动匹配。',
  },
  fields: [
    {
      name: 'code',
      label: '代码 ID',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: '稳定标识，仅小写英文与连字符，如 christianity、buddhism、taoism',
      },
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
      name: 'emoji',
      type: 'text',
      label: '表情符号',
      admin: {
        description: '列表中展示的小图标，如 ☸️、✝️（可选）',
      },
    },
    {
      name: 'rank',
      label: '排序（信众规模）',
      type: 'number',
      defaultValue: 50,
      admin: {
        position: 'sidebar',
        description: '数值越小排序越靠前',
      },
    },
    {
      name: 'adherentsM',
      label: '信众（百万）',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: '全球信众约数，单位：百万人',
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
