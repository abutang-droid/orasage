import type { CollectionConfig } from 'payload';
import { cmsAccessForSlug } from '../lib/cmsStaffAccess';
import { requiredText } from '../lib/validators';

const LOCALE_OPTIONS = [
  { label: '简体中文', value: 'zh-CN' },
  { label: '繁體中文', value: 'zh-TW' },
  { label: 'English', value: 'en' },
  { label: 'Português', value: 'pt-BR' },
] as const;

const KIND_OPTIONS = [
  { label: '隐私政策', value: 'privacy' },
  { label: '服务协议（注册）', value: 'service' },
  { label: '商品服务协议（付费/售后）', value: 'product' },
] as const;

const STATUS_OPTIONS = [
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' },
] as const;

/**
 * 全站法律协议（多语言）。
 * - privacy：隐私政策（页脚 / 注册旁链）
 * - service：服务协议（注册必勾，服务内容与隐私保存说明）
 * - product：商品服务协议（结账/付费必勾，售后退换货等）
 */
export const LegalAgreements: CollectionConfig = {
  slug: 'legal-agreements',
  labels: {
    singular: '法律协议',
    plural: '法律协议',
  },
  admin: {
    group: '站点',
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'locale', 'version', 'status', 'updatedAt'],
    description:
      '全站协议正文。按「协议类型 + 语言」各维护一篇；前台缺语言时回退到简体中文。',
  },
  access: cmsAccessForSlug('legal-agreements'),
  fields: [
    {
      name: 'kind',
      type: 'select',
      label: '协议类型',
      required: true,
      options: [...KIND_OPTIONS],
      admin: {
        position: 'sidebar',
        description: 'privacy=隐私政策；service=注册服务协议；product=付费商品服务协议',
      },
    },
    {
      name: 'locale',
      type: 'select',
      label: '语言',
      required: true,
      defaultValue: 'zh-CN',
      options: [...LOCALE_OPTIONS],
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      label: '发布状态',
      required: true,
      defaultValue: 'draft',
      options: [...STATUS_OPTIONS],
      admin: { position: 'sidebar' },
    },
    {
      name: 'version',
      type: 'text',
      label: '版本号',
      required: true,
      defaultValue: '2026.07',
      admin: {
        position: 'sidebar',
        description: '用户同意时落库的版本标识，例如 2026.07',
      },
      validate: (value: unknown) => requiredText(value, '请填写版本号'),
    },
    {
      name: 'title',
      type: 'text',
      label: '标题',
      required: true,
      validate: (value: unknown) => requiredText(value, '请填写标题'),
    },
    {
      name: 'summary',
      type: 'textarea',
      label: '摘要（可选）',
      admin: {
        description: '用于勾选旁短说明；留空则前台用默认文案',
      },
    },
    {
      name: 'bodyHtml',
      type: 'textarea',
      label: '正文 HTML',
      required: true,
      admin: {
        description: '支持基础 HTML（h2/p/ul/li/a）。可从旧 WordPress 法律页粘贴。',
        rows: 24,
      },
      validate: (value: unknown) => requiredText(value, '请填写协议正文'),
    },
  ],
};
