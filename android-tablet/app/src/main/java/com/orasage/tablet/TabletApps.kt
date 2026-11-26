package com.orasage.tablet

/**
 * Full tablet destinations. Each entry is a first-class surface in the native rail
 * so Android 11 users can open BaZi without depending on portal HTML navigation.
 */
enum class TabletApp(
    val id: String,
    val labelZh: String,
    val url: String,
) {
    HOME("home", "首页", BuildConfig.START_URL),
    BAZI("bazi", "八字", "https://bazi.orasage.com/"),
    ZIWEI("ziwei", "紫微", "https://ziwei.orasage.com/chart"),
    TAROT("tarot", "塔罗", "https://tarot.orasage.com/"),
    SHOP("shop", "商城", "https://shop.orasage.com/"),
    ACCOUNT("account", "我的", "https://auth.orasage.com/center"),
    ;

    companion object {
        fun fromHost(host: String?): TabletApp? {
            val h = host?.lowercase() ?: return null
            return when {
                h == "bazi.orasage.com" -> BAZI
                h == "ziwei.orasage.com" -> ZIWEI
                h == "tarot.orasage.com" -> TAROT
                h == "shop.orasage.com" -> SHOP
                h == "auth.orasage.com" -> ACCOUNT
                h == "orasage.com" || h == "www.orasage.com" -> HOME
                else -> null
            }
        }
    }
}
