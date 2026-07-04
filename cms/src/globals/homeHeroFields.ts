import type { Field } from 'payload';
import {
  HERO_IMAGE_SPEC,
  HERO_VIDEO_UPLOAD_SPEC,
  HERO_VIDEO_URL_SPEC,
} from '../lib/media-specs';
import { requiredText } from '../lib/validators';

export type HomeHeroDefaults = {
  eyebrow: string;
  headline: string;
  subtitle: string;
};

/** 四站 Hero Global 共用字段（中文标注 + 媒体规格提示） */
export function homeHeroFields(defaults: HomeHeroDefaults): Field[] {
  return [
    {
      name: 'enabled',
      type: 'checkbox',
      label: '启用',
      defaultValue: true,
      admin: {
        description: '取消勾选后，对应站点首页 Hero 区域将完全不显示',
      },
    },
    {
      name: 'eyebrow',
      type: 'text',
      label: '眉标（可选）',
      defaultValue: defaults.eyebrow,
      admin: {
        description: '主标题上方的小字标签，如品牌名或栏目名',
      },
    },
    {
      name: 'headline',
      type: 'text',
      label: '主标题',
      required: true,
      defaultValue: defaults.headline,
      validate: (value: unknown) => requiredText(value, '请填写主标题'),
    },
    {
      name: 'subtitle',
      type: 'textarea',
      label: '副标题',
      defaultValue: defaults.subtitle,
      admin: {
        description: '主标题下方的说明文字，建议一两句话',
      },
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
      admin: {
        description: '纯文字：仅标题与文案；图片：标题下方展示主图；视频：背景循环播放',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero 图片',
      admin: {
        condition: (_, siblingData) =>
          siblingData?.displayMode === 'image' || siblingData?.displayMode === 'video',
        description: HERO_IMAGE_SPEC,
      },
    },
    {
      name: 'heroVideo',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero 视频（MP4 / WebM）',
      admin: {
        condition: (_, siblingData) => siblingData?.displayMode === 'video',
        description: HERO_VIDEO_UPLOAD_SPEC,
      },
    },
    {
      name: 'videoExternalUrl',
      type: 'text',
      label: '或外部视频 URL',
      admin: {
        condition: (_, siblingData) => siblingData?.displayMode === 'video',
        description: HERO_VIDEO_URL_SPEC,
      },
    },
    {
      name: 'videoAutoplay',
      type: 'checkbox',
      label: '视频静音自动播放',
      defaultValue: true,
      admin: {
        condition: (_, siblingData) => siblingData?.displayMode === 'video',
        description: '符合浏览器自动播放策略：须静音；用户可在部分浏览器手动控制',
      },
    },
    {
      name: 'bodyText',
      type: 'textarea',
      label: '补充正文（可选）',
      admin: {
        description: '显示在副标题下方的额外说明，一般可留空',
      },
    },
  ];
}
