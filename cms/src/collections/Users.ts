import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: '后台用户',
    plural: '后台用户',
  },
  auth: true,
  admin: {
    useAsTitle: 'email',
    description: 'CMS 后台登录账号，仅运维与编辑人员使用',
  },
  fields: [],
};
