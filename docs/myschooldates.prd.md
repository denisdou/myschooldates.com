# myschooldates.com — Product Requirements Document

**Product:** myschooldates
**Positioning:** School Calendar Platform
**Version:** 3.0
**Status:** Draft
**Updated:** 2026-07-01

---

> **Product Statement**
>
> myschooldates is a School Calendar Platform that transforms official school district calendars into simple, searchable and actionable calendar tools for parents.

---

## 1. Vision

**myschooldates** 是一个面向美国家长的 **School Calendar Platform**。

我们不是收集学校日历的网站，而是帮助家长浏览、理解、管理和使用学校日历的工具平台。

官方学区提供日历数据，myschooldates 提供更好的使用体验。

**核心产品原则：**

> 不要问：还能展示什么？
> 而要问：**家长围绕学校日历，还需要完成什么事情？**

**1 年目标**：月访问量 100K，覆盖家长会搜索的 1,000 个高质量学区。

---

## 2. Problem

每个美国 School District 都会发布官方学年日历，但对于家长而言：

- 日历通常隐藏在 PDF 中，页面难找，信息分散
- 充斥教育行业术语，阅读体验差
- 无法快速找到重要日期
- 无法直接导入手机日历
- 不方便用于家庭规划
- 每年都需要重新查找

家长真正需要的不是 PDF，而是**一个可以直接使用的学校日历工具**。

现有竞品走的是「内容站」路线，没有人在做工具层——这是真正的产品机会。

### Evidence

- 每个主要学区"[district] school calendar 2025-2026"类搜索词月均 7,000–20,000 次，需求真实
- 竞品 `schools-calendar.com`：Google 自然流量 0，靠 ChatGPT 引用（617 次）生存，无工具功能
- 竞品 `schooldistrictcalendar.org`：Authority Score 2，被 Google 降权惩罚，月访问仅 11
- 所有竞品均为纯内容堆砌，无一提供工具层——**工具层是无竞争区**
- Google SEO 在该细分市场几乎是无人区，技术扎实的静态站有极大机会

---

## 3. Target Users

### Primary User

美国 K-12 学生家长，尤其是需要安排工作、托管、家庭旅行的双职工家庭。

- **Current behavior**：去官方学区网站找 PDF，手动记录重要日期，或直接忘记
- **Trigger**：开学前（7-8 月）、假期前（12 月、3 月），孩子问"什么时候放假"时，或需要订机票时
- **Success state**：30 秒内找到所需日期，一键同步手机日历，不再反复查询

他们需要根据学校日历安排：工作、家庭旅行、Childcare、家庭活动。

### Secondary Users

- **学生**：查假期安排
- **老师**：确认学区统一节假日
- **教育工作人员**

### Non-Users

- 学区管理员（有官方系统）
- 教育政策研究者（需要原始 PDF 数据）
- B2B 数据需求方（非 MVP 目标）

---

## 4. Jobs To Be Done

> 当我需要规划家庭旅行或安排孩子托管时，我希望能快速找到孩子学区今年的完整日历并导入手机，这样我就不会错过任何重要节点。

家长围绕学校日历需要完成的核心任务：

| 任务 | 场景 | 当前解法（痛点） |
|------|------|----------------|
| 查询开学/放假日期 | 规划假期旅行 | 去官方网站找 PDF |
| 同步到手机日历 | 日常提醒 | 手动逐条添加 |
| 和家人共享日历 | 和配偶、祖父母协调 | 截图发微信 |
| 知道今天有没有课 | 早上出门前 | 不知道去哪查 |
| 找最佳旅行窗口 | 订机票 | 手动对比日历 |
| 知道哪些天需要安排托管 | 排工作计划 | 完全依赖记忆 |

---

## 5. Product Principles

### Better than Official

任何页面都必须比官方学区网站更容易使用。所有页面都应该比官方学区页面更容易阅读、更容易获取信息。

### Parent First

使用家长能够理解的语言，而不是教育行业术语。

| 官方术语 | 家长语言 |
|---------|---------|
| Teacher Planning Day | No School for Students |
| Professional Development Day | No School |
| Staff Development Day | Student Holiday |
| Early Release Day | Early Dismissal |

