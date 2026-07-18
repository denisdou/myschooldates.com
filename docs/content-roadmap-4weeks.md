# MySchoolDates Content Roadmap — 4-Week Plan

> 目标：覆盖 TX / CA / FL / VA / NC 五州约 400–500 个学区，建立 School Calendar Topical Authority。
> 制定日期：2026-07-12

---

## 当前进度快照

**已完成学区（41个）**

| 州 | 已完成 | P1 完成度 | P2 完成度 |
|----|--------|-----------|-----------|
| Texas | Houston ISD, Dallas ISD, Fort Worth ISD, Austin ISD, Northside ISD, Plano ISD, Frisco ISD, Katy ISD, Round Rock ISD, Conroe ISD, Cy-Fair ISD | 6/6 ✓ | 5/5 ✓ |
| California | LAUSD, San Diego Unified, Long Beach Unified, Fresno Unified, Sacramento City USD, Elk Grove USD, San Francisco USD, San Jose USD | 5/5 ✓ | 3/5 |
| Florida | Miami-Dade, Broward County, Orange County, Palm Beach County, Hillsborough County | 5/5 ✓ | 0/5 |
| Virginia | Fairfax County, Prince William County, Loudoun County, Virginia Beach City, Chesterfield County, Henrico County, Arlington Public Schools | 5/5 ✓ | 2/5 |
| North Carolina | Wake County, Charlotte-Mecklenburg, Guilford County, Winston-Salem/Forsyth, Cumberland County, Union County, Cabarrus County, Johnston County, Durham Public Schools, New Hanover County | 5/5 ✓ | 5/5 ✓ |

**合计：P1 已完成 27/27 ✓，P2 已完成 14/24，P3 尚未开始。**

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
| P2 | Katy ISD | `/katy-independent-school-district-calendar` | ✓ 已完成 |
| P2 | Round Rock ISD | `/round-rock-independent-school-district-calendar` | ✓ 已完成 |
| P2 | Conroe ISD | `/conroe-independent-school-district-calendar` | ✓ 已完成 |

> Plano ISD 约 54,000 学生，位于达拉斯北部郊区。Frisco 和 Katy 是 DFW/Houston 增长最快的学区，搜索量高，适合内链 Dallas ISD 和 Houston ISD。

### North Carolina（5个）

| 优先级 | 学区 | Slug | 状态 |
|--------|------|------|------|
| P2 | Union County Public Schools | `/union-county-school-calendar` | ✓ 已完成 |
| P2 | Cabarrus County Schools | `/cabarrus-county-school-calendar` | ✓ 已完成 |
| P2 | Johnston County Public Schools | `/johnston-county-school-calendar` | ✓ 已完成 |
| P2 | Durham Public Schools | `/durham-public-schools-calendar` | ✓ 已完成 |
| P2 | New Hanover County Schools | `/new-hanover-county-school-calendar` | ✓ 已完成 |

> NC P1 已全部完成，P2 各学区规模 30,000–70,000，覆盖 Charlotte 郊区（Union、Cabarrus）、Raleigh 郊区（Johnston）、Durham 三角研究区和沿海（New Hanover/Wilmington）。

### Virginia（2个）

| 优先级 | 学区 | Slug | 状态 |
|--------|------|------|------|
| P1 补缺 | Henrico County Public Schools | `/henrico-county-school-calendar` | ✓ 已完成 |
| P2 | Arlington Public Schools | `/arlington-public-schools-calendar` | ✓ 已完成 |

> Henrico County 约 52,000 学生，紧邻 Richmond。Arlington 约 27,000 学生，与 DC 联邦就业高度绑定，是 Pentagon / Amazon HQ2 家庭的主要学区。

---

## Week 2（目标：11个学区）

**重点：TX P2 收尾 + CA P2 全部 + VA P2 全部**

### Texas（1个）

| 优先级 | 学区 | Slug | 状态 |
|--------|------|------|------|
| P2 | Cy-Fair ISD | `/cy-fair-isd-calendar` | ✓ 已完成 |

