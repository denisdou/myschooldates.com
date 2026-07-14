# MySchoolDates Content Roadmap — 4-Week Plan

> 目标：覆盖 TX / CA / FL / VA / NC 五州约 400–500 个学区，建立 School Calendar Topical Authority。
> 制定日期：2026-07-12

---

## 当前进度快照

**已完成学区（26个）**

| 州 | 已完成 | P1 完成度 | P2 完成度 |
|----|--------|-----------|-----------|
| Texas | Houston ISD, Dallas ISD, Fort Worth ISD, Austin ISD, Northside ISD, Plano ISD | 6/6 ✓ | 0/5 |
| California | LAUSD, San Diego Unified, Long Beach Unified, Fresno Unified, Sacramento City USD | 5/5 ✓ | 0/5 |
| Florida | Miami-Dade, Broward County, Orange County, Palm Beach County, Hillsborough County | 5/5 ✓ | 0/5 |
| Virginia | Fairfax County, Prince William County, Loudoun County, Virginia Beach City, Chesterfield County | 4/5 (缺 Henrico County) | 1/5 |
| North Carolina | Wake County, Charlotte-Mecklenburg, Guilford County, Winston-Salem/Forsyth, Cumberland County | 5/5 ✓ | 0/5 |

**合计：P1 已完成 25/27，P2 已完成 1/24，P3 尚未开始。**

---

## 每个学区需要创建的内容

每个新学区需要两个文件：

1. `content/districts/{slug}.json` — 学区静态信息（about、planningTips、districtFaqs、livingHere、relatedDistricts、sources、logo）
2. `content/calendars/{slug}/2026-2027.json` — 日历事件数组 + calendarNotes（7句"Why + So What"格式）

内容质量标准参见已完成学区（目标审计分数 ≥ 9.0/10）。

---

## Week 1（目标：11个学区，Plano ISD 已提前完成）

**重点：补全 P1 缺口 + TX P2 全部 + NC P2 全部**

### Texas（5个）

| 优先级 | 学区 | Slug | 状态 |
|--------|------|------|------|
| P1 补缺 | Plano ISD | `/plano-independent-school-district-calendar` | ✓ 已完成 |
| P2 | Frisco ISD | `/frisco-independent-school-district-calendar` | ✓ 已完成 |
| P2 | Katy ISD | `/katy-isd/` | 待创建 |
| P2 | Round Rock ISD | `/round-rock-isd/` | 待创建 |
| P2 | Conroe ISD | `/conroe-isd/` | 待创建 |

> Plano ISD 约 54,000 学生，位于达拉斯北部郊区。Frisco 和 Katy 是 DFW/Houston 增长最快的学区，搜索量高，适合内链 Dallas ISD 和 Houston ISD。

### North Carolina（5个）

| 优先级 | 学区 | Slug | 状态 |
|--------|------|------|------|
| P2 | Union County Public Schools | `/union-county/` | 待创建 |
| P2 | Cabarrus County Schools | `/cabarrus-county/` | 待创建 |
| P2 | Johnston County Public Schools | `/johnston-county/` | 待创建 |
| P2 | Durham Public Schools | `/durham-public-schools/` | 待创建 |
| P2 | New Hanover County Schools | `/new-hanover-county/` | 待创建 |

> NC P1 已全部完成，P2 各学区规模 30,000–70,000，覆盖 Charlotte 郊区（Union、Cabarrus）、Raleigh 郊区（Johnston）、Durham 三角研究区和沿海（New Hanover/Wilmington）。

### Virginia（2个）

| 优先级 | 学区 | Slug | 状态 |
|--------|------|------|------|
| P1 补缺 | Henrico County Public Schools | `/henrico-county-school-calendar` | ✓ 已完成 |
| P2 | Arlington Public Schools | `/arlington-public-schools/` | 待创建 |

> Henrico County 约 52,000 学生，紧邻 Richmond。Arlington 约 27,000 学生，与 DC 联邦就业高度绑定，是 Pentagon / Amazon HQ2 家庭的主要学区。

---

## Week 2（目标：11个学区）

**重点：TX P2 收尾 + CA P2 全部 + VA P2 全部**

### Texas（1个）

| 优先级 | 学区 | Slug | 状态 |
|--------|------|------|------|
| P2 | Cy-Fair ISD | `/cy-fair-isd/` | 待创建 |