### Search First

每一个页面都是独立的搜索入口，用户可以直接通过 Google 找到对应学区。页面标题、结构和内容均围绕家长实际搜索行为设计。

### Tool First

所有功能都围绕"帮助家长完成事情"设计，而不是增加阅读内容。

功能从「展示」进化到「工具」：

| 内容站思维 | 工具平台思维 |
|-----------|------------|
| 展示日历 | 同步日历 |
| 列出假期 | 倒计时提醒 |
| 提供信息 | 辅助决策 |
| 吸引访问 | 解决任务 |

---

## 6. Product Definition

myschooldates 是一个 Search-first 的 School Calendar Platform。

它围绕学校日历提供完整的工具能力，而不仅仅展示日历内容。

平台帮助家长：浏览学校日历 → 理解重要日期 → 导入自己的日历 → 管理学校安排 → 规划家庭时间。

产品演进路径：

```
School Calendar Website（内容站）  ← 竞品所在位置
        ↓
School Calendar Platform（工具平台）  ← 当前定位
        ↓
School Date Platform（数据平台）  ← 长期愿景
```

---

## 7. Information Architecture

```
Home（全国学区索引）
        ↓
State（州级汇总页，如 /florida）
        ↓
District（学区主页，如 /miami-dade-school-calendar）
        ↓
Calendar（日历展示 + 工具）
        ↓
Calendar Tools / Planning
```

---

## 8. Platform Capabilities（五大模块）

### Module A — Browse（日历浏览）

浏览学校日历，让官方日历变得可读。

| Feature | Priority |
|---------|----------|
| District Calendar 主页面（Parent Friendly Labels） | Must |
| Timeline（时间线事件流） | Must |
| Month Calendar Grid（月历可视化视图） | Must |
| Multi-year Calendar（多学年切换） | Must |
| First / Last Day 首屏展示 | Must |
| Teacher Work Days 明确标注 | Must |
| Early Release Days | Should |
| Official PDF 链接 | Should |

---

### Module B — Calendar Tools（日历工具）

帮助家长真正**使用**学校日历，把日历带入自己的生活。这是产品的核心差异化层，竞品全部缺失。

| Feature | Priority |
|---------|----------|
| Add to Google Calendar（一键导入） | Must |
| Apple Calendar（ICS 文件下载） | Must |
| webcal:// Subscription（动态订阅，自动同步） | Should |
| Export Calendar | Should |
| Print Calendar（打印友好视图） | Should |
| Share Calendar（生成分享链接） | Could |

---

### Module C — Planning（规划）

帮助家长**利用**学校日历安排生活，从"查日历"到"用日历规划"。

| Feature | Priority |
|---------|----------|
| Today School Status（今天有没有课） | Must |
| Next Holiday（距离下一次放假还有几天） | Must |
| Holiday Countdown | Should |
| Spring Break Countdown | Should |
| Summer Break Countdown | Should |
| Long Weekend Finder（找出连着假期的长周末） | Should |
| Calendar Comparison（2025 vs 2026 对比） | Should |
| Childcare Planner（列出所有需要安排托管的日期） | Could |
| Family Trip Planner（推荐最佳旅行窗口） | Could |

---

### Module D — Discovery（发现）

帮助用户发现更多相关内容，同时支撑 SEO 内部链接结构。

| Feature | Priority |
|---------|----------|
| Related Districts（相关学区推荐） | Must |
| State Calendar Pages（州级汇总页） | Must |
| FAQ（基于真实数据自动生成） | Must |
| About District（学区基本信息） | Should |
| Search（全站学区搜索） | Should |
| Nearby Districts | Could |

---

### Module E — Data（数据）

保证内容可信，建立权威性（E-E-A-T）。

| Feature | Priority |
|---------|----------|
| Official Source URL（每条数据注明来源） | Must |
| District Information（学生数、官网、联系方式） | Should |
| Update History（数据最后更新时间） | Could |
| Official / Draft 状态标注 | Could |

---

## 9. Long-term Vision — School Date Platform