> Cy-Fair ISD 约 116,000 学生，是 Houston 最大郊区学区，搜索量高，应内链 Houston ISD。

### California（5个）

| 优先级 | 学区 | Slug | 状态 |
|--------|------|------|------|
| P2 | Elk Grove USD | `/elk-grove-usd-calendar` | ✓ 已完成 |
| P2 | San Francisco USD | `/san-francisco-unified-school-district-calendar` | ✓ 已完成 |
| P2 | San Jose USD | `/san-jose-unified-school-calendar` | ✓ 已完成 |
| P2 | Oakland USD | `/oakland-unified-school-district-calendar` | ✓ 已完成 |
| P2 | Irvine USD | `/irvine-unified-school-district-calendar` | ✓ 已完成 |

> CA P1 已全部完成。Elk Grove 是 Sacramento 南郊最大学区；San Francisco USD 覆盖 Bay Area / urban district 核心搜索意图；San Jose USD 覆盖 Bay Area / Silicon Valley 核心搜索意图；Irvine USD 是 Orange County 高收入学区，搜索精准度高。
> Irvine USD 已按 SEO 审计补强：增加 District Entity 信息、Traditional vs Year Round 使用说明、IUSD Calendar Statistics、Irvine 本地规划语境、School Choice / Enrollment / Childcare 资源提示和三年 Calendar History，降低纯日期页与模板化风险。
> Irvine USD 二次补强：增加 Why Irvine Families Search the IUSD Calendar 独有模块，并把学年统计升级为派生分析，包括最长 instructional stretch、Monday no-school count、最长 break window 等，提高 Information Gain。
> Irvine USD 三次补强：Year by Numbers 已去除 Instructional Days / First Day / Last Day 重复项，改为派生指标；Comparison 模块增加自动 starts/ends 分析句，减少纯表格展示。
> Irvine USD 四次精简：修复 calendar track 页内锚点，合并重叠家长规划模块，移除 Calendar Statistics 重复模块，切换为完整日期表，并压缩 Title，重点提升信息密度和页面组织。
> Irvine USD 五次精简：隐藏重复日期型 Quick Facts，去除 Year by Numbers 中 Winter Break / Longest Break 的事实重复，改用 School-Year Span，并把 District Profile 文案进一步收敛到 calendar planning 场景。
> Irvine USD 2027-2028 定向修正：Winter Break 数字卡改为 Winter Recess / calendar days 表达，Longest Instructional Stretch 文案补充 instructional weekday，Changes 模块补充 2026-2027 / 2027-2028 年份实体，并把该学年 FAQ 控制到 10 条。

### Virginia（4个）

| 优先级 | 学区 | Slug | 状态 |
|--------|------|------|------|
| P2 | Alexandria City Public Schools | `/alexandria-city-public-schools-calendar` | ✓ 已完成 |
| P2 | Stafford County Public Schools | `/stafford-county-public-schools-calendar` | ✓ 已完成 |
| P2 | Spotsylvania County Public Schools | `/spotsylvania-county-public-schools-calendar` | ✓ 已完成 |
| — | （Chesterfield 已完成） | — | ✓ 已完成 |

