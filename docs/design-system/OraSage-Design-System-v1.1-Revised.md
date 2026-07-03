# OraSage Design System v1.1 (Revised)

**版本说明**：本版本遵循“极致克制”原则，剔除所有非必要的色彩，仅以**黑、白、灰**构建视觉体系。通过细腻的灰度层级与考究的排版，传达“现代东方工具书”的安静与专业。

---

## 1. 品牌色彩 (Monochrome System)

核心理念：**无色胜有色**。通过 5 种核心灰度定义所有界面元素。

| Token | Hex | 用途 |
| :--- | :--- | :--- |
| **Pure Black** | `#171717` | 品牌色、一级文字、主按钮背景、标题 |
| **Deep Gray** | `#6B7280` | 二级文字、占位符 (Placeholder)、图标 |
| **Light Gray** | `#E7E5E4` | 边框 (Border)、分割线、次级按钮边框 |
| **Soft Surface** | `#FAFAF8` | 全局背景 (Background)、输入框禁用背景 |
| **Pure White** | `#FFFFFF` | 卡片背景 (Surface)、输入框背景、按钮文字 |

---

## 2. 排版系统 (Typography)

强调**衬线体 (Serif)** 与 **无衬线体 (Sans)** 的碰撞，营造书卷气息。

*   **中文标题 (H1-H4)**: `Source Han Serif SC` (思源宋体) - 字重：Bold
*   **中文正文**: `PingFang SC` - 字重：Regular / Medium
*   **英文/数字**: `Inter`
*   **代码/数据**: `JetBrains Mono`

### 字号与行高

| 级别 | Size | Weight | Line Height | 间距 (Letter Spacing) |
| :--- | :--- | :--- | :--- | :--- |
| **H1** | 40px | Bold | 1.2 | -0.02em |
| **H2** | 32px | Bold | 1.3 | -0.01em |
| **H3** | 24px | Medium | 1.4 | 0 |
| **Body** | 16px | Regular | 1.6 | 0.02em |
| **Small** | 14px | Regular | 1.5 | 0.02em |
| **Caption** | 12px | Regular | 1.5 | 0.05em |

---

## 3. 基础组件 (Base Components)

### 3.1 按钮 (Buttons)
统一圆角：`12px` | 高度：`44px` (Large) / `36px` (Medium)

*   **Primary (主按钮)**:
    *   背景：`#171717` (Black)
    *   文字：`#FFFFFF` (White)
    *   Hover：背景 `#333333` | 动效：`translateY(-1px)`
*   **Secondary (次按钮)**:
    *   背景：`#FFFFFF`
    *   文字：`#171717`
    *   边框：`1px solid #E7E5E4`
    *   Hover：背景 `#FAFAF8`
*   **Ghost (幽灵按钮)**:
    *   背景：Transparent
    *   文字：`#6B7280`
    *   Hover：文字 `#171717`

### 3.2 输入框 (Inputs)
统一圆角：`12px` | 高度：`44px`

*   **Default (默认状态)**:
    *   背景：`#FFFFFF`
    *   边框：`1px solid #E7E5E4`
    *   文字：`#171717`
    *   **占位符 (Placeholder)**: `#A1A1AA` (淡灰色)
*   **Focus (聚焦状态)**:
    *   边框：`1px solid #171717` (黑边)
    *   阴影：无 (保持克制)
*   **Disabled (禁用状态)**:
    *   背景：`#FAFAF8`
    *   文字：`#D1D5DB`
    *   边框：`1px solid #F3F4F6`

---

## 4. 界面元素 (UI Elements)

### 4.1 卡片 (Card)
*   背景：`#FFFFFF`
*   圆角：`16px`
*   边框：`1px solid #E7E5E4`
*   阴影：`0 1px 2px rgba(0,0,0,0.04)` (极轻微)

### 4.2 分割线 (Divider)
*   颜色：`#E7E5E4`
*   厚度：`0.5px` (在高清屏上表现更细腻)

---

## 5. CSS Design Tokens

```css
:root {
  /* Colors */
  --color-black: #171717;
  --color-white: #FFFFFF;
  --color-gray-deep: #6B7280;
  --color-gray-light: #E7E5E4;
  --color-bg: #FAFAF8;
  --color-placeholder: #A1A1AA;

  /* Typography */
  --font-serif: "Source Han Serif SC", serif;
  --font-sans: "Inter", "PingFang SC", sans-serif;

  /* Components */
  --radius-btn: 12px;
  --radius-card: 16px;
  --input-height: 44px;
  
  /* Animation */
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast: 200ms;
}
```

---

## 6. 最终设计目标 (Design Goal)

OraSage 的视觉应如同一张**铺在木质桌面上的宣纸**：
1.  **静谧**：不通过颜色抢夺注意力，让命理内容本身说话。
2.  **秩序**：通过严谨的对齐与栅格，体现“工具书”的逻辑感。
3.  **人文**：利用宋体的衬线细节，平衡科技带来的冰冷感。
