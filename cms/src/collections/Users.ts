import type { CollectionConfig } from 'payload';

import { orasageAuthStrategy } from '../auth/orasageStrategy';
import { orasageAdminEmail } from '../auth/orasageSso';

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: '后台用户',
    plural: '后台用户',
  },
  auth: {
    disableLocalStrategy: true,
    strategies: [orasageAuthStrategy],
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
  admin: {
    useAsTitle: 'email',
    hidden: true,
    description: '由 orasage 统一登录自动同步，无需单独设置 CMS 密码',
  },
  access: {
    admin: () => true,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
        description: 'SSO 自动写入的内部邮箱',
      },
    },
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
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation === 'create' && data?.orasageUserId != null && !data.email) {
          data.email = orasageAdminEmail(Number(data.orasageUserId));
        }
        return data;
      },
    ],
  },
};
