import type { GlobalConfig } from 'payload';

export const BaziHomeHero: GlobalConfig = {
  slug: 'bazi-home-hero',
  label: '八字首页 Hero',
  access: {
    read: () => true,
  },
  admin: {
    description:
      '配置 bazi.orasage.com 计算器顶部 Hero。支持纯文字、图片或视频；与主站首页 Hero 字段一致。',
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: '启用',
      defaultValue: true,
    },
    {
      name: 'eyebrow',
      type: 'text',
      label: '眉标（可选）',
      defaultValue: '八字命理',
    },
    {
      name: 'headline',
      type: 'text',
      label: '主标题',
      required: true,
      defaultValue: '精准排盘，洞察五行',
    },
    {
      name: 'subtitle',
      type: 'textarea',
      label: '副标题',
      defaultValue: '输入出生信息，即刻生成四柱命盘与免费解读',
    },
    {
      name: 'displayMode',
      type: 'select',
      label: '展示模式',
      defaultValue: 'text',
      required: true,
      options: [
        { label: '纯文字', value: 'text' },
        { label: '图片', value: 'image' },
        { label: '视频', value: 'video' },
      ],
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero 图片',
      admin: {
        condition: (_, siblingData) =>
          siblingData?.displayMode === 'image' || siblingData?.displayMode === 'video',
        description: '图片模式主图；视频模式作 poster 封面',
      },
    },
    {
      name: 'heroVideo',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero 视频（MP4 / WebM）',
      admin: {
        condition: (_, siblingData) => siblingData?.displayMode === 'video',
      },
    },
    {
      name: 'videoExternalUrl',
      type: 'text',
      label: '或外部视频 URL',
      admin: {
        condition: (_, siblingData) => siblingData?.displayMode === 'video',
      },
    },
    {
      name: 'videoAutoplay',
      type: 'checkbox',
      label: '视频静音自动播放',
      defaultValue: true,
      admin: {
        condition: (_, siblingData) => siblingData?.displayMode === 'video',
      },
    },
    {
      name: 'bodyText',
      type: 'textarea',
      label: '补充正文（可选）',
    },
  ],
};
