# MySchoolDates UI 整改方案

> 基于 `build-benchlm-ui` skill 制定。目标不是复制 BenchLM，而是把 MySchoolDates 从“卡片化 SEO 内容站”升级为一个可信、紧凑、证据优先的学校日历数据产品。

保留 MySchoolDates 的品牌、家长用户定位和日历语义，只迁移 BenchLM 最有价值的设计原则：答案优先、来源可见、数据密集但易扫读、细边框代替大阴影、统一状态体系。

所有 UI 改造必须遵守本文的 SEO Contract。搜索、筛选和响应式组件是用户体验增强，不能取代 SSR 正文、可抓取目录、标准链接、稳定 URL 和现有结构化数据。

方案制定时 `http://localhost:3000` 未运行，因此当前评估基于现有 Nuxt 页面、组件和样式源码。

## 一、当前主要问题

| 问题 | 当前表现 | 整改方向 |
| --- | --- | --- |
| 设计系统不完整 | 只有少量 CSS variables，大量颜色直接写在 Vue 中 | 建立统一语义 tokens |
| 卡片过度 | 项目内约 414 处 `rounded-lg` | 减少独立卡片，使用连续面板、表格和分隔线 |
| 颜色混杂 | Teal、Tailwind blue/gray/green/amber、棕色按钮同时存在 | 一个品牌主色 + 少量状态色 |
| 页面像内容站 | 首页有大段介绍、Why cards、重复信息 | 改成搜索和数据入口优先 |
| 日期缺少数据感 | 日期、数字和文本使用相同字体体系 | 日期和数字使用等宽字体或 tabular numerals |
| 验证信息视觉过重 | 绿色验证卡、Sources、Hero metadata 多处重复 | 合并为紧凑证据条和底部核验面板 |
| CTA 层级不稳定 | ICS、PDF、订阅、更新按钮颜色不同且都抢眼 | 统一主次按钮体系 |
| 移动导航过长 | 展开后直接展示大量州链接 | 改为搜索、常用入口和分组浏览 |
| 模块差异靠大量配置维持 | 页面结构灵活，但视觉语言不统一 | 保留模块显隐能力，统一组件表现 |

## 二、目标视觉系统

### 1. 色彩

继续使用 MySchoolDates 现有 teal，避免做成 BenchLM 仿站。

- 页面背景：暖灰白 `#f5f4ef`
- 主面板：暖白 `#fffef9`
- 次级面板：`#efeee8`
- 主文字：深墨色 `#151915`
- 正文文字：`#4a4d48`
- 弱化文字：`#74766f`
- 品牌强调：保留 `#0f5d6b`
- 标准边框：`#d9d7ce`
- 强边框：`#b9bcb3`

状态色只用于语义：

- Verified：绿色
- Conditional / Possible make-up：琥珀色
- Alert / incorrect：红色
- Information：蓝灰色
- Break、No school、Early release 等日历类型使用低饱和色，不铺满整张卡片

### 2. 字体

优先采用两层字体职责：

- 标题、正文与控件：保留 Inter，通过字重、字距和字号建立层级
- 日期、年份、数字、统计：Inter + `font-variant-numeric: tabular-nums`
- Geist Mono 只作为可选增强，并仅加载日期、统计和少量 metadata 所需的最小字体子集

日期应形成明显的数据视觉，例如：

- `SEP 08`
- `2026–27`
- `12 weekdays`
- `Reviewed AUG 09, 2026`

不需要让正文全部等宽化。

首轮整改不引入三套完整 Web Font。若现有字体能够通过 tabular numerals 和排版层级实现数据感，就不新增字体请求，避免增加 LCP、FCP 和布局稳定性风险。

### 3. 几何和间距

- 内容最大宽度由当前 64rem 调整到约 1120px
- 默认圆角：6px
- 小标签：3–4px
- 搜索框和核心面板：8px
- 删除大部分阴影
- 主要依靠暖白层级和 1px hairline border 分组
- 桌面 section 间距：48–64px
- 移动端：32–40px
- 所有移动端控件至少 44px

