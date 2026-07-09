import type { Access } from 'payload';
import {
  hasStaffPermission,
  type CmsCollectionPermission,
} from '../../../shared/staff-permissions/index';

type CmsReqUser = {
  staffPermissions?: string[];
};

function userPermissions(req: { user?: unknown }): ReadonlySet<CmsCollectionPermission | string> {
  const perms = (req.user as CmsReqUser | undefined)?.staffPermissions ?? [];
  return new Set(perms);
}

/** CMS 写操作权限（7a）：按 collection 所需权限点校验 */
export function cmsWriteAccess(required: CmsCollectionPermission): Access {
  return ({ req }) => {
    if (!req.user) return false;
    return hasStaffPermission(userPermissions(req) as ReadonlySet<import('../../../shared/staff-permissions/index').AnyStaffPermission>, required);
  };
}

export const CMS_COLLECTION_ACCESS = {
  pages: 'content.cms.pages',
  media: 'content.cms.media',
  'shop-product-pages': 'content.cms.shop',
  'shop-product-media': 'content.cms.shop',
  'shop-product-testimonials': 'content.cms.shop',
  'bazi-feed': 'content.cms.feed',
  'ziwei-feed': 'content.cms.feed',
  faiths: 'content.cms.faith',
  sanctuaries: 'content.cms.faith',
  'geo-regions': 'content.cms.faith',
  'geo-countries': 'content.cms.faith',
  'country-faiths': 'content.cms.faith',
} as const satisfies Record<string, CmsCollectionPermission>;

export function cmsAccessForSlug(slug: string): {
  read: Access;
  create: Access;
  update: Access;
  delete: Access;
} {
  const perm = CMS_COLLECTION_ACCESS[slug as keyof typeof CMS_COLLECTION_ACCESS] ?? 'content.cms';
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
  return cmsWriteAccess('content.cms.heroes');
}
