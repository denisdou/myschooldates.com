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
/miami-dade
/miami-dade/2025-2026
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
/miami-dade
/chicago-public-schools
/lausd
```

默认展示：最新 School Year。

---

### School Year

```
/miami-dade/2025-2026
/miami-dade/2026-2027
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

优先使用官方名称的可读形式：

```
miami-dade
chicago-public-schools
los-angeles-unified
dallas-isd
```

如果两个 District 重名，增加州信息以保持全站唯一：

```
springfield-il
springfield-mo
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

## Final URL Structure

```
/
├── california
├── florida
├── texas
│
├── miami-dade
│   ├── 2025-2026
│   ├── 2026-2027
│   └── 2027-2028
│
├── chicago-public-schools
│
├── lausd
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
