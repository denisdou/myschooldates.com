# Page Audit Round 2: Houston ISD Calendar 2026-2027

**Page:** `/houston-independent-school-district-calendar/2026-2027/`
**Date:** 2026-07-10
**Based on:** Round 1 audit + Title fix applied

---

## Score Comparison

| Dimension | Round 1 | Round 2 |
|-----------|---------|---------|
| Title | 7/10 | **9.5/10** ✅ |
| Meta Description | 7/10 | 7/10（未变） |
| SEO 结构 | 9/10 | 9/10 |
| 内容质量 | 6.5/10 | 6.5/10 |
| EEAT | 6/10 | 6.5/10 |
| **综合** | 7.8/10 | **8.2/10** |

---

## 1. Title ✅ 已解决

```
Houston ISD Calendar 2026-2027: PDF & Holidays
```

优点：`shortName` > 全名，包含年份/PDF/Holidays，长度适中，无堆砌。**不需要再改。**

---

## 2. Meta Description — 仍需优化

**当前：**
```
Official Houston Independent School District school calendar 2026-2027. First day Aug 10, 2026...
```

**问题：** Title 里的 `PDF`、`Holidays` 在 Description 里未出现，关键词不一致。

**建议模板：**
```
View the official {{shortName}} Calendar {{year}} with holidays, spring break,
key dates, and downloadable PDF. Verified against the official district calendar.
```

示例：
```
View the official Houston ISD Calendar 2026–2027 with holidays, spring break,
key dates, and downloadable PDF. Verified against the official district calendar.
```

覆盖词：PDF / Holidays / Spring Break / Key Dates / Verified

---

## 3. H1 — 保持现状（刻意与 Title 不同）

```
H1: Houston Independent School District Calendar 2026-2027  ← 保留全名
Title: Houston ISD Calendar 2026-2027: PDF & Holidays        ← shortName + 修饰词
```

H1 保留全名可以覆盖更多长尾词，Google 也能识别 HISD = Houston Independent School District。**不需要改。**

---

## 4. 重复展示同一日期（最大结构问题）

`Aug 10`（First Day）在以下位置重复出现：

- Hero 段落
- Key Date Cards
- Quick Facts
- Upcoming Dates
- All Dates 表格
- FAQ
- JSON-LD

**建议删除其中一个整块：**

优先考虑删除 **`Upcoming Dates`** 模块（与 `All Dates` 表格高度重叠），或合并到 `All Dates` 里。

---

## 5. What's Different 模块 — 升级内容，不删除模块

> ⚠️ 修正：模块本身有价值（页面差异化），问题在于**当前内容质量不足**，不是模块方向错误。

**当前内容问题：**
```
First day is 2 days earlier.
Spring Break starts 1 day earlier.
```
纯数字比较，无决策价值，大规模生成后 Google 容易识别为程序输出。

**正确方向：** 保留模块，升级内容。详见 `whats-different-content-strategy.md`

---

## 6. Quick Facts — 删除 "Same as Fort Worth"

**当前某格显示：**
```
Same as Fort Worth
```

无搜索价值，增加模板感。

**建议替换为：**
```
Spring Break: 5 Days
```
或
```
School Ends: May 28
```

---

## 7. FAQ — 删除偏题问题

**建议删除：**
- "Does Houston ISD offer magnet schools?" — 与 Calendar 无关
- 涉及 University of Houston 的问题 — 无搜索价值

**保留聚焦于日历的问题：**
- When is the first day of school for Houston ISD 2026-2027?
- When is spring break for Houston ISD?
- Where can I download the Houston ISD school calendar PDF?
- What holidays does Houston ISD observe?
- When does Houston ISD get out for summer?

---

## 8. Planning Tips — 亮点，继续扩展

当前已有：Book travel / Different districts / Hurricane season

**建议增加（Houston 本地化）：**
- SAT / ACT testing dates during the school year
- Texas STAAR testing windows（影响家长请假安排）
- Spring break travel：Houston → Cancun / Florida 机票趋势
- Holiday travel peak pricing tips

---

## 9. About the District — 用模糊表达代替硬编码数字

| 当前写法 | 建议写法 |
|---------|---------|
| `194,000 students` | `approximately 194,000 students` |
| `275 schools` | `more than 275 schools` |
| `largest school district in Texas` | `one of the largest school districts in Texas` |

避免数据过时导致页面长期失准。

---

## 10. Schema — Event 精简

**当前：** First Day / Last Day / Spring Break / Winter Break / Thanksgiving 全部做 Event

**建议只保留：**
- First Day of School
- Last Day of School

其余 break/holiday event schema 收益有限，可移除。

---

## 优先改进项（按收益排序）

| 优先级 | 问题 | 操作 |
|--------|------|------|
| 1 | What's Different 内容价值低（非模块本身） | 升级内容：保留模块，删除纯数字比较句，增加变化的实际意义说明 |
| 2 | University of Houston / Magnet FAQ 偏题 | 删除 |
| 3 | Meta Description 未覆盖 PDF/Holidays | 更新模板，加入 PDF、Holidays、Spring Break、Verified |
| 4 | 同一日期重复 6 次 | 删除 Upcoming Dates 模块，或合并到 All Dates |
| 5 | 缺少 Houston 本地化原创内容 | 增加 300–500 字：飓风政策、STAAR 测试、旅行建议等 |

---

## 结论

**Title 已达到规模化页面推荐水平，不需要再迭代。**

核心短板仍是**模板化内容占比过高**——对于几十个学区页面勉强够用，但作为 Programmatic SEO 项目，Google 会重点审查每页的独特价值。

下一步重心应从标题/Schema 微调转向：
1. 删除低价值模块（What's Different、偏题 FAQ）
2. 减少重复展示
3. 增加每个学区的本地化原创内容
