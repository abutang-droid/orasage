import type { CollectionConfig } from 'payload';
import { MEDIA_LIBRARY_SPEC } from '../lib/media-specs';
import { requiredText } from '../lib/validators';

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: '媒体文件',
    plural: '媒体库',
  },
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'mimeType', 'filesize', 'updatedAt'],
    description: MEDIA_LIBRARY_SPEC,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: '替代文字（alt）',
      required: true,
      admin: {
        description: '必填。描述图片/视频内容，用于无障碍阅读与 SEO，例如「绿幽灵水晶手串产品图」',
      },
      validate: (value: unknown) => requiredText(value, '请填写替代文字，说明该媒体的内容'),
    },
  ],
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'],
  },
};