> Cy-Fair ISD 约 116,000 学生，是 Houston 最大郊区学区，搜索量高，应内链 Houston ISD。

### California（5个）

| 优先级 | 学区 | Slug | 状态 |
|--------|------|------|------|
| P2 | Elk Grove USD | `/elk-grove-usd/` | 待创建 |
| P2 | San Francisco USD | `/san-francisco-usd/` | 待创建 |
| P2 | San Jose USD | `/san-jose-usd/` | 待创建 |
| P2 | Oakland USD | `/oakland-usd/` | 待创建 |
| P2 | Irvine USD | `/irvine-usd/` | 待创建 |

> CA P1 已全部完成。Elk Grove 是 Sacramento 南郊最大学区；SF USD 具有极高品牌知名度；Irvine USD 是 Orange County 高收入学区，搜索精准度高。

### Virginia（4个）

| 优先级 | 学区 | Slug | 状态 |
|--------|------|------|------|
| P2 | Alexandria City Public Schools | `/alexandria-city/` | 待创建 |
| P2 | Stafford County Public Schools | `/stafford-county/` | 待创建 |
| P2 | Spotsylvania County Public Schools | `/spotsylvania-county/` | 待创建 |
| — | （Chesterfield 已完成） | — | ✓ 已完成 |

> Alexandria City 约 16,000 学生，DCA 机场旁，联邦雇员密度极高。Stafford 和 Spotsylvania 位于 Quantico 走廊，军人家庭大量集中。

---

## Week 3（目标：15个学区）

**重点：FL P2 全部 + TX P3 批次1 + CA P3 批次1**

### Florida（5个）

| 优先级 | 学区 | Slug | 状态 |
|--------|------|------|------|
| P2 | Duval County Public Schools | `/duval-county/` | 待创建 |
| P2 | Pinellas County Schools | `/pinellas-county/` | 待创建 |
| P2 | Polk County Public Schools | `/polk-county/` | 待创建 |
| P2 | Lee County School District | `/lee-county/` | 待创建 |
| P2 | Pasco County Schools | `/pasco-county/` | 待创建 |

> FL P1 已全部完成。Duval（Jacksonville）约 127,000 学生，是 FL 第三大学区。Lee County（Fort Myers）和 Pasco County 是近年增长最快的 FL 学区，PCS 军人家庭比例高（近 MacDill AFB、Patrick SFB）。

### Texas P3 批次1（5个）

按 Enrollment 从高到低（P1/P2 之后）：

| 优先级 | 学区 | 预计 Slug | 状态 |
|--------|------|-----------|------|
| P3 | Arlington ISD | `/arlington-isd/` | 待创建 |
| P3 | Lewisville ISD | `/lewisville-isd/` | 待创建 |
| P3 | Garland ISD | `/garland-isd/` | 待创建 |
| P3 | Pasadena ISD | `/pasadena-isd/` | 待创建 |
| P3 | Aldine ISD | `/aldine-isd/` | 待创建 |

> 均为 DFW 或 Houston 郊区，学生规模 50,000–65,000，适合通过 Dallas ISD / Houston ISD 页面的内链引流。

### California P3 批次1（5个）

| 优先级 | 学区 | 预计 Slug | 状态 |
|--------|------|-----------|------|
| P3 | Santa Ana USD | `/santa-ana-usd/` | 待创建 |
| P3 | Riverside USD | `/riverside-usd/` | 待创建 |
| P3 | Garden Grove USD | `/garden-grove-usd/` | 待创建 |
| P3 | San Bernardino City USD | `/san-bernardino-usd/` | 待创建 |
| P3 | Stockton USD | `/stockton-usd/` | 待创建 |

---

## Week 4（目标：20个学区）

**重点：VA P3 批次1 + NC P3 批次1 + TX P3 批次2 + CA P3 批次2**

### Virginia P3 批次1（5个）

| 优先级 | 学区 | 预计 Slug | 状态 |
|--------|------|-----------|------|
| P3 | Newport News City Public Schools | `/newport-news-city/` | 待创建 |
| P3 | Hampton City Schools | `/hampton-city/` | 待创建 |
| P3 | Roanoke County Public Schools | `/roanoke-county/` | 待创建 |
| P3 | Williamsburg-James City County Schools | `/williamsburg-james-city-county/` | 待创建 |
| P3 | York County School Division | `/york-county/` | 待创建 |

