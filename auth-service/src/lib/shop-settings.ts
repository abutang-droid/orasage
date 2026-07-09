import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { shopSettings } from "../db/schema.ts";

export const SHOP_HOME_LAYOUTS = ["legacy", "crystal_v1"] as const;
export type ShopHomeLayout = (typeof SHOP_HOME_LAYOUTS)[number];

const HOME_LAYOUT_KEY = "home_layout";
const DEFAULT_HOME_LAYOUT: ShopHomeLayout = "legacy";

function parseHomeLayout(raw: unknown): ShopHomeLayout {
  if (typeof raw === "string" && (SHOP_HOME_LAYOUTS as readonly string[]).includes(raw)) {
    return raw as ShopHomeLayout;
  }
  return DEFAULT_HOME_LAYOUT;
}

export async function getShopHomeLayout(): Promise<ShopHomeLayout> {
  const [row] = await db
    .select()
    .from(shopSettings)
    .where(eq(shopSettings.key, HOME_LAYOUT_KEY))
    .limit(1);
  if (!row) return DEFAULT_HOME_LAYOUT;
  return parseHomeLayout(row.value);
}

export async function setShopHomeLayout(layout: ShopHomeLayout): Promise<ShopHomeLayout> {
  if (!(SHOP_HOME_LAYOUTS as readonly string[]).includes(layout)) {
    throw new Error("无效的首页布局");
  }
  await db
    .insert(shopSettings)
    .values({ key: HOME_LAYOUT_KEY, value: layout, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: shopSettings.key,
      set: { value: layout, updatedAt: new Date() },
    });
  return layout;
}

export async function getShopPublicConfig() {
  const homeLayout = await getShopHomeLayout();
  return { homeLayout };
}
