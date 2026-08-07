# 2026-07-30 之前创建的学区审计整改队列

Created: 2026-08-03
Last updated: 2026-08-07

## Scope

本队列只列出 `2026-07-30` 之前创建的学区 slug、审计状态和整改优先级。创建日期按各学区学年文件中最早的 `datePublished` 判断；`2026-07-30` 当天及之后创建的学区不在本清单内。

## Priority

- `P0`: 最优先。早期创建且未审计，模板风险最高。
- `P1`: 高优先级。未审计，或已审计但仍待整改复核。
- `P2`: 已审计过，但需要按 9.5+ 新标准重新抽查。
- `P3`: 已重新审计，低优先级抽查即可。
- `P4`: 已审计并已达标，暂不需要进入整改队列。

## Queue

| Priority | Slug | Audit status |
| --- | --- | --- |
| P4 | `/austin-independent-school-district-calendar` | 已审计已达标 |
| P1 | `/aurora-public-schools-calendar` | 已完成 Aurora 2026–27 本轮修复：消除 January 4 返校冲突、统一 APS 日期分类、移除重复学生无课描述、展开 PRD、接入 conventional/alternative/updates 独立官方链接、修正 CreativeWork 来源 URL、补充 12 语言入口；已通过构建，2027–28 尚无本地页面，updated: 2026-08-05 |
| P3 | `/broward-county-school-calendar` | 已审计已达标 |
| P4 | `/cherry-creek-school-district-calendar` | 最终审计达到发布级，无需继续整改。2026–27 为 9.8/10，2027–28 与 2028–29 均为 9.7/10；三个学年已完成 All Schools 命名、统计口径、英语、重复模块、FAQ、导航、双来源、Dataset 范围与 ICS 整改，并通过本地 SSR/文件级复核。三个学年均正确区分 K–12/K–8 non-contact；2026–27 另正确区分 August 17 开学基准日与 Phase-In。`dateModified`/Updated 为 2026-08-06，来源复核日期保持 2026-08-05；仅剩 Google Calendar / Apple Calendar 实际导入测试。reviewed: 2026-08-06 |
| P4 | `/fort-worth-independent-school-district-calendar` | 已审计并达到 9.8 发布级，完成 Traditional/ADSY/ECHS/Intersessional 分流、October 连续休息、Winter return、Spring Break 后四天周末、April testing/grading 边界、PDF 版本/Board approval 区分、ICS、FAQ、Comparison、Schema 与来源说明整改，updated/reviewed: 2026-08-05 |
| P4 | `/fresno-unified-school-district-calendar` | 已审计并达到 9.5+ 发布级，2026–27、2027–28 已完成整改与复核，reviewed: 2026-08-05 |
| P4 | `/hillsborough-county-school-calendar` | 已审计并达到 9.7 发布级，完成 2026–27 与 2027–28 年份入口、日期、Schema、来源和页面结构复核，reviewed: 2026-08-05 |
| P4 | `/long-beach-unified-school-district-calendar` | 已审计并达到 9.7+ 发布级，完成 CAMS & Sato 例外日历、minimum day、Thanksgiving week、academic milestones、官方 PDF/ICS 范围、Dataset/ItemList/aria-label 和重复模块整改，reviewed: 2026-08-05 |
| P4 | `/los-angeles-unified-school-district-calendar` | 已审计并达到 9.8 发布级，完成 Thanksgiving week、Sep 21、Jan 11/Jun 7 条件例外、Schema、PDF/ICS 和重复模块整改，reviewed: 2026-08-05 |
| P4 | `/miami-dade-school-calendar` | 已完成 Miami-Dade 2026–27 全部审计整改并达到 9.8 发布级：比较模块限定 Broward/Palm Beach，补充 Wednesday Early Release、grading periods 与前置备用日历模块，统一使用官方 Elementary and Secondary Calendar 名称，明确区分 7 月 28 日日期核验与 8 月 6 日页面更新，收紧 Important Dates/ICS/Schema 范围，清理未核验多语言源数据，关闭 Article/FAQPage Schema，并补齐 Dataset 元数据与 revision history；生产构建、双路由 SSR、模块顺序、锚点、JSON-LD、比较表与 ICS 文件级 QA 均通过，updated: 2026-08-06 |
| P4 | `/northside-independent-school-district-calendar` | 2026–27 已完成最终整改并达到 9.8 发布级；2027–28 已按同一发布级架构完成重构并达到 9.8：February 22 改为带 `STATUS:TENTATIVE` 的条件补课日，补入 August 2–6 与 May 25 教师工作日，拆分 October 8/11/12，移除 175 天统计、无来源节日命名和重复模块，前移 PDF/ICS，补充 2026–27 比较来源、PDF 版本、三县 Dataset 范围及精确的 October Schema 日期，并消除 Related Calendars 的跨学年比较暗示；已完成本地 SSR 与 ICS 文件级验证。updated/reviewed: 2026-08-06 |
| P4 | `/orange-county-school-calendar` | 已审计并达到 9.8 发布级：补齐四个 Severe Weather Make-Up Days、marking-period transitions、Wednesday Early Release 与返校日期，精简 FAQ 和重复模块；学区主文件已删除旧 About、FAQ、Planning、Living Here、旅游、School Choice、飓风概率和南佛州推荐理由，相关推荐改为 Central Florida 学区；关闭 Article/FAQPage Schema，并同步 ICS 条件提醒、可访问日期范围和官方来源，Dataset 来源范围已与 ICS 内容收紧。待生产部署、重新索引及 ICS 三平台导入验证，reviewed: 2026-08-06 |
| P4 | `/palm-beach-county-school-calendar` | 已完成 2026–27 审计整改并达到 9.5+ 发布级：改用 2026-07-28 amended official PDF，处理 PDF 与 Key Dates page 的日期、标签及 attendance-day 统计冲突，删除无可靠依据的天数/学期统计，补齐返校日、grading-period、teacher workday、emergency make-up、年度差异、ICS 范围、Schema 与来源优先级说明；官方来源及页面均于 2026-08-07 复核/更新。reviewed: 2026-08-07 |
| P4 | `/pasco-county-school-calendar` | 已完成 2026–27 审计整改并达到 9.5+ 发布级：明确 February 12 / April 16 条件 school-day 逻辑、October / January / February 三个 early-release days、June 1–4 extended-closure make-up window，以及 Winter / Spring Break 后的实际返校日；同步收紧 ICS、FAQ、重复模块、订阅说明与来源追踪。核心日期保持 2026-07-18 官方复核结果，页面 updated/reviewed: 2026-08-07 |
| P4 | `/sacramento-city-unified-school-calendar` | 已完成 2026–27 审计整改并达到 9.5+ 发布级：页面范围收紧为 Traditional Student Attendance Calendar，区分 TK–6 / 7–12 academic calendars、dependent charter 与 Adult Education 独立日历，补齐 Fall / Winter / Spring Break 返校日、年度差异、PDF/ICS 范围、FAQ、来源说明与 Schema，并清理无当前官方依据的学区通用文案。updated/reviewed: 2026-08-07 |
| P0 | `/san-diego-unified-school-district-calendar` | 未审计 |
| P0 | `/charlotte-mecklenburg-schools-calendar` | 未审计 |
| P0 | `/chesterfield-county-school-calendar` | 未审计 |
| P0 | `/cumberland-county-school-calendar` | 未审计 |
| P0 | `/fairfax-county-school-calendar` | 未审计 |
| P0 | `/guilford-county-school-calendar` | 未审计 |
| P0 | `/loudoun-county-school-calendar` | 未审计 |
| P0 | `/prince-william-county-school-calendar` | 未审计 |
| P0 | `/virginia-beach-school-calendar` | 未审计 |
| P0 | `/wake-county-school-calendar` | 未审计 |
| P0 | `/winston-salem-forsyth-school-calendar` | 未审计 |
| P0 | `/frisco-independent-school-district-calendar` | 未审计 |
| P0 | `/henrico-county-school-calendar` | 未审计 |
| P0 | `/katy-independent-school-district-calendar` | 未审计 |
| P0 | `/plano-independent-school-district-calendar` | 未审计 |
| P0 | `/round-rock-independent-school-district-calendar` | 未审计 |
| P0 | `/conroe-independent-school-district-calendar` | 未审计 |
| P0 | `/cabarrus-county-school-calendar` | 未审计 |
| P0 | `/johnston-county-school-calendar` | 未审计 |
| P0 | `/union-county-school-calendar` | 未审计 |
| P0 | `/arlington-public-schools-calendar` | 未审计 |
| P0 | `/cypress-fairbanks-isd-calendar` | 未审计 |
| P0 | `/durham-public-schools-calendar` | 未审计 |
| P0 | `/elk-grove-unified-school-district-calendar` | 未审计 |
| P0 | `/new-hanover-county-school-calendar` | 未审计 |
| P0 | `/san-jose-unified-school-calendar` | 未审计 |
| P0 | `/lee-county-school-calendar` | 未审计 |
| P0 | `/oakland-unified-school-district-calendar` | 未审计 |
| P0 | `/san-francisco-unified-school-district-calendar` | 未审计 |
| P0 | `/aldine-independent-school-district-calendar` | 未审计 |
| P0 | `/garden-grove-unified-school-district-calendar` | 未审计 |
| P0 | `/garland-independent-school-district-calendar` | 未审计 |
| P0 | `/lewisville-independent-school-district-calendar` | 未审计 |
| P0 | `/pasadena-independent-school-district-calendar` | 未审计 |
| P0 | `/riverside-unified-school-district-calendar` | 未审计 |
| P0 | `/san-bernardino-city-unified-school-district-calendar` | 未审计 |
| P0 | `/santa-ana-unified-school-district-calendar` | 未审计 |
| P0 | `/stockton-unified-school-district-calendar` | 未审计 |
| P1 | `/hampton-city-schools-calendar` | 未审计 |
| P1 | `/newport-news-public-schools-calendar` | 已审计，待整改复核 |
| P1 | `/roanoke-county-public-schools-calendar` | 未审计 |
| P1 | `/williamsburg-james-city-county-schools-calendar` | 未审计 |
| P1 | `/york-county-school-division-calendar` | 未审计 |
| P1 | `/brunswick-county-schools-calendar` | 未审计 |
| P1 | `/catawba-county-schools-calendar` | 未审计 |
| P1 | `/henderson-county-public-schools-calendar` | 未审计 |
| P1 | `/henderson-county-schools-ky-calendar` | 未审计 |
| P1 | `/iredell-statesville-schools-calendar` | 未审计 |
| P1 | `/randolph-county-school-system-calendar` | 未审计 |
| P1 | `/bakersfield-city-school-district-calendar` | 未审计 |
| P1 | `/capistrano-unified-school-district-calendar` | 未审计 |
| P1 | `/humble-isd-calendar` | 未审计 |
| P1 | `/klein-isd-calendar` | 未审计 |
| P1 | `/mansfield-isd-calendar` | 未审计 |
| P1 | `/mckinney-isd-calendar` | 未审计 |
| P1 | `/moreno-valley-unified-school-district-calendar` | 未审计 |
| P1 | `/pomona-unified-school-district-calendar` | 未审计 |
| P1 | `/spring-isd-calendar` | 未审计 |
| P1 | `/chicago-public-schools-calendar` | 未审计 |
| P1 | `/clark-county-school-district-calendar` | 未审计 |
| P1 | `/gwinnett-county-public-schools-calendar` | 未审计 |
| P1 | `/arlington-isd-calendar` | 未审计 |
| P1 | `/fort-bend-independent-school-district-calendar` | 未审计 |
| P1 | `/hawaii-state-department-of-education-calendar` | 未审计 |
| P1 | `/montgomery-county-school-calendar` | 未审计 |
| P1 | `/new-york-city-public-schools-calendar` | 未审计 |
| P1 | `/north-east-isd-calendar` | 未审计 |
| P1 | `/prince-georges-county-school-calendar` | 未审计 |
| P1 | `/school-district-of-philadelphia-calendar` | 未审计 |
| P1 | `/anaheim-union-high-school-district-calendar` | 未审计 |
| P1 | `/chula-vista-elementary-school-district-calendar` | 未审计 |
| P1 | `/corona-norco-unified-school-district-calendar` | 未审计 |
| P1 | `/fontana-unified-school-district-calendar` | 未审计 |
| P1 | `/judson-isd-calendar` | 未审计 |
| P1 | `/mesquite-isd-calendar` | 未审计 |
| P1 | `/poway-unified-school-district-calendar` | 未审计 |
| P1 | `/san-juan-unified-school-district-calendar` | 未审计 |
| P1 | `/sweetwater-union-high-school-district-calendar` | 未审计 |
| P1 | `/brevard-public-schools-calendar` | 未审计 |
| P1 | `/osceola-school-district-calendar` | 未审计 |
| P1 | `/seminole-county-school-calendar` | 未审计 |
| P1 | `/volusia-county-schools-calendar` | 未审计 |
| P1 | `/cobb-county-school-calendar` | 未审计 |
| P1 | `/dekalb-county-school-calendar` | 未审计 |
| P1 | `/sarasota-county-school-calendar` | 未审计 |
| P2 | `/houston-independent-school-district-calendar` | 已审计，需按新标准复核 |
| P2 | `/alexandria-city-public-schools-calendar` | 已审计，需按新标准复核 |
| P2 | `/duval-county-school-calendar` | 已审计，需按新标准复核 |
| P2 | `/irvine-unified-school-district-calendar` | 已审计，需按新标准复核 |
| P2 | `/pinellas-county-school-calendar` | 已审计，需按新标准复核 |
| P2 | `/polk-county-school-calendar` | 已审计，需按新标准复核 |
| P2 | `/spotsylvania-county-public-schools-calendar` | 已审计，需按新标准复核 |
| P2 | `/stafford-county-public-schools-calendar` | 已审计，需按新标准复核 |
| P2 | `/collier-county-school-calendar` | 已审计，需按新标准复核 |
| P3 | `/atlanta-public-schools-calendar` | 已重新审计，需抽查 |
| P3 | `/fulton-county-schools-calendar` | 已重新审计，需抽查 |
| P4 | `/forsyth-county-schools-calendar` | 已审计已达标 |
| P4 | `/dallas-independent-school-district-calendar` | 已审计并达到 9.7+ 发布级，完成 Key Dates 返校说明、What Changed 年度对比、meta 语法、ADSY 全称、175 student days 来源、Winter Break/Jan. 5、inclement weather day、early release、FAQ 链接、ICS 一致性与 comparison 口径收尾，updated/reviewed: 2026-08-03 |
