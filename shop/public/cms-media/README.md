# 物理媒体目录（运行时填充）

由 `scripts/phys-copy-cms-from-oricosmos.sh` 从源机 **tar/cp** 写入，不经 HTTP 反代。

- 文件：与 Payload `CMS_MEDIA_DIR` 相同的文件名
- `sku-map.json`：SKU → filename，供店铺同源 `/cms-media/...` 引用

此目录默认不入库大图；生产机落盘后 `npm run build` / `next start` 会从 `public/` 直出。
