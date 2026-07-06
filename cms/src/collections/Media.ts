import path from 'path';
import { fileURLToPath } from 'url';
import type { CollectionConfig } from 'payload';
import { MEDIA_LIBRARY_SPEC } from '../lib/media-specs';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const mediaDir =
  process.env.CMS_MEDIA_DIR?.trim() ||
  path.resolve(dirname, '../../media');

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
    group: false,
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'mimeType', 'filesize', 'updatedAt'],
    description: MEDIA_LIBRARY_SPEC,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: '替代文字（alt，可选）',
      defaultValue: '',
      admin: {
        description:
          '可选。描述图片/视频内容，用于无障碍阅读与 SEO；纯媒体 Hero 可不填',
      },
    },
  ],
  upload: {
    staticDir: mediaDir,
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'],
  },
};