## 三、全站外壳整改

### Header

改成约 66px 的紧凑 sticky header：

- 左侧：Logo + MySchoolDates
- 中部：Home、States、Districts、Calendar Data
- 右侧：全站搜索入口
- 当前页面导航使用 2px teal 下划线
- 不再显示较长的 `US School Calendar Platform`
- Header 使用暖白半透明背景和细底边
- Dropdown 使用低圆角、细边框、浅阴影

移动端：

- Logo
- 搜索按钮
- Menu 按钮
- 菜单只展示一级入口、热门州和 “Browse all states”
- 不再一次展开所有州

### Footer

从长链接列表改成“证据型 Footer”：

1. MySchoolDates 简短定位
2. 当前覆盖的州、学区、学年数量
3. 最近数据更新时间
4. Browse / Calendar Data / Methodology / Company 四组链接
5. Editorial policy、verification methodology、corrections、data license
6. 法律链接

热门学区和热门州不要无限增长。

Footer 中的时间必须区分：

- `Dataset refreshed`
- `Page reviewed`
- `Official source updated`

不能用构建时间或部署时间伪装内容更新，也不能把不同时间语义合并成泛化的 `Last updated`。

## 四、首页整改

首页应从“介绍网站”转向“快速找到学区日历”。

### 推荐顺序

1. Header
2. Decision-first Hero
3. 全站学区搜索
4. 数据覆盖 metadata strip
5. 当前学年入口
6. 热门学区
7. 按州浏览
8. 数据方法与可信度
9. Calendar Data / Trends
10. Footer

### Hero

H1 建议保持直接：

> Find Your School District Calendar

副标题只说明：

- First and last days
- Breaks and no-school days
- Official PDFs
- Calendar downloads

删除首屏五条绿色 check 列表，以及过于营销化的 `Free forever`。

### Search

搜索是首页唯一主任务：

- 宽度约 620px
- 48–52px 高
- 支持 district、city、state 搜索
- 右侧显示 `⌘ K`
- 搜索结果显示 district name、city/state、可用学年
- 支持键盘上下选择和 Enter 打开
- 无结果时提供 “Browse all districts” 或州入口

搜索只承担用户导航，不承担搜索引擎发现页面的职责。首页必须保留普通 `<a href>` 形式的 `Browse all states` 和 `Browse all districts`，并确保可沿稳定链接访问：

```text
/
├── /states
│   ├── /oregon
│   │   ├── Beaverton
│   │   └── Portland
│   └── /california
└── /districts
```

学区搜索建议可以使用客户端交互，但不能成为访问学区页的唯一入口。

### 覆盖统计

当前深色横条改成暖色 metadata strip：

| Districts | States | Current years | Last data refresh |
| --- | --- | --- | --- |

数字使用等宽字体，不使用纯黑大色块。

### 删除或降权

- `About US School Calendars` 移到底部或拆到独立说明页
- `Why MySchoolDates` 四张卡压缩成一条可信度说明
- 州介绍不要在首页全部展开成长段正文
- 首页只显示热门州，完整目录进入 States 页面

## 五、州页面与 Districts 目录

将其设计成真正的 searchable directory。

### 推荐结构

1. 州名称与一句说明
2. 搜索学区
3. 学区数量、学年覆盖、最近更新时间
4. 学区目录
5. 州级日历规律或统计
6. 数据来源与方法

### 学区目录表现

减少独立圆角卡片，改为连续的 ruled list：

| District | Location | Available years | Data status |
| --- | --- | --- | --- |

状态显示：

- Reviewed
- PDF available
- Multiple calendars
- Translation available
- Update needed

移动端每行变为紧凑记录卡，但必须保留 district、地点、当前学年和验证状态。

