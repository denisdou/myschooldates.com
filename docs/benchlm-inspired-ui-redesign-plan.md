# MySchoolDates 纯 UI 视觉整改方案

> 本方案基于 `build-benchlm-ui` skill，但只吸收其视觉语言，不调整 MySchoolDates 的系统结构、产品结构或内容结构。

## 一、整改目标

本次整改只解决一个问题：

> 让现有页面看起来更舒服、更统一、更精致，更像可信的学校日历数据产品。

保留现有：

- URL 和路由
- 页面模块及其顺序
- 学区配置和模块显隐逻辑
- 搜索、筛选和导航功能
- 数据结构和内容文件
- SSR、Schema、canonical 和 sitemap
- 页面正文、标题和 SEO 内容
- ICS、PDF、Print 和分享功能

允许调整：

- 颜色
- 字体表现
- 字号和字重
- 行高和字距
- 页面宽度
- 间距和留白
- 边框、圆角和阴影
- 按钮、标签、输入框和卡片外观
- 表格和日期列表外观
- Header、Footer 和移动菜单的视觉表现
- Hover、Focus、Active 和折叠动画
- 响应式样式

## 二、明确不做的事情

本次不做：

- 不重新规划信息架构
- 不改变首页模块顺序
- 不改变学年页模块顺序
- 不新增全站搜索系统
- 不新增筛选或分页系统
- 不调整目录 URL
- 不拆分或合并内容模块
- 不重写现有文案
- 不删除 SEO 正文
- 不新增 Derived insights
- 不修改 district JSON schema
- 不重构日历计算逻辑
- 不新建暗色模式
- 不模仿 BenchLM 的 Logo、品牌、字体文件、文案或数据

如为统一视觉而抽取 CSS class 或纯表现组件，必须保证现有 DOM 语义、内容和功能不变。

## 三、当前视觉问题

| 问题 | 当前表现 | 视觉整改方向 |
| --- | --- | --- |
| 颜色不统一 | Teal、Tailwind blue/gray、green、amber 和棕色混用 | 收敛到一个品牌色和少量状态色 |
| 硬编码较多 | Vue 中约有 452 处硬编码颜色 | 使用统一视觉 tokens |
| 圆角过多 | 约有 414 处 `rounded-lg` | 收敛为 4px、6px、8px 三档 |
| 卡片感过重 | 大量模块都是白底圆角卡片 | 用暖色层级和细边框替代漂浮卡片 |
| 阴影不一致 | 输入框、卡片、按钮阴影规则不同 | 默认无阴影，仅 dropdown 使用浅阴影 |
| 日期不突出 | 日期和说明文字视觉层级接近 | 日期使用 tabular numerals 和更清晰的对齐 |
| 按钮层级混乱 | Teal、绿色、棕色实心按钮同时存在 | 主按钮统一 teal，其他使用描边或文字按钮 |
| 状态提示太亮 | Green/blue/amber 大色块较多 | 使用低饱和背景、细边框和短标签 |
| Header/Footer 偏普通 | 与正文缺少统一的数据产品气质 | 统一暖白表面、细边框和紧凑排版 |
| 移动端略拥挤 | 多个 badge、按钮和卡片堆叠 | 调整间距、换行和触摸尺寸，不删除内容 |

## 四、目标视觉语言

整体气质：

- 温暖、安静、可信
- 数据密集但不拥挤
- 清晰而非花哨
- 更像编辑严谨的日历工具，而不是营销型 SaaS
- 保留 MySchoolDates 自己的品牌识别

### 1. 色彩

建议 tokens：

| 角色 | 建议颜色 | 用途 |
| --- | --- | --- |
| Canvas | `#f5f4ef` | 页面背景 |
| Panel | `#fffef9` | 卡片、Header、输入框 |
| Panel 2 | `#efeee8` | 模块标题栏、轻强调区域 |
| Panel 3 | `#e9e8e1` | 选中、嵌套和更强分组 |
| Ink | `#151915` | 标题和主要正文 |
| Muted ink | `#4a4d48` | 普通正文 |
| Dim ink | `#74766f` | metadata 和辅助说明 |
| Hairline | `#d9d7ce` | 普通边框 |
| Strong hairline | `#b9bcb3` | 输入框和强调边框 |
| Brand accent | `#0f5d6b` | 主按钮、链接、Focus、当前状态 |

状态色：

- Verified：低饱和绿色
- Conditional / Make-up：低饱和琥珀色
- Error：低饱和红色
- Information：蓝灰色
- Break、No school、Early release 保留区分，但降低色彩面积

使用规则：

- 页面中实心强调色面积控制在 10% 以内
- 不使用大面积渐变
- 不用颜色替代文字标签
- 不给每个模块分配不同品牌色

### 2. 字体

