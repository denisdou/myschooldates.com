# 2026-07-30 之前创建的学区审计整改队列

Created: 2026-08-03
Last updated: 2026-08-12

## Scope

本队列只列出 `2026-07-30` 之前创建的学区 slug、审计状态和整改优先级。创建日期按各学区学年文件中最早的 `datePublished` 判断；`2026-07-30` 当天及之后创建的学区不在本清单内。

2026-08-10 审计批次共完成 10 个学区。其中 Frisco、Henrico、Katy、Plano 和 Winston-Salem/Forsyth 属于本清单并已更新为 P4；Canyons、Davis、Granite、Jordan 和 Weber 的最早 `datePublished` 均为 2026-08-10，按上述 Scope 不加入本队列。

2026-08-11 审计批次共完成 10 个学区。其中 Round Rock、Conroe、Cabarrus、Johnston 和 Union County 属于本清单并已更新为 P4；Albuquerque、Boise、Las Cruces、Washoe 和 West Ada 的最早 `datePublished` 均为 2026-08-11，按上述 Scope 不加入本队列。

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
| P4 | `/winston-salem-forsyth-school-calendar` | 已完成 2026–27 审计整改并达到发布级：将错误的 Traditional Calendar 定位修正为 Board-adopted Modified Start Student Calendar，补齐 178 个学生日、四个季度/学期节点、Teacher Professional Days、返校日期与条件 snow make-up dates；新增 Student、Spanish、Early/Middle College、Middle/High A/B Day 和 Staff 官方日历分流，重写 Hero、FAQ、年度差异、Planning Notes、Comparison、PDF/ICS 范围与来源说明，并删除 Living Here、泛 District Profile、Wake Forest 错误 FAQ、生活方式推断和重复模板模块。官方 2026–27/2025–26 PDF、Board announcement 与 calendar hub 已完成复核。updated/reviewed: 2026-08-10 |
| P4 | `/frisco-independent-school-district-calendar` | 已完成 2026–27 多轮审计整改并达到 9.9 发布级，正文冻结：校正 October no-school dates、February 非连续日期、Winter Break、bad-weather make-up days 与 April 30 分类；补齐 PGA Championship 提前结束学年、每日增加 5 分钟、官方 PDF、MySchoolDates ICS、同年 nearby comparison、FAQ、来源与 Dataset 语义，并建立 `production_ready`、重审触发条件和 enrollment provenance。updated/reviewed: 2026-08-10 |
| P4 | `/henrico-county-school-calendar` | 已完成 2026–27 与 2027–28 双学年审计整改并达到发布级：核对 staggered opening、Pre-K/K school-specific schedules、all-student attendance day、breaks、return dates 与 scheduled last day；同步收紧官方来源、PDF/ICS、FAQ、Schema、年度差异与页面模块范围。updated/reviewed: 2026-08-10 |
| P4 | `/katy-independent-school-district-calendar` | 已完成 2026–27 与 2027–28 双学年审计整改并达到发布级：核对 first/last day、Fall Break、Spring Break、early dismissal、teacher preparation days 与容易遗漏的学生无课日期；完成官方来源、PDF/ICS、FAQ、Schema、年度差异和模块去模板化整改。updated/reviewed: 2026-08-10 |
| P4 | `/plano-independent-school-district-calendar` | 已完成 2026–27 与 2027–28 双学年审计整改并达到发布级：按官方标签处理 October 连续无课日期，明确 Winter Break 后的独立 student holidays/staff work days 与返校日，并核对 first/last day、early release、semesters、grading periods、PDF/ICS、FAQ、Schema 与年度差异。updated/reviewed: 2026-08-10 |
| P4 | `/round-rock-independent-school-district-calendar` | 已完成 2026–27 审计整改并达到发布级：核对 first/last day、170 instructional days / 440-minute day、Fall/Winter/Spring Break 与 January 5 返校日，保留 Yom Kippur、Indigenous Peoples’ Day / Columbus Day、YOU Days 和 Eid al-Fitr 等官方标签；补齐 PDF 版本、年度差异、Austin ISD 同年比较、ICS、Schema、来源与衍生返校日期说明，并清理重复和泛化模块。updated/reviewed: 2026-08-11 |
| P4 | `/conroe-independent-school-district-calendar` | 已完成 2026–27 多轮审计整改并达到 9.9 发布级，正文冻结：校正 March 26 Holiday、March 29 条件恶劣天气补课日、173 instructional days、December 18 / May 27 early release 及教师日叠加关系；页面收敛为 Key Dates、完整日期、Calendar Notes、PDF/ICS、年度变化、同年附近学区比较、Calendar Profile 与来源复核，并完成 derived return dates、Dataset/ItemList provenance 和 review triggers 整改。updated/reviewed: 2026-08-11 |
| P4 | `/cabarrus-county-school-calendar` | 已完成 2026–27 审计整改并达到发布级：明确页面以 Traditional Academic Calendar 为主，并为 Early College 与 Restart schools 提供独立官方日历分流；核对 first/last day、breaks、student no-school workdays、early dismissals、exam windows、graduation 及官方教学日/小时统计，同步收紧 PDF/ICS、FAQ、Schema、来源和页面模块范围。updated/reviewed: 2026-08-11 |
| P4 | `/johnston-county-school-calendar` | 已完成 2026–27 审计整改并达到发布级：限定为 JCPS Traditional Student Calendar，核对 first/last day、breaks、January return、early dismissals、quarter endings 与 student no-school dates；补充 kindergarten August 26–27 staggered entry 和 August 28 all-kindergarten start，并将 ECA/CTLA 独立日历与主页面、PDF/ICS、FAQ、Comparison、Schema 和来源说明清楚分离。updated/reviewed: 2026-08-11 |
| P4 | `/union-county-school-calendar` | 已完成 2026–27 与 2027–28 双学年审计整改并达到发布级：两个页面均限定为 UCPS Traditional Calendar，核对 175 instructional days、semester totals、first/last day、teacher workdays、annual-leave/holiday 分类、major no-school periods 与官方 PDF/ICS；2026–27 分流 Early College 和 Wolfe School，2027–28 按当前官方发布情况仅明确 Wolfe School 独立日历，并同步完成年度差异、附近学区比较、Schema、来源与更新边界整改。updated/reviewed: 2026-08-11 |
| P4 | `/arlington-public-schools-calendar` | 已完成 APS 2026–27 审计整改并达到 9.7 内容定稿级，正文冻结：核对 K–12、PreK/VPI 分阶段开学、June 17 early-release last day、major breaks 与返校日期；新增 APS-specific Back-to-School Nights、grading periods、ParentVUE posting dates 和 weather/emergency closure policy，并用官方 Calendar Narrative、Holiday Calendar 与前一学年日历补齐来源关系。页面已删除 Year Numbers 等模板化重复内容，人工化年度差异，统一 APS 官方 `Early Release` 术语，收紧为三行完整 nearby comparison，关闭 Article/FAQPage Schema，并修正 official PDF 与独立 ICS 的描述边界、Jump Nav、Reviewed/Updated 与 JSON-LD 日期语义。最终收尾已将 June 11、14–16 High School Early Release 建模为非连续日期，FAQ 收敛为 4 条，来源摘要补齐 Holiday Calendar，并将宽泛的 `districtwide / all students` 改为 APS 官方 elementary / middle / high school 年级范围表达；Dataset 已收窄为与 ICS 一致的 Student Calendar Dataset，保留 June 17 temporal coverage，并明确排除 Back-to-School Nights / ParentVUE。`localhost:3000` SSR、模块顺序、Comparison、JSON-LD、JSON 解析与 ICS 均已通过验证，ICS 恰好逐日导出四个 High School Early Release 事件。按要求未执行构建。updated: 2026-08-12，source reviewed: 2026-07-16 |
| P4 | `/cypress-fairbanks-isd-calendar` | 已完成 2026–27 审计整改并达到发布级，正文冻结：删除无官方口径支持的 173 instructional days 及跨学区天数比较，合并重复 Key Dates/Year Numbers/School Year Status，前移并重写年度变化，补充 Board approval、DEIC 与 15,000+ surveys 背景；明确 Oct. 9、Nov. 3、Mar. 12 条件补课日和 Fall/Thanksgiving/Winter/Spring Break 返校日期，并补齐 CFISD/Houston/Katy 的同年 Fall Break 比较；收紧 PDF/ICS、FAQ、Comparison、Schema 与来源说明，并隐藏泛化模块。官方 PDF 已视觉复核；localhost SSR、模块顺序、Comparison、JSON-LD 与 ICS 均已通过运行验证。updated/reviewed: 2026-08-12 |
| P4 | `/durham-public-schools-calendar` | 已完成 2026–27 多轮审计整改并达到发布级，正文可冻结：页面收敛为 DPS Traditional Calendar，明确分流 Year-Round 与 Cooperative Innovative High School 官方日历；核对 first/last day、176 instructional days、breaks、students return、marking-period endings、early release 及 Teacher Workday / Required Teacher Workday 官方术语。删除 Key Dates Summary、School Year Status、Year by Numbers、泛 About 与重复验证/下载文案；完成年度差异、DPS/Wake/Johnston 五项完整日期比较、PDF/ICS/官方自动更新数字日历边界、FAQ、来源与 Schema 整改。canonical 路由已补齐 `beforeKeyDates` 配置支持；localhost SSR 已验证提醒顺序、全部锚点、Downloads H2/H3、Comparison、官方事件名称及 Article/FAQPage Schema 关闭状态，静态检查通过，未运行 build。updated/reviewed: 2026-08-12 |
| P4 | `/elk-grove-unified-school-district-calendar` | 已完成 EGUSD 2026–27 多轮审计整改并达到 9.5+ 发布级：页面明确限定为 Traditional Calendar，并前置 Traditional、Modified Traditional、Track A、B、C、D 六套官方日历分流；拆分 Track B/C，直接链接六份独立官方 PDF。透明记录 combined calendar 将 Dec. 21–Jan. 4 标为 Traditional Winter Break、独立 Traditional PDF 将 Dec. 23–Jan. 1 标为 Winter Break的官方源差异，并将 Dec. 21–Jan. 4 统一表达为学生 winter recess/no-school period、Jan. 5 返校。同步完成 Key Dates、完整日期、返校说明、年度差异、精简下载、5 条用户型 FAQ、Sources、Dataset/ItemList provenance 与 ICS 范围整改，关闭 Comparison、Article、FAQPage 及泛化模板模块。localhost 页面返回 200，最终 HTML、JSON-LD 与 12 项 Traditional-only ICS 已通过运行验证，未混入 Modified Traditional 或 A–D track 日期。updated/reviewed: 2026-08-12 |
| P4 | `/new-hanover-county-school-calendar` | 已完成 NHCS 2026–27 多轮审计整改并达到 9.5+ 发布级，正文冻结：页面限定为 Traditional Calendar，删除无官方来源支持的 178 instructional days 主张，将 Thanksgiving、Winter 和 Spring 的家庭视角连续无课区间与官方 Teacher Workday、Vacation Day、Holiday、Spring Break 标签分离；恢复 Staggered Enrollment、完整 workday/vacation/holiday/reporting/graduation 日期及 June 4 half day，补齐多个 Year-Round、Restart、Early College、Technical High School、Pre-K 官方日历和 Spanish PDF；明确官方 live Google/iCal calendar 与 MySchoolDates 一次性 student-focused ICS 的用途差异，年度变化使用官方 Spring Break 周口径，并将跨区比较收敛为相邻 Brunswick County Schools。已清理重复 PSEO 模块、Calendar Track notice、FAQ 与验证文案，移除 FAQPage Schema，修正 ItemList/Dataset、Meta、锚点和官方事件名；官方 2025–26/2026–27 PDF 已视觉复核，localhost SSR、模块顺序、导航锚点、JSON-LD 与 22 项 ICS 事件均通过运行验证。updated/reviewed: 2026-08-12 |
| P4 | `/rosemount-apple-valley-eagan-public-schools-calendar` | 已完成 District 196 2026–27 与 2027–28 两个学年审计整改并通过 9.85+ 内容验收。2026–27 已删除无官方来源支持的 180 instructional days、Traditional/year-round 泛化提醒、Invalid Date、错误 seven-cities 文案及 RAVE Title；页面收敛为 Key Dates、分年级 conference no-school dates、完整日期、Major Breaks、District trimesters / EVHS quarters、READ Act 年度变化、学生 ICS、官方 PDF、Spanish/Somali 翻译差异、Sources 与 7 条用户型 FAQ，并建立 approved PDF `K–12 / K–8 / 9–12` 与 live page `K–12+` 的来源分层。2027–28 已同步成熟编辑标准：删除 180、Traditional、RAVE、Opening/Quick Facts/Status/Year Numbers/About/Profile/Living 等旧模板内容与串学年 FAQ；重写 Hero、Title/Meta、七项 Key Dates、Conference、Trimester/EVHS、Thanksgiving Week、三条 Planning Notes 与 7 条本学年 FAQ；加入 2027–28 年度变化、PDF/current page 与 Board article 的 Winter Break 日期冲突、April 21 无公开原因及 2027–28 无翻译 PDF 的专属 Source Notes；All Dates 保留批准 PDF scope，Dataset 覆盖完整 staff/student date range，FAQPage/Article Schema 已隐藏。最终验收补充 June 7 weekday 官方网页 typo 的核验记录，将 Board approval article 纳入 WebPage/Dataset `isBasedOn` 与 `citation`，并统一 FAQ 学年 en dash。两个学年均已通过 localhost SSR、可见正文、锚点、JSON-LD 与 ICS 验证；未执行 build。updated/reviewed: 2026-08-12 |
| P0 | `/san-jose-unified-school-calendar` | 未审计 |
| P0 | `/lee-county-school-calendar` | 未审计 |
| P0 | `/oakland-unified-school-district-calendar` | 未审计 |
| P0 | `/san-francisco-unified-school-district-calendar` | 未审计 |
| P4 | `/aldine-independent-school-district-calendar` | 已完成 Aldine ISD 2026–27 多轮审计整改并达到发布级：官方来源由失效的 district v5 / ADSY v6 更新为 v6（2026-07-22）与 v61（2026-06-03），并增加两个 PDF 的 URL + SHA-256 监控；删除无官方依据的 180 instructional days、重复模板模块及 FAQPage Schema，页面收敛为 ADSY 分流、8 项 Key Dates、PDF/ICS、All Dates、Breaks/Student Holiday Weeks、Grading、Aldine-specific notes、8 条 FAQ 与 Sources。2025–26 历史记录已从误用 ADSY 的 Jul. 24–Jun. 18 修正为 districtwide traditional 的 Aug. 11–May 28，并引入 `calendarTrackId` 作为年度比较身份，防止 traditional/ADSY 串轨；October/February/March 26 保留官方 Student Holiday 语义，Midwinter 为 12 个学生无课工作日；ADSY 首次展开为 Additional Days School Year，官方 v61 PDF 与批准公告的 Smith Elementary 来源冲突保持公开并启用人工复核。正文与 jump nav 现共用最终模块顺序，ADSY 位于 Key Dates 前。最新 localhost 运行验证待开发服务器重启；按要求未执行 build。updated/reviewed: 2026-08-13 |
| P4 | `/detroit-public-schools-community-district-calendar` | 已完成 DPSCD 2026–27 最终验收并达到约 9.9 内容质量：页面收敛为单一 Key Dates、districtwide/no-school PD 与 school-based PD 的出勤区别、K–8 / grades 9–12 conference dates、Calendar Key、完整日期、Major Breaks、四个 grading periods、conditional June 9–17 make-up window、PDF/ICS、五份官方翻译、8 条用户型 FAQ 与 Sources。已隐藏错误的 Traditional/year-round 泛化提示及 generic Key Date cards、Quick Facts/About/Profile/Planning/Comparison/年度变化等模板模块；DPSCD 学年 legend 现仅显示 Holiday、No School、Break、Academic / School-Based PD、Conditional，不再带入 Reserved Weather Day；ICS 区删除两段通用重复免责声明，All Dates 仅在首次 school-based PD 保留说明，并移除重复 PD/conference 注释及 June 8/18 的数据注释腔。Jump nav 已与阅读任务对齐为 Key Dates → PD Days → Dates → Breaks → Grading → Download → FAQ，全部锚点有效；边界说明、FAQ、短版 Meta、grading 文案与 Sources 均完成母语级精修，Article Schema 保持关闭。localhost SSR 已验证 Title、15 个内容 H2、8 条可见 FAQ及 FAQPage、6 项 ItemList、专属 legend、无通用 ICS/天气日残留与无失效锚点；36 项 ICS 正常输出，conditional make-up window 和 school-based PD 均未进入下载。正文现冻结，仅随官方日历修订更新；按要求未执行 build。updated/reviewed: 2026-08-13 |
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
