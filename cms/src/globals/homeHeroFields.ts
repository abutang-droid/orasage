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

type HeroSiblingData = {
  displayMode?: 'text' | 'image' | 'video' | null;
  videoExternalUrl?: string | null;
  heroVideo?: unknown;
};

/** 五站 Hero Global 共用字段（中文标注 + 媒体规格提示） */
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
      defaultValue: defaults.headline,
      admin: {
        description: '纯文字模式必填；图片/视频模式可留空，仅展示媒体',
      },
      validate: (value: unknown, { siblingData }: { siblingData?: HeroSiblingData }) => {
        if (siblingData?.displayMode === 'text') {
          return requiredText(value, '纯文字模式请填写主标题');
        }
        return true;
      },
    },
    {
      name: 'subtitle',
      type: 'textarea',
      label: '副标题（可选）',
      defaultValue: defaults.subtitle,
      admin: {
        description: '主标题下方的说明文字，可留空',
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
        description:
          '纯文字：须填主标题；图片/视频：可只展示媒体，标题与文案均可不填',
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
      validate: (value: unknown, { siblingData }: { siblingData?: HeroSiblingData }) => {
        if (siblingData?.displayMode === 'image' && !value) {
          return '图片模式请选择 Hero 图片';
        }
        return true;
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
      validate: (value: unknown, { siblingData }: { siblingData?: HeroSiblingData }) => {
        if (siblingData?.displayMode !== 'video') return true;
        const hasExternal = Boolean(String(siblingData?.videoExternalUrl ?? '').trim());
        if (!value && !hasExternal) {
          return '视频模式请上传视频或填写外部视频 URL';
        }
        return true;
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
      validate: (value: unknown, { siblingData }: { siblingData?: HeroSiblingData }) => {
        if (siblingData?.displayMode !== 'video') return true;
        const hasExternal = Boolean(String(value ?? '').trim());
        const hasUpload = Boolean(siblingData?.heroVideo);
        if (!hasExternal && !hasUpload) {
          return '视频模式请上传视频或填写外部视频 URL';
        }
        return true;
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
