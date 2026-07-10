# Page Audit Round 3: Houston ISD Calendar 2026-2027

**Page:** `/houston-independent-school-district-calendar/2026-2027/`
**Date:** 2026-07-10
**Auditor note:** HTML snapshot reviewed against official HISD 2026-2027 PDF

---

## Score Comparison

| Dimension | Round 2 | Round 3 | Delta |
|-----------|---------|---------|-------|
| Title | 9.5 | **9.5** | — |
| Meta Description | 7 | **8** | ↑ |
| 搜索意图覆盖 | 9 | **9** | — |
| FAQ 相关性 | 7 | **8.5** | ↑ |
| 内容差异化 | 6.5 | **6.5** | — |
| 数据准确性 | 7.5 | **4.5** | ↓↓ |
| 技术 SEO | 8 | **5** | ↓↓ |
| **综合** | 8.2 | **6.9** | ↓ |

> 分数下降主要因为：多项事件名称与官方 PDF 不一致 + 开发环境代码泄漏（本地审计环境问题，不影响生产）。

---

## P0：数据错误（已修复）

### 1. Nov 6 错误标为 Staff PD Day ✅ 已删除
官方 PDF 中 Nov 6 为 Report Card 日期，不是 No School 日。
**操作：** 删除该 event entry。

### 2. Feb 15 "Presidents Day" → Staff PD Day ✅ 已修复
官方 PDF 标注为 Staff PD Day (No Classes)，与联邦 Presidents Day 重合但官方名称不同。
**操作：** name 改为 `No School (Staff PD Day)`，type 改为 `no_school`。

### 3. Mar 26 "Good Friday" → Staff PD Day ✅ 已修复
官方 PDF 标注为 Staff PD Day (No Classes)，与 Good Friday 重合但官方名称不同。
**操作：** name 改为 `No School (Staff PD Day)`，type 改为 `no_school`。

### 4. Mar 29 Chavez-Huerta Day 缺失 ✅ 已补充
官方 PDF 明确列出 Mar 29, 2027 — Chavez-Huerta Day Observed。
**操作：** 新增 event entry。

### 5. Jan 4 显示为 "Second semester begins" 错误 ✅ 已修复
Jan 4 是 Staff PD Day（学生不上课），学生实际返校日为 Jan 5。
**操作：** 修复 `getSecondSemesterStart()` 函数，跳过 `no_school` 类型事件，返回第一个真正的学生上课日。

---

## P0：技术问题

### 6. 开发环境 HTML 泄漏
审计的 HTML 来自 `nuxt dev`，包含：
- 本地绝对路径 `/Users/doujiajun/work/...`
- `@vite/client` 脚本
- Tailwind CSS 加载两次
- Nuxt devtools timing 脚本

**这是审计环境问题，不是生产 bug。** 上线前必须使用 `nuxt build && nuxt preview` 或对应部署命令。

---

## P1：提升搜索表现

### Meta Description 仍偏长
当前约 180+ 字符，Google 搜索结果可能截断。

**建议压缩为：**
```
Houston ISD Calendar 2026-2027 with holidays, spring break and key dates.
View the verified official schedule, download the PDF or add it to Google Calendar.
```
（约 150 字符）

### What's New 内容升级（代码已改，需重启 dev server 生效）
`computeYearDiff` 的句子已更新为有上下文的描述，例如：
- 旧：`Spring Break starts 1 day earlier than 2025-2026 (Mar 8).`
- 新：`Spring Break starts 1 day earlier this year (Mar 8–Mar 12). Families planning trips with students from neighboring districts should confirm those calendars separately.`

### teacher work days FAQ
`teacherWorkDays: 192` 来源需验证。如无官方 Teacher Calendar 文件支撑，建议将 FAQ 替换为：
> Q: When is the last day for Houston ISD teachers in 2026-2027?
> A: The official calendar lists June 1, 2027 as the last day for teachers.

### Hurricane makeup FAQ 措辞建议修正
当前写法 "Texas law requires districts to make up days" 过于绝对。
TEA 实际机制包括使用内置分钟、补课日和 missed-school-day waiver，并不必然延长学年。
**建议改为：**
> HISD may use built-in instructional minutes, scheduled makeup days, or state-approved waivers after weather closures. Significant disruptions could still change the published calendar, so families should check the district's latest updates before booking late-May travel.

### "Same as Fort Worth" 仍存在于 Quick Facts
建议替换为：
- `Spring Break: Mar 8–12` 或
- `Teacher Last Day: Jun 1`

---

## 已验证正确的项目

| 项目 | 状态 |
|------|------|
| Title | ✅ 无需改动 |
| H1 保留全名（与 Title 不同） | ✅ 正确策略 |
| Staff PD Day 标签本身 | ✅ 可接受（Sep 21、Oct 9、Jan 4、Apr 16） |
| Thanksgiving Break | ✅ Nov 23–27 正确 |
| Spring Break Mar 8–12 | ✅ 正确 |
| First Day Aug 10 | ✅ 正确 |
| Last Day May 28 | ✅ 正确 |

---

## 修复后预期评分：~8.7/10