### North Carolina P3 批次1（5个）

| 优先级 | 学区 | 预计 Slug | 状态 |
|--------|------|-----------|------|
| P3 | Iredell-Statesville Schools | `/iredell-statesville/` | 待创建 |
| P3 | Brunswick County Schools | `/brunswick-county-nc/` | 待创建 |
| P3 | Henderson County Schools | `/henderson-county-nc/` | 待创建 |
| P3 | Catawba County Schools | `/catawba-county/` | 待创建 |
| P3 | Randolph County Schools | `/randolph-county-nc/` | 待创建 |

### Texas P3 批次2（5个）

| 优先级 | 学区 | 预计 Slug | 状态 |
|--------|------|-----------|------|
| P3 | McKinney ISD | `/mckinney-isd/` | 待创建 |
| P3 | Klein ISD | `/klein-isd/` | 待创建 |
| P3 | Spring ISD | `/spring-isd/` | 待创建 |
| P3 | Humble ISD | `/humble-isd/` | 待创建 |
| P3 | Mansfield ISD | `/mansfield-isd/` | 待创建 |

### California P3 批次2（5个）

| 优先级 | 学区 | 预计 Slug | 状态 |
|--------|------|-----------|------|
| P3 | Bakersfield City SD | `/bakersfield-city-usd/` | 待创建 |
| P3 | Corona-Norco USD | `/corona-norco-usd/` | 待创建 |
| P3 | Pomona USD | `/pomona-usd/` | 待创建 |
| P3 | Capistrano USD | `/capistrano-usd/` | 待创建 |
| P3 | Moreno Valley USD | `/moreno-valley-usd/` | 待创建 |

---

## 4-Week 累计进度

| 周 | 新增学区数 | 累计总量 | 说明 |
|----|-----------|---------|------|
| 基准（已完成） | 26 | 26 | 含 Plano ISD（2026-07-12 完成） |
| Week 1 | +11 | 37 | Plano ISD 已完成，剩余 TX P2 + NC P2 + VA P1 补缺 |
| Week 2 | +11 | 48 | TX/CA P2 收尾 + VA P2 |
| Week 3 | +15 | 63 | FL P2 + TX/CA P3 批次1 |
| Week 4 | +20 | 83 | VA/NC P3 + TX/CA P3 批次2 |

---

## Week 5+ P3 长尾规划（简化）

4周后进入全面 P3 阶段，按 Enrollment 从高到低持续扩展：

**Texas**（目标 100 个）：Week 4 后还剩约 87 个，建议每周 10 个，约需 9 周
**California**（目标 100 个）：Week 4 后还剩约 83 个，建议每周 10 个，约需 9 周
**Florida**（目标 100 个）：Week 4 后还剩约 90 个，建议每周 10 个，约需 9 周
**Virginia**（目标 50 个）：Week 4 后还剩约 40 个，建议每周 5 个，约需 8 周
**North Carolina**（目标 50 个）：Week 4 后还剩约 40 个，建议每周 5 个，约需 8 周

P3 内容可采用更高度模板化的方式生成（calendarNotes 精简为 4-5 句，about 缩短为 1 段），优先确保覆盖广度。

---

## 内容质量标准参考

| 字段 | P1/P2 标准 | P3 标准 |
|------|-----------|---------|
| `about` | 2 个条目，共约 200-300 字 | 1 个条目，约 100 字 |
| `planningTips` | 4-6 条，具体可操作 | 3-4 条 |
| `districtFaqs` | 5-8 个 FAQ | 3-5 个 FAQ |
| `livingHere` | 5-7 个 highlights | 3-4 个 highlights |
| `calendarNotes` | 7 句"Why + So What"格式 | 5 句 |
| `searchAliases` | 6-8 个 | 4-6 个 |
| `relatedDistricts` | 2-3 个，含 reason 字段 | 2 个 |
| `sources` | 3-6 个来源 | 2-3 个来源 |
| `logo` | 本地 `public/logos/` 文件 | 本地文件 |
| 目标审计分数 | ≥ 9.0/10 | ≥ 8.0/10 |
