# Information Architecture Specification

## Design Principles

### 1. User-first

信息架构首先服务用户，而不是 SEO。

用户应该能够快速找到：

- 学区
- 学年
- 日历
- 日历工具

---

### 2. Search-first

每一个 District 页面都是独立的 Landing Page。

用户无需经过首页即可直接访问。

---

### 3. Tool-first

myschooldates 是一个 **School Calendar Platform**。

日历只是数据。

真正的产品是围绕日历的一系列工具。

---

## Content Model

整个网站只有几个核心实体。

```
State
    ↓
District
        ↓
School Year
                ↓
Calendar Events
```

### State

例如：California、Florida、Texas

职责：聚合 District、浏览入口

---

### District（核心实体）

整个网站最重要的数据。

```
District
├── Name
├── Slug
├── State
├── Official Website
├── Official PDF
├── School Years
├── Related Districts
├── About
└── FAQ
```

一个 District 可以拥有多个 School Year。

---

### School Year

例如：2025–2026、2026–2027、2027–2028

```
School Year
├── Events
├── ICS
├── Google Calendar
└── Update Date
```

---

### Event

```
First Day / Last Day
Holiday
Spring Break / Winter Break
Teacher Day
Early Release
Graduation
```

Event 不单独生成页面。

---

## Platform Modules

整个产品划分为五个模块。

### A. Browse

浏览日历。

- District Calendar
- Timeline
- Month View
- Multi-year

---

### B. Calendar Tools

围绕日历的工具。

- Google Calendar
- Apple Calendar
- ICS
- Export
- Print
- Share

---

### C. Planning

帮助家长规划。

- Countdown
- Long Weekend Finder
- Calendar Compare
- Today School Status

---

### D. Discovery

帮助继续浏览。

- Related Districts
- State Pages
- FAQ
- About District

---

### E. Resources

帮助中心。

- Guides
- About
- Privacy
- Contact
