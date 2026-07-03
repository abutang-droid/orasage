import type { GlobalConfig } from 'payload';

export const HomeHero: GlobalConfig = {
  slug: 'home-hero',
  label: '首页 Hero',
  access: {
    read: () => true,
  },
  admin: {
    description:
      '配置 orasage.com 首页顶部 Hero。视频请上传 MP4/WebM 至媒体库；首页以静音循环自动播放（符合浏览器策略），封面图取自 Hero 图片。',
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
      defaultValue: 'OraSage',
    },
    {
      name: 'headline',
      type: 'text',
      label: '主标题',
      required: true,
      defaultValue: '探索命运，平衡能量',
    },
    {
      name: 'subtitle',
      type: 'textarea',
      label: '副标题',
      defaultValue: '八字 · 紫微 · 塔罗 — 东方智慧与现代科技的融合',
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
        description: '建议 H.264 MP4，15MB 以内；静音自动循环播放',
      },
    },
    {
      name: 'videoExternalUrl',
      type: 'text',
      label: '或外部视频 URL',
      admin: {
        condition: (_, siblingData) => siblingData?.displayMode === 'video',
        description: '填写 .mp4 直链（大文件可放 CDN）；优先于上传文件',
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