### 搜索、筛选与分页的 SEO 规则

以下 URL 可以作为稳定、可索引的信息架构入口：

```text
/states
/oregon
/districts
/beaverton-school-district-calendar
/beaverton-school-district-calendar/2026-2027
```

以下状态默认只属于 UI，不自动生成 SEO landing page：

```text
?q=beaverton
?sort=name
?status=reviewed
?pdf=true
?year=2026
```

实施要求：

- 搜索、排序和多条件筛选不得制造无限可索引 URL
- 筛选状态优先保存在组件状态中；需要分享时再定义严格的 URL 白名单
- 参数 URL 必须有明确的 canonical、robots 和 crawl 策略
- 不为每种参数组合生成 sitemap URL
- `Load more` 或无限滚动不能成为访问后续记录的唯一方式
- 大型目录必须提供 SSR 且可抓取的分页 URL，例如 `/districts?page=2`
- 州页面规模允许时，可以直接 SSR 完整学区列表

## 六、学区主页面整改

主页面的第一任务是帮助用户选择学年，而不是展示大量学区介绍。

### 推荐顺序

1. Breadcrumb
2. 学区名称、Logo、官方网站
3. Current school year 直接入口
4. Available school years
5. 当前日历简要状态
6. Official district resources
7. Related districts
8. Sources

学区统计、城市介绍、Living Here 等内容默认隐藏。只有确实对日历选择有帮助时才显示。

## 七、学年日历页整改

这是全站最重要的页面类型。

### 推荐基础顺序

1. Breadcrumb
2. Hero direct answer
3. Metadata strip
4. Sticky “On this page”
5. 学区特有决策模块
6. Key Dates
7. Breaks
8. Download / Official PDFs
9. Full Calendar Dates
10. Year-over-year changes
11. Derived calendar insights
12. FAQ
13. Sources and Review Notes
14. Related calendars

学区配置仍然可以决定模块显隐和排序。

Hero 后最多允许 1–2 个短小、decision-critical 的学区特色模块进入 Key Dates 之前。其他解释模块必须放在核心日期之后，避免用户需要经过多个特殊说明才能看到日期。

### Hero

Hero 只保留：

- H1
- 直接答案
- Official source
- Reviewed date
- Reviewed by
- Current / conditional 状态

删除大面积绿色验证卡和重复的 `How verified` 内容。

改为横向 metadata strip：

| Reviewed | Official source | Calendar version | Status |
| --- | --- | --- | --- |

### Key Dates

当前多张圆角卡改成连续的 decision panel。

桌面：

| Date | Event | What families should know |
| --- | --- | --- |

移动端：

- 日期作为短等宽标签
- 事件标题
- 一句说明
- 状态 badge

只有真正需要强调的 5–8 个日期进入 Key Dates。

### Breaks

改成紧凑列表：

| Break | Dates | Weekdays off | Students return |
| --- | --- | --- | --- |

避免每个 break 都使用单独彩色卡片。

### Full Calendar

保留月份导航，但升级成数据产品：

- Month header sticky 或清晰分段
- 日期列固定宽度
- 日期使用 tabular/mono
- Event type badge 统一
- Attendance status 与 event type 分开
- Conditional make-up 使用明确文字
- 当前日期可以使用淡 teal 左边线
- 默认不为每条事件生成解释性文案

桌面使用语义化列表或表格；移动端使用等价的紧凑记录结构。桌面和移动端必须保持同一信息集合，不能在移动端删除 conditional status、grade caveat、return date 或其他影响决策的字段。

优先使用同一份语义化 DOM，通过 CSS 改变布局。只有确有必要时才维护独立的移动展示组件；若采用两套组件，必须加入字段等价测试。

### Download / Official PDF

整合为一个 Utility Panel：

1. 官方实时订阅（如存在）
2. Official PDF
3. MySchoolDates ICS
4. Print
5. Copy link

只保留一个主按钮。推荐优先级：