Module E 的数据层，长期可扩展为完整的 School Date Platform：

```
School Calendar（当前）
        ↓
School Closures / Snow Days / Emergency Closures
        ↓
Testing Schedule（考试日程）
        ↓
Graduation / District Events
        ↓
School Board Calendar（学区董事会会议）
```

所有 School Date 进入一个平台。这是第三阶段愿景，不在近期范围内。

---

## 10. MVP Scope（Phase 1）

第一阶段聚焦现有 8 个学区，完成以下能力：

**Module A（Browse）**
- District Calendar（含 Parent Friendly Labels）
- Timeline
- Calendar Grid（月历视图）

**Module B（Calendar Tools）**
- Google Calendar（一键导入）
- Apple Calendar（ICS 下载）

**Module C（Planning）**
- Today School Status
- Next Holiday Countdown

**Module D（Discovery）**
- FAQ
- Related Districts
- State Calendar Pages（FL / CA / TX / NY / IL）

**基础**
- 品牌硬编码修复（`publicschoolcalendar.com` → `myschooldates.com`）
- Schema.org 结构化数据完整（FAQPage + BreadcrumbList + Event）

目标是打造一套完整的 School Calendar 工具体验。

---

## 11. Out of Scope

MVP 暂不包含：

- **学校（School）层级页面** — 绝大多数学校共用学区日历，维护成本高于 SEO 增量
- **用户账号** — 广告模式不依赖注册
- **评论 / 家长社区** — 超出工具平台定位
- **私立学校 / 大学** — 需求分散，先聚焦 K-12 公立学区
- **Mobile App** — 移动 Web 足够覆盖核心场景
- **AI Chat** — 超出 MVP 范围
- **邮件通知** — 后期功能
- **School Date Platform（第三阶段）** — 长期愿景，不在近期范围

myschooldates 不会成为：教育门户、新闻网站、School Directory、家长论坛、教育 SaaS。

它始终专注于成为美国最好用的 **School Calendar Platform**。

---

## 12. Success Definition

### 定性成功（用户视角）

- 家长可以在 **30 秒内**找到需要的日期
- 可以**一键**加入自己的日历
- 可以直接完成家庭规划，而无需回到官方网站
- myschooldates 成为家长查询 School Calendar 的首选入口

### 定量成功指标

| 指标 | 目标 | 衡量方式 |
|------|------|----------|
| 月有机访问量 | 100,000 | Google Analytics |
| 覆盖学区数 | 1,000+ | 内容数量 |
| 核心学区页面 Google 排名 | 前 3 | GSC / Semrush |
| 日历导出 / 工具使用率 | >5% 访问用户 | GA4 事件埋点 |
| 广告 RPM | $15+（AdSense 起步） | 广告平台后台 |
| 月广告收入 | $1,500+（100K 访问时） | 广告平台后台 |

---

## 13. Implementation Phases

> 扩张策略详见 [docs/district-prioritization.md](./district-prioritization.md)

| # | Phase | Description | Status | Parallel | Depends |
|---|-------|-------------|--------|----------|---------|
| 1 | Quality Foundation | 品牌修复；Parent Labels；Google Calendar；Today；Countdown；Month Grid；Schema.org | pending | - | - |
| 2 | SEO Architecture | 州级汇总页；Sitemap；内部链接；GSC 验证 | pending | - | 1 |
| 3 | Analytics & Monetization | GA4 埋点；AdSense；CWV 监控 | pending | with 2 | 1 |
| 4 | District Expansion to 25 | 补充至 25 学区（5 州 × 5 学区），完成州集群 | pending | - | 2 |
| 5 | Planning Module | Long Weekend Finder；Calendar Compare；webcal:// 订阅；Share | pending | - | 2 |
| 6 | District Expansion 26–50 | 第二梯队学区；覆盖主要都会区 | pending | - | 4 |
| 7 | Scale to 300+ | Priority Score 驱动；半自动化数据管道；广告网络升级 | pending | - | 6 |

### Phase Details

