# MySchoolDates SEO Content Strategy

## Goal

Build **MySchoolDates** into a nationwide **School Calendar Database +
School Calendar Intelligence** platform.

## Execution Priority (Confirmed)

> **当前阶段（Phase 1）：专注学区词。** 先把所有学区页的 long-tail 排名做扎实，达到一定流量规模后，再进入 Phase 2 开始做 Guides。
>
> 原因：学区页竞争低、意图明确、转化率高；Guides 面向宽泛词，竞争激烈，需要 Domain Authority 积累后才有胜算。

| Phase | 重点 | 触发条件 |
|-------|------|---------|
| Phase 1（当前）| 学区页 long-tail 关键词 | — |
| Phase 2 | Guides（数据驱动型） | Phase 1 稳定带量后 |
| Phase 3 | Guides（宽泛国家词） | DA 积累到一定程度 |

---

## Recommended Site Architecture

``` text
/
├── Home
├── States
│   ├── /florida/
│   ├── /texas/
│   └── ...
├── Districts
│   ├── /broward-county-school-calendar/
│   ├── /hillsborough-county-school-calendar/
│   └── ...
└── Guides  ← Phase 2 开始建设
    ├── /guides/when-is-the-first-day-of-school/
    ├── /guides/when-does-school-end/
    ├── /guides/school-start-dates-by-state/
    ├── /guides/spring-break-dates/
    ├── /guides/winter-break-dates/
    ├── /guides/earliest-school-start-dates/
    └── /guides/latest-school-start-dates/
```

---

## URL Structure Decision (已确认，勿再更改)

**当前采用 keyword-rich slug，保持不变。**

```
/broward-county-school-calendar/          ✅ 已上线
/hillsborough-county-school-calendar/     ✅ 已上线
/austin-independent-school-district-calendar/  ✅ 已上线
```

**决策依据：**

- 学区页 URL 已包含核心关键词（`school-calendar` / `school-district-calendar`），符合 SEO 最佳实践
- 站点尚早期，Google 尚未大规模收录，无历史 URL 包袱
- URL 一旦确定、有收录后，不应再修改（301 重定向也会损失部分权重）

**⚠️ 注意：slug 命名存在不一致问题，需统一**

当前有两种模式混用：

| 模式 | 示例 | 数量 |
|------|------|------|
| `{name}-school-calendar` | `broward-county-school-calendar` | 多数 |
| `{name}-school-district-calendar` | `austin-independent-school-district-calendar` | 少数（ISD 类） |

**建议：** ISD 类保持现状（`school-district-calendar` 也是合法搜索词），不做强制统一，避免 URL 变更。新增学区统一用 `{name}-school-calendar` 格式。

---

## Homepage

The homepage should be the national School Calendars hub, not a
traditional blog.

Suggested sections:
- Search by school district
- Browse by state
- Popular districts
- Recently updated calendars
- Featured guides（Phase 2 后加入）

---

## Keyword Roadmap

### Phase 1（当前执行）— 学区 Long-tail

每个学区页面天然命中以下关键词组合：

- `{district name} school calendar 2025-2026`
- `{district name} school calendar 2026-2027`
- `{district name} first day of school`
- `{district name} spring break`
- `{district name} school calendar pdf`（已上线 PDF 下载模块）
- `{district name} winter break`
- `{district name} school holidays`

**这类词：竞争低、意图明确、用户质量高。**

### Phase 2（Guides 第一批）— 数据驱动型（差异化护城河）

> 这类内容竞争对手难以复制，因为只有我们有全国结构化学区数据库。优先级高于宽泛词。

- Districts with the longest winter break
- Districts with the most student days off
- Spring break overlap across states（南佛罗里达三县同时放假这类 insight）
- Average first day of school by state
- States with the earliest / latest school start dates
- Interactive school calendar comparison（年度对比）

### Phase 3（Guides 第二批）— 宽泛国家词

> 竞争极强，需要 Domain Authority 积累后才有排名希望。

- When is the first day of school?
- When does school end?
- School start dates by state
- Spring break dates
- Last day of school by state
- Thanksgiving break by state
- Winter break dates by district
- Earliest / latest school start dates

---

## Guide Template

1. Direct answer (featured snippet 优先)
2. National statistics
3. State comparison
4. District comparison
5. Data insights
6. Related state pages
7. Related district pages

---

## Internal Linking

**当前方向（学区页为核心）：**

```
Homepage
    ↓
State Pages
    ↓
District Pages（当前重点）
```

**Phase 2 后补充 Guides 双向链接：**

```
Guides
    ↕  ← 双向，不是单向
State Pages
    ↕
District Pages
```

> 重要：每个学区页应反向链接到相关 Guide（例如 Broward County 页链接到
> "Florida Spring Break Dates" Guide），形成双向权重传递。

---

## Schema Markup Strategy

| 页面类型 | 已有 | 待加 |
|---------|------|------|
| 学区年份页 | Event, BreadcrumbList, FAQPage | — |
| 学区主页 | BreadcrumbList, FAQPage | — |
| 州页面 | BreadcrumbList, ItemList | — |
| Guides（Phase 2）| — | FAQPage, Dataset |

---

## Avoid

Do not focus on generic blog topics:
- Back-to-school tips
- School supply lists
- Parenting advice
- Lunch ideas

---

## Positioning

**School Calendar Database + School Calendar Intelligence**

Core advantages:
- Nationwide district calendar database（唯一护城河）
- State aggregation
- District comparisons
- Year-over-year analysis（已上线 What's Different This Year 模块）
- Localized insights
- Data-driven guides
- Official PDF links with editorial verification（已上线）