> Alexandria City 约 16,000 学生，DCA 机场旁，联邦雇员密度极高。Stafford 和 Spotsylvania 位于 Quantico 走廊，军人家庭大量集中。
> Alexandria City SEO 审计补强：切换为完整日期表，增加 No School Days、Teacher Work Days / Professional Learning Days、ACPS calendar verification 方法模块，Title 改为 holidays/breaks/PDF 取向，并补充 standalone no-school weekdays 派生统计。
> Alexandria City 二次补强：把 No School Days / Teacher Work Days 模块提前到 Key Dates 后，验证模块改为 MySchoolDates Research Team 审核表述，并补充 Election Day、180 instructional days、Winter Break end 三个 FAQ 长尾问题。
> Alexandria City 三次补强：Quick Facts 去除静态构建后可能过期的 “Days Until …” 倒计时，改用固定 break 日期；District landing / year page JSON-LD 增加关键日期 ItemList，强化 AI Search 对 First Day、Breaks、Last Day 的解析。
> Alexandria City 四次精简：2026-2027 FAQ 收敛为 8 条高意图问题，保留 start / last day / spring break / winter break / no-school days / teacher workdays / Election Day / calendar download；Virginia hub 补强 Northern Virginia district cluster 文案。
> Alexandria City 五次细化：ICS 路由已确认带 X-Robots-Tag: noindex；ACPS Labor Day Weekend 标签改为 Holiday Weekend Begins，避免 Quick Facts 误读为 Labor Day 正日；相关学区模块标题改为 Related Virginia School Calendars。
> Stafford County SEO 审计补强：切换为完整日期表，增加 Important Stafford County Dates Parents Should Know、Stafford calendar verification 方法模块，首屏说明覆盖 holidays / staff work days / PDF intent，并补充 Labor Day、180 instructional days、summer break、school closings、Google Calendar download 等长尾 FAQ。
> Stafford County 二次补强：Sources and Verification 增加 MySchoolDates Editorial Team reviewer 信号，首屏说明补入 Google Calendar / Apple Calendar / Outlook 导入意图，并在学年页补充同学区年份切换链路。
> Spotsylvania County SEO 审计补强：切换为完整日期表，Title 改为 Spotsylvania County School Calendar 取向，增加 Important Notes for Spotsylvania Families、Spotsylvania calendar verification 方法模块，并补充 A/B Day calendar、179 student days、PDF download、Google Calendar import 等长尾 FAQ。
> Spotsylvania County 二次精修：Title 增加 Breaks，Meta 增加 2026-27 搜索写法，FAQ 去重并控制到 8 条以内，同时把 ICS 下载按钮统一强化为 Google Calendar 导入文案。
> Spotsylvania County 三次精修：H1 改为 School Calendar 搜索表述，FAQ 用 “When does Spotsylvania County school start” 替换低意图说明型问题，Quick Facts 的 staff-only 日期改为 Next Staff Event，并在 ICS 说明中明确 Updated automatically: No。
> Spotsylvania County 四次精修：Meta 改为 “2026-2027 school year” 搜索写法，Dataset schema 删除泛化 license 字段，Quick Facts 的 no-school 指标改为 Student No-School Days 并使用包含 student_holiday 的口径。

---

## Week 3（目标：15个学区）

**重点：FL P2 全部 + TX P3 批次1 + CA P3 批次1**

### Florida（5个）

| 优先级 | 学区 | Slug | 状态 |
|--------|------|------|------|
| P2 | Duval County Public Schools | `/duval-county-school-calendar` | ✓ 已完成 |
| P2 | Pinellas County Schools | `/pinellas-county-school-calendar` | ✓ 已完成 |
| P2 | Polk County Public Schools | `/polk-county-school-calendar` | ✓ 已完成 |
| P2 | Lee County School District | `/lee-county-school-calendar` | ✓ 已完成 |
| P2 | Pasco County Schools | `/pasco-county-school-calendar` | ✓ 已完成 |