- 官方 subscription 存在：官方订阅为主
- 否则：ICS 为主
- Official PDF 为次级
- Print、Copy link 为文字操作

不要继续让 teal、green、brown 三种实心按钮同时竞争。

### Verification 与 Sources

页面上层显示简短 evidence metadata；详细过程集中到底部：

- Official calendar page
- PDF
- Supplemental calendars
- Last reviewed
- Reviewer
- Known discrepancy
- Conditional interpretation
- Revision trigger
- Correction link

核验信息应像编辑方法，不像绿色成功提示或 QA 日志。

### Derived calendar insights

计算型洞察可以保留，但必须满足：

- 能从明确日期或官方规则确定性推导
- 能说明计算口径
- 不把条件日期写成确定事实
- 不生成旅游、家庭活动或生活方式类泛化建议
- 删除该洞察后，用户必须会少知道一个真实、可验证的日历事实

典型合格内容包括 break length、student-free weekdays、grading-period length 和 conditional make-up sequence。泛化的 “families have plenty of time” 等内容不进入数据层。

## 八、组件系统整改

建议建立以下统一组件，不再在每个页面重复硬编码颜色和圆角：

- `SiteHeader`
- `GlobalDistrictSearch`
- `PageHero`
- `EvidenceMetadataStrip`
- `StatusBadge`
- `CalendarEventBadge`
- `DecisionPanel`
- `KeyDatesTable`
- `CalendarMonthSection`
- `DownloadUtilityPanel`
- `OfficialSourceList`
- `SectionNavigation`
- `DirectoryList`
- `EmptyState`
- `StaleDataNotice`
- `EvidenceFooter`

状态 badge 必须把日期事实与可信度分开：

- `Reviewed`
- `Estimated`
- `Conditional`
- `Official PDF`
- `Archived copy`
- `Updated`
- `Needs review`

## 九、响应式与无障碍

### 移动端

- 320px 下不出现横向页面溢出
- Sticky “On this page” 可横向滚动，但必须显示滚动提示
- 搜索始终可达
- Key Dates 和 Calendar Dates 不隐藏关键内容
- 所有按钮至少 44px
- 长学区名允许合理换行
- Dropdown、PDF、ICS 操作不依赖 hover
- 移动端与桌面端的主要正文、来源、日期说明和结构化数据保持等价
- 折叠内容在 SSR HTML/DOM 中存在，不在用户首次点击时才从 API 加载

### 键盘

- 增加 Skip to content
- 全站搜索支持 `⌘ K / Ctrl K`
- Escape 关闭菜单和搜索
- Dropdown 保留正确焦点
- Calendar filter 更新结果时使用 live region
- Sortable table 使用 `aria-sort`

### 动效

只使用约 150ms 的功能性过渡：

- Hover border
- Active navigation
- Disclosure
- Copy/download success
- Filter result update

删除 `active:scale`，改成最多 1px 下压。支持 `prefers-reduced-motion`。

## 十、SEO Contract 与实施阶段

### Phase 0：SEO Regression Guardrails P0

在任何视觉组件迁移前，为当前重点路由保存基准快照，并建立自动或半自动回归检查。

| 检查项 | 要求 |
| --- | --- |
| URL | 不因 UI 重构改变 |
| canonical | 保持正确且唯一 |
| robots | 不出现意外 `noindex` |
| title | 保留或经单独 SEO 审批后修改 |
| meta description | 保留 |
| H1 | 保留且 SSR 可见 |
| 主要正文 | 存在于 SSR HTML |
| structured data | 类型、实体关系和关键字段不因组件迁移消失 |
| breadcrumb | 可见并保留 schema |
| district/year 内链 | 使用可抓取的 `<a href>` / NuxtLink 输出 |
| sitemap URL | 不丢失、不生成筛选参数组合 |
| official source links | SSR HTML 中存在 |
| reviewed date/source | 页面继续可见 |
| mobile content | 与 desktop 核心信息等价 |