首轮保持 Inter，不增加三套 Web Font。

- H1：32–44px，700，紧凑行高
- H2：22–28px，700
- H3：16–18px，600–700
- 正文：14–15px，行高 1.6
- UI 标签：12–13px，500–600
- Metadata：11–12px
- 日期和数字：Inter + `font-variant-numeric: tabular-nums`

通过字重、字距、大小和对齐建立层级，而不是依赖多种字体。

### 3. 圆角、边框和阴影

- Badge：4px
- 普通按钮和小组件：6px
- 主面板和搜索框：8px
- 不再默认使用 12px 以上圆角
- 所有主要分组使用 1px hairline
- 卡片默认无阴影
- Dropdown、popover 可以使用非常浅的 `shadow-sm`
- 按钮按下状态使用 1px 位移，不使用缩放动画

### 4. 页面宽度与留白

- 保留现有内容结构，将主内容最大宽度统一在约 1024–1120px
- 正文段落控制在 60–68 字符宽度
- 桌面模块间距：32–48px
- 模块内部 padding：16–24px
- 移动端模块间距：24–32px
- 紧凑组件间距：8–12px

## 五、全站公共区域的视觉整改

### Header

保留现有导航内容和交互，只调整视觉：

- 暖白半透明背景
- 1px 底边
- 更紧凑的 Logo 和文字间距
- 当前链接使用 teal 和细下划线
- 普通链接使用深灰，不使用 Tailwind 默认蓝色
- Dropdown 圆角降到 6–8px
- Dropdown 使用细边框和浅阴影
- Header 高度和上下 padding 保持一致
- 移动菜单按钮至少 44px

不调整：

- 导航项目
- Dropdown 内容
- 州链接结构
- 菜单交互逻辑

### Footer

保留现有链接和栏目，只调整：

- 暖白/浅暖灰背景
- 标题、链接和辅助文字层级
- 分组间距
- 顶部细边框
- Hover 统一为 teal
- 移动端列间距和换行

不删除 Footer 链接，不改变站点链接图。

## 六、首页视觉整改

保持首页当前模块和顺序，只做视觉升级。

### Hero

- 暖色背景替代纯白块
- H1 更紧凑、更有品牌感
- 副标题降低宽度和灰度
- 绿色 check 改为更克制的细图标或短标签
- 不增加新文案

### 数据统计条

- 保留现有统计内容
- 将纯黑背景调整为深墨绿或暖色 metadata strip
- 数字使用 tabular numerals
- 使用细分隔线代替多个卡片

### 搜索框

- 保留现有搜索逻辑
- 高度统一到 48–52px
- 圆角 8px
- 边框使用 strong hairline
- Focus 使用 teal ring
- Dropdown 统一 panel、border 和 hover

### Current School Years、Popular Districts、Browse by State

- 保留现有内容、顺序和链接
- 减少蓝色背景卡片
- 使用连续列表或轻面板视觉
- 统一行高、边框和箭头样式
- Hover 只改变背景、文字或边框，不放大卡片

### About 与 Why MySchoolDates

- 保留现有内容
- 降低卡片感
- 统一标题和正文间距
- 四个 Why 模块使用同一表面层级和边框
- 不做内容删减或模块移动

## 七、学区主页面视觉整改

保持现有页面内容和学年入口，只调整：

- 学区 Logo、名称和官网链接对齐
- 学年卡片统一高度、边框和文字层级
- 当前学年使用 teal 细边或轻背景区分
- 历史学年降低视觉权重
- 官方来源、地址和辅助信息使用统一 metadata 样式
- Related districts 使用紧凑列表视觉

不调整学年结构、链接地址或页面内容。

## 八、学年日历页视觉整改

保留每个学区现有模块、顺序、显隐配置和文案。

### Hero

- H1 使用更紧凑的行高和字距
- Source line、Reviewed、Updated 使用统一 metadata 样式
- Hero quick dates 继续保留，但改为细边框连续面板
- Verified badge 改为短小状态标签
- CTA 统一主次按钮视觉

### Sticky “On this page”

- 保留现有导航项目和顺序
- 暖色半透明背景
- 当前/hover 状态使用 teal
- 上下边框统一
- 移动端优化横向滚动和边缘提示

### Key Dates

- 保留现有数据和组件逻辑
- 减少每张日期卡片的独立漂浮感
- 日期使用 tabular numerals
- Event badge 使用低饱和色
- 标题、日期和说明建立清晰层级
- 移动端只调整布局，不删除字段

### Breaks

- 保留现有 break 数据和 duration badge
- 使用分隔线组织条目
- Duration badge 降低饱和度和圆角
- 当前 break 状态可使用轻 teal 左边线

### Full Calendar

