/**
 * 前台展示与设计规范对应的媒体上传提示（供 CMS 后台 description 引用）。
 * 尺寸依据各站 Hero CSS：max-height ≈ 13rem（208px），宽度自适应居中。
 */

export const HERO_IMAGE_SPEC = [
  '【Hero 主图规格】',
  '· 格式：WebP（推荐）/ JPG / PNG',
  '· 比例：16:9 或 3:2 横图',
  '· 尺寸：建议 1200×675 px（宽 1200–1600 px）',
  '· 体积：≤ 500 KB（过大请用 squoosh.app 等压缩后上传）',
  '· 展示：前台最高约 208 px，居中 contain，圆角卡片',
  '· 用途：图片模式主图；视频模式作封面 poster',
].join('\n');

export const HERO_VIDEO_UPLOAD_SPEC = [
  '【Hero 视频规格】',
  '· 格式：MP4（H.264，推荐）或 WebM',
  '· 比例：16:9 横屏',
  '· 尺寸：建议 1920×1080 或 1280×720',
  '· 体积：短片 ≤ 15 MB（建议 720p H.264）',
  '· 播放：前台静音循环、约 30% 透明度作背景',
].join('\n');

export const HERO_VIDEO_URL_SPEC =
  '填写 .mp4 或 .webm 直链；本地媒体经 nginx 静态直出+长缓存。若填写则优先于上方上传文件。';

export const MEDIA_LIBRARY_SPEC = [
  '【媒体库通用规范】',
  '· 图片：WebP / JPG / PNG，单张建议 ≤ 2 MB',
  '· 视频：MP4 / WebM，短片 ≤ 15 MB（建议 720p）；长片请控码率',
  '· 替代文字（alt）必填，用于无障碍与 SEO',
  '· 上传后可在各 Hero / 圣地等字段中引用',
].join('\n');

export const SANCTUARY_IMAGE_SPEC = [
  '【圣地图片规格】',
  '· 格式：WebP（推荐）/ PNG（透明底可用）',
  '· 比例：1:1 方图或 4:5 竖图（塔罗卡片人像）',
  '· 尺寸：建议 512×512 或 512×640 px',
  '· 体积：≤ 300 KB',
  '· 也可填写下方「图片 URL」指向 tarot 静态资源',
].join('\n');
