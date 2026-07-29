import type { Access } from 'payload';
import {
  hasStaffPermission,
  type AnyStaffPermission,
  type ContentPermission,
} from '../../../shared/staff-permissions/index';

type CmsReqUser = {
  staffPermissions?: string[];
};

function userPermissions(req: { user?: unknown }): ReadonlySet<string> {
  const perms = (req.user as CmsReqUser | undefined)?.staffPermissions ?? [];
  return new Set(perms);
}

/** CMS 写操作权限：按 content.* 校验（兼容 JWT 中旧 content.cms.*） */
export function cmsWriteAccess(required: ContentPermission | 'content.pages'): Access {
  return ({ req }) => {
    if (!req.user) return false;
    return hasStaffPermission(userPermissions(req) as ReadonlySet<AnyStaffPermission>, required);
  };
}

/** Phase B：canonical content.*（旧 content.cms.* 经 alias 仍可通过） */
export const CMS_COLLECTION_ACCESS = {
  pages: 'content.pages',
  media: 'content.media',
  'shop-product-pages': 'content.product',
  'shop-product-media': 'content.product',
  'shop-product-testimonials': 'content.product',
  'bazi-feed': 'content.feed',
  'ziwei-feed': 'content.feed',
  faiths: 'content.faith',
  sanctuaries: 'content.faith',
  'geo-regions': 'content.faith',
  'geo-countries': 'content.faith',
  'country-faiths': 'content.faith',
} as const satisfies Record<string, ContentPermission>;

export function cmsAccessForSlug(slug: string): {
  read: Access;
  create: Access;
  update: Access;
  delete: Access;
} {
  const perm = (CMS_COLLECTION_ACCESS[slug as keyof typeof CMS_COLLECTION_ACCESS] ?? 'content.pages') as ContentPermission;
  const write = cmsWriteAccess(perm);
  return {
    read: () => true,
    create: write,
    update: write,
    delete: write,
  };
}

/** 全局 Hero 配置写权限 */
export function cmsGlobalWriteAccess(): Access {
  return cmsWriteAccess('content.heroes');
}