**Phase 1: Quality Foundation**
- **Goal**: 8 个学区页面达到工具平台标准，成为细分市场质量标杆
- **Scope**:
  - 修复所有 `publicschoolcalendar.com` → `myschooldates.com` 硬编码
  - 建立 Parent Friendly Labels 映射表（统一替换官方术语）
  - Google Calendar 一键导入（构造 gcal URL，纯前端，无需 API Key）
  - Today School Status 模块（今天是否上课）
  - Next Holiday Countdown（距下一假期倒计时）
  - Month Calendar Grid（月历可视化视图）
  - 完善 Schema.org：FAQPage + BreadcrumbList + 独立 Event 对象
- **Success signal**: 8 个页面全部被 Google 收录，核心工具功能上线可用

**Phase 2: SEO Architecture**
- **Goal**: 建立内部链接权重体系，捕获州级搜索词流量
- **Scope**:
  - 新增州级汇总页（FL / CA / TX / NY / IL 优先）
  - Sitemap.xml 自动生成并提交 GSC
  - Canonical URL 全面确认
  - 相关学区交叉链接优化（基于 `relatedDistricts` 字段）
- **Success signal**: GSC 显示全部页面已索引，核心学区词出现在搜索结果

**Phase 3: Analytics & Monetization**
- **Goal**: 建立数据反馈闭环，开始广告收入
- **Scope**:
  - GA4 接入，追踪 Google Calendar 导出、Today 查看、倒计时等工具使用事件
  - AdSense 接入（待流量达标后升级 Ezoic / Mediavine）
  - Core Web Vitals 监控，保障广告不影响 CWV 评分
- **Success signal**: 数据可读，有第一笔广告收入

**Phase 4: Planning Module**
- **Goal**: 上线 Module C Planning 核心功能，提升产品工具深度
- **Scope**:
  - Long Weekend Finder：找出所有连着假期的长周末
  - Calendar Comparison：2025-2026 vs 2026-2027 完整对比视图
  - webcal:// 订阅：支持 Apple Calendar 动态同步
  - Share：生成可分享链接
- **Success signal**: Planning 功能使用率 > 3%

**Phase 4: District Expansion to 25**
- **Goal**: 完成 5 州集群，让 Google 识别主题权威性
- **Scope**:
  - 策略：一个州一次做透（每州 5 个核心学区），详见 [district-prioritization.md](./district-prioritization.md)
  - Florida 补充 Hillsborough；California 补充 4 个；Texas 补充 4 个；Illinois 补充 4 个；New York 补充 4 个
  - 每学区必须有 2025-2026 和 2026-2027 两年数据
  - 每个州页面自动聚合该州所有学区（已实现）
- **Success signal**: 5 个州页面被 GSC 收录，至少 3 个学区关键词出现在 Google 排名

**Phase 5: Planning Module**
- **Goal**: 上线规划工具，提升产品深度与用户停留
- **Scope**:
  - Long Weekend Finder：找出连着假期的长周末
  - Calendar Comparison：2025-2026 vs 2026-2027 对比视图
  - webcal:// 订阅：支持 Apple Calendar 动态同步
  - Share：生成可分享链接
- **Success signal**: Planning 功能使用率 > 3%

**Phase 6: District Expansion 26–50**
- **Goal**: 覆盖美国主要都会区，扩张第二梯队
- **Scope**:
  - 优先：Clark County（NV）、Gwinnett/Cobb（GA）、Wake/Charlotte（NC）、Fairfax/Montgomery（VA/MD）
  - 补充现有 5 州深度（每州扩至 8-10 个）
- **Success signal**: 月有机访问量 10,000+，至少 15 个学区有 GSC 排名数据

**Phase 7: Scale to 300+**
- **Goal**: 实现 100K 月访问量
- **Scope**:
  - Priority Score 驱动扩张（Search Volume × 0.5 + Population × 0.2 + Brand × 0.1 + Data Quality × 0.1 + Internal Link × 0.1）
  - 半自动化数据收集（pdf-parse 已在依赖中）
  - 年度数据更新流程（每年 5-6 月 review）
  - 广告网络升级 Ezoic → Mediavine（需 50K sessions/月）