为首页、州页、Districts 目录、学区主页面和学年页保存重构前后的：

- rendered HTML
- canonical、robots、title、description
- H1/H2 结构
- JSON-LD
- 内链数量和目标 URL
- source/PDF links
- SSR 正文关键片段

回归失败时不得仅凭视觉验收上线。

### Phase 1：设计系统 P0

- 完整建立颜色、字体、间距、圆角、边框和状态 tokens
- 替换硬编码颜色
- 建立按钮、badge、panel、metadata、table primitives
- 清理 Tailwind 默认 blue/gray 与自定义颜色混用

验收：

- 90%以上硬编码颜色被 tokens 替代
- 圆角收敛为 3 个级别
- 实心主按钮只使用品牌 teal
- 状态色不再承担品牌 CTA

### Phase 2：全站外壳与首页 P0

- Header
- Mobile navigation
- Global search
- Homepage hero
- Coverage metadata
- Footer

验收：

- 用户在首屏即可搜索学区
- 移动菜单不再展示完整州列表
- 首页不再由 generic SEO cards 主导

### Phase 3：学区与学年页面 P0

- Hero
- Evidence strip
- Key Dates
- Breaks
- Download utility
- Full Calendar
- Sources

优先使用三个标杆页验证：

- Edmonds
- Virginia Beach
- North Clackamas
- 一个无复杂规则、内容较少的普通学区

它们分别覆盖早放、复杂 make-up rules、多学段日历和最小内容模板。普通学区用于确认系统不会为了填满页面而强行生成无价值模块。

### Phase 4：District / State / Directory P1

- States
- Districts
- 搜索、排序和筛选 URL 策略
- 可抓取分页
- Hub → State → District → Year 内链图

目录验收：

- 禁用 JavaScript 后仍能沿普通链接发现所有重要学区页
- 搜索不是唯一入口
- 参数组合不进入 sitemap
- 后续分页可以通过 `<a href>` 抓取
- 移动端和桌面端目录字段等价

### Phase 5：Trends / Dataset P1

- Trends hub
- Dataset
- National report
- Comparison

统一为 searchable directory 和 evidence-first table。

### Phase 6：SEO、CWV、无障碍与响应式 QA P1

检查：

- 320×568
- 390×844
- 768×1024
- 1280×800
- Wide desktop
- 200% zoom
- Keyboard only
- Reduced motion
- Print calendar
- Empty/no-result/stale/error states
- SSR HTML 与 hydration 后内容对比
- crawlable links
- canonical / robots / sitemap
- JSON-LD 回归
- Core Web Vitals 与字体加载
- 筛选参数抓取空间

## 十一、最终验收标准

整改完成后应达到：

- 首页首屏只有一个清晰主任务
- 学年页首屏直接回答开学、放假和最后一天
- 所有关键日期均能追溯到来源和审核时间
- 日期与数字视觉上明显区别于正文
- 页面主要依赖 hairline 和排版分组，而非大量圆角卡片
- 同一页面不出现多个相互竞争的实心按钮
- 学区特色模块仍由数据决定显隐
- 普通学区页不会为了视觉完整强行填充模块
- 页面仍然明确属于 MySchoolDates，而不是 BenchLM 仿站
- 搜索没有取代可抓取目录和内部链接图
- 移动端没有减少关键日期、条件和来源信息
- UI 参数不会形成无限可索引 URL
- URL、canonical、SSR 内容、schema 和 sitemap 通过回归检查
- 删除的是 generic SEO prose，而不是学区或州特有解释
- 字体增强不造成明显 LCP、FCP 或 CLS 回退

整体建议是：先统一视觉系统，再整改首页和学年页，不要逐组件零散换颜色。当前真正需要解决的不是“页面不够漂亮”，而是让可信来源、日期决策和下载功能形成一套统一的数据产品界面。
