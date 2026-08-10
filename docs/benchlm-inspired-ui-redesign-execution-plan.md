# MySchoolDates 纯 UI 视觉整改执行计划

## 1. 计划概览

- 关联方案：[benchlm-inspired-ui-redesign-plan.md](./benchlm-inspired-ui-redesign-plan.md)
- 计划启动日期：2026-08-10
- 预计主计划完成：2026-08-28
- 缓冲窗口：2026-08-31 至 2026-09-01
- 总工期：12–17 个有效工作日
- 日历周期：约 2.5–3.5 周
- 资源假设：1 名全职开发者 + Codex 辅助

## 当前执行进度（2026-08-10）

已完成第一轮源码迁移：

- 统一暖纸色表面、文字、细边框、强调色、状态色、圆角和动效 tokens
- 完成 Button、IconButton、Panel、Input、链接和 focus-visible 基础样式
- 完成 Header、桌面下拉菜单、移动菜单和 Footer 视觉整改
- 完成首页 Hero、统计条、搜索、学年卡片、学区列表、州目录和说明模块视觉整改
- 完成学区主页面和独立学年页 Hero、证据 metadata、页内导航视觉整改
- 完成 Key Dates、Full Calendar、ICS/PDF/Share、Sources 核心组件视觉整改
- 完成 Districts 目录页和州页主要表面的视觉整改
- 已运行 `pnpm build`，1112 个预渲染输出成功生成

待完成验收：

- `http://localhost:3000` 当前未运行；重启后补做桌面、平板和移动端视觉检查
- 抽查 Edmonds、Virginia Beach、North Clackamas 和一个普通学区
- 根据真实页面截图处理仅限视觉层的间距、换行和颜色问题

范围执行情况：未修改 URL、模块顺序、数据结构、搜索筛选逻辑、SEO metadata、JSON-LD、ICS/PDF/Print/分享功能。

## 2. 范围约束

本计划只修改视觉表现。

必须保持不变：

- URL 和路由
- 页面模块顺序
- 导航项目和链接结构
- 学区配置和模块显隐
- 搜索、筛选和分页逻辑
- 数据结构和内容文件
- SEO metadata 和 JSON-LD
- SSR 内容
- ICS、PDF、Print 和分享功能

允许修改：

- CSS tokens
- Tailwind 视觉配置
- 颜色、字体表现、间距和留白
- 边框、圆角和阴影
- 按钮、输入框、badge、panel、table 外观
- Header、Footer、首页和内容组件的样式
- 响应式样式和交互状态

## 3. 里程碑

| 里程碑 | 目标日期 | 交付结果 |
| --- | --- | --- |
| M1：视觉基础完成 | 2026-08-12 | Tokens 和 primitives 可使用 |
| M2：全站外壳与首页完成 | 2026-08-14 | Header、Footer、首页完成视觉统一 |
| M3：学年页标杆完成 | 2026-08-21 | 四个标杆学区完成视觉整改 |
| M4：其余页面完成 | 2026-08-26 | 目录和数据页面完成视觉迁移 |
| M5：最终验收 | 2026-08-28 | 响应式、无障碍和构建通过 |
| M6：缓冲完成 | 2026-09-01 | 阻塞问题关闭 |

## 4. Week 1：视觉基础、全站外壳和首页

时间：2026-08-10 至 2026-08-14

### Day 1：视觉基线与样式清单

任务：

- [ ] 重启并确认 `http://localhost:3000`
- [ ] 截取首页、目录、州页、学区页和学年页视觉基线
- [ ] 记录桌面、平板和移动端主要问题
- [ ] 统计硬编码颜色、圆角和阴影
- [ ] 建立颜色映射表
- [ ] 建立组件视觉清单
- [ ] 确认不修改内容和结构

交付物：

- 视觉基线截图
- 颜色映射表
- 组件迁移清单

### Day 2：Tokens 与基础排版

任务：

- [ ] 扩展 `app/assets/css/main.css`
- [ ] 同步 `tailwind.config.ts`
- [ ] 定义 canvas、panel、ink、muted、hairline、accent
- [ ] 定义状态色
- [ ] 定义 4px、6px、8px 圆角
- [ ] 定义统一 shadow
- [ ] 定义 tabular numerals
- [ ] 统一 H1、H2、H3、正文和 metadata 样式

验收：

- [ ] 不新增完整 Web Font
- [ ] 不改变页面 DOM 和内容
- [ ] Tokens 可以覆盖主要硬编码颜色

### Day 3：UI primitives

任务：

- [ ] Button variants
- [ ] IconButton
- [ ] StatusBadge
- [ ] CalendarEventBadge
- [ ] Panel / PanelHeader
- [ ] MetadataStrip
- [ ] Alert / Notice
- [ ] Input / SearchInput
- [ ] Dropdown
- [ ] Table 基础样式
- [ ] Details / Accordion

