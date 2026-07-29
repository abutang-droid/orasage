import type { CollectionConfig } from 'payload';

import { orasageAuthStrategy } from '../auth/orasageStrategy';
import { orasageAdminEmail } from '../auth/orasageSso';

type CmsUser = {
  staffRole?: string | null;
};

/**
 * Payload Admin UI 仅平台超管可进。
 * 内容运营 / 合作方员工通过 admin.orasage.com 自研 /content/* 写 CMS API，不进 /cms/admin。
 */
function canAccessPayloadAdmin({ req }: { req: { user?: unknown } }): boolean {
  const role = (req.user as CmsUser | undefined)?.staffRole;
  return role === 'admin';
}

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
    admin: canAccessPayloadAdmin,
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
    {
      name: 'staffRole',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'SSO 同步的运营角色（admin / shop_ops / content_ops）',
      },
    },
    {
      name: 'staffPermissions',
      type: 'json',
      admin: {
        hidden: true,
        description: 'SSO 同步的运营权限点',
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