> FL P1 已全部完成。Duval（Jacksonville）约 127,000 学生，是 FL 第三大学区。Lee County（Fort Myers）和 Pasco County 是近年增长最快的 FL 学区，PCS 军人家庭比例高（近 MacDill AFB、Patrick SFB）。
> Duval County SEO 审计补强：Title 从 Official Online Dates 改为 School Calendar / Holidays / Breaks / PDF 搜索取向，Meta 增加 printable dates 和 Google Calendar download，页面切换完整日期表，补充 Jacksonville 家长规划模块，并加入 180 instructional days、early release、Google Calendar import 等 FAQ 长尾。
> Duval County 二次精修：Meta 增加 Jacksonville families / DCPS，关闭该学年 Dataset schema，新增 Printable Duval County School Calendar 替代区块，FAQ 替换为 “What day does...” 并补 Veterans Day，隐藏 comparison / whatsDifferent 降低模板痕迹。
> Duval County 三次补强：Sources reviewer 统一为 MySchoolDates Calendar Data Team；Duval 日历 ItemList/Event schema 扩展到 planning / professional development / weather days 等重要事件；新增 Jacksonville weather 与 campus calendar notes 作为本地独有内容块。
> Duval County 四次精修：CreativeWork source schema 对无 PDF 的在线日历默认使用 Calendar Source 命名，避免误标为 PDF；首屏 verification badge 补入 MySchoolDates Calendar Data Team reviewer 信号。
> Pinellas County SEO 审计补强：Title / Meta 强化 PDF 下载意图，关闭该学年 Dataset schema 测试，补充 Pinellas quick-answer 问答块、School Calendar Types / Program Notes、本地城市语境（St. Petersburg / Clearwater / Largo / Gulf Coast）和 board-approved sourceVersion。
> Pinellas County 二次精修：Quick Answers 改为问题型 H2 “When Does Pinellas County Schools Start in 2026?”；补充 District Facts for Calendar Planning；PDF / ICS 下载模块上移到完整日期表之前；无 Dataset 页面的 WebPage mainEntity 回退指向 key-dates ItemList。
> Pinellas County 三次精修：Comparison 表头避免 Florida 学区缩写冲突，Pinellas / Pasco / Duval / Hillsborough 使用清晰地区名；2026-2027 FAQ 收敛到 5 条核心搜索问题；verification reviewer 强化为 MySchoolDates Editorial Team。
> Pinellas County 四次精修：FAQ 将低价值 PDF 问题替换为 hurricane make-up days 问题；Comparison 缺失值由破折号改为 “Not listed in summary”；首屏增加 Key Dates / PDF & Calendar / Dates / Comparison / FAQ 页内跳转；verification badge 同时展示 Updated 与 Verified 日期。
> Pinellas County 五次精修：ICS 说明由 “Updated automatically: No” 改为更正向的一次性导入文件说明；Comparison 结论句拆成 Start date comparison / End date comparison 两个扫描型分析块，降低长句阅读成本。
> Polk County SEO 审计补强：Title / Meta 增加 PCPS、parents/students、printable calendar 与 Important Dates 意图；补充 totalSchoolDays=180、sourceVersion、Lakeland / Winter Haven / Bartow 本地搜索别名；新增 “Important Polk County Dates Parents Should Know” 家长规划模块，覆盖 storm make-up days、早放学、childcare / travel 场景；FAQ 扩展 instructional days、Veterans Day、Winter Break end 长尾问题；ICS CTA 统一改为 “Add [District] calendar to Google Calendar”。
> Polk County 二次精修：新增 “Polk County Calendar Verification Process” 区块，说明 official PDF 检查、日期核对和仍需家长确认的 school-specific / storm make-up 信息；FAQ 增加 PDF availability 与 Google Calendar import 两个高意图问题，并将该学年 FAQ 展示控制在 9 条。
> Polk County 三次精修：新增站点级 `/calendar-verification-methodology` 页面并从 Sources、About、Footer 链接；Polk 增加 “Polk County School Calendar by City” 本地语义区块，覆盖 Lakeland / Winter Haven / Bartow / Haines City / Lake Wales / Auburndale 城市搜索意图，但暂不生成城市级薄页面。

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
| Week 1 进度 | +11 | 38 | Frisco ISD、Katy ISD、Round Rock ISD、Conroe ISD、Cy-Fair ISD、Union County、Cabarrus County、Johnston County、Durham Public Schools、New Hanover County、Arlington Public Schools（2026-07-16 完成），TX P2、NC P2 和 VA Arlington 已完成 |
| Week 1 目标 | +11 | 38 | ✓ 已完成 |
| Week 2 进度 | +2 | 41 | San Jose USD（2026-07-17 完成）、San Francisco USD（2026-07-18 完成），CA P2 进度 3/5 |
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