验收：

- [ ] 每个控件有 hover、focus-visible、active、disabled 状态
- [ ] 移动端触摸区域至少 44px
- [ ] 默认组件不使用大阴影

### Day 4：Header 与 Footer 视觉整改

Header：

- [ ] 统一暖白背景和细边框
- [ ] 优化 Logo、品牌文字和 tagline 间距
- [ ] 统一导航文字和 hover
- [ ] 优化 dropdown 表面、边框和阴影
- [ ] 优化移动菜单按钮和面板
- [ ] 保留全部导航项目和链接

Footer：

- [ ] 统一背景、边框和文字层级
- [ ] 调整栏目间距
- [ ] 统一链接 hover
- [ ] 优化移动端列布局
- [ ] 保留全部现有链接

### Day 5：首页视觉整改

任务：

- [ ] Hero 色彩、排版和留白
- [ ] Check items 外观
- [ ] 数据统计条外观
- [ ] Search input 和 dropdown
- [ ] Current School Years
- [ ] About US School Calendars
- [ ] Popular Districts
- [ ] Browse by State
- [ ] Why MySchoolDates
- [ ] 检查 320px、768px、1280px
- [ ] 运行 `pnpm build`

Week 1 Definition of Done：

- [ ] 首页和公共外壳视觉统一
- [ ] 页面内容、顺序和功能未改变
- [ ] 主按钮、边框、圆角和 hover 形成统一体系
- [ ] 构建成功

建议提交：

```text
feat: add unified visual tokens and UI primitives
style: refresh global shell and homepage
```

## 5. Week 2：学区与学年页面

时间：2026-08-17 至 2026-08-21

### Day 6：学区主页面与学年页 Hero

任务：

- [ ] 学区 Logo、名称和官网链接视觉
- [ ] 学年卡片视觉
- [ ] Current year 与历史学年状态
- [ ] 学年页 H1 和 direct answer 排版
- [ ] Source、Reviewed、Updated metadata
- [ ] Hero quick dates
- [ ] CTA 主次关系
- [ ] Sticky “On this page” 外观

### Day 7：Key Dates 与 Breaks

任务：

- [ ] Key Date cards 统一边框和表面
- [ ] 日期使用 tabular numerals
- [ ] Event badges 降低饱和度
- [ ] 统一标题和说明层级
- [ ] Break rows 视觉
- [ ] Duration badges
- [ ] 当前 break 视觉状态
- [ ] 保留现有数据和字段

### Day 8：Full Calendar

任务：

- [ ] 月份导航外观
- [ ] 月份标题层级
- [ ] 日期列宽与数字对齐
- [ ] Event badge 统一
- [ ] 行分隔和 hover
- [ ] Conditional 和 level-specific 状态
- [ ] 移动端间距与换行
- [ ] Print 样式回归

### Day 9：Download、FAQ、Sources 与 Custom Sections

任务：

- [ ] ICS primary button
- [ ] PDF secondary button
- [ ] Official updates、Print 和 Copy link 外观
- [ ] Compatible calendars badges
- [ ] FAQ details 外观
- [ ] Sources panel 外观
- [ ] Verification 和 warning states
- [ ] Custom section 标题、表格、列表和 details

### Day 10：四个标杆页面验收

页面：

- [ ] Edmonds
- [ ] Virginia Beach
- [ ] North Clackamas
- [ ] 一个普通学区

检查：

- [ ] 所有原模块仍在原位置
- [ ] 所有字段和文案保持不变
- [ ] 特殊 badge 和状态可读
- [ ] 多语言 PDF 正常
- [ ] ICS、PDF、Print 和分享功能正常
- [ ] 320px、390px、768px、1280px 正常
- [ ] 运行 `pnpm build`

Week 2 Definition of Done：

- [ ] 学区和学年页形成统一视觉
- [ ] 复杂和普通学区都没有视觉破损
- [ ] 不存在模块顺序、内容或功能变化

建议提交：

```text
style: refresh district and school-year calendar surfaces
style: unify calendar utility and evidence components
```

## 6. Week 3：其余页面与最终 QA

时间：2026-08-24 至 2026-08-28

### Day 11：States 与 Districts 页面

任务：

- [ ] 保留现有页面结构和功能
- [ ] 统一搜索框外观
- [ ] 统一学区列表和州列表
- [ ] 统一卡片、分隔线和箭头
- [ ] 调整文字层级和间距
- [ ] 优化移动端换行

### Day 12：Trends、Dataset、Report 与 Comparison

任务：

- [ ] 标题和说明排版
- [ ] Table 表面、边框和行高
- [ ] 数字使用 tabular numerals
- [ ] Chart 容器视觉
- [ ] Source 和 citation metadata
- [ ] Download controls
- [ ] 移动端横向滚动视觉
- [ ] 保留数据和筛选功能