- **Success signal**: 月访问量 100,000+，广告月收入 $1,500+

---

## 14. Technical Approach

**Feasibility**: HIGH

### Stack

| 层级 | 技术 |
|------|------|
| Framework | Nuxt 4（全静态预渲染） |
| UI | Vue 3 + Tailwind CSS |
| Content | @nuxt/content + JSON + Zod 验证 |
| Hosting | CDN 静态托管（无服务器成本） |

### Architecture Notes

- Google Calendar 集成：构造 `https://calendar.google.com/calendar/render?action=TEMPLATE&...`，纯前端，无需 API Key
- Today / Countdown：纯客户端计算（`new Date()` 对比 events 数组），无需后端
- webcal:// 订阅：ICS 文件暴露为静态资源 + webcal:// 前缀
- 州级汇总页：新增 `content/states/*.json` + `app/pages/[state].vue`

### Technical Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Google 算法对程序化内容降权 | M | 工具功能真实可用，非纯内容堆砌；每页内容基于真实数据差异化 |
| 官方学区数据更新不及时 | H | 每年 5-6 月主动 review；`sourcePdfUrl` 记录源头便于核查 |
| 扩张到 1,000 学区时数据录入瓶颈 | H | Phase 6 前评估半自动化工具 |
| 竞品跟进工具功能 | L | 工具层先发优势；内容站转型工具平台成本高 |

---

## 15. Decisions Log

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| 产品定位 | School Calendar Platform | 内容站 | 工具层无竞争；内容站赛道已有多个失败案例 |
| 不做学校层级 | 仅学区层级 | 学区 + 学校 | 维护成本高于 SEO 增量 |
| Today/Countdown 归属 | Module C Planning | Module B Tools | Tools = 导入/导出；Planning = 规划/决策，语义更清晰 |
| 全静态渲染 | Nuxt prerender | SSR / SPA | CDN 友好，SEO 最优，无服务器成本 |
| 数据格式 | JSON + Zod 验证 | CMS / 数据库 | 简单、版本可控、schema 验证保障数据质量 |
| 变现方式 | 展示广告为主 | 订阅 / API / 联盟 | 启动最快，无需用户注册 |
| SEO 策略 | 质量优先（8 个学区做深） | 数量优先（快速铺量） | 竞品全部走数量路线且失败，质量是差异化关键 |
| K-12 公立学区优先 | 仅 K-12 公立 | 含私立 / 大学 | 需求最集中，家长目标用户最精准 |

---

## 16. Open Questions

- [ ] Phase 4 Planning 模块中，Family Trip Planner "最佳旅行窗口"的算法标准如何定义？
- [ ] webcal:// 订阅 URL：静态文件如何保持更新，或是否需要引入动态服务？
- [ ] 代码中硬编码 `publicschoolcalendar.com` 需立即修复（Phase 1 最高优先级）
- [ ] 扩张到 1,000 学区时，数据录入自动化方案：PDF 解析 vs 结构化抓取？
- [ ] 广告网络升级时机：AdSense → Ezoic（10K sessions）→ Mediavine（50K sessions）

---

## 17. Research Summary

### Market Context

- 美国约 13,700 个 LEA，K-12 统一学区约 8,000–9,000 个
- **Google SEO 在该细分市场几乎是无人区**：最强竞品自然流量 0，次强竞品月访问 11
- 所有竞品走「内容站」路线，无一提供工具层——工具层是真正的差异化机会
- 广告 RPM 基准：AdSense $8–15 → Ezoic $10–30 → Mediavine $25–40（需 50K sessions）

### Technical Context

- 现有技术栈：Nuxt 4 + Vue 3 + Tailwind + @nuxt/content，全静态预渲染，SEO 基础扎实
- 已实现：ICS 导出、FAQ 自动生成、Schema.org BreadcrumbList + FAQPage、多学年支持
- 待实现：Google Calendar 集成、Today 模块、Countdown、Month Grid、州级汇总页、品牌修复

---

*Created: 2026-07-01 | Updated: 2026-07-01*
*Status: DRAFT — Phase 1 ready to implement*