- 保留现有月份导航、月份分组和事件顺序
- 月份标题使用 Panel 2 背景
- 日期列宽和数字对齐统一
- Badge 颜色和圆角统一
- 说明文字降低灰度但保持可读性
- 行 hover 使用轻表面变化
- Print 样式保持不变

### Download / PDF / Share

- 保留所有按钮和功能
- ICS 使用唯一主按钮样式
- PDF、官方更新、Print 使用 secondary 按钮
- 社交分享使用 text/icon button
- 取消绿色、teal、棕色按钮同时抢视觉
- Compatible calendars 标签统一为轻边框 badge

### FAQ、Sources 和 Verification

- 保留所有内容和折叠逻辑
- `<details>` 标题统一高度、边框和 chevron
- Sources 使用更安静的 panel
- URL、日期和版本信息使用 tabular/metadata 样式
- Warning、discrepancy 使用低饱和提示框

### Custom Sections

- 不改变 custom section 的位置和内容
- 统一 H2、H3、表格、列表、badge 和折叠组件样式
- 避免每个 custom section 产生新的独立视觉语言

## 九、数据页面的视觉整改

适用于 Trends、Dataset、Report 和 Comparison。

只调整：

- 标题层级
- 数据表边框和行高
- 数字对齐
- Chart 容器表面
- Download 按钮
- Source 和 citation metadata
- 移动端横向滚动提示

不调整数据内容、筛选逻辑、URL 或页面结构。

## 十、组件视觉规范

建议统一以下视觉组件，但不改变业务逻辑：

- Button
- IconButton
- StatusBadge
- CalendarEventBadge
- Panel
- PanelHeader
- MetadataStrip
- Alert / Notice
- TextInput / SearchInput
- Dropdown
- SectionNavigation
- Table
- Details / Accordion
- EmptyState

纯表现组件可以复用现有 slot 和 props，不引入新的内容结构。

## 十一、响应式和交互细节

### 移动端

- 保留全部核心信息
- 只改变布局、间距和换行
- 按钮至少 44px
- 长标题允许换行
- Badge 可以换行但不覆盖正文
- 表格保持现有语义和数据
- 不建立与桌面端不同的数据版本

### Focus 和 Hover

- 所有链接和按钮使用统一 `focus-visible`
- Hover 只调整背景、边框和文字颜色
- Active 使用 1px 下压
- 不使用卡片放大
- 不使用持续动画或渐变动画

### Reduced motion

- 尊重 `prefers-reduced-motion`
- 移除不必要的 smooth scroll 和 transition

## 十二、安全护栏

虽然本次不进行 SEO 或系统改造，仍需确认视觉迁移没有意外改变：

- URL
- canonical
- title 和 meta description
- H1
- SSR 正文
- JSON-LD
- Breadcrumb
- 内部链接 href
- Official source/PDF links
- Sitemap
- 移动端核心内容

这些是回归检查，不是本次改造范围。

## 十三、实施阶段

### Phase 1：视觉基础

- Tokens
- Typography
- Button
- Badge
- Panel
- Border、radius、shadow

### Phase 2：全站外壳和首页

- Header
- Mobile menu
- Footer
- Homepage

### Phase 3：学区和学年页面

- District master page
- Hero
- Key Dates
- Breaks
- Full Calendar
- Download
- FAQ
- Sources
- Custom sections

标杆页面：

- Edmonds
- Virginia Beach
- North Clackamas
- 一个普通学区

### Phase 4：其余页面与 QA

- States / Districts
- Trends / Dataset / Report / Comparison
- Responsive
- Accessibility
- Visual consistency
- Build

## 十四、预计工期

| 阶段 | 预计时间 |
| --- | ---: |
| 视觉基线与 tokens | 2–3 天 |
| Header、Footer、首页 | 2–3 天 |
| 学区和学年页面 | 4–6 天 |
| 目录与数据页面 | 2–3 天 |
| 响应式、无障碍和视觉 QA | 2–3 天 |
| 缓冲 | 1–2 天 |

总计：12–17 个有效工作日，约 2.5–3.5 周。

## 十五、最终验收标准

- 页面内容、顺序和功能没有改变
- 页面整体颜色统一
- 主按钮只有一种品牌视觉
- 状态色只表达状态
- 硬编码颜色明显减少
- 圆角收敛为三档
- 阴影只用于必要的浮层
- 日期和数字对齐清晰
- Header、Footer 和正文属于同一视觉系统
- 学区特色模块仍正常显示
- 320px 到宽屏均无明显视觉问题
- Keyboard focus 清晰
- Print calendar 正常
- `pnpm build` 成功
- SEO、安全和 SSR 回归检查无变化

最终效果应是：页面结构和内容保持原样，但视觉更安静、更精致、更容易阅读，并且仍然明显属于 MySchoolDates。