### Day 13：响应式视觉 QA

视口：

- [ ] 320×568
- [ ] 390×844
- [ ] 768×1024
- [ ] 1280×800
- [ ] Wide desktop
- [ ] 200% zoom

检查：

- [ ] 无页面级横向溢出
- [ ] 长学区名正常换行
- [ ] Button 和 badge 不覆盖正文
- [ ] Sticky navigation 不遮挡 anchor
- [ ] Dropdown 不超出视口
- [ ] 所有内容继续显示

### Day 14：无障碍与视觉一致性

任务：

- [ ] Keyboard only
- [ ] Focus visible
- [ ] Reduced motion
- [ ] 对比度
- [ ] 44px touch targets
- [ ] Button variants 使用一致
- [ ] 状态色使用一致
- [ ] 检查遗留硬编码颜色
- [ ] 检查遗留大圆角和重阴影

### Day 15：最终构建与验收

任务：

- [ ] 运行 `pnpm build`
- [ ] 运行 `pnpm generate`（如发布流程需要）
- [ ] 对比整改前后截图
- [ ] 抽查主要 URL、canonical 和 JSON-LD 未改变
- [ ] 抽查内部链接和官方链接
- [ ] 确认 Print calendar
- [ ] 关闭 P0/P1 视觉问题
- [ ] 编写发布说明

Week 3 Definition of Done：

- [ ] 所有主要页面完成视觉统一
- [ ] 内容、结构和功能保持不变
- [ ] 响应式和键盘体验通过
- [ ] 构建成功
- [ ] 可以发布

建议提交：

```text
style: align directory and data pages with the new visual system
fix: close responsive and accessibility visual issues
```

## 7. 缓冲期

时间：2026-08-31 至 2026-09-01

只处理：

- [ ] 生产环境视觉差异
- [ ] 浏览器兼容问题
- [ ] 移动端布局问题
- [ ] 状态色或对比度问题
- [ ] 打印样式问题
- [ ] 遗漏组件视觉
- [ ] 构建或 hydration 问题

不在缓冲期增加新功能或结构调整。

## 8. 跨阶段视觉看板

### Tokens

- [ ] Canvas / Panel
- [ ] Ink / Muted / Dim
- [ ] Hairline / Strong hairline
- [ ] Accent
- [ ] Status colors
- [ ] Radius scale
- [ ] Shadow scale
- [ ] Focus ring
- [ ] Tabular numerals

### Components

- [ ] Header
- [ ] Footer
- [ ] Button
- [ ] IconButton
- [ ] Input
- [ ] Dropdown
- [ ] Badge
- [ ] Alert
- [ ] Panel
- [ ] Metadata
- [ ] Table
- [ ] Details
- [ ] Section navigation

### Pages

- [ ] Homepage
- [ ] States
- [ ] Districts
- [ ] District master
- [ ] District year
- [ ] Trends
- [ ] Dataset
- [ ] Report
- [ ] Comparison

## 9. 风险与应对

| 风险 | 应对 |
| --- | --- |
| 全局 tokens 影响大量页面 | 小批量迁移，每批检查标杆页 |
| 机械替换 414 处圆角导致破损 | 以组件为单位调整，不全文替换 |
| 硬编码颜色遗漏 | 使用颜色清单逐阶段检查 |
| 状态色与品牌色混淆 | CTA 和状态采用不同 token |
| 移动端视觉拥挤 | 只调整布局和间距，不删除信息 |
| 打印日历受全局样式影响 | 每轮检查 print stylesheet |
| 视觉修改意外改变 SEO | 抽查 SSR、metadata、schema 和 links 不变 |

## 10. 每日完成标准

- [ ] 当日涉及页面正常打开
- [ ] 内容和模块顺序未改变
- [ ] 交互功能未改变
- [ ] Focus 清晰
- [ ] 移动端无明显破损
- [ ] 无新增 hydration warning
- [ ] 记录剩余视觉问题

每周结束：

- [ ] `pnpm build` 成功
- [ ] 标杆页面通过
- [ ] P0 视觉问题为零
- [ ] 变更可以独立回滚

## 11. 最终完成定义

- [ ] 所有主要页面完成视觉统一
- [ ] 页面结构和模块顺序保持不变
- [ ] 页面内容和数据保持不变
- [ ] 搜索、导航、筛选和下载功能保持不变
- [ ] 主按钮、边框、圆角和状态色形成统一体系
- [ ] 日期和数字更容易扫读
- [ ] Header、Footer 与内容区属于同一视觉语言
- [ ] 四个标杆学区通过
- [ ] 320px 到宽屏均可正常使用
- [ ] Keyboard focus 和 reduced motion 通过
- [ ] Print calendar 正常
- [ ] `pnpm build` 成功
- [ ] 关键 SEO 输出未发生变化
