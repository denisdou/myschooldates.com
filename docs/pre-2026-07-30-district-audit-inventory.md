# 2026-07-30 之前创建的学区审计整改队列

Created: 2026-08-03
Last updated: 2026-08-10

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
| P4 | `/san-diego-unified-school-district-calendar` | 已完成 SDUSD 2026–27 审计整改并达到 9.75 内容定稿级，正文冻结：删除错误的 Mexico spring-break / Easter 表述及不成立的 César Chávez Day 全州自动停课断言，清理 relocation、magnet demand、购物、biotech/defense、机场价格、wildfire 等无来源扩展内容；页面收敛为 Key Dates、Calendar Dates、带返校日的 Breaks、PDF/ICS、年度差异、5 条日历型 FAQ、SDUSD/LAUSD/LBUSD 的 First/Last Day 与 late-November/Winter/Spring Break 五项完整比较及来源复核，比较行以 `Thanksgiving Week / Fall Break` 保留 LBUSD 官方命名差异，补充 school-specific minimum-day 边界，并移除 Hero 重复的 instructional-day/return-date facts；关闭 Article、FAQPage、key-date ItemList 与 comparison Schema，Dataset 保留为独立数据实体但不再作为 WebPage mainEntity，并清理隐藏 ItemList 后的 `#key-dates` 悬空引用。JSON、事实字段、模块配置、结构化数据开关与审计清单 QA 均通过；本地运行页待 `localhost:3000` 恢复后复核，updated/reviewed: 2026-08-08 |
| P3 | `/charlotte-mecklenburg-schools-calendar` | 已完成 2026–27 与 2027–28 双学年审计整改：页面限定为 CMS Traditional Calendar，核对 first/last day、1,063 instructional hours、teacher workdays、early release、break windows、grading periods 与条件补课顺序，明确 early college、middle college、Hawthorne Academy 和 A/B schedules 使用独立日历；收紧 FAQ、来源、ICS/PDF 范围与 district master，隐藏重复/生活方式/Comparison 模块并关闭 Article、FAQPage Schema。两个学年均于 2026-08-08 更新和复核，待运行页/ICS 抽查后升 P4。 |
| P3 | `/chesterfield-county-school-calendar` | 已完成 2026–27 与 2027–28 双学年审计整改：重建 grade-based staggered opening schedule、Pre-K/K assigned attendance days、178 instructional days、holidays/workdays、breaks、返校日期、官方订阅边界、年度差异、FAQ 与来源说明，并清理 district master 中偏离 calendar intent 的内容；2027–28 另记录 live calendar 的 June 2 last day 与 approval announcement 的 June 1 冲突，当前遵循 live student calendar 且设置复核触发条件。两个学年均于 2026-08-08 更新和复核，待运行页/ICS 抽查后升 P4。 |
| P1 | `/fairfax-county-school-calendar` | 已审计并完成 2027–28 关键事实修正：last day 由 June 15 改为 June 14，移除失效 PDF URL，改用 School Board-approved calendar published July 9, 2026 的来源说明，并删除无来源的 Loudoun alignment 判断，updated/reviewed: 2026-08-08。当前 2026–27 页面仍保留 2026-07-05 旧结构，尚未按 9.5+ 资源页标准完成正文、来源、FAQ、Schema 与模块复核，因此维持 P1。 |
| P4 | `/edmonds-school-district-calendar` | 已完成 2026–27 多轮审计整改，最新独立内容评分 9.84，达到发布/冻结标准并转向站点级 SEO。页面已对齐 ESD Family Calendar、Key Dates、English/Spanish PDF、live calendar 及 start/end-time 官方资料；处理 grades 1–12/kindergarten/preschool 分阶段开学、精确 Friday early releases、conference/districtwide half days、May 28 与 June 23–25/28 有序 snow make-up dates、年度差异、独立 ICS 和来源视觉复核。Aug 28、Aug 31、Sep 1 已防止误合并，Dataset temporal coverage、Scheduled Last Day、Key Dates 及 ItemList Schema 均与可见页面一致。最终收尾包括精确区分两个 First Day Schema description、修正 What Changed 的同比语义、明确 DataDownload 只包含精选重要日期且不含 recurring Friday early releases，并完成 All Dates coverage、snow make-up、preschool 与 Spanish PDF 文案整理。updated/reviewed: 2026-08-08。 |
| P3 | `/guilford-county-school-calendar` | 已重新审计，2026–27 与 2027–28 页面已完成更新和官方来源复核，reviewed: 2026-08-09 |
| P3 | `/loudoun-county-school-calendar` | 已重新审计，2025–26、2026–27 与 2027–28 页面已完成更新和官方来源复核，reviewed: 2026-08-09 |
| P3 | `/prince-william-county-school-calendar` | 已重新审计，2026–27 页面已完成更新和官方来源复核，reviewed: 2026-08-09 |
| P3 | `/virginia-beach-school-calendar` | 已重新审计，2026–27 页面已完成更新和官方来源复核，reviewed: 2026-08-09 |
| P3 | `/wake-county-school-calendar` | 已重新审计，2026–27 与 2027–28 页面已完成更新和官方来源复核，reviewed: 2026-08-09 |
| P3 | `/winston-salem-forsyth-school-calendar` | 已完成 2026–27 审计整改：将错误的 Traditional Calendar 定位修正为 Board-adopted Modified Start Student Calendar，补齐 178 个学生日、四个季度/学期节点、Teacher Professional Days、返校日期与条件 snow make-up dates；新增 Student、Spanish、Early/Middle College、Middle/High A/B Day 和 Staff 官方日历分流，重写 Hero、FAQ、年度差异、Planning Notes、Comparison、PDF/ICS 范围与来源说明，并删除 Living Here、泛 District Profile、Wake Forest 错误 FAQ、生活方式推断和重复模板模块。官方 2026–27/2025–26 PDF、Board announcement 与 calendar hub 已完成文件级复核；`localhost:3000` 当前未运行，待 SSR/ICS 抽查后升 P4。updated/reviewed: 2026-08-10 |
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
| P4 | `/cumberland-county-school-calendar` | 已完成 2026–27 三轮审计整改及最终编辑收尾，内容评分 9.8，主体内容冻结：改用 CCS 当前 Traditional Calendar，将错误的 Aug 7 开学修正为 Aug 24，删除不存在的 October Fall Break，按官方类别重建 Nov 23–27、Dec 21–Jan 1 与 Mar 25–Apr 2 学生无课日期，补齐两小时提前放学日及 Feb 15 条件补课日；修复 Year-Round 旧学年 PDF，补齐 Early-College/Cumberland Polytechnic 日历；清除 Fort Liberty、无来源 PCS/IEP、relocation/lifestyle 与学区优劣判断，收敛军人家庭说明；关闭 Article、FAQPage、key-date ItemList 与 comparison Schema。后续轮次已删除重复 notice/badge，统一自然语言与完整官方 holiday 名称，修正 Guilford slug 并补齐 CCS/Wake/Guilford/CMS 五行比较；将 comparison spring 行统一为 `Spring Break / No-School Period`，图例收敛为实际可见类型，精修 break/military 文案并隐藏 Related Districts 重复描述。最终 polish 将提前放学 FAQ 改为自然英文，将 comparison 行改为 `Late-November No-School Period`，并删除非版本标识的 `CreativeWork.version`。源文件 JSON、Comparison 与静态一致性检查通过。当前公网 canonical URL 仍返回 Aug 7、旧 Fall/Spring Break、Fort Liberty 等旧 HTML，内容源已达标但部署/index freshness 为 P0 外部阻塞；`localhost:3000` 未运行，未执行构建或运行页/ICS 复核。updated/reviewed: 2026-08-08 |
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
