# 紫微 UI/UX 修复进度（2026-07-15）

分支：`cursor/ziwei-uiux-fix-3d1a`  
任务书：`orasage-ziwei-claude-code-fix-tasks-2026-07-13.md`  
基线：`b1d55ac`（与任务书一致）

## 影响评估

| 范围 | 变更 |
|------|------|
| ziwei 专属 | BirthForm / PalaceCell / ChartBoard / TimeNav / chart page / Hero·Feed·Brief·Recommend / chat 品牌文案 / globals·ziwei-home CSS / share·session / layout lang+fonts |
| `@orasage/city` | CitySearchInput 可选 `inputId` / `ariaLabel` / `ariaDescribedBy`（additive，bazi 兼容） |
| `shared/app-shell/` | Skip link、顶部品牌 OraSage、`aria-current`、main id；`app-shell:sync` 全站副本 |
| 禁止未改 | 排盘算法、四化计算、支付/订单、休眠组件挂载、Tabler 图标、formB 进 URL |

## 任务完成

| ID | 状态 | 说明 |
|----|------|------|
| CC-00 | DONE | 手工验收清单写入本文件 §验收 |
| CC-01 | DONE | noValidate、fieldset、id/name、aria-invalid、radiogroup、CURRENT_YEAR |
| CC-02 | DONE | 宫位 role=button+键盘；仅真实回调时 stopPropagation |
| CC-03 | DONE | TimeNav tablist、年份 ± 44px、aria-label；模式/甲乙/性别历法选中语义 |
| CC-04 | DONE | <768 移动两列重排 + 中心独立；桌面 4×4 保留；连线仅桌面 |
| CC-05 | DONE | UI state URL(`tv/ly/pb/ht`)+session；heming 缺 formB 不再静默单盘 |
| CC-06 | DONE | 简读/推荐 loading·error·empty·retry |
| CC-07 | DONE | Hero 骨架+H1、图片宽高/比例；next/font 替代 Google `@import` |
| CC-08 | DONE | Framer useReducedMotion；全局 reduce；scrollIntoView auto |
| CC-09 | DONE | 活跃命盘/TimeNav/选中态映射 mono token；四化用现有 legend 类 |
| CC-10 | DONE | Skip link、OraSage 顶牌、aria-current；sync 通过 |
| CC-11 | DONE | Feed 克隆 aria-hidden；html lang 服务端 detect；Orasage→OraSage |
| CC-12 | 见构建结果 | |
| CC-13 | UNVERIFIED | 本环境无完整视口矩阵/读屏 |

## 验收矩阵（本环境）

六视口 / 键盘 / 读屏 / 200% / reduce-motion / 慢网：**UNVERIFIED**（需人工补测）。  
登录问答/付费：受限，未测。

## 剩余风险

- CMS 紫微 Hero 若仍指向塔罗图属运营数据，未在代码硬改图。
- 跨设备合盘第二人仍依赖 session，未暴露 formB 到 URL（按任务禁止项）。
