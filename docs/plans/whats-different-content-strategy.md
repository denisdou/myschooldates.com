# "What's Different" 模块内容策略

**Date:** 2026-07-10

---

## 核心结论

| | 结论 |
|--|------|
| 模块本身 | ✅ 保留——是 pSEO 页面差异化的关键抓手 |
| 当前内容 | ❌ 需升级——纯数字比较无决策价值，模板感强 |

---

## 为什么这个模块有价值

pSEO 最大的风险是每个页面结构完全相同，只有变量不同：

```
A 页面: First Day / Last Day / Spring Break / FAQ
B 页面: First Day / Last Day / Spring Break / FAQ
```

"What's Different" 的作用是回答一个真实用户问题：

> 今年和去年有什么变化？我需要重新安排什么吗？

这是有搜索价值的，也是竞争对手难以批量生成的内容（需要跨年数据对比）。

---

## 当前内容的问题

### ① 信息价值太低

```
First day is 2 days earlier.
Spring Break starts 1 day earlier.
Thanksgiving Break is 5 days.
```

"提前一天" 对家长没有决策意义。Google Helpful Content 倾向于奖励能帮用户**做决策**的内容。

### ② 规模化后极易被识别为程序输出

几千个页面都会变成：

```
2 days earlier / 3 days earlier / same / 1 day later
```

Google 识别模板的能力越来越强。

---

## 升级方向：从"日期变化"到"变化意味着什么"

### 内容结构模板

```
What's New for {{year}}

1. [日期变化] + [为什么用户应该关心]
2. [与周边学区的对比] + [对家庭计划的影响]
3. [本地注意事项]（飓风、考试窗口、新政策等）
4. [Calendar 更新说明]
```

### Houston 示例

```
What's New for 2026–2027

- School starts two days earlier than last year, giving students a slightly
  longer fall semester before the Thanksgiving break.

- Spring Break moves to March 8–12, one week earlier than many neighboring
  Texas districts. Families planning joint trips with relatives in Dallas ISD
  or Fort Worth ISD should note the schedule difference.

- Hurricane-related closures can still extend the school year if makeup days
  are required. The district has built in buffer days, but extended storms
  may push the last day past May 28.

- The official calendar PDF has been updated to reflect these changes.
  The .ics file on this page is synced to the latest version.
```

### 对比：升级前 vs. 升级后

| 升级前 | 升级后 |
|--------|--------|
| `First day is 2 days earlier.` | `School starts two days earlier, giving students a longer fall semester before Thanksgiving.` |
| `Spring Break starts 1 day earlier.` | `Spring Break moves to March 8–12, one week earlier than Dallas ISD — important for families planning joint trips.` |
| （无） | `Hurricane makeup days may extend the school year past May 28.` |

---

## 模块标题建议

| 选项 | 适用场景 |
|------|---------|
| `What's Different This Year` | 有实质性变化时 |
| `What's New for {{year}}` | 强调新学年视角 |
| `What Families Should Know This Year` | 内容以建议为主时 |

**推荐：** 根据当年内容动态选择，不要固定标题。有变化就用 `What's Different`，无变化但有本地注意事项就用 `What Families Should Know`。

---

## 内容生成规则

### 必须包含（如果数据存在）

- 开学日期变化 + 对学期节奏的影响
- 春假/寒假日期变化 + 与周边学区的对比

### 应该包含（如果适用）

- 本地季节性因素（飓风季、极端天气）
- 标准化考试窗口（STAAR、SAT/ACT）
- 新增或取消的假日

### 不应该出现

- 纯数字比较（`2 days earlier`）不加任何解释
- 与日历无关的学区信息（Magnet、大学合作等）
- 无法核实的预测性内容

---

## 实现建议

### 短期（手动写）

对流量最高的 20–30 个学区手动写 `calendarNotes` 字段，加入本地化解释。

### 中期（半自动）

在 JSON 里增加结构化字段：

```json
{
  "yearChanges": [
    {
      "type": "date_shift",
      "event": "firstDay",
      "delta": -2,
      "note": "Longer fall semester before Thanksgiving break."
    },
    {
      "type": "local_note",
      "note": "Hurricane makeup days may push last day past May 28."
    }
  ]
}
```

组件读取 `yearChanges`，自动生成有上下文的描述，而不是纯 `-2 days`。

### 长期（AI 辅助生成）

对每个学区，用结构化数据 + 本地知识库生成 200–300 字原创内容，人工审核后发布。
