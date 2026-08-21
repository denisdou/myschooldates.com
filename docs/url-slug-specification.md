# URL & Slug Specification

> **数据库可以很复杂，但 URL 必须保持简单。**

---

## Design Principles

### Keep URLs Flat

URL 最多两层。不要为了映射数据库结构而增加目录。

数据库层级：
```
State → District → School Year → Event
```

URL 层级：
```
/example-public-schools-calendars
/example-public-schools-calendars/2026-2027
```

即可。

---

### Stable URLs

URL 不包含产品功能。

不要：
```
/calendar
/calendar-view
/new-calendar
```

以后产品升级无需修改 URL。

---

### Human Readable

URL 必须：可读、可分享、可记忆。

---

## Route Specification

### Home

```
/
```

---

### State

```
/california
/florida
/texas
```

用于：浏览州内 District、SEO

---

### District（核心）

```
/example-public-schools-calendars
/example-public-schools-calendars/2026-2027
```

无年份 URL 是长期稳定的 District Calendar Hub，不承载滚动学年的完整正文。Hub 展示可用学年，并把用户引导到固定学年页面。

> **存量兼容：** 已存在的学区 slug 保持不变，不因本规范改为复数而迁移或重定向。

---

### School Year

```
/example-public-schools-calendars/2025-2026
/example-public-schools-calendars/2026-2027
```

支持历史学年。

---

### Tools

```
/tools
/tools/google-calendar
/tools/apple-calendar
/tools/calendar-export
/tools/calendar-compare
/tools/holiday-countdown
/tools/print-calendar
```

---

### Guides

```
/guides
/guides/how-to-add-school-calendar-to-google-calendar
/guides/how-to-import-ics
/guides/what-is-early-release
```

---

### Search

```
/search
```

---

### System Pages

```
/about
/contact
/privacy
/terms
```

---

## Slug Specification

### Character Set

仅使用：小写字母、数字（必要时）、连字符（`-`）

```
miami-dade
los-angeles-unified
new-york
spring-break
```

### 禁止

```
MiamiDade       ← 大写
Miami_Dade      ← 下划线
Miami Dade      ← 空格
miami--dade     ← 双连字符
```

---

### District Slug

自 **2026-08-21** 起，新建学区的无年份 Hub slug 统一使用官方名称的可读形式，并以复数 `-calendars` 结尾：

```
example-public-schools-calendars
example-unified-school-district-calendars
example-isd-calendars
```

固定学年页面继承同一个 Hub slug：

```
/example-public-schools-calendars/2026-2027
```

不要为新学区创建单数 `-calendar` slug。这里的复数表示无年份页面是多个固定学年日历的集合；单个固定学年页面的页面标题仍可使用单数 `Calendar`。

**不要修改任何已存在的 slug。** 存量 URL（包括以 `-calendar` 结尾的 URL）继续作为该学区的永久 Hub。只有本规范生效后首次创建的新学区使用 `-calendars`。

如果两个 District 重名，增加州信息以保持全站唯一：

```
springfield-public-schools-il-calendars
springfield-public-schools-mo-calendars
```

---

### State Slug

统一使用英文州名：

```
california
florida
texas
new-york
```

---

### School Year Slug

统一格式：

```
2025-2026
2026-2027
```

不要：

```
25-26
2025_2026
school-year-2025
```

---

### Annual Report Links

带明确学年的报告、专题分析和数据集是固定的数据快照，不使用站点的动态 `currentSchoolYear`：

```
/school-calendar-trends/2026-2027-report
/school-start-dates-2026
/winter-break-2026
/spring-break-2027
/summer-break-2027
/datasets/school-calendar-trends
```

上述 2026–2027 报告中的学区链接必须固定指向 `/{district-slug}/2026-2027`。学区进入新的当前学年时，不更新这些历史报告的目标年份。

2027–2028 及以后学年的趋势、开学、假期和数据集需要重新审核数据并创建新的报告版本；不得复用旧报告 URL，也不得让旧报告自动滚动到新学年。

---

## Final URL Structure

```
/
├── california
├── florida
├── texas
│
├── example-public-schools-calendars
│   ├── 2025-2026
│   ├── 2026-2027
│   └── 2027-2028
│
├── tools
│   ├── google-calendar
│   ├── apple-calendar
│   ├── calendar-export
│   ├── calendar-compare
│   ├── holiday-countdown
│   └── print-calendar
│
├── guides
│
├── search
│
├── about
├── contact
├── privacy
└── terms
```

---

## 扩展能力

虽然 URL 保持扁平，但数据模型始终保留完整层级关系：

```
State
 └── District
      └── SchoolYear
           └── Event
```

这样以后无论增加州页面、更多学年、API、移动端还是其他工具，都不需要迁移数据；而 URL 仍然可以保持简洁稳定。

兼顾：产品体验 + SEO + 长期可维护性。
