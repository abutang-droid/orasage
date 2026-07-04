import type { CollectionConfig } from 'payload';

import { orasageAuthStrategy } from '../auth/orasageStrategy';

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: '后台用户',
    plural: '后台用户',
  },
  auth: {
    disableLocalStrategy: true,
    strategies: [orasageAuthStrategy],
  },
  admin: {
    useAsTitle: 'email',
    hidden: true,
    description: '由 orasage 统一登录自动同步，无需单独设置 CMS 密码',
  },
  fields: [
    {
      name: 'orasageUserId',
      type: 'number',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'auth-service 用户 ID，SSO 自动写入',
      },
    },
  ],
};
