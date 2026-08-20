# MySchoolDates Content Roadmap — 4-Week Plan

> 目标：覆盖 TX / CA / FL / VA / NC 五州约 400–500 个学区，建立 School Calendar Topical Authority。
> 制定日期：2026-07-12

---

## 当前进度快照

**已完成学区（62个）**

| 州 | 已完成 | P1 完成度 | P2 完成度 |
|----|--------|-----------|-----------|
| Texas | Houston ISD, Dallas ISD, Fort Worth ISD, Austin ISD, Northside ISD, Plano ISD, Frisco ISD, Katy ISD, Round Rock ISD, Conroe ISD, Cy-Fair ISD, Fort Bend ISD | 6/6 ✓ | 5/5 ✓ |
| California | LAUSD, San Diego Unified, Long Beach Unified, Fresno Unified, Sacramento City USD, Elk Grove USD, San Francisco USD, San Jose USD, Bakersfield City SD, Pomona USD, Capistrano USD, Moreno Valley USD | 5/5 ✓ | 3/5 |
| Florida | Miami-Dade, Broward County, Orange County, Palm Beach County, Hillsborough County | 5/5 ✓ | 0/5 |
| Virginia | Fairfax County, Prince William County, Loudoun County, Virginia Beach City, Chesterfield County, Henrico County, Arlington Public Schools | 5/5 ✓ | 2/5 |
| North Carolina | Wake County, Charlotte-Mecklenburg, Guilford County, Winston-Salem/Forsyth, Cumberland County, Union County, Cabarrus County, Johnston County, Durham Public Schools, New Hanover County | 5/5 ✓ | 5/5 ✓ |
| Georgia | Gwinnett County Public Schools, Fulton County Schools, Atlanta Public Schools, Forsyth County Schools, Clayton County Public Schools | — | — |
| Maryland | Montgomery County Public Schools, Prince George's County Public Schools, Baltimore County Public Schools, Anne Arundel County Public Schools, Howard County Public School System, Baltimore City Public Schools | — | — |
| Arizona | Mesa Public Schools, Peoria Unified School District, Chandler Unified School District, Tucson Unified School District, Gilbert Public Schools, Deer Valley Unified School District, Scottsdale Unified School District, Dysart Unified School District, Tempe Union High School District | — | — |
| Colorado | Denver Public Schools, Jeffco Public Schools | — | — |

**合计：P1 已完成 27/27 ✓，P2 已完成 14/24，P3 尚未开始。**

### 追加创建记录

| 创建日期 | 州 | 学区 | 实际 Slug | 已创建学年 | 备注 |
|----------|----|------|-----------|------------|------|
| 2026-08-20 | Tennessee | Knox County Schools | `/knox-county-schools-calendar` | 2025-2026, 2026-2027 | 基于 KCS 官方网站、Calendar、Severe Weather Information、官网 SVG logo、2025–26 官方 PDF、用户提供的本地同源文件及官网 Current Year HTML 日历创建。2025–26 一页 PDF 已完成文字提取和整页高分辨率视觉核对，本地文件与官网直链逐字节一致，SHA-256 为 `446dabf0d0d09e3741d948dec5c419f0679fa859cdc150a4227b82824c9a2de5`。2026–27 官网未发布 district PDF，因此学年文件明确使用官方 Current Year HTML 文本、网页监控断言和 HTML 来源说明，并隐藏 PDF 下载模块。两学年重点保留 first / last student day 均为 half-day、全年七个 districtwide student half-days、6th / 9th grade orientation 与全体学生开学的边界、Systemwide In-Service / Administrative Day 的 staff-purpose 语义、Winter Break 后实际返校日、grading-period markers，以及 180 instructional days 实为 177 student instructional days + 3 个按每日七小时制累计日的法定口径。页面同时保留最多 8 个因恶劣天气或严重疾病暴发取消日无需补课的官方规则，并说明 KCS 争取在清晨 5 点前作出天气决定及其通知渠道。2027–28 至 2029–30 未按本次输入创建；2026–27 的官方来源为网页文本而非 PDF。创建日期：2026-08-20。 |
| 2026-08-20 | Tennessee | Metro Nashville Public Schools | `/metro-nashville-public-schools-calendar` | 2025-2026, 2026-2027 | 基于 MNPS 官方网站、District Calendar 页面、官网 SVG logo、两份 English District Calendar PDF、用户提供的本地同源文件，以及 2026–27 Arabic、Burmese、Kurdish、Somali、Spanish、Swahili 六份官方翻译日历创建。八份一页 PDF 均完成文字提取和整页高分辨率视觉核对；两份本地 English PDF 均与官网当前直链逐字节一致，2025–26 SHA-256 为 `ec7970360fdc1a55ce9b1c680f0a2053ae5719815b27a304672d64c97f2feb6b`，2026–27 为 `b15eb8b4cecdaec192080733b6392947f02975c0b78efc5eddbb75bef4960838`。页面重点保留 grades 1–12 full day / Pre-K and kindergarten half day 的开学范围，高中考试半天与 Pre-K–8 full day 的差异，面向全体学生的 semester / year-end half days，长于 district-office closure 的 Thanksgiving / Winter student breaks，quarter / report-card dates，以及 stockpiled PD / inclement-weather planning boundary。2026–27 Burmese、Somali、Swahili 版本比 English、Arabic、Kurdish、Spanish 更具体地列出 Feb. 15、May 28、June 1–4、June 7 为潜在 snow make-up dates；页面公开记录该差异但不把任何候选日期写成已确认学生上课日或导入 ICS。2027–28 至 2029–30 PDF URL 未提供，暂不创建。创建日期：2026-08-20。 |
| 2026-08-20 | Tennessee | Memphis-Shelby County Schools | `/memphis-shelby-county-schools-calendar` | 2025-2026, 2026-2027 | 基于 MSCS 官方网站、Calendar 页面、官网 PNG logo、两份 English Student Calendar PDF、用户提供的本地源文件，以及 2026–27 Spanish Student、Teacher、Attendance and Report Card Periods 配套日历创建。两份一页 English PDF 均完成嵌入文字提取和整页视觉核对；2025–26 本地文件 SHA-256 为 `73eb2196f53a1611360ff0cc2145b0563270204870c119a1cac52ca2a25b148a`，2026–27 为 `7de9f8b4d9cb2de17fcf1f6005c67e174f2a23542f9850aa372eb60557d95670`。页面重点保留 high / middle / elementary 分学段 4–7 p.m. Parent Conferences 并明确其不是自动停课日，解释 Student Calendar 与 Teacher Calendar 对 Fall Break、Thanksgiving 和 Spring Break II 的不同运营口径，使用 reporting-period 文件核对 2026–27 的 49+38+47+42=176 student days，并与 2025–26 的 87+88=175 天做有意义的年度比较。2026–27 English / Spanish Student Calendar 均标注 pending Tennessee Department of Education approval，因此页面、下载和结构化数据保留 provisional 状态并启用人工复核；Spanish 文件按同一 student schedule 的官方翻译处理，不包装为替代学制。2027–28、2028–29、2029–30 PDF URL 未提供，暂不创建。创建日期：2026-08-20。 |
| 2026-08-20 | Oklahoma | Moore Public Schools | `/moore-public-schools-calendar` | 2026-2027, 2027-2028 | 基于 MPS 官方网站、Calendar、Winter Weather Information、Our Schools & School Hours、官网 PNG logo、两份 BOE-approved District Calendar PDF 及用户提供的本地同源文件创建。两份一页 PDF 均完成嵌入文字提取和整页高分辨率视觉核对，本地文件与官网当前直链逐字节一致；2026–27 SHA-256 为 `d7e042b8fc6525b46689e3e7dc47cef65ec4cc63f7601bdedb1a44f6b448d3ee`，2027–28 为 `c49174e77b6093bef90f7249769c115ae2dcc2055314e4ec628cf83f57f5dda2`。页面重点解释 83+92=175 instructional days、4+3=7 professional days 与 PDF `Total 182` 的真实边界，保留 Parent/Teacher Conference + Fall/Spring Break 的连续学生停课窗口、Winter Break 后 Record Day 与实际返校日、未被官方展开的 TNT Day 标签、MPS 1,086 instructional hours / banked minutes 天气规则及 ParentSquare 通知路径；2026–27 另加入 live calendar 的 Oct. 13 evening / Oct. 14 morning conferences，2027–28 加入与前一学年的变化表并公开披露 October 2027 月历格将 19 误印为 29、但无事件依赖该格。2026–27 PDF 可见标题与官网均标 BOE approved 11/10/2025，嵌入式 Title metadata 仍带 Proposed，已在 review notes 披露。2025–26、2028–29、2029–30 PDF URL 未提供，暂不创建。创建日期：2026-08-20。 |
| 2026-08-18 | Oklahoma | Tulsa Public Schools | `/tulsa-public-schools-calendar` | 2026-2027 | 基于官方 TPS Calendars / live district calendar、官网 PNG logo、官方 English Printable School Calendar for Families、用户提供的本地同源 PDF、官方 Spanish family calendar 和更详细的 Teacher Calendar 创建；三份一页 PDF 均完成文字提取与整页视觉核对，本地 English PDF 与官网当前文件逐字节一致。页面重点保留 August 19 general first day 与 live calendar 单列 August 21 Pre-K opening、37/39/46/46 四季度合计 168 天、October 13 同时为 Quarter 2 reporting boundary 与 no-class conference day、Winter Break 后 January 4 professional day / January 5 return，以及按 0/1/2/3 个 weather days 将最后一天滑动为 May 25/26/27/28 的官方规则。Spanish PDF 的 spring conference event list 写为 March 19，但其自身图例与日期高亮以及 English family / teacher calendars 均指向 January 19；结构化数据采用 January 19 并启用 source conflict / manual review。2025-2026、2027-2028、2028-2029、2029-2030 PDF URL 未提供，暂不创建。创建日期：2026-08-18。 |
| 2026-08-18 | Oklahoma | Oklahoma City Public Schools | `/oklahoma-city-public-schools-calendar` | 2026-2027, 2027-2028 | 基于 OKCPS 官方 Student Calendar 页面、官网 SVG logo、2026–27 view-only Google Sheet、官方 2027–28 DRAFT PDF、2026–27 school-day / recess update、用户提供的两份本地审核文件创建。2026–27 本地浏览器导出 PDF 已完成文字提取和两页高分辨率视觉核对，校历内容集中在第一页、第二页为空白；2027–28 本地 PDF 与官网当前直链逐字节一致，SHA-256 为 `36a2321b52803152dd19fd1262ac7f9f0c9c55eda5aa1fe975f4879573619d7b`，并完成文字提取和整页高分辨率视觉核对。页面重点区分学生 No School 范围与更短的 Admin Building Closings，保留 Parent Conferences 与单独 Conference Day 的出勤边界、Professional Development / Teacher Work Day、Record Day、April Snow Day 条件性、quarter markers 和 2026–27 因 Oklahoma SB1481 增加 K–5 每日 40 分钟 recess 后的分级 bell times。2026–27 官方双语表存在 English 169 / Spanish 168 Student Days、Winter Break through Jan. 5 与 Jan. 5 Quarter 3 marker、Sep. 1 / Sep. 7 Labor Day office label 三处内部差异，页面采用英文主表、完整 No School 范围和 Sep. 7 并公开说明。2027–28 官网明确标注 pending HB3151 adjustment、文件标题仍为 DRAFT，且 English 170 / Spanish 168 Student Days，故全页标为 provisional、开启 manual review / source conflict，并从 ICS 排除 Apr. 14 Snow Day (If Available)。2025–26、2028–29、2029–30 PDF URL 未提供，暂不创建。创建日期：2026-08-18。 |
| 2026-08-18 | Nebraska | Omaha Public Schools | `/omaha-public-schools-calendar` | 2026-2027 | 基于官方 OPS Calendars & School Hours 页面、官网 PNG logo、OPS Quick Facts、官方 English District Calendar PDF、本地同源副本，以及 Spanish District、English / Spanish Early Childhood 和 Wilson Focus Elementary 扩展日历创建。英文主 PDF 与官网当前直链 SHA-256 一致，并完成文字提取和整页视觉核对；Spanish、Early Childhood 与 Wilson Focus 文件也完成文字及版面检查。页面重点保留 Aug. 19 kindergarten / middle and high school entry-level grades、Aug. 20 其余 K–12、Aug. 26 Pre-K 的三段式开学，Alternative Education 专属停课，全年四次 two-hour late start，PreACT / ACT 日按高中年级划分的出勤规则，Early Childhood 额外停课，May 14 senior last day，以及 May 26 main / Early Childhood last student day。Wilson Focus 按独立 Aug. 4–June 16 日历和 enrichment sessions 处理，不混入主 ICS。2025–26、2027–28、2028–29、2029–30 PDF URL 未提供，暂不创建。同步创建 Nebraska 州页以保持 header 州入口与覆盖州统计一致。创建日期：2026-08-18。 |
| 2026-08-18 | Kansas | Blue Valley Schools | `/blue-valley-schools-calendar` | 2026-2027, 2027-2028 | 基于官方 Blue Valley Calendar 页面、District Overview、Demographics、Family Resources / school hours、官网 SVG logo、两份 board-approved Calendar PDF、本地同源副本及 2027–28 Board approval notice 创建。两份本地 PDF 均与官网当前直链逐字节一致，并完成文字提取与整页高分辨率视觉核对。页面重点保留 grades 6 and 9 Transition Day 与次日 EC–12 / kindergarten orientation 的开学边界，K–5-only Teacher Professional Collaboration、EC–8 conference closure 与次日 EC–12 no-school 的不同范围，三级 early-release times、Blue Valley North 周二/周四比其余高中早五分钟的 block start、高中 finals、grade 12 / EC / K–11 分层结束，以及 tentative graduation dates。2026–27 PDF 的可见页面标记 Board Approved 02.10.25，但嵌入式 Title metadata 仍带 draft/revision 字样；同时 2026-11-09 在 PDF 中标为 EC–12、官网文本标为 K–12，页面已公开这一范围差异并提示 Early Childhood 家庭确认。2025–26、2028–29、2029–30 PDF URL 未提供，暂不创建。创建日期：2026-08-18。 |
| 2026-08-18 | Kansas | Shawnee Mission School District | `/shawnee-mission-school-district-calendar` | 2026-2027, 2027-2028 | 基于官方 SMSD Calendar hub、官网 PNG logo、两份 board-approved English District Calendar PDF、本地同源副本，以及两个学年的 Spanish 扩展 PDF 创建。两份英文主 PDF 均与官网当前直链逐字节一致，并完成文字提取和整页视觉核对。页面重点保留 grades 1–7 and 9 / grades 8 and 10–12 / Pre-K and kindergarten 三段式开学，grades 1–6 与 K–12 / 9–12 提前放学边界，秋季 grades 7–12 / Pre-K–6 与春季 grades 9–12 / Pre-K–8 家长会分组，172 student days 与 quarter counts，高中 finals、Pre-K / K–11 分开结束，以及五所高中和 Horizons 的 graduation dates / host sites。Spanish PDF 按同一主日历的官方翻译处理；live All Schools Events 与学校沟通保留给 building events、会议预约和后续变更。2025-2026、2028-2029、2029-2030 PDF URL 未提供，暂不创建。创建日期：2026-08-18。 |
| 2026-08-18 | Kansas | Wichita Public Schools | `/wichita-public-schools-calendar` | 2026-2027, 2027-2028 | 基于官方 WPS All Events / annual calendars page、官网 SVG logo、两份官方 English School Year Calendar PDF、本地同源副本，以及两个学年的 Spanish / Vietnamese 扩展 PDF 创建。两份主 PDF 均与官网当前直链逐字节一致，并完成文字提取和两页视觉核对。页面重点解释 Student Winter Recess 与嵌套的 administrative-office Winter Recess、districtwide Parent Teacher Conferences、No School (Conferences)、Nonteaching Duty Day、Conference Release Day、new grades 6–12 orientation、kindergarten assigned opening schedule、multilingual enrollment、high-school finals、grading-period contact days和 PDF / live calendar / employee calendar 的适用边界；语言版按同一主日历的官方翻译处理，不包装为替代学制。2025-2026、2028-2029、2029-2030 PDF URL 未提供，暂不创建。创建日期：2026-08-18。 |
| 2026-08-17 | Missouri | Parkway Schools | `/parkway-schools-calendar` | 2026-2027, 2027-2028 | 基于官方 Parkway District Calendar 页面、官网 PNG logo、两份 one-page Academic Calendar PDF、本地同源副本，以及 2026–27 Calendar of Religious Observances 扩展 PDF 创建；两份主 PDF 均与官网当前直链逐字节一致，三份 PDF 均完成文字提取和整页视觉核对。页面重点区分 districtwide PK–12 half days 与 grades 9–12 high-school finals，按学年保留 Tier 1 / 2 / 3 dismissal times；2027–28 Tier 2 从上一学年的 12:20 p.m. 调整为 12:30 p.m.。2026–27 宗教节日日历仅作为 avoid-events/testing/major-projects 的排程指引，不转换为停课事件或 ICS，并公开说明可见 2026–27 标题与嵌入式旧 25–26 PDF Title metadata 的差异；2027–28 April 24 仅保留官方通用 No School，不猜测原因。两学年均完整保留 professional-development、teacher-records、break、summer-school 与 post-year 日期范围，并把 summer-only entries 排除在家庭 ICS 外；2025–26、2028–29、2029–30 PDF URL 未提供，暂不创建。2026–27 页面于 2026-08-17 完成知识资源页审计收口：删除 generic Traditional Calendar 与重复 Other Official Calendars 展示，将宗教纪念日 PDF 合并至 Downloads，补全 Fall Break 后返校说明，前置 half-day tier 解释，并加入 Parkway Early Childhood 官方 early-release 差异说明。 |
| 2026-07-28 | Georgia | Fulton County Schools | `/fulton-county-schools-calendar` 08.02已重新审计| 2025-2026, 2026-2027, 2027-2028 | 基于官方 Fulton County Schools calendar page 与三份官方 PDF；2028-2029 PDF URL 未提供，暂不创建。 |
| 2026-07-28 | Georgia | Atlanta Public Schools | `/atlanta-public-schools-calendar` 08.02已重新审计| 2025-2026, 2026-2027, 2027-2028 | 基于官方 Atlanta Public Schools calendar page 与三份官方 Student Calendar PDF；官网 logo 未提供，主文件暂不写 logo。 |
| 2026-07-29 | Georgia | Forsyth County Schools | `/forsyth-county-schools-calendar` 08.02已重新审计| 2025-2026, 2026-2027, 2027-2028 | 基于官方 Forsyth County Schools calendar page 与三份官方 Student Calendar PDF；2028-2029 PDF URL 未提供，暂不创建。 |
| 2026-07-30 | Georgia | Clayton County Public Schools | `/clayton-county-public-schools-calendar` | 2025-2026, 2026-2027 | 基于官方 Clayton County Public Schools school-year calendars page、两份官方 PDF 和 2026-2027 本地图片副本；2027-2028 与 2028-2029 PDF URL 未提供，暂不创建。 |
| 2026-07-30 | Maryland | Baltimore County Public Schools | `/baltimore-county-school-calendar` | 2025-2026, 2026-2027 | 基于官方 BCPS calendars page、官网 logo、两份官方 Pre-Labor Day Start Calendar PDF 和本地 PDF 副本；2027-2028 与 2028-2029 PDF URL 未提供，暂不创建。 |
| 2026-07-30 | Maryland | Anne Arundel County Public Schools | `/anne-arundel-county-school-calendar` | ２０２５－２０２６, ２０２６－２０２７, ２０２７－２０２８ | 基于官方 AACPS school calendar page、官网 logo、本地 ２０２５－２０２６ PDF、官方 ２０２６－２０２７ approved PDF、２０２７－２０２８ PDF 和 Spanish 扩展日历；２０２８－２０２９ PDF URL 未提供，暂不创建。 |
| 20 twenty-six-seven-thirty | Maryland | Howard County Public School System | `/howard-county-school-calendar` |  twenty-five-twenty-six, twenty-six-twenty-seven | 基于官方 HCPSS calendar page、官网 logo、两份官方 dates-only calendar PDF 和本地 PDF 副本； twenty-seven-twenty-eight 与 twenty-eight-twenty-nine PDF URL 未提供，暂不创建。 |
| 2026-07-30 | Maryland | Baltimore City Public Schools | `/baltimore-city-public-schools-calendar` | 2025-2026, 2026-2027 | 基于官方 City Schools events page、官网 logo、两份官方 school year calendar PDF、本地 PDF 副本和 2026-2027 Spanish 扩展日历；2027-2028 与 2028-2029 PDF URL 未提供，暂不创建。 |
| 2026-07-31 | Washington | Lake Washington School District | `/lake-washington-school-district-calendar` | 2025-2026, 2026-2027, 2027-2028 | 基于官方 LWSD calendar page、官网 logo、本地 2025-2026 PDF、官方 2026-2027 final PDF、2026-2027 Spanish 扩展日历和 2027-2028 tentative PDF；2028-2029 PDF URL 未提供，暂不创建。 |
| 2026-08-01 | Arizona | Mesa Public Schools | `/mesa-public-schools-calendar` | 2026-2027, 2027-2028, 2028-2029 | 基于官方 MPS calendars page、官网 logo、2026-2027 approved calendar PDF export、2027-2028 / 2028-2029 官方 Google Sheets 日历和本地 PDF 导出；2025-2026 本地 PDF 已核对但未创建该学年页面。 |
| 2026-08-01 | Arizona | Peoria Unified School District | `/peoria-unified-school-district-calendar` | 2025-2026, 2026-2027, 2027-2028 | 基于官方 PUSD school-year calendars page、官网 logo、2025-2026 / 2026-2027 / 2027-2028 官方 PDF 和本地 PDF 副本；2026-2027 页面补充 5-day / 6-day rotation calendar 资源说明，2028-2029 PDF URL 未提供，暂不创建。 |
| 2026-08-01 | Washington | Northshore School District | `/northshore-school-district-calendar` | 2025-2026, 2026-2027 | 基于官方 NSD calendar page、官网 logo、本地 2025-2026 Family Calendar PDF、官方 2026-2027 English Family Calendar v2，以及 2026-2027 Spanish、Portuguese、Vietnamese、Russian、Arabic、Simplified Chinese、Ukrainian 扩展日历；2027-2028 与 2028-2029 PDF URL 未提供，暂不创建。 |
| 2026-08-01 | Arizona | Chandler Unified School District | `/chandler-unified-school-district-calendar` | 2026-2027, 2027-2028, 2028-2029 | 基于官方 CUSD calendar page、官网 logo、三份 approved calendar PDF 和本地 PDF 副本；2025-2026 PDF URL 未提供，暂不创建。 |
| 2026-08-01 | Arizona | Tucson Unified School District | `/tucson-unified-school-district-calendar` | 2025-2026, 2026-2027 | 基于官方 TUSD calendar page、官网 logo、两份官方 English calendar PDF 和本地 PDF 副本；2027-2028 与 2028-2029 PDF URL 未提供，暂不创建。 |
| 2026-08-02 | Arizona | Gilbert Public Schools | `/gilbert-public-schools-calendar` | 2025-2026, 2026-2027, 2027-2028, 2028-2029, 2029-2030 | 基于官方 GPS calendar page、官网 logo、五份官方 family calendar PDF 和本地 PDF 副本；页面补充 one-hour early releases、K-12 half days、K-6 conference half days、semester day counts、grading days 和 summer school windows。 |
| 2026-08-03 | Arizona | Deer Valley Unified School District | `/deer-valley-unified-school-district-calendar` | 2025-2026, 2026-2027 | 基于官方 DVUSD calendar page、官网 logo、两份官方 PreK-12 Instructional Calendar PDF 和本地 PDF 副本；页面补充 Friday 90-minute early releases、K-12 / K-8 conference half days、9-12 / K-12 semester half days、staff development no-school day、semester day counts 和 2025-2026 → 2026-2027 年度变化；2027-2028 与 2028-2029 PDF URL 未提供，暂不创建。 |
| 2026-08-03 | Arizona | Scottsdale Unified School District | `/scottsdale-unified-school-district-calendar` | 2025-2026, 2026-2027, 2027-2028 | 基于官方 SUSD district calendar page、官网 logo、三份官方 English district calendar PDF、本地 PDF 副本，以及 2026-2027 / 2027-2028 Spanish 扩展日历；页面补充按年级变化的 early release、ES/K-8 和 middle school conference early releases、high school final exam early releases、staff preparation / PD no-student days、180 instructional days 和 PDF school directory bell schedules。 |
| 2026-08-03 | Arizona | Dysart Unified School District | `/dysart-unified-school-district-calendar` | 2025-2026, 2026-2027, 2027-2028, 2028-2029, 2029-2030 | 基于官方 Dysart school-year calendars page、官网 logo、五份官方 School Calendar PDF 和本地 PDF 副本；页面补充 Monday early dismissal for teacher professional development、K-8 conference half days、high school final exam half days、K-8 quarter counts、high school semester counts、graduation day notes 和 2026-2027 preschool calendar 扩展资源。 |
| 2026-08-04 | Arizona | Tempe Union High School District | `/tempe-union-high-school-district-calendar` | 2026-2027, 2027-2028, 2028-2029 | 基于官方 TUHSD student calendars page、官网 logo、三份官方 Student Calendar PDF 和本地 PDF 副本；页面补充 9-12 high-school-only district 语境、semester exam windows、district inservice half days、quarter / semester day counts、graduation after last student day 和 elementary / middle school sibling calendar 校验提示；2025-2026 PDF URL 未提供，暂不创建。 |
| 2026-08-04 | Colorado | Denver Public Schools | `/denver-public-schools-calendar` | 2026-2027, 2027-2028, 2028-2029 | 基于官方 DPS calendars page、官网 logo、三份官方 family/student calendar PDF 和本地 PDF 副本；页面补充 K-12 与 ECE 分开开学、174.5 student/instructional days、conference/no-class days、vacation or staff-learning no-class days、observances school-open 说明和 last day half-day early release；2025-2026 PDF URL 未提供，暂不创建。 |
| 2026-08-04 | Colorado | Jeffco Public Schools | `/jeffco-public-schools-calendar` | 2025-2026, 2026-2027, 2027-2028 | 基于官方 Jeffco calendar page、官网 logo、三份官方 English family calendar PDF、本地 PDF 副本，以及 2026-2027 / 2027-2028 Spanish、Vietnamese、Russian 扩展日历；页面补充 student contact days、teacher workday counts、teacher staff development days、potential snow make-up days、modified contact-day school-level 提示、last-day 2.5-hour early dismissal 和 charter-school exception。 |
| 2026-08-05 | Colorado | Douglas County School District | `/douglas-county-school-district-re-1-calendar` | 2025-2026, 2026-2027, 2027-2028, 2028-2029, 2029-2030 | 基于官方 DCSD academic calendars page、官网 logo、五份官方 conventional/school calendar PDF 和本地 PDF 副本；页面补充 173 student days、Fall/Thanksgiving/Winter/Spring Break、New Teacher Orientation、Teacher Work Day、Professional Development、Compensation Day、District Holiday、2026-2027 起的 PLC delayed-start 标记和 south-metro Denver 家庭规划语境；未提供扩展日历 PDF，暂不创建。 |
| 2026-08-05 | Colorado | Cherry Creek School District | `/cherry-creek-school-district-calendar` | 2025-2026, 2026-2027, 2027-2028, 2028-2029 | 基于官方 CCSD calendar page、官网 logo、四份 All Schools calendar PDF 和本地 PDF 副本；页面补充 No School for Students and Staff、K-12 Non-contact、K-8 Non-contact/conferences、开学前 Teacher Work Days，以及 2026-2027 的 15 份 specialty/school calendars（含 preschool、adaptive、Challenge、innovation、pathways 和各高中）；2029-2030 PDF URL 未提供，暂不创建。 |
| 2026-08-05 | Colorado | Aurora Public Schools | `/aurora-public-schools-calendar` | 2025-2026, 2026-2027 | 基于官方 APS calendars page、官网 logo、两份官方 conventional district calendar PDF 和本地 PDF 副本；页面补充 2026-2027 的 1-12 与 Preschool-K 开学/结束日期差异、Professional Release Day、Educator Workday、Conference Exchange Day、English/Spanish 双语资源和 heritage observance 语境；2027-2028 及以后未提供可核验 PDF，暂不创建。 |
| 2026-08-06 | Colorado | Adams 12 Five Star Schools | `/adams-12-five-star-schools-calendar` | 2025-2026, 2026-2027, 2027-2028 | 基于官方 Adams 12 district calendar page、官网 logo、三份官方 English school calendar PDF 和本地 PDF 副本；页面补充 6th / 9th grade orientation、K-8 school exception、quarter endings、Staff Workdays、high school 可另选的 April / May workdays 和 subject-to-revision 校验提示；未提供扩展日历及 2028-2029 以后 PDF，暂不创建。 |
| 2026-08-06 | Colorado | St. Vrain Valley Schools | `/st-vrain-valley-schools-calendar` | 2025-2026, 2026-2027, 2027-2028 | 基于官方 SVVSD school calendar page、官网 logo、三份官方 English academic calendar PDF、本地 PDF 副本，以及 2026-2027 / 2027-2028 Spanish 扩展日历；页面补充按年级分四批开学、7 个 PLC 2.5-hour late starts、174 student contact days、quarter / semester / trimester counts、full / compensation / split workdays、Life Skills ACE completion、分校 graduation dates 和 makeup-day 规则；2028-2029 以后 PDF 未提供，暂不创建。 |
| 2026-08-06 | Colorado | Poudre School District | `/poudre-school-district-calendar` | 2025-2026, 2026-2027 | 基于官方 PSD calendars and schedules page、官网 logo、两份官方 student/district calendar PDF 和本地 PDF 副本，以及 2026-2027 Spanish / Arabic 扩展日历；页面补充 6th / 9th grade Transition Day、all-schools first day、Elementary-only no-school dates、parent-teacher conference closures、building / staff / exchange / professional learning days、PreK / Integrated Services 例外和可互换 staff-day 提示；2027-2028 以后 PDF 未提供，暂不创建。 |
| 2026-08-07 | Washington | Tacoma Public Schools | `/tacoma-public-schools-calendar` | 2025-2026, 2026-2027 | 基于官方 TPS calendar page、官网 logo、两份官方 conventional student calendar PDF 和本地 PDF 副本；页面补充分年级开学、每周三 one-hour late start、conference early release、elementary / secondary 分层停课、conditional snow make-up days，以及 2026-2027 IDEA/SAMI/SOTA、Head Start/ECEAP 和 ECSE 独立项目日历边界；2027-2028 以后 PDF 未提供，暂不创建。 |
| 2026-08-07 | Washington | Kent School District | `/kent-school-district-calendar` | 2025-2026, 2026-2027 | 基于官方 KSD Student Calendar page、官网 logo、官方 document library、两份 one-page Student Calendar PDF 和本地 PDF 副本；页面补充分开的 K-12 / kindergarten / preschool 开学、每周三全校 two-hour early release、elementary / secondary 分级 conference dismissal、ECSE no-school exceptions 与独立 last day、teacher workshop closures，以及按 April → May → June 顺序启用的 optional snow make-up days；2025-2026 官方页面另有 Persian / Punjabi / Spanish / Ukrainian / Vietnamese 文件；2026-2027 直链为临时签名 URL，页面改用稳定的官方 document library 入口；2027-2028 以后 PDF 未提供，暂不创建。 |
| 2026-08-07 | Washington | Bellevue School District | `/bellevue-school-district-calendar` | 2025-2026, 2026-2027 | 基于官方 BSD calendar page、官网 logo、两份官方 Staff & District Academic Calendar PDF 和本地 PDF 副本；页面区分 grades 1-12、Kindergarten WA Kids、kindergarten、preschool 与 Evergreen Transition Program 开学日期，补充 elementary conference early release、regular-school-day grading-period endings、staff-only Wednesday structures、带 cutoff 的 conditional emergency make-up days，以及 2025-2026 修订表中的 last-day / make-up-day 变化；官方 PDF 为静态副本，页面提示使用 live calendar subscription 获取更新；2027-2028 以后 PDF 未提供，暂不创建。 |
| 2026-08-08 | Washington | Federal Way Public Schools | `/federal-way-public-schools-calendar` | 2025-2026, 2026-2027, 2027-2028, 2028-2029 | 基于官方 FWPS calendar、early-release、district profile 页面、官网 logo、四份 English FWPS Calendar PDF 和本地 PDF 副本，以及 2026-2027 至 2028-2029 的 Dari、Korean、Pashto、Russian、Somali、Spanish、Ukrainian 扩展日历；页面补充 selected-Friday 75-minute early release、Kindergarten Connection 半天会议与 full-day transition、Scholar-Led Conference 停课、Winter Break 后 two-hour late start、Thanksgiving 前 early dismissal、seniors' last day 和 conditional snow make-up dates；2029-2030 PDF URL 未提供，暂不创建。 |
| 2026-08-08 | Washington | Edmonds School District | `/edmonds-school-district-calendar` | 2025-2026, 2026-2027 | 基于官方 ESD calendar、district profile、start and dismissal times 页面、官网 logo、两份 English Family and Community Calendar PDF 和本地 PDF 副本，以及 2026-2027 Spanish 扩展日历；页面补充分开的 grades 1-12 / Kindergarten Family Connection / kindergarten / Edmonds Preschool 开学安排、每个上课周五 75-minute early release、elementary conference half days、districtwide half days、term endings、live RSS/iCal 订阅和按 May → post-year June 顺序启用的 snow make-up dates；2027-2028 以后 PDF URL 未提供，暂不创建。 |
| 2026-08-08 | Washington | Puyallup School District | `/puyallup-school-district-calendar` | 2025-2026, 2026-2027 | 基于官方 PSD calendars and bell schedules、school bell schedules、district maps 页面、官网 SVG logo、两份修订版 English school calendar PDF 和本地 PDF 副本；页面补充分开的 grades 1-12 / kindergarten / Transition to Kindergarten 开学、每周一 one-hour late start、Puyallup Fair Day 3.25-hour early dismissal 与 no-lunch 规则、conference / grading / school-improvement 2.5-hour early dismissal、180 student attendance days、2025-2026 emergency closure 实际补课记录，以及按 in-year → post-year 顺序启用的 conditional emergency make-up dates；未提供扩展日历及 2027-2028 以后 PDF，暂不创建。 |
| 2026-08-08 | Washington | Spokane Public Schools | `/spokane-public-schools-calendar` | 2025-2026, 2026-2027, 2027-2028 | 基于官方 SPS school-year calendar、balanced calendar、first-day、late-start 和 end-of-year 页面、官网 logo、三份 English student calendar PDF 与本地 PDF；页面补充 Launch Conferences、grades 1-12 / kindergarten A-B rotation / all kindergarten / PreK / specialized preschool 分批开学、Monday one-hour late-start collaboration、PLID non-student days、elementary conferences、weather reserves、program-specific last days，以及 2026-2027 与 2027-2028 的 180-day balanced calendar 和 October / February intersessions；用户提供的 2025-2026 文件实为 Board Meeting Calendar，已改用 SPS 学校官网链接的正确学生日历，并记录 2025-2026 PDF 与后续官网公告的 preschool 结束日期差异；未提供扩展日历及 2028-2029 以后 PDF。 |
| 2026-08-08 | Oregon | Portland Public Schools | `/portland-public-schools-calendar` | 2025-2026, 2026-2027 | 基于官方 PPS calendar、weather、Dual Language 和 furlough 页面、官网 SVG logo、正确的 Oregon 2025-2026 基础日历、2026-2027 三页 District Calendar 与本地 PDF，以及 2026-2027 Pre-K、Spanish、Vietnamese、Chinese、Russian、Somali 扩展日历；页面补充分开的 main opening / comprehensive grades 7-8 and 10-11 / Kindergarten Ramp Up / all kindergarten / Pre-K & Head Start 开学、except-high-schools early release、conference-week closure、quarter grading and planning days、religious and cultural event scheduling guidance 与 conditional snow make-up days；用户提供的 2025-2026 URL 和本地 PDF 实为 Portland, Maine 日历，已排除其 island schools、PATHS、February Break 与 April Break 日期，并依据 Oregon PPS 的 2026 年 4 月最终修订写入 May 1 furlough closure、移除 early release 和 June 5 last student day；2027-2028 以后 PDF 未提供。 |
| 2026-08-09 | Oregon | Beaverton School District | `/beaverton-school-district-calendar` | 2025-2026, 2026-2027 | 基于官方 BSD district calendar、school schedules、Pre-K、inclement weather、cultural and religious observances 页面、官网 SVG logo、两份 English district calendar PDF 与本地 PDF 副本，以及 2026-2027 Spanish、Arabic、Chinese、Dari、Japanese、Korean、Pashto、Russian、Somali、Vietnamese 和 English / Spanish Pre-K 扩展日历；页面补充 174 student days 与 quarter split、可能按 grade level 调整的 first-day 边界、staff development / grading no-student days、seniors' last day、按 ODE instructional hours 触发的 June make-up week、非自动停课的 do-not-schedule observances，以及独立的 135-day / no-school-on-Fridays Pre-K & Preschool Promise calendar；2027-2028 以后 PDF 未提供。 |
| 2026-08-09 | Oregon | Salem-Keizer Public Schools | `/salem-keizer-public-schools-calendar` | 2026-2027 | 基于官方 SKPS calendar page、官网 SVG logo、English Family Key Date Calendar、本地 PDF 副本，以及 Arabic、Chuukese、Russian、Spanish、Swahili 扩展日历；页面补充分年级开学、Kindergarten Transition、连续三天秋季 student-free window、March 17–26 八个 student-free weekdays、middle-school trimester / high-school semester markers、graduation window、K–5 与 6–11 分开结束、live calendar 与 PDF 对 November 30 的措辞差异，以及未预先指定日期的 June emergency make-up rule；2025-2026 与 2027-2028 以后未提供可核验 PDF，暂不创建。 |
| 2026-08-09 | Oregon | North Clackamas School District | `/north-clackamas-school-district-calendar` | 2026-2027 | 基于官方 NCSD calendar page、官网 SVG logo、分别面向 Elementary、Middle School、High School 的三份 English Student Calendar PDF 与本地 PDF 副本，以及三个学段各自的 Spanish、Russian、Vietnamese、Simplified Chinese 扩展日历；页面补充分年级开学、Elementary / Middle / High 不同 last day 与 emergency make-up window、Elementary-only workday closures、Middle School 的 31 个 L1/L2 late-start Wednesdays、High School finals period sequence、不同 Winter Break return date，以及官网摘要把 Elementary last day 年份写成 2026 而 PDF 写作 2027 的来源差异；用户提供的本地 2025-2026 文件实为 Classified Paraeducator staff calendar，且官网未提供 2025-2026 student PDF URL，因此未创建该学年学生页；2027-2028 以后 PDF 未提供。 |
| 2026-08-09 | Utah | Alpine School District | `/alpine-school-district-calendar` | 2025-2026, 2026-2027 | 基于官方 ASD District Calendars 页面、官网 logo、2026-2027 board-approved A/B Academic Calendar PDF、本地 2025-2026 与 2026-2027 官方 PDF 副本、live A/B Calendar 和官方学区拆分说明；页面补充逐日 A/B 轮换、K / PreK assessment opening、Minimal Day 与 no-PreK 边界、break 后相邻 staff days、PreK 独立 last day，以及 Alpine 于 2027-06-30 结束运营并由 Aspen Peaks、Lake Mountain、Timpanogos 三个学区接续的说明；2025-2026 官网未提供稳定官方 PDF URL，页面不输出虚构下载链接；官网的 2027-2028 至 2029-2030 文件仅为 recommendations，不作为 adopted student calendars 创建。 |
| 2026-08-10 | Utah | Davis School District | `/davis-school-district-calendar` | 2025-2026, 2026-2027 | 基于官方 DSD School Year Calendars 页面、官网 logo、2025-2026 adjusted calendar PDF、2026-2027 approved calendar PDF、本地 PDF 副本及官方审批/修订公告；页面区分 secondary A/B rotation、junior high / high school Wednesday late starts、elementary Friday early dismissals、分学段家长会规则、2025-2026 kindergarten testing 与可选测试窗口、174 student days 和 term / semester day counts，并保留 2026-2027 February 12 conditional weather make-up day、May new-IRP conference exception 与 May 25-28 graduation window；未提供扩展日历及 2027-2028 至 2029-2030 官方 PDF URL，暂不创建。 |
| 2026-08-10 | Utah | Granite School District | `/granite-school-district-calendar` | 2026-2027, 2027-2028 | 基于官方 GSD calendar 页面、官网 SVG logo、2026-2027 updated approved calendar、2027-2028 board-approved calendar、本地 PDF 副本，以及 2026-2027 A/B Calendar 与 2027 Graduation Dates 官方资源；页面补充 senior high / junior high / elementary SEP 分层家长会、会后 compensatory no-school days、176 / 179 student days 和逐 term 天数、break 后相邻 teacher contract days、2026-2027 kindergarten testing / early-out 开学序列，并披露 approved PDF 与 live calendar 对 routine Friday junior-high early out 的表述差异；用户提供的 2025-2026 文件实为 199-day counselor employee calendar，未作为学生日历创建；2027-2028 未提供 A/B 扩展日历，2028-2029 以后 PDF 未提供。 |
| 2026-08-10 | Utah | Jordan School District | `/jordan-school-district-calendar` | 2025-2026, 2026-2027 | 基于官方 Planning & Enrollment calendar 页面、官方三页 all-level PDF、分学段 family calendar、A/B 资源、本地 PDF 副本及用户提供的第三方单页辅助文件；页面保留 high school / seventh-grade orientation 与 elementary / grades 8-9 分批开学、seventh grade 提前结束、分学段 conference / compensation / professional-day 切换、elementary recurring early out、high-school A/B 与年级化 testing 规则、180 天汇总及 conditional emergency make-up date；2025-2026 以找回的官方三页文件为主源，第三方文件仅承载 early-out 辅助说明；2026-2027 对 Winter Recess 年份笔误及 Q2/Q3 天数互换做可见来源说明，不擅自选择冲突数字；2027-2028 官方源存在但本轮未创建。 |
| 2026-08-10 | Utah | Canyons School District | `/canyons-school-district-calendar` | 2025-2026, 2026-2027, 2027-2028, 2028-2029 | 基于官方 School Calendars 页面、官网 logo、四份 K-12 PDF、本地 PDF 副本、三份 Brighton High School trimester calendar 及 2026-2027 English / Spanish 扩展资源；页面补充分开的 6th / 9th grade half-day orientation、grades 1-12 与 kindergarten 开学、每个 instructional Friday early out、secondary red A / black B rotation、elementary / middle / high school 分层 conference dates、PTC compensation / grading / professional days、remote-learning emergency make-up 规则，并把 Brighton 从 K-12 quarter track 中独立分流；用户标为 Portuguese 的 URL 实际与 English PDF 相同，未错误发布为葡萄牙语版本；Spanish PDF 将 Spring Break 误译为 Fall Break，页面遵循 English 主历并披露；2028-2029 PDF 将 January 22 标为 MLK recess，页面保留官方停课日期并设置复核提示；2029-2030 URL 未提供。 |
| 2026-08-10 | Utah | Weber School District | `/weber-school-district-calendar` | 2025-2026, 2026-2027 | 基于官方 WSD calendar document library、官网 logo、两份官方 one-page vertical calendar PDF 及本地 PDF 副本；页面补充 secondary A/B rotation、每周三 elementary / secondary 不同的 early-out 时间、开学首周全周 early out、分学段 parent-teacher conferences、compensation / professional-development no-student days、High School ACT day、Elementary Iron Kid / Math Science or STEM Olympiad，以及四个 quarter 合计 180 天；2026-2027 secondary Wednesday dismissal 从 1:20 调整为 1:15；该年 PDF 图例把 federal holiday 写成 February 16，但网格把 February 15 标为停课、February 16 标为 B day / mid-term，页面采用内部一致的网格日期并公开保留冲突；2027-2028 至 2029-2030 PDF URL 未提供。 |
| 2026-08-11 | New Mexico | Albuquerque Public Schools | `/albuquerque-public-schools-calendar` | 2026-2027 | 基于官方 APS School Calendars and Grading Periods 页面、官网 logo、2026-2027 English printable calendar、本地 PDF 副本，以及 Spanish、Arabic、Simplified Chinese、Dari、Farsi、Swahili、Vietnamese 扩展日历；页面补充分开的 grades 1-12 / Pre-K and kindergarten 开学日期、K-12 conference / virtual learning days、quarter / trimester 双 grading cycle、College & Career High School 的 CNM calendar 例外、school-specific bell schedules 和 142 schools / 1,200 square miles 的本地服务语境；2025-2026 与 2027-2028 以后 PDF URL 未提供，暂不创建。 |
| 2026-08-11 | New Mexico | Las Cruces Public Schools | `/las-cruces-public-schools-calendar` | 2026-2027, 2027-2028 | 基于官方 LCPS Calendars, Handbooks & School Hours 页面、官网 logo、两份 English Instructional Calendar PDF、本地 PDF 副本、两份 Spanish 主日历，以及 2026-2027 Arrowhead Park ECHS 与 Early Childhood 英西双语扩展日历；页面补充 K / 6 / 9 transition day 与其他年级分批开学和结束、183 student / 190 teacher days、Educator Planning remote learning activities、明确停课的 conference / Next Step Planning dates、in-session Cultural Awareness Week、六校 graduation times 和 NMSU early-college / Head Start / NM PreK 日历边界；2027-2028 PDF 将 Memorial Day 标为 May 22，但 OPM 的 2028 联邦节日日历为 May 29，页面公开披露且未把该学年结束后的标签写成学生停课事件；2025-2026 与 2028-2029 以后 PDF URL 未提供，暂不创建。 |
| 2026-08-11 | Idaho | Boise School District | `/boise-school-district-calendar` | 2025-2026, 2026-2027 | 基于官方 Boise School District Calendars 页面、官网 logo、两份 Board-approved Student Calendar PDF、本地 PDF 副本及 2026-2027 School Year Information 页面；页面补充 K-12 首日/末日 early release、Pre-K / ECSE 延后开学与提前结束、seniors' last day、Pre-K / K-6 / junior high / high school 分层 conference schedule、standard / late-start elementary 与 secondary early-release times、42/43/47/44 共 176 instructional days、两段各 18 天 Secondary Summer School 和六所高中 graduation TBD 边界；官网 late-start 文字称 ten schools 但列出 11 个名称，页面按名称而非冲突数量呈现；2026-2027 PDF 的第三 reporting period 从无学生上课的 January 4 起算，页面保留 47 天官方总数并公开说明 January 5 才复课；2027-2028 以后 PDF URL 未提供，暂不创建。 |
| 2026-08-12 | Minnesota | Minneapolis Public Schools | `/minneapolis-public-schools-calendar` | 2025-2026, 2026-2027, 2027-2028 | 基于官方 MPS Calendars and School Bell Times 页面、官网 SVG logo、三份 English Student School Year Calendar 官方原始 PDF、本地 PDF 副本，以及 2026-2027 / 2027-2028 Spanish、Somali、Hmong 扩展日历；页面补充 grades 1-12 与 Pre-K / kindergarten 错峰开学、grades 10-12 因 freshman orientation 需确认 late-start time、168 instructional days、Family-Teacher Conference 接 MEA Break 的三天连续停课、record-keeping / professional-development student-free dates、Rosh Hashanah / Yom Kippur / Eid al-Fitr / Eid al-Adha 按学年变化的宗教节日停课、校级 7:30–9:25 多档 bell times、50 community schools / 13 magnet schools 与 100+ family languages 语境；2025-2026 本地文件为带 MPS 品牌、官网与联络信息的官方原始 PDF，但未提供稳定官方 PDF URL，因此页面引用官方 archive hub 且不输出第三方或虚构下载链接；2028-2029 以后 PDF URL 未提供，暂不创建。 |
| 2026-08-12 | Minnesota | Osseo Area Schools | `/osseo-area-schools-calendar` | 2025-2026, 2026-2027, 2027-2028 | 基于官方 Osseo Area Schools Calendars、district pathways、2026-2027 attendance boundaries 与 language services 页面、官网 logo、三份 grades K-12 English Calendar PDF 及本地 PDF 副本，以及 2026-2027 Hmong、Oromo、Russian、Spanish、Somali、Ukrainian、Vietnamese 扩展日历；页面补充三个 trimester 的 58/58/56 共 172 student contact days、conference release / mark reporting / licensed staff workshop 三类 no-student dates、仍需完成学习任务的 planned asynchronous remote days、Winter Break 与实际复课日边界、high-school commencement、elementary six-day PE / Music specialist rotation、新 elementary / middle attendance boundaries，以及 District 279 服务 Maple Grove、Osseo、Brooklyn Park、Brooklyn Center 和 100+ languages and cultures 的语境；2027-2028 官网尚未发布翻译版，2028-2029 以后 PDF URL 未提供。 |
| 2026-08-12 | Minnesota | Saint Paul Public Schools | `/saint-paul-public-schools-calendar` | 2026-2027, 2027-2028 | 基于官方 SPPS Calendars 页面、About SPPS 页面、官网 SVG logo、两份 English School Year Calendar 官方 PDF、本地 PDF 同源副本，以及两个学年的 Hmong、Karen、Somali、Spanish 扩展日历；页面补充 grades 1-12 与 Pre-K / kindergarten / ECSE 错峰开学、Welcome Meetings、PreK-5-only 与 PreK-12 停课图例、PreK-8 学校内 grades 6-8 仍上课的边界、四个 quarter、分学段 conference / professional-development / grading 安排、69 schools / 33,260 students / 115+ languages 的本地语境，并公开说明 2026-2027 最新 English PDF 与部分较早翻译版对学生学年结束后 Juneteenth 办公室关闭日期的差异；2025-2026 与 2028-2029 以后 PDF URL 未提供，暂不创建。 |
| 2026-08-12 | Minnesota | Rosemount-Apple Valley-Eagan Public Schools (District 196 | `/rosemount-apple-valley-eagan-public-schools-calendar` | 2026-2027, 2027-2028 | 基于官方 District 196 academic calendar、About 页面、官网 logo、两份 approved English District Calendar PDF、本地同源副本，以及 2026-2027 Spanish、Somali 扩展日历；页面补充全体学生统一开学后紧接 Friday/Monday Labor Day 停课、K-12 / K-8 / 9-12 三种停课范围、conference Thursday 与 districtwide planning Friday、general trimester 与 Eastview High School four-quarter 双 grading track、READ Act 培训提前完成带来的三个额外学生日、110 square miles / 29,000 students / Triple-A 语境，以及 Somali PDF 的 11/20 trimester 起始日与 January 22 年级范围差异；2025-2026、2028-2029 以后 PDF 及 2027-2028 翻译版未提供，暂不创建。 |
| 2026-08-12 | Minnesota | Minnesota State School Calendar Page | `/minnesota` | 2026-2027 | 基于 Minnesota Statutes §§120A.35、120A.40、120A.41、120A.414、Minnesota Department of Education 2025 Legislative Session Update，以及已核验的 Anoka-Hennepin、Minneapolis、Osseo、Saint Paul、District 196 五个学区日历；页面补充 2026-2027 / 2027-2028 临时 September 1 开学权限与常设 Labor Day 规则的边界、grades 1-11 至少 165 instructional days、分学段 instructional-hour 要求、最多五个 inclement-weather e-learning days、宗教和 American Indian cultural observance accommodation、五学区错峰开学与结束日期对照、统一 MEA Break 但 Winter / Spring Break 分流，以及 central-city / northwest / south-metro 三个导航集群。 |
| 2026-08-13 | Wisconsin | Milwaukee Public Schools | `/milwaukee-public-schools-calendar` | 2026-2027, 2027-2028 | 基于官方 MPS District Calendar、About 页面、官网 SVG logo、两份九页 all-languages Districtwide Calendar PDF 与本地同源副本；页面补充 176 student / 191 staff days、English / Arabic / Spanish / Hmong / Karen / Burmese / Rohingya / Somali / Swahili 合订语言结构、五色 staff/student attendance 规则、Parent-Teacher Conference Day 连 staff 也不 report 的边界、Summer Academy 与 Camp / CLC / Safe Places 七月运营、individual-school extra non-attendance days，以及不自动导入的 conditional emergency makeup days；公开记录 2026-2027 网页 revision label 与 PDF footer 的版本元数据差异，以及 2027-2028 Hmong 页 April 10 网格漏印首位数字但不影响任何标记停课日；2025-2026、2028-2029 和 2029-2030 PDF URL 未提供，暂不创建。 |
| 2026-08-13 | Wisconsin | Madison Metropolitan School District | `/madison-metropolitan-school-district-calendar` | 2025-2026, 2026-2027 | 基于官方 MMSD Calendars、两份 School Year Calendar 月度网页、Religious Holiday Calendar、Why MMSD、Start and Dismissal Times 页面、官网 SVG logo，以及两份官网网页本地打印 PDF；页面补充 4K / kindergarten / grades 6 and 9 / Early Childhood 与全体学生分两天开学、仅 elementary / middle school 适用的 Monday early release、elementary / middle / high school 分层 conference 与 professional-learning closures、四 quarter / 两 semester、2025-2026 ACT / PreACT 到校测试与其他高中年级 asynchronous / virtual learning、分校 graduation dates、独立 Summer Semester、宗教节日属于避免安排重大活动而非自动停课，以及 snow days 用尽后 Staff Only Day 可能转为上课日；用户提供的两个 PDFURL 实为官方网页，两个本地 PDF 为浏览器打印件（2025-2026 另含空白第二页），因此页面以官网年度网页为 canonical source，不输出虚构 PDF 下载按钮；2027-2028 以后 URL 未提供。 |
| 2026-08-13 | Wisconsin | Racine Unified School District | `/racine-unified-school-district-calendar` | 2025-2026, 2026-2027 | 基于官方 RUSD District Calendar、2026-27 calendar transition、Start/End Times、4K and Early Learning、school directory 页面、官网 logo、两份 English School Year Calendar PDF 与本地同源副本，以及 2026-2027 Spanish、English / Spanish Early Learning 扩展日历；页面补充 5K family orientation → A-L → M-Z → all-student 四步错峰开学、K-5-only 与 K-12 停课图例、grade 11 ACT 到校而 K-10 / grade 12 停课、四 quarter / 两 semester、asterisk weather-contingency dates、2026-2027 新增 25 个 one-hour early-release Wednesdays、regular days 加 6 分钟、busing / K-5 Extended Learning / middle-school study-hall 衔接，以及 3K / 4K / PCOC / Early Childhood / BEE Center 独立日历与 Goodland Montessori 反向使用 K-12 日历的例外；2027-2028 以后 PDF URL 未提供，暂不创建。 |
| 2026-08-13 | Wisconsin | Kenosha Unified School District | `/kenosha-unified-school-district-calendar` | 2026-2027, 2027-2028 | 基于官方 KUSD Calendar hub、两个 Instructional Calendar 年度页面、District / School Options / Hours of the School Day / School Closing Procedures 页面、官网 PNG logo，以及每学年 boundary elementary、boundary middle、boundary high、Frank alternate 四份英文 PDF；八份一页 PDF 均已下载、文字提取并完整渲染核对，页面明确不把任一学段 PDF 冒充全区主 PDF，并补充 September 1 boundary K-12 / September 8 boundary 4K 与 Frank August 3 K-5 / August 10 4K 错峰开学、elementary / Frank 每周 Friday early release、LakeView K-8 / Ruth Harman 改随 middle-school conference、分学段 conference / finals / ACT / PreACT 出勤差异、Frank Enrichment Weeks 与专属 closures、graduating-senior last day、KUSD 天气延迟对 early childhood / 4K 的影响，以及 Kenosha / Pleasant Prairie / Somers 服务范围；2026-2027 同时收录四份 Spanish PDF 与 English / Spanish Assessment Calendar，2027-2028 官网当前仅发布四份 English PDF，且 ACT / PreACT 日期仍为 TBD，未虚构具体日期；2025-2026、2028-2029、2029-2030 官方日历未提供，暂不创建。 |
| 2026-08-13 | Michigan | Detroit Public Schools Community District | `/detroit-public-schools-community-district-calendar` | 2026-2027 | 基于官方 DPSCD Calendar hub、About DPSCD、School Directory、官网 PNG logo、2026-2027 English Family-Friendly Academic Calendar 官方 PDF 及本地同源副本，以及 Arabic、Bengali、French、Pashto、Spanish 扩展日历；官方直链下载与本地 English PDF 的 SHA-256 完全一致，并已完成一页 PDF 的文字提取与完整渲染核对；页面补充 August 24 first day / June 7 last day、District In-Person PD 学生停课与 gray school-based PD 非自动停课的区别、grades 9-12 / K-8 分开的 fall / spring conferences、schools closed but District open 与 District Recognized Holiday 的运营差异、四 quarter / report-card markers、June 9-17 仅在 emergency closure 或 districtwide PD staff attendance 不足时启用的 conditional make-up window，以及 Detroit citywide enrollment pathways；用户提供的 2025-2026 本地 PDF 由 MichiganSchools.us 于 2026 年重新生成，带第三方品牌、QR code 与版权，当前官网也未发布该学年 family PDF，因此未将其作为官方来源或创建 2025-2026 页面；2027-2028 以后 PDF URL 未提供。 |
| 2026-08-14 | Michigan | Dearborn Public Schools | `/dearborn-public-schools-calendar` | 2026-2027 | 基于官方 Dearborn Schools Calendar hub、District Profile、School Start and End Times、First Bell calendar announcement、官网 PNG logo、2026-2027 English calendar graphic、本地官方原始 PDF 副本，以及 Arabic graphic、English / Arabic text、Open Houses and Parent-Teacher Conferences、Young 5s and Kindergarten Soft Start 扩展资源；本地一页 PDF 已完成文字提取和完整渲染核对，SHA-256 为 `1189a35c7c022e1ace79fc698210fd0b594f611c119773c08ea85d9de3bdc1ad`，但 Google Drive 远端文件未成功取得可比 hash，未声称远端 hash 一致；页面补充 August 24 全体 half day 与 Young 5s / kindergarten 连续四个 half-day soft start、31 个 September-May Tuesday 90-minute early dismissals 及分学段 / 例外项目 bell times、October 23 / January 5 分学段 shortened-day 规则、四个 card-marking periods、conference 非自动停课边界、March / May Eid closures、lunar timing 可能触发 March 9 或 12 额外停课并把 June 10 tentative last day 延至 June 11 的 contingency，以及 37 schools / 36 buildings、约 45% English learners、Henry Ford College early-middle-college 语境；官方公告称 2026-2027 calendar 为 tentative，已设置更新复核提示；2025-2026 与 2027-2028 以后 PDF URL 未提供，暂不创建。 |
| 2026-08-14 | Michigan | Utica Community Schools | `/utica-community-schools-calendar` | 2025-2026, 2026-2027, 2027-2028 | 基于官方 UCS Calendar and School Hours、K-12 Grade Configurations、Schools of Choice、School Reports、Advanced Coursework / Specialty Programs 页面、官网 SVG logo，以及三份官方 one-page District Calendar Overview PDF 与本地同源副本；三份本地 PDF 均与官方直链逐字节一致并完成文字提取和整页渲染核对；页面补充全体 K-12 同日开学但仅 elementary 首日 half day、early / late elementary 与 junior high / senior high / ALC / center programs 不同半日时间、elementary / secondary / all-student 三种 half-day 范围、分层 parent-teacher conference 与 secondary exam sequence、Teacher Full Day DPPD 学生停课、只收录 PDF 明示的 marking-period endings，以及 2027-2028 正逢全区从混合 K-6 / 7-9 / 10-12 与 K-6 / 7-8 / 9-12 模式统一切换至 K-5 / 6-8 / 9-12 的日历解释边界；2028-2029 与 2029-2030 PDF URL 未提供，暂不创建。 |
| 2026-08-14 | Michigan | Plymouth-Canton Community Schools | `/plymouth-canton-community-schools-calendar` | 2025-2026, 2026-2027 | 基于官方 P-CCS District Calendar、About、Schools、Pupil Accounting and Enrollment、P-CEP、Starkweather、Wayne County Five-Year Common Calendar 页面、官网 PNG logo、两份官方 one-page family calendar PDF、2026-2027 accessible calendar 与 live Google Calendar subscription；两份官方 PDF 均已下载、文字提取和整页渲染核对，2026-2027 本地文件与官方直链逐字节一致，2025-2026 则从 P-CCS Finalsite 资源中找回官方 PDF；页面补充全体 K-12 首日 half day 后 kindergarten 连续两个额外 half days、K-5 / grades 6-8 / grades 9-12 / all K-12 四种 shortened-day 范围、elementary / middle / P-CEP half-day / P-CEP exam-day / Starkweather 五种放学时间、November K-5 conferences、P-CEP finals 与 April state-testing 非自动 half-day 边界，以及 Michigan 唯一 educational park 在 305 acres 内共享 Canton / Plymouth / Salem 三所高中和约 6,200 名学生、随机 home-school assignment、Starkweather 独立 quarterly calendar、Wayne County 33-district common calendar 的本地语境；用户提供的 2025-2026 PDF URL 及本地两页文件由 MichiganSchools.us 于 2026 年独立生成，带第三方作者、版权、二维码和品牌，未作为官方来源或下载链接；2027-2028 以后只有 county common-calendar 局部日期而无完整 P-CCS family PDF，暂不创建。 |
| 2026-08-14 | Michigan | Ann Arbor Public Schools | `/ann-arbor-public-schools-calendar` | 2025-2026, 2026-2027 | 基于官方 AAPS Calendars、Bell Schedules、两学年 calendar announcement、Current Initiatives、Preschools、A2Virtual 页面、官网 PNG logo，以及两份官方 one-page School Year Calendar PDF 与本地同源副本；两份本地 PDF 均与官方直链逐字节一致并完成文字提取和整页渲染核对；页面补充 Community / Huron / Pioneer semester exams 与 Pathways / Skyline trimester exams 双轨结构、elementary / K-8 / middle / high school 分层 report-writing half days、5th / 8th grade transition day 与不同学段 half day 的配对、first-day / report-writing 与 last-day 两套 release times、2025-2026 恢复 three-tier bus schedule 导致 elementary bell time 平移五分钟、PSAT / SAT / Work Readiness 分年级 late starts、preschool / A2Virtual 独立日历边界，以及 2026-2027 Arabic、Chinese、Dari、Japanese、Korean、Spanish 六种翻译 PDF；公开披露 2026-2027 PDF 正文和月历及官方 text page 均列 April 14 SAT / PSAT，但底部 exam table 列 April 16 的内部冲突，页面采用三处一致的 April 14 同时要求家庭确认；2027-2028 以后 PDF URL 未提供，暂不创建。 |
| 2026-08-14 | Ohio | Columbus City Schools | `/columbus-city-schools-calendar` | 2026-2027, 2027-2028 | 基于官方 CCS Calendars、Our District、School Start Times、Early Childhood Education、Woodcrest Calendar 页面、官网 PNG logo、两份 Traditional School Year Calendar PDF、两份 Woodcrest Year-Round Calendar PDF，以及 2026-2027 Traditional Pre-K / Woodcrest Pre-K PDF；用户提供的两份本地传统日历均与官网直链逐字节一致，六份官方 PDF 均完成文字提取与整页渲染核对；页面补充 grades 1-12 / kindergarten / Pre-K 三段传统开学、Woodcrest grades 1-5 / kindergarten and Pre-K 七月错峰开学、五日 Wellness Week、30-minute early dismissal 对 Pre-K 实为停课的边界、professional-development / records closures、Woodcrest fall / January / spring intersessions、Pre-K orientation 与 F.A.C.E. / family engagement 独立资源，以及约 45,000 students / 110 schools / 95 family languages / 104 countries 的 Columbus 语境；公开披露 2026-2027 官网摘要把 August 20 写成 K-12 first day、Quarter 2 end 写成 January 12，但链接 PDF 明确为 grades 1-12、kindergarten August 25 和 January 14，年度页采用 PDF 并保留人工复核标记；2027-2028 官网尚未发布 Pre-K 专属 PDF，未虚构下载链接，2025-2026 与 2028-2029 以后 PDF URL 未提供。 |
| 2026-08-15 | Ohio | Cincinnati Public Schools | `/cincinnati-public-schools-calendar` | 2025-2026, 2026-2027, 2027-2028 | 基于官方 CPS Calendar、Find a School、Enrollment、Elementary / Magnet Schools、CPS History 页面、官网 PNG logo、三份 English 12-Month Calendar PDF、本地同源副本，以及 2026-2027 / 2027-2028 Spanish、French、Arabic 扩展日历；三份本地 English PDF 均与官网直链逐字节一致，九份 PDF 共 18 页均完成文字提取或整页渲染核对；页面补充 school-only closure 与 all-CPS / central-office closure 的运营差异、Teacher Conference Exchange Days、midterm week 与 quarter end 非停课边界、June 1-30 Summer School 与常规学生学年的分离、约 33,000 students / 66 schools / 91 square miles、1829 建区历史、neighborhood / magnet school choice 和四语言资源；公开披露 2026-2027 English PDF 于 2026-07-16 更新为 170 student days、5 个 CFT/CAAS furlough days 和 May 25 last student day，而 3 月创建的三份翻译版仍为 171 days / May 26；另披露 2027-2028 English December 网格重复 15 并漏印 17、Arabic May 25 把 last teacher day 误标为 last student day，结构化日期采用 English details page 与多语言交叉一致结果；2028-2029 与 2029-2030 PDF URL 未提供，暂不创建。 |
| 2026-08-15 | Ohio | Cleveland Metropolitan School District | `/cleveland-metropolitan-school-district-calendar` | 2026-2027 | 基于官方 CMSD District Calendar、Back-to-School 2026、Fast Facts、Weather FAQs 页面、官网 SVG logo、12 页 2026-2027 Calendar PDF、本地同源副本，以及 2026-2027 School Start-End Times PDF；本地 PDF 与官网当前直链逐字节一致并完成文字提取和 12 页整页渲染核对；页面补充 DEC / School of One 205-day extended-year August 10 开学与 June 16 结束、traditional grades 1-12 / kindergarten / Pre-K 分批开学、Pre-K phase-in、kindergarten / Pre-K-only PD closures、full-day versus early-dismissal conferences、schools closed / facilities open 与 facilities closed 的运营边界，以及四 marking periods；公开披露官网将下载标为 Approved Calendar，但 PDF 保留 DRAFT 水印、首尾页分别列 174 / 176 student working days，且 live calendar 与 Back-to-School 页面对 August 24 适用年级存在冲突；页面采用可交叉验证的 grades 1-12 开学日期，不展示冲突学生天数并保留人工复核；2025-2026 与 2027-2028 以后 PDF URL 未提供，暂不创建。2026-08-15 内容审计整改后达到 9.9+ 最终发布/冻结级：删除错误的 180-day 输出、Invalid Date、Year-Round 误称、Quick Facts、Year Numbers、Living/About/Profile、重复开学/来源模块及 Special Education Child Count Day；页面收敛为单一 Key Dates、`Which CMSD Start Date Applies to My Child?`、带 Signal Cleveland attribution 的年度变化、完整日期、学段专属停课、Multi-Day School Breaks、PDF/精选 ICS、School Times、3 条 Planning Notes、8 条 FAQ 和三层 source-conflict 证据链。最终收口将 Independence Day、两段 staff PD 与 Juneteenth 四个低家长行动价值事件保留在底层数据并从 All Dates 隐藏，跳转导航改为 Start Dates，拆分斜杠合并事件标题并将次要事实移入说明，School Times 改为面向家长的行动文案；Fast Facts 可见来源已删除，Related Calendars 已简化，Article/FAQPage/Dataset Schema 保持关闭。localhost SSR 与 ICS 均返回 200；4 个事件未出现在可见正文，8 条 FAQ、10 个主导航锚点及 22 项 traditional-only ICS 均通过验证，ICS 未混入 DEC/SO1、Pre-K phase-in、学段专属停课或上述隐藏事件；WebPage mainEntity 继续指向 `#key-dates`。正文正式冻结，仅随官方 source revision 更新；按要求未执行 build。 |
| 2026-08-15 | Ohio | Toledo Public Schools | `/toledo-public-schools-calendar` | 2025-2026, 2026-2027, 2027-2028, 2028-2029 | 基于官方 TPS Calendar、Students and Parents、Gifted / EHSO、Magnet Schools、Career Technology 页面、官网 PNG logo、四份 one-page Student Attendance Calendar PDF、本地同源副本，以及 TPS 2025 Official Statement；四份本地 PDF 均与官网直链逐字节一致并完成文字提取和整页渲染核对；页面补充 grades 1-9 / grade 10 / grades 11-12 连续三天报到、Pre-School and Kindergarten phase-in、Early High School Opportunity 独立开学、first / third quarter ending 的 K-8 two-hour delay、两日 elementary conferences 仅 K-8 学生停课、high-school exam blocks、teacher inservice / work days 与 post-year Key Day 边界、每年 174 student days 但不同 semester split，以及 21,261 K-12 students / 42 K-8 schools / 6 high schools / 6 specialized centers / 6 learning communities 和 Toledo magnet / career-tech 语境；公开披露 2025-2026 Important Dates 中 September 4 多写一个 0、June 1 缺少斜线但月历网格清楚，以及 2026-2027 PDF 可见页与官方 URL 正确但嵌入 Title metadata 误写 2028-2029；另明确 2027-2028 Spring Break 为 April 10-17 inclusive、2028-2029 Semester 1 / 2 分别 82 / 92 days，未沿用旧年分布；2029-2030 PDF URL 未提供，暂不创建。 |
| 2026-08-15 | Ohio | Akron Public Schools | `/akron-public-schools-calendar` | 2025-2026, 2026-2027 | 基于官方 APS Calendar、2025–26 School Calendar 网页、Schools / CLC、Specialty Programs、Akron Early College 页面和官方 2026–27 one-page PDF。2025–26 保留 grades 1–12、kindergarten appointment / phase-in、Pre-K / kindergarten 与 grade 12 独立日期；2026–27 同时解释 PDF 的泛化 August 27 first day 与 live calendar 的细分信息：grades 1–12 August 27、kindergarten phase-in August 27–28、Pre-K / kindergarten August 31。两学年均区分 student no-school days 与 schools-and-offices closures；2026–27 另保留四个 marking-period endings、完整 dates table、PDF/ICS 和 program-calendar coverage。2027–28 以后官方资料未提供，暂不创建。 |
| 2026-08-15 | Ohio | South-Western City School District | `/south-western-city-school-district-calendar` | 2026-2027, 2027-2028 | 2026–27 已完成去模板化审计整改并以 9.91/10 达到最终发布/冻结级：页面收敛为单一 Key Dates、K–3 姓氏分组开学表、Full Student Calendar Dates、Major School Breaks、三项 Dates That Need Extra Attention、统一 English/Spanish/ICS 下载、三条 Planning Notes、7 条消歧 FAQ、Sources 与 Other Reviewed Ohio Calendars；隐藏重复 Key Date cards、About、Year Numbers、Grade Band 独立表、Living/Profile、泛 Planning、Comparison、National Trends 与外置 Other Calendars，修复 duplicate `other-calendars` 风险。当前 Calendar Hub 的 English PDF（Drive `1pAz…`）与已视觉审核并留存 checksum 的副本（Drive `1F8z…`）已分离，下载与主 Schema 只指向当前官方文件，reviewed copy 作为独立 provenance；March 15 使用由 SWCS grade-card schedule 支持、与 2026–27 年度序列一致的审慎证据措辞。August 24 由官方 SW Insider Back-to-School FAQ 作为 district-level supporting source，Finland Elementary 作为独立校级佐证；May 4 tentative closure 与 June 1–4、7–8 conditional calamity dates 继续排除在 ICS 外。2027–28 独立终审达到 9.94/10 并进入停止优化区：保留 K–3 三组开学、April 14 官方通用 No School、malformed April grid、May 2 tentative closure 与六个 conditional calamity dates，未套用 2026–27 的全员返校推断；当前 English/Spanish 文件与 reviewed English copy 分开建模，Dataset/WebPage 直接推导来源仅保留 Calendar page 与逐项审阅副本，当前语言版本继续作为官方引用资源。两个学年均固定显示 7 条学年型 FAQ，并由学年答案优先覆盖通用 Spanish FAQ；最新复核确认 current Calendar.aspx 的 English/Spanish Drive 链接仍与页面一致。正文与主体结构正式冻结，三个非阻塞 UX/措辞选项不实施。JSON、来源归属、FAQ、排除规则与 diff 静态检查通过；`localhost:3000` 当前未运行，待重启后补记 SSR、标题层级、唯一锚点、FAQ/Schema 与 ICS 运行验证；按要求未执行 build。updated/reviewed: 2026-08-15。 |
| 2026-08-16 | Ohio | Olentangy Local School District | `/olentangy-local-school-district-calendar` | 2025-2026, 2026-2027 | 基于官方 Olentangy School Calendars、历史 Events 月历、About the Olentangy Area、Enrollment Data、Schools、History、Mission、Start and Dismissal Times 页面、官网 SVG logo、2026–27 final District Calendar、本地同源副本，以及 School Events、Kindergarten、Preschool 三份官方扩展 PDF；2026–27 本地主 PDF 与官网直链逐字节一致，四份官方一页 PDF 均完成文字提取和整页渲染核对。页面补充 K–12 August 20 开学与两个 kindergarten color cohorts、preschool Tuesday–Friday attendance、K–5-only final-day two-hour early dismissal、Conference Exchange Days 与 site-specific preschool conferences 的边界、grade-banded curriculum nights、四所高中同日分时 graduation、分层 bell times，以及 95 square miles、24,563 PS–12 students、17 elementary / 6 middle / 4 high schools 的 Central Ohio 语境。用户提供的 2025–26 本地两页文件由 OhioSchools.us 于 2026 年第三方生成，带其品牌、二维码与版权，且官网当前没有该学年官方 PDF URL，因此年度页以官方历史 Events 月历为 canonical source、隐藏 PDF 下载并排除仅第三方文件出现而无法在 districtwide historical view 验证的 August staff / open-house dates；2027–28 以后官方资料未提供，暂不创建。 |
| 2026-08-16 | Indiana | Indianapolis Public Schools | `/indianapolis-public-schools-calendar` | 2025-2026, 2026-2027 | 基于官方 IPS School Year Calendar、District Overview、Choose Your IPS、IPS Schools、Inclement Weather、Transportation 页面、官网 SVG logo、两个官方 Google Drive 年度文件夹及两份 English Student & Staff School Calendar 本地同源副本；两份 PDF 均为单页图像型日历，已完成完整渲染和逐项视觉核对，并从本地下载元数据还原官方 Drive 文件 ID 与直达链接。页面补充每年 180 student days 中包含 3 个 Student Asynchronous Learning days、192 staff days、July staff induction / districtwide and school-based PL / teacher work ramp-up、四 quarter ranges、五日 Fall Break、semester close records day、post-year staff holidays，以及 IPS 4 enrollment zones、70+ schools、8 education models、32+ high-school pathways、annual transportation opt-in 和 Innovation Network schools 可使用独立日历并自行决定 weather closures 的范围边界；2026–27 PDF 将 Quarter 1 写至 October 17、Quarter 2 从 October 20 开始但未将 October 19 标为停课，页面保留官方 quarter ranges、把 October 19 视为 Fall Break 后返校日且不虚构 closure；2027–28 以后 PDF URL 未提供，暂不创建。 |
| 2026-08-16 | Indiana | M.S.D. of Wayne Township | `/msd-of-wayne-township-calendar` | 2026-2027, 2027-2028 | 基于官方 Wayne Township Calendar 页面、官网 SVG logo、两份 English School Calendar 本地同源副本和两份官方 Spanish 扩展 PDF；两份本地英文文件均与官网当前直链逐字节一致，四份两页 PDF 共 8 页均完成文字提取和逐页视觉核对。页面补充每个上课周一的 late-start 规则、Area 31 Career Center / Little Giants Preschool / Wayne Preparatory Academy 三项例外、Wayne Township Preschool 8:20–10:50 a.m. 与 1:00–3:30 p.m. 的 Monday alternate schedule、三次 asynchronous eLearning staff-development days、Snow Day 1–2 停课 / Snow Day 3+ synchronous eLearning 的顺序，以及 Spring Recess 后仍有一天时启用 Memorial Day 前周五的 conditional snow make-up 规则；公开披露 2026–27 English PDF 将 May 4, 2027 错配为 Wednesday（Spanish edition 正确标 Tuesday），以及 2027–28 Spanish PDF 将 May 31 错写为 `31 de junio`，两页分别采用跨语言和日历日期可核验的 May 4 / May 31 数值日期并保持人工复核。2025–26 与 2028–29 以后 PDF URL 未提供，暂不创建。 |
| 2026-08-16 | Indiana | Hamilton Southeastern Schools | `/hamilton-southeastern-schools-calendar` | 2026-2027, 2027-2028, 2028-2029 | 基于官方 HSE District Calendars 页面、官网 SVG logo、三份 one-page HSE District Calendar PDF 与本地同源副本；三份本地 PDF 均与官网当前直链逐字节一致，已完成文字提取和整页视觉核对。页面按学年整理 first full day for all students、teacher orientation / in-service、first and third grading-period endings、semester endings、Fall / Thanksgiving / Winter / Spring Break、student and teacher last days，并单独解释 Fishers High School 与 Hamilton Southeastern High School 两个毕业日期；三个学年均保留官方“学校取消时使用 Virtual Learning days”的边界，不虚构预设 eLearning Flex Days 或 weather make-up dates。2026–27 与 2027–28 使用 2026-03-11 revised 版本，2028–29 使用 2026-02-11 adopted 版本；2028–29 PDF 的 `Frist Day` 明显拼写错误仅在前台更正拼写、不改变 January 4 日期。2025–26 与 2029–30 PDF URL 未提供，暂不创建。`localhost:3000` 根页面、三个显式学年页面和三份 ICS 均返回 200；Title、H1、canonical、Dataset、FAQPage 关闭状态、全部 jump anchors 与 8 条可见 FAQ 通过验证。三个 ICS 各包含 15 项家庭相关事件，并正确排除 staff-only orientation、teacher half day 与学生学年结束后的 Memorial Day。 |
| 2026-08-17 | Missouri | Kansas City Public Schools | `/kansas-city-public-schools-calendar` | 2026-2027 | 基于官方 KCPS Calendar 页面、官网 PNG logo、English School Calendar 官方 PDF、本地同源副本，以及 Spanish `Calendario Escolar`、Swahili `Kalenda ya Shule` 两份扩展日历；三份一页 PDF 均已完成文字提取和整页视觉核对，本地 English PDF 与官网直链逐字节一致。页面补充 October conference + PD 连续停课、Winter Break 后 January 4 District PD 导致 January 5 返校、February conference / PD / Presidents' Day 连续停课、Spring Break 后 Spring Holiday、April 30 seniors' last day 与 May 28 districtwide early-dismissal last student day 的边界、四 quarter ranges 和 multilingual downloads；公开披露 Spanish / Swahili June 2027 month grids 重复 June 26 / 28 并漏印 June 25 / 27，以及 Spanish `JULIIO` 拼写问题，结构化日期采用 English PDF、翻译版保留为语言资源。终审移除所有依赖模块当前位置的 `above` / `below` 文案，隐藏 district-level 说明严格区分 October 30 `PD Day` 与 February 12 `PD/Workday`；English source CreativeWork version 仅描述 English calendar，Spanish / Swahili 继续使用独立 CreativeWork；May 28 三项官方记录保持独立且删除紧邻重复说明。官方文件未声明 instructional-day total，也未给出 May 28 全区统一放学时间，页面不作推断。2025-2026 与 2027-2028 以后 PDF URL 未提供，暂不创建。updated/reviewed: 2026-08-17。 |
| 2026-08-17 | Missouri | Saint Louis Public Schools | `/st-louis-public-schools-calendar` | 2026-2027 | 基于官方 SLPS Calendar 页面、官网 PNG badge 和 district-linked one-page 2026–27 Calendar PDF；官网当前 PDF 的 SHA-256 仍为 `88c18b4934105de696670515d15ceb77f8974c9be673d348af847ef94fc98329`，已完成文字提取与来源复核。页面保留 October 14 / February 10 两次 two-hour early release、October / March parent-teacher conference windows 非自动停课、Winter Break 内 12-month employees work 与 district closed 的官方分段标签、high-school / senior finals、June 1–4 conditional snow / make-up dates及 June 7–July 2 summer school。终审确认 October 23、January 15、March 19 在 PDF 中仅标为 `Record Keeping/Wellness` 或 `Record Keeping/PD`，未另写 `No School`；页面已撤销 no-student 推断、恢复官方名称并排除家庭 ICS。独立 Winter H2 已并入 Breaks，Full Calendar 保留 source-faithful 分段行并关闭与实际分段展示冲突的 vacation-period footer，三个 PD/Recordkeeping/Wellness 日期改用官方类别 badge 且不在表内重复来源免责声明；Downloads 移至 Full Calendar 后，Quarter/Semester 与 High School 内容随后。Quarter/Semester 表仅保留 PDF 明确列出的 Quarter 1、Quarter 2 / Semester 1 和 Quarter 3 endings；January 19 Semester 2 begins、March 22 Quarter 4 begins 与 May 27 last student day 仍按官方名称留在 Full Calendar，不再把 May 27 推断为 Quarter 4 / Semester 2 ending。August 12–19 使用学年级 `preserveOfficialName`，最终可见标题保留为 `Professional Development — Details TBD`，并注明 PDF 原文 `PD (TBD`；FAQ 收敛为 5 条边界问题，Title 增加 `St. Louis, MO` 消歧，Meta 明确 official PDF 与 one-time ICS 边界。主路由与显式学年路由均返回 200；9 个 H2、30 个唯一 ID、22 个有效 hash links、Dataset 来源语义、FAQPage 关闭及 15 项家庭 ICS 均通过运行断言。本轮按要求未执行 build。2025–26 与 2027–28 以后 PDF URL 未提供，暂不创建。updated/reviewed: 2026-08-17。 |
| 2026-08-17 | Missouri | Rockwood School District | `/rockwood-school-district-calendar` | 2026-2027 | 基于官方 Rockwood District Calendar、2026–27 School Year Overview、School Calendars、Start and Dismissal Times、By The Numbers、Communities and Demographics、History、Mission / Vision / Values 页面和官网 PNG logo创建。官网未发布年度 PDF，年度页以 HTML overview 为 canonical source、隐藏 PDF 下载并提供基于官方文本的 ICS；没有把包含 Board meetings 等非出勤事项的整个 Events feed 直接冒充学生日历。页面补充 August 24 first day、May 7 senior ending、May 28 final K–11 attendance / early dismissal、elementary / middle / high 不同早放时间、八个 high-school-only 9:51 late-start Mondays、elementary 与 middle/high 分开的 third-quarter endings、Conference Compensation Days、1–4 weather closures 不改最后一天 / 5–9 AMI / 10+ 调整学年日历的三级规则，以及 18,566 students、19 elementary / 6 middle / 4 high schools、八个 western St. Louis County communities 和 1908 consolidation 的学区语境。公开披露官网把 middle/high third-quarter ending 写成 “Friday, March 11, 2027”，但该日实际为 Thursday 且下一行明确是 Friday, March 12 professional-development closure；结构化数据保留官方数字日期 March 11 并设置 manual review / source conflict。2025–26 与 2027–28 以后完整年度资料未提供，暂不创建。 |

| 2026-08-18 | Massachusetts | Springfield Public Schools | `/springfield-public-schools-ma-calendar` | 2026-2027 | 基于官方 SPS Calendar、About、Student Assignment Services、SEZP School Calendars、Innovation School Calendars、Massachusetts DESE district profile、官网 PNG logo、官方 one-page 2026–27 School Calendar PDF 及用户提供的本地审核副本；图像型 PDF 已完成整页高分辨率渲染与逐项视觉核对，本地文件 SHA-256 为 `688e5b92c48c8687e432a51a3eb50e1e816791170531a8588a65639c008bad57`。页面补充 grades 1–12 August 24 / kindergarten September 2 / Pre-K September 14 三段开学、August 24–28 kindergarten screening、yellow schools-closed 与 green schools-and-central-offices-closed 的运营差异、Presidents' Day + Mid-Winter Break 和 Patriots' Day + Spring Break 连续停课、Winter Break 后 January 6 teacher professional day 导致 January 7 返校，以及 June 25 tentative half-day ending 已含 5 snow days、完成 180 pupil school days 后由 district bulletin 确认最终日期的边界；另明确 district PDF 不替代 SEZP / Innovation / individual-school calendars，并使用 `-ma-` slug 与 Missouri、Illinois 同名学区消歧。2025–26 与 2027–28 以后 PDF URL 未提供，暂不创建。 |
| 2026-08-18 | Kansas | Olathe Public Schools | `/olathe-public-schools-calendar` | 2026-2027, 2027-2028 | 基于官方 OPS District Calendar、School and Building Directory、School Calendars、Inclement Weather 页面、官网 PNG logo、两份 English District Calendar 本地同源副本、两份官方 Spanish 扩展 PDF，以及 2026–27 Elementary Specials A/B/C/D 扩展 PDF；两份本地 English PDF 均与官网当前直链逐字节一致，五份一页 PDF 均完成文字提取和整页高分辨率视觉核对。页面补充 grades K–5 / 6 / 9 先行半日、次日全体 K–12、随后 Early Childhood 的三段开学，October / February conference window、half day、no-student conference day 与额外 no-school day的区别，Harmony / Heartland Early Childhood 与 K–12 常规和半日作息，四个 reporting periods 合计 170 days，grade 12 / Early Childhood / K–11 分层结束、高中 finals 与 commencement 边界，以及每年 March / April professional days 同时作为 possible inclement-weather dates 的条件性；2026–27 Elementary Specials 被按不受天气停课顺延影响的固定 A/B/C/D 辅助轮换处理，Spanish 文件按同一主日历的官方翻译处理。2025–26、2028–29、2029–30 PDF URL 未提供，暂不创建。创建日期：2026-08-18。 |
| 2026-08-18 | Nebraska | Lincoln Public Schools | `/lincoln-public-schools-calendar` | 2025-2026, 2026-2027, 2027-2028 | 基于官方 LPS Calendars 页面、官网 PNG logo、三份 Student Calendar Google Drive PDF、用户提供的三个本地审核副本、官方 2025–26 enrollment announcement，以及 Board of Education 的 2027–28 approval summary 创建。三份一页主 PDF 均完成文字提取、整页高分辨率渲染与逐项视觉核对，本地 SHA-256 已写入对应学年文件。页面重点保留 kindergarten / grade 6 / grade 9 先行、其余 K–12 次日加入的 transition-focused opening，quarter end / general closure / professional learning-planning / quarter start 的符号边界，宗教纪念日 excused-absence 规则，以及天气导致低于州最低学时后可增加分钟、增加天数或重启原 non-student day 的调整机制。2026–27 Middle School X/Y、Preschool、Full Day Preschool 三份扩展日历作为 program-specific companion calendars 独立收录，不混入 districtwide K–12 ICS。2027–28 Version 2.3 另保留 175 student days、189 teacher contract days、42/45/46/42 quarter totals，building / district professional learning-planning 与 compensatory day 的不同含义，以及 comprehensive high-school graduation weekend 与 program graduation TBA 的边界；PDF 嵌入式 Title 为 `LPS Teacher Calendar`，但可见标题为 `Student Calendar`，页面按可见文档内容命名并在审核说明中披露。2028–29、2029–30 PDF URL 未提供，暂不创建。创建日期：2026-08-18。 |
| 2026-08-18 | Oklahoma | Edmond Public Schools | `/edmond-public-schools-calendar` | 2026-2027 | 基于官方 EPS Calendar hub、官网 PNG logo、EPS 首页学校与学生规模信息、Boundaries、School Start/End Times、Weather & School Closure Procedures、官方三页 revised 2026–27 Instructional Calendar PDF 及用户提供的本地副本创建；本地 PDF SHA-256 为 `351bd6e533d880966abf71dfb0d8477d9f56f3e5b71668b3a0a8ca099351e7b4`，已完成嵌入文本提取和三页高分辨率视觉核对。页面补充 August 6 secondary virtual schedule release、August 11 elementary Meet the Teacher、August 13 PK–12 first day、按 elementary / middle / high school 分开的 October conference dates and times、Fall Break / conferences / staff development 混合窗口、May 14 7:30 p.m. graduation、May 19 scheduled last day 和 inclement-weather days 可能追加到学年末的条件性；另加入 24,000+ students / 31 schools、Edmond Oklahoma 与 Edmonds Washington 消歧、Norman NWS weather monitoring、remote-learning / snow-day 决策、通常不提前放学以及 tornado warning 下暂缓学生和校车离校的本地运营语境。官方 PDF 第 1 页写 January 4 / 47 third-quarter days / 172 total days，第 2 页写 January 5 / 46 days / 171 total days，且 Thanksgiving office-status 也存在视觉与文字冲突；页面已设置 manual review / source conflict，不发布确定总天数，并从 ICS 排除有争议的 January return date。2025–26 与 2027–28 以后 PDF URL 未提供，暂不创建。创建日期：2026-08-18。 |
| 2026-08-20 | Missouri | Springfield Public Schools | `/springfield-public-schools-mo-calendar` | 2025-2026, 2026-2027 | 基于官方 SPS Calendar 与 archive、Our Schools、School Start/End Times、Field Primary Years Programme 页面、官网 SVG logo、两份 one-page District Calendar PDF 本地副本，以及 2025–26 / 2026–27 Boyd、Field、Rountree PYP 官方附件入口创建；两份主 PDF 均完成文字提取和整页高分辨率视觉核对，SHA-256 分别为 `36e44780d2b1deff310f1e6b260bed5e9e5eb477183af00ea212689365fb5670` 与 `167d3020502c27069c1bb30629800641d7dbf74eab7d7ec7e4c73d641180d7f2`。页面补充两年均为 171 student days、Wonder Years / Early Childhood SPED 与主日历同日开学、Parent/Teacher Conference window 非自动停课、break 后 professional day / district closure 对实际返校日的影响、四 quarter ranges、Explore summer learning window、PYP calendar scope，以及 Tier One / Two / Three 上放学时间；Boyd、Field、Rountree 均属于 7:20 a.m.–2:20 p.m. 的 Tier One。2025–26 PDF 同时把 May 22 列为 last day 和 Quarter 4 range ending，却在另一处打印 `End 4th Quarter: May 23`；页面采用与学生日历及 quarter range 一致的 May 22，并保留 source conflict / manual review。使用 `-mo-` slug 与 Massachusetts 同名学区消歧；2027–28 以后官方资料未提供，暂不创建。创建日期：2026-08-20。 |

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
| P3 | Arlington ISD | `arlington-isd-calendar` | ✓ 已完成：`arlington-isd-calendar` |
| P3 | Lewisville ISD | `/lewisville-independent-school-district-calendar` | ✓ 已完成 |
| P3 | Garland ISD | `/garland-independent-school-district-calendar` | ✓ 已完成 |
| P3 | Pasadena ISD | `/pasadena-independent-school-district-calendar` | ✓ 已完成 |
| P3 | Aldine ISD | `/aldine-independent-school-district-calendar` | ✓ 已完成 |

> 均为 DFW 或 Houston 郊区，学生规模 50,000–65,000，适合通过 Dallas ISD / Houston ISD 页面的内链引流。

### California P3 批次1（5个）

| 优先级 | 学区 | 预计 Slug | 状态 |
|--------|------|-----------|------|
| P3 | Santa Ana USD | `/santa-ana-unified-school-district-calendar` | ✓ 已完成 |
| P3 | Riverside USD | `/riverside-unified-school-district-calendar` | ✓ 已完成 |
| P3 | Garden Grove USD | `/garden-grove-unified-school-district-calendar` | ✓ 已完成 |
| P3 | San Bernardino City USD | `/san-bernardino-city-unified-school-district-calendar` | ✓ 已完成 |
| P3 | Stockton USD | `/stockton-unified-school-district-calendar` | ✓ 已完成 |

---

## Week 4（目标：20个学区）

**重点：VA P3 批次1 + NC P3 批次1 + TX P3 批次2 + CA P3 批次2**

### Virginia P3 批次1（5个）

| 优先级 | 学区 | 预计 Slug | 状态 |
|--------|------|-----------|------|
| P3 | Newport News City Public Schools | `/newport-news-public-schools-calendar` | ✓ 已完成 |
| P3 | Hampton City Schools | `/hampton-city-schools-calendar` | ✓ 已完成 |
| P3 | Roanoke County Public Schools | `/roanoke-county-public-schools-calendar` | ✓ 已完成 |
| P3 | Williamsburg-James City County Schools | `/williamsburg-james-city-county-schools-calendar` | ✓ 已完成 |
| P3 | York County School Division | `/york-county-school-division-calendar` | ✓ 已完成 |

### North Carolina P3 批次1（5个）

| 优先级 | 学区 | 预计 Slug | 状态 |
|--------|------|-----------|------|
| P3 | Iredell-Statesville Schools | `/iredell-statesville-schools-calendar` | ✓ 已完成 |
| P3 | Brunswick County Schools | `/brunswick-county-schools-calendar` | ✓ 已完成 |
| P3 | Henderson County Public Schools | `/henderson-county-public-schools-calendar` | ✓ 已完成 |
| P3 | Catawba County Schools | `/catawba-county-schools-calendar` | ✓ 已完成 |
| P3 | Randolph County Schools | `/randolph-county-school-system-calendar` | ✓ 已完成 |

### Kentucky P3 补充（1个）

| 优先级 | 学区 | 预计 Slug | 状态 |
|--------|------|-----------|------|
| P3 | Henderson County Schools (KY | `/henderson-county-schools-ky-calendar` | ✓ 已完成 |

### Texas P3 批次2（5个）

| 优先级 | 学区 | 预计 Slug | 状态 |
|--------|------|-----------|------|
| P3 | McKinney ISD | `/mckinney-isd-calendar` | ✓ 已完成 |
| P3 | Klein ISD | `/klein-isd-calendar` | ✓ 已完成 |
| P3 | Spring ISD | `/spring-isd-calendar` | ✓ 已完成 |
| P3 | Humble ISD | `/humble-isd-calendar` | ✓ 已完成 |
| P3 | Mansfield ISD | `/mansfield-isd-calendar` | ✓ 已完成 |
| P3 | Fort Bend ISD | `/fort-bend-independent-school-district-calendar` | ✓ 已完成 |

### California P3 批次2（5个）

| 优先级 | 学区 | 预计 Slug | 状态 |
|--------|------|-----------|------|
| P3 | Bakersfield City SD | `/bakersfield-city-school-district-calendar` | ✓ 已完成 |
| P3 | Corona-Norco USD | `/corona-norco-unified-school-district-calendar` | ✓ 已完成 |
| P3 | Pomona USD | `/pomona-unified-school-district-calendar` | ✓ 已完成 |
| P3 | Capistrano USD | `/capistrano-unified-school-district-calendar` | ✓ 已完成 |
| P3 | Moreno Valley USD | `/moreno-valley-unified-school-district-calendar` | ✓ 已完成 |

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

## Top300 剩余学区周计划

基于 `/Users/doujiajun/Downloads/myschooldates_us_top_300_school_districts.md`，按当前实际存在的 `content/districts/*.json` 学区文件过滤已创建学区；不以本 roadmap 表格中的完成状态作为过滤依据。创建 Chicago Public Schools、Clark County School District、Gwinnett County Public Schools、Forsyth County Schools 和 Clayton County Public Schools 后，Top300 中剩余待创建 227 个学区。本周安排 20 个学区，后续每周安排 45 个学区，最后一周安排剩余 32 个学区。执行时仍按原 Top300 排名顺序推进，并逐一核验官方名称、日历页面、PDF/网页日历来源、当前学年和特殊日历适用范围。

### 本周（20个）

| 排名 | 州/地区 | 学区 | 主要都市圈 | 状态 |
|-----:|---------|------|------------|------|
| 1 | New York | New York City Public Schools | New York City | ✓ 已完成：`new-york-city-public-schools-calendar` |
| 4 | Illinois | Chicago Public Schools | Chicago | ✓ 已完成 |
| 5 | Nevada | Clark County School District | Las Vegas | ✓ 已完成 |
| 11 | Georgia | Gwinnett County Public Schools | Atlanta | ✓ 已完成 |
| 13 | Hawaii | Hawaii State Department of Education | Statewide | ✓ 已完成：`hawaii-state-department-of-education-calendar` |
| 15 | Maryland | Montgomery County Public Schools | Washington, D.C. metro | ✓ 已完成：`montgomery-county-school-calendar` |
| 19 | Maryland | Prince George's County Public Schools | Washington, D.C. metro | ✓ 已完成：`prince-georges-county-school-calendar` |
| 20 | Pennsylvania | School District of Philadelphia | Philadelphia | ✓ 已完成：`school-district-of-philadelphia-calendar` |
| 30 | Texas | Arlington Independent School District | Dallas-Fort Worth | ✓ 已完成：`arlington-isd-calendar` |
| 32 | Texas | North East Independent School District | San Antonio | ✓ 已完成：`north-east-isd-calendar` |
| 34 | Texas | Fort Bend Independent School District | Houston | ✓ 已完成：`fort-bend-independent-school-district-calendar` |
| 38 | Texas | Judson Independent School District | San Antonio | ✓ 已完成：`judson-isd-calendar` |
| 40 | Texas | Mesquite Independent School District | Dallas-Fort Worth | ✓ 已完成：`mesquite-isd-calendar` |
| 46 | California | Corona-Norco Unified School District | Inland Empire | ✓ 已完成：`corona-norco-unified-school-district-calendar` |
| 54 | California | Poway Unified School District | San Diego | ✓ 已完成：`poway-unified-school-district-calendar` |
| 55 | California | Sweetwater Union High School District | San Diego | ✓ 已完成：`sweetwater-union-high-school-district-calendar` |
| 57 | California | Chula Vista Elementary School District | San Diego | ✓ 已完成：`chula-vista-elementary-school-district-calendar` |
| 58 | California | Anaheim Union High School District | Orange County | ✓ 已完成：`anaheim-union-high-school-district-calendar` |
| 59 | California | San Juan Unified School District | Sacramento | ✓ 已完成：`san-juan-unified-school-district-calendar` |
| 60 | California | Fontana Unified School District | Inland Empire | ✓ 已完成：`fontana-unified-school-district-calendar` |

### 第 2 周（45个）

| 排名 | 州/地区 | 学区 | 主要都市圈 | 状态 |
|-----:|---------|------|------------|------|
| 65 | Florida | Volusia County Schools | Daytona Beach | ✓ 已完成：`volusia-county-schools-calendar` |
| 66 | Florida | Seminole County Public Schools | Orlando | ✓ 已完成：`seminole-county-school-calendar` |
| 67 | Florida | Osceola School District | Orlando | ✓ 已完成：`osceola-school-district-calendar` |
| 68 | Florida | Brevard Public Schools | Space Coast | ✓ 已完成：`brevard-public-schools-calendar` |
| 69 | Florida | Collier County Public Schools | Naples | ✓ 已完成：`collier-county-school-calendar` | 已审计完 7.27
| 70 | Florida | Sarasota County Schools | Sarasota | ✓ 已完成：`sarasota-county-school-calendar` 2026-07-28 |
| 71 | Georgia | Cobb County School District | Atlanta | ✓ 已完成：`cobb-county-school-calendar` 2026-07-28|
| 72 | Georgia | DeKalb County School District | Atlanta | ✓ 已完成：`dekalb-county-school-calendar` 2026-07-28|
| 73 | Georgia | Fulton County Schools | Atlanta | ✓ 已完成：`fulton-county-schools-calendar` 2026-07-28 |
| 74 | Georgia | Atlanta Public Schools | Atlanta | ✓ 已完成：`atlanta-public-schools-calendar`（2026-07-28） |
| 75 | Georgia | Forsyth County Schools | Atlanta | ✓ 已完成：`forsyth-county-schools-calendar`（2026-07-29） |
| 76 | Georgia | Clayton County Public Schools | Atlanta | ✓ 已完成：`clayton-county-public-schools-calendar`（2026-07-30） |
| 90 | Maryland | Baltimore County Public Schools | Baltimore | ✓ 已完成：`baltimore-county-school-calendar`（2026-07-30） |
| 91 | Maryland | Anne Arundel County Public Schools | Baltimore-Washington | ✓ 已完成：`anne-arundel-county-school-calendar`（2026-07-30） |
| 92 | Maryland | Howard County Public School System | Baltimore-Washington | ✓ 已完成：`howard-county-school-calendar`（2026-07-30） |
| 93 | Maryland | Baltimore City Public Schools | Baltimore | ✓ 已完成：`baltimore-city-public-schools-calendar`（2026-07-30） |
| 94 | Massachusetts | Boston Public Schools | Boston | ✓ 已完成：`boston-public-schools-calendar`（2026-07-31） |
| 95 | Washington | Seattle Public Schools | Seattle | ✓ 已完成：`seattle-public-schools-calendar`（2026-07-31） |
| 96 | Washington | Lake Washington School District | Seattle | ✓ 已完成：`lake-washington-school-district-calendar`（2026-07-31） |
| 97 | Washington | Northshore School District | Seattle | ✓ 已完成：`northshore-school-district-calendar`（2026-08-01） |
| 98 | Arizona | Mesa Public Schools | Phoenix | ✓ 已完成：`mesa-public-schools-calendar`（2026-08-01） |
| 99 | Arizona | Chandler Unified School District | Phoenix | ✓ 已完成：`chandler-unified-school-district-calendar`（2026-08-01） |
| 100 | Arizona | Tucson Unified School District | Tucson | ✓ 已完成：`tucson-unified-school-district-calendar`（2026-08-01） |
| 101 | Arizona | Peoria Unified School District | Phoenix | ✓ 已完成：`peoria-unified-school-district-calendar`（2026-08-01） |
| 102 | Arizona | Gilbert Public Schools | Phoenix | ✓ 已完成：`gilbert-public-schools-calendar`（2026-08-02） |
| 103 | Arizona | Deer Valley Unified School District | Phoenix | ✓ 已完成：`deer-valley-unified-school-district-calendar`（2026-08-03） |
| 104 | Arizona | Scottsdale Unified School District | Phoenix | ✓ 已完成：`scottsdale-unified-school-district-calendar`（2026-08-03） |
| 105 | Arizona | Dysart Unified School District | Phoenix | ✓ 已完成：`dysart-unified-school-district-calendar`（2026-08-03） |
| 106 | Arizona | Tempe Union High School District | Phoenix | ✓ 已完成：`tempe-union-high-school-district-calendar`（2026-08-04） |
| 107 | Colorado | Denver Public Schools | Denver | ✓ 已完成：`denver-public-schools-calendar`（2026-08-04） |
| 108 | Colorado | Jeffco Public Schools | Denver | ✓ 已完成：`jeffco-public-schools-calendar`（2026-08-04） |
| 109 | Colorado | Douglas County School District RE-1 | Denver | ✓ 已完成：`douglas-county-school-district-re-1-calendar`（2026-08-05） |
| 110 | Colorado | Cherry Creek School District | Denver | ✓ 已完成：`cherry-creek-school-district-calendar`（2026-08-05） |
| 111 | Colorado | Aurora Public Schools | Denver | ✓ 已完成：`aurora-public-schools-calendar`（2026-08-05） |
| 112 | Colorado | Adams 12 Five Star Schools | Denver | ✓ 已完成：`adams-12-five-star-schools-calendar`（2026-08-06） |
| 113 | Colorado | St. Vrain Valley Schools | Boulder-Longmont | ✓ 已完成：`st-vrain-valley-schools-calendar`（2026-08-06） |
| 114 | Colorado | Poudre School District | Fort Collins | ✓ 已完成：`poudre-school-district-calendar`（2026-08-06） |
| 115 | Washington | Tacoma Public Schools | Tacoma | ✓ 已完成：`tacoma-public-schools-calendar`（2026-08-07） |
| 116 | Washington | Kent School District | Seattle | ✓ 已完成：`kent-school-district-calendar`（2026-08-07） |
| 117 | Washington | Bellevue School District | Seattle | ✓ 已完成：`bellevue-school-district-calendar`（2026-08-07） |
| 118 | Washington | Federal Way Public Schools | Seattle | ✓ 已完成：`federal-way-public-schools-calendar`（2026-08-08） |
| 119 | Washington | Everett Public Schools | Seattle | 待创建 |
| 120 | Washington | Edmonds School District | Seattle | ✓ 已完成：`edmonds-school-district-calendar`（2026-08-08） |
| 121 | Washington | Puyallup School District | Tacoma | ✓ 已完成：`puyallup-school-district-calendar`（2026-08-08） |
| 122 | Washington | Spokane Public Schools | Spokane | ✓ 已完成：`spokane-public-schools-calendar`（2026-08-08） |

### 第 3 周（45个）

| 排名 | 州/地区 | 学区 | 主要都市圈 | 状态 |
|-----:|---------|------|------------|------|
| 123 | Oregon | Portland Public Schools | Portland | ✓ 已完成：`portland-public-schools-calendar`（2026-08-08） |
| 124 | Oregon | Beaverton School District | Portland | ✓ 已完成：`beaverton-school-district-calendar`（2026-08-09） |
| 125 | Oregon | Salem-Keizer Public Schools | Salem | ✓ 已完成：`salem-keizer-public-schools-calendar`（2026-08-09） |
| 126 | Oregon | Hillsboro School District | Portland | ✓ 已完成：`hillsboro-school-district-calendar`（2026-08-09） |
| 127 | Oregon | North Clackamas Schools | Portland | ✓ 已完成：`north-clackamas-school-district-calendar`（2026-08-09） |
| 128 | Oregon | Eugene School District 4J | Eugene | 待创建 |
| 129 | Utah | Alpine School District | Provo-Orem | ✓ 已完成：`alpine-school-district-calendar`（2026-08-09） |
| 130 | Utah | Davis School District | Salt Lake City | ✓ 已完成：`davis-school-district-calendar`（2026-08-10） |
| 131 | Utah | Granite School District | Salt Lake City | ✓ 已完成：`granite-school-district-calendar`（2026-08-10） |
| 132 | Utah | Jordan School District | Salt Lake City | ✓ 已完成：`jordan-school-district-calendar`（2026-08-10） |
| 133 | Utah | Canyons School District | Salt Lake City | ✓ 已完成：`canyons-school-district-calendar`（2026-08-10） |
| 134 | Utah | Weber School District | Ogden | ✓ 已完成：`weber-school-district-calendar`（2026-08-10） |
| 135 | Nevada | Washoe County School District | Reno | ✓ 已完成：`washoe-county-school-district-calendar`（2026-08-11） |
| 136 | New Mexico | Albuquerque Public Schools | Albuquerque | ✓ 已完成：`albuquerque-public-schools-calendar`（2026-08-11） |
| 137 | New Mexico | Las Cruces Public Schools | Las Cruces |  ✓ 已完成：`/las-cruces-public-schools-calendar` （2026-08-11） |
| 138 | Idaho | West Ada School District | Boise | ✓ 已完成：`west-ada-school-district-calendar`（2026-08-11） |
| 139 | Idaho | Boise School District | Boise | ✓ 已完成（2026-08-11，`/boise-school-district-calendar`） |
| 140 | Minnesota | Anoka-Hennepin School District | Minneapolis-St. Paul | ✓ 已完成：`anoka-hennepin-school-district-calendar`（2026-08-12） |
| 141 | Minnesota | Minneapolis Public Schools | Minneapolis | ✓ 已完成：`minneapolis-public-schools-calendar`（2026-08-12） |
| 142 | Minnesota | Saint Paul Public Schools | Saint Paul | ✓ 已完成：`saint-paul-public-schools-calendar`（2026-08-12） |
| 143 | Minnesota | Osseo Area Schools | Minneapolis-St. Paul | ✓ 已完成：`osseo-area-schools-calendar`（2026-08-12） |
| 144 | Minnesota | Rosemount-Apple Valley-Eagan Public Schools | Minneapolis-St. Paul | ✓ 已完成：`rosemount-apple-valley-eagan-public-schools-calendar`（2026-08-12） |
| 145 | Wisconsin | Milwaukee Public Schools | Milwaukee | ✓ 已完成：`milwaukee-public-schools-calendar`（2026-08-13） |
| 146 | Wisconsin | Madison Metropolitan School District | Madison | ✓ 已完成：`madison-metropolitan-school-district-calendar`（2026-08-13） |
| 147 | Wisconsin | Kenosha Unified School District | Kenosha | ✓ 已完成：`kenosha-unified-school-district-calendar`（2026-08-13） |
| 148 | Wisconsin | Racine Unified School District | Racine | ✓ 已完成：`racine-unified-school-district-calendar`（2026-08-13） |
| 149 | Michigan | Detroit Public Schools Community District | Detroit | ✓ 已完成：`detroit-public-schools-community-district-calendar`（2026-08-13） |
| 150 | Michigan | Utica Community Schools | Detroit | ✓ 已完成：`utica-community-schools-calendar`（2026-08-14） |
| 151 | Michigan | Dearborn Public Schools | Detroit | ✓ 已完成：`dearborn-public-schools-calendar`（2026-08-14） |
| 152 | Michigan | Plymouth-Canton Community Schools | Detroit | ✓ 已完成：`plymouth-canton-community-schools-calendar`（2026-08-14） |
| 153 | Michigan | Ann Arbor Public Schools | Ann Arbor | ✓ 已完成：`ann-arbor-public-schools-calendar`（2026-08-14） |
| 154 | Ohio | Columbus City Schools | Columbus | ✓ 已完成：`columbus-city-schools-calendar`（2026-08-14） |
| 155 | Ohio | Cleveland Metropolitan School District | Cleveland | ✓ 已完成：`cleveland-metropolitan-school-district-calendar`（2026-08-15） |
| 156 | Ohio | Cincinnati Public Schools | Cincinnati | ✓ 已完成：`cincinnati-public-schools-calendar`（2026-08-15） |
| 157 | Ohio | Toledo Public Schools | Toledo | ✓ 已完成：`toledo-public-schools-calendar`（2026-08-15）；2026–27、2027–28 与 2028–29 均已按独立知识资源页标准完成减法审计，达到约 9.9+ 内容质量并冻结正文。三年共同保留 staggered openings、EHSO、preschool/kindergarten phase-in、K–8 attendance interpretation、Calendar Dates、Major Breaks、官方 quarter/semester totals、PDF/精选 ICS、5 条 FAQ、3 条 Planning Notes 与 Sources；删除统一 174-day 断言、Year Numbers、Calendar Context/About、重复 opening/semester 模块、break badges、FAQPage Schema 与偏题模块。2026–27 保留 Bowsher/Start grade 9/10 exceptions；2027–28 保留 Apr. 10–17 Spring Break；两年分别补齐 Jan. 8/Jan. 7 O.O.D. deadline。2028–29 补齐 Jan. 12 O.O.D. deadline 并排除 ICS，将官方页面当前链接但可见内容仍标 DRAFT、文件名含 adopted 的冲突完整同步到 Hero、verification、downloads、Sources、CreativeWork/Dataset/DataDownload，启用 `sourceConflict` 与 manual review；删除独立 Semester Split，只在 Quarter section 保留 39/43/48/44 与 82/92 并说明适用边界，Opening/Attendance/FAQ/Title/Meta/H2/ItemList/labels/review triggers 均完成最终收口。最终 ICS 文案明确导入内容来自 TPS-published draft PDF，且一次性导入不会同步后续修订；两个 P3（DataDownload name、折叠区 SHA 文案）有意不动。2026–27 此前 localhost canonical、显式学年页与 ICS 均返回 200；2027–28/2028–29 静态 P0/P1/P2、来源冲突、FAQ/Schema、导航与 ICS 排除检查通过，localhost 当前停止，未完成运行页复核；按要求未执行 build。正文冻结，source monitoring 保持开启。 |
| 158 | Ohio | Akron Public Schools | Akron | ✓ 已完成：`akron-public-schools-calendar`（2026-08-15）；2026–27 已完成终稿级内容审计并达到约 9.8+ 发布档：修复 PDF 与 live calendar 的开学范围差异，移除无官方依据的 180 instructional days 与 7-day 派生指标，收敛为 Start Dates、单一 Key Dates、No-School Days、完整 Calendar Dates、Breaks、Marking Periods、PDF/ICS、program coverage、6 条 FAQ、2 项 APS resources 与 Sources；隐藏 About/Living/Year Numbers/Planning/Comparison/Related 和重复 Opening/Office 模块，清除 checksum/local-file 前台痕迹并关闭 FAQPage Schema。localhost SSR、9 个 jump-nav 锚点、11 个 H2、6 条 FAQ 与 23 项 ICS 均通过验证；未执行 build。 |
| 159 | Ohio | South-Western City School District | Columbus | ✓ 已完成：`south-western-city-school-district-calendar`（2026-08-15）；2026–27 内容终审 9.91/10、2027–28 内容终审 9.94/10，两个学年均已进入停止优化区，正文与主体结构冻结；已移除 official conditional calamity dates 的错误 derived-return 标记，待 localhost 运行复核。 |
| 160 | Ohio | Olentangy Local School District | Columbus | ✓ 已完成：`olentangy-local-school-district-calendar`（2026-08-16） |
| 161 | Indiana | Indianapolis Public Schools | Indianapolis | ✓ 已完成：`indianapolis-public-schools-calendar`（2026-08-16） |
| 162 | Indiana | Fort Wayne Community Schools | Fort Wayne | ✓ 已完成：`fort-wayne-community-schools-calendar`（2026-08-16） |
| 163 | Indiana | Metropolitan School District of Wayne Township | Indianapolis | ✓ 已完成：`msd-of-wayne-township-calendar`（2026-08-16） |
| 164 | Indiana | Hamilton Southeastern Schools | Fishers | ✓ 已完成：`hamilton-southeastern-schools-calendar`（2026-08-16） |
| 165 | Indiana | Carmel Clay Schools | Indianapolis | ✓ 已完成：`carmel-clay-schools-calendar`（2026-08-17） |
| 166 | Missouri | St. Louis Public Schools | St. Louis | ✓ 已完成：`st-louis-public-schools-calendar`（2026-08-17） |
| 167 | Missouri | Kansas City Public Schools | Kansas City | ✓ 已完成：`kansas-city-public-schools-calendar`（2026-08-17） |

### 第 4 周（45个）

| 排名 | 州/地区 | 学区 | 主要都市圈 | 状态 |
|-----:|---------|------|------------|------|
| 168 | Missouri | Parkway School District | St. Louis | ✓ 已完成：`parkway-schools-calendar`（2026-08-17） |
| 169 | Missouri | Rockwood School District | St. Louis | ✓ 已完成：`rockwood-school-district-calendar`（2026-08-17） |
| 170 | Missouri | Springfield Public Schools | Springfield | ✓ 已完成：`springfield-public-schools-mo-calendar`（2026-08-20） |
| 171 | Kansas | Wichita Public Schools | Wichita | ✓ 已完成：`wichita-public-schools-calendar`（2026-08-18） |
| 172 | Kansas | Olathe Public Schools | Kansas City | ✓ 已完成：`olathe-public-schools-calendar`（2026-08-18） |
| 173 | Kansas | Shawnee Mission School District | Kansas City | ✓ 已完成：`shawnee-mission-school-district-calendar`（2026-08-18） |
| 174 | Kansas | Blue Valley Schools | Kansas City | ✓ 已完成：`blue-valley-schools-calendar`（2026-08-18） |
| 175 | Nebraska | Omaha Public Schools | Omaha | ✓ 已完成：`omaha-public-schools-calendar`（2026-08-19） |
| 176 | Nebraska | Lincoln Public Schools | Lincoln | ✓ 已完成：`lincoln-public-schools-calendar`（2026-08-18） |
| 177 | Oklahoma | Oklahoma City Public Schools | Oklahoma City | ✓ 已完成：`oklahoma-city-public-schools-calendar`（2026-08-18） |
| 178 | Oklahoma | Tulsa Public Schools | Tulsa | ✓ 已完成：`tulsa-public-schools-calendar`（2026-08-18） |
| 179 | Oklahoma | Edmond Public Schools | Oklahoma City | ✓ 已完成：`edmond-public-schools-calendar`（2026-08-19） |
| 180 | Oklahoma | Moore Public Schools | Oklahoma City | ✓ 已完成：`moore-public-schools-calendar`（2026-08-20） |
| 181 | Tennessee | Memphis-Shelby County Schools | Memphis | ✓ 已完成：`memphis-shelby-county-schools-calendar`（2026-08-20） |
| 182 | Tennessee | Metro Nashville Public Schools | Nashville | ✓ 已完成：`metro-nashville-public-schools-calendar`（2026-08-20） |
| 183 | Tennessee | Knox County Schools | Knoxville | ✓ 已完成：`knox-county-schools-calendar`（2026-08-20） |
| 184 | Tennessee | Hamilton County Schools | Chattanooga | 待创建 |
| 185 | Tennessee | Rutherford County Schools | Nashville | 待创建 |
| 186 | Tennessee | Williamson County Schools | Nashville | 待创建 |
| 187 | Kentucky | Jefferson County Public Schools | Louisville | 待创建 |
| 188 | Kentucky | Fayette County Public Schools | Lexington | 待创建 |
| 189 | Alabama | Mobile County Public Schools | Mobile | 待创建 |
| 190 | Alabama | Jefferson County Schools | Birmingham | 待创建 |
| 191 | Alabama | Montgomery Public Schools | Montgomery | 待创建 |
| 192 | Alabama | Birmingham City Schools | Birmingham | 待创建 |
| 193 | Alabama | Madison County Schools | Huntsville | 待创建 |
| 194 | Alabama | Huntsville City Schools | Huntsville | 待创建 |
| 195 | Louisiana | Jefferson Parish Schools | New Orleans | 待创建 |
| 196 | Louisiana | East Baton Rouge Parish School System | Baton Rouge | 待创建 |
| 197 | Louisiana | Caddo Parish Public Schools | Shreveport | 待创建 |
| 198 | Mississippi | DeSoto County Schools | Memphis metro | 待创建 |
| 199 | Mississippi | Rankin County School District | Jackson | 待创建 |
| 200 | Arkansas | Little Rock School District | Little Rock | 待创建 |
| 201 | Pennsylvania | Pittsburgh Public Schools | Pittsburgh | 待创建 |
| 202 | Pennsylvania | Central Bucks School District | Philadelphia suburbs | 待创建 |
| 203 | Pennsylvania | Allentown School District | Lehigh Valley | 待创建 |
| 204 | Pennsylvania | Reading School District | Reading | 待创建 |
| 205 | Pennsylvania | Downingtown Area School District | Philadelphia suburbs | 待创建 |
| 206 | New Jersey | Newark Public Schools | Newark | 待创建 |
| 207 | New Jersey | Jersey City Public Schools | New York metro | 待创建 |
| 208 | New Jersey | Paterson Public Schools | New York metro | 待创建 |
| 209 | New Jersey | Elizabeth Public Schools | New York metro | 待创建 |
| 210 | New Jersey | Edison Township Public Schools | New York metro | 待创建 |
| 211 | New Jersey | Toms River Regional Schools | Jersey Shore | 待创建 |
| 212 | New Jersey | Cherry Hill Public Schools | Philadelphia metro | 待创建 |

### 第 5 周（45个）

| 排名 | 州/地区 | 学区 | 主要都市圈 | 状态 |
|-----:|---------|------|------------|------|
| 213 | New York | Buffalo Public Schools | Buffalo | 待创建 |
| 214 | New York | Rochester City School District | Rochester | 待创建 |
| 215 | New York | Yonkers Public Schools | New York metro | 待创建 |
| 216 | New York | Syracuse City School District | Syracuse | 待创建 |
| 217 | New York | Sachem Central School District | Long Island | 待创建 |
| 218 | New York | Brentwood Union Free School District | Long Island | 待创建 |
| 219 | Connecticut | Bridgeport Public Schools | Bridgeport | 待创建 |
| 220 | Connecticut | Hartford Public Schools | Hartford | 待创建 |
| 221 | Connecticut | New Haven Public Schools | New Haven | 待创建 |
| 222 | Connecticut | Stamford Public Schools | Stamford | 待创建 |
| 223 | Rhode Island | Providence Public School District | Providence | 待创建 |
| 224 | Massachusetts | Worcester Public Schools | Worcester | 待创建 |
| 225 | Massachusetts | Springfield Public Schools | Springfield | ✓ 已完成：`springfield-public-schools-ma-calendar`（2026-08-18） |
| 226 | Massachusetts | Brockton Public Schools | Boston metro | 待创建 |
| 227 | Massachusetts | Newton Public Schools | Boston metro | 待创建 |
| 228 | New Hampshire | Manchester School District | Manchester | 待创建 |
| 229 | Maine | Portland Public Schools | Portland | 待创建 |
| 230 | Delaware | Red Clay Consolidated School District | Wilmington | 待创建 |
| 231 | Delaware | Christina School District | Wilmington | 待创建 |
| 232 | District of Columbia | District of Columbia Public Schools | Washington, D.C. | 待创建 |
| 233 | Virginia | Norfolk Public Schools | Hampton Roads | 待创建 |
| 234 | Virginia | Chesapeake Public Schools | Hampton Roads | 待创建 |
| 236 | Virginia | Richmond Public Schools | Richmond | 待创建 |
| 239 | Maryland | Frederick County Public Schools | Frederick | 待创建 |
| 240 | Maryland | Harford County Public Schools | Baltimore | 待创建 |
| 241 | Maryland | Charles County Public Schools | Washington, D.C. metro | 待创建 |
| 244 | North Carolina | Buncombe County Schools | Asheville | 待创建 |
| 245 | North Carolina | Pitt County Schools | Greenville | 待创建 |
| 246 | North Carolina | Onslow County Schools | Jacksonville | 待创建 |
| 247 | South Carolina | Greenville County Schools | Greenville | 待创建 |
| 248 | South Carolina | Charleston County School District | Charleston | 待创建 |
| 249 | South Carolina | Richland School District Two | Columbia | 待创建 |
| 250 | South Carolina | Horry County Schools | Myrtle Beach | 待创建 |
| 251 | South Carolina | Lexington County School District One | Columbia | 待创建 |
| 252 | Georgia | Henry County Schools | Atlanta | 待创建 |
| 253 | Georgia | Cherokee County School District | Atlanta | 待创建 |
| 254 | Georgia | Hall County Schools | Gainesville | 待创建 |
| 255 | Georgia | Richmond County School System | Augusta | 待创建 |
| 256 | Florida | St. Johns County School District | Jacksonville | 待创建 |
| 257 | Florida | Manatee County School District | Bradenton | 待创建 |
| 258 | Florida | Lake County Schools | Orlando | 待创建 |
| 259 | Florida | Escambia County Public Schools | Pensacola | 待创建 |
| 260 | Florida | Leon County Schools | Tallahassee | 待创建 |
| 261 | Texas | Leander Independent School District | Austin | 待创建 |
| 262 | Texas | Prosper Independent School District | Dallas-Fort Worth | 待创建 |

### 第 6 周（32个）

| 排名 | 州/地区 | 学区 | 主要都市圈 | 状态 |
|-----:|---------|------|------------|------|
| 263 | Texas | Denton Independent School District | Dallas-Fort Worth | 待创建 |
| 264 | Texas | Clear Creek Independent School District | Houston | 待创建 |
| 265 | Texas | Lamar Consolidated Independent School District | Houston | 待创建 |
| 268 | Texas | Socorro Independent School District | El Paso | 待创建 |
| 269 | Texas | El Paso Independent School District | El Paso | 待创建 |
| 270 | Texas | Ysleta Independent School District | El Paso | 待创建 |
| 271 | Texas | Lubbock Independent School District | Lubbock | 待创建 |
| 272 | Texas | Amarillo Independent School District | Amarillo | 待创建 |
| 273 | Texas | Corpus Christi Independent School District | Corpus Christi | 待创建 |
| 275 | California | Kern High School District | Bakersfield | 待创建 |
| 277 | California | Modesto City Schools | Modesto | 待创建 |
| 278 | California | Clovis Unified School District | Fresno | 待创建 |
| 279 | California | Visalia Unified School District | Visalia | 待创建 |
| 280 | California | Mt. Diablo Unified School District | East Bay | 待创建 |
| 281 | California | Fremont Unified School District | Bay Area | 待创建 |
| 282 | California | Santa Clara Unified School District | Bay Area | 待创建 |
| 284 | California | Palo Alto Unified School District | Bay Area | 待创建 |
| 285 | California | Antioch Unified School District | East Bay | 待创建 |
| 286 | California | Oxnard Union High School District | Ventura County | 待创建 |
| 287 | California | Conejo Valley Unified School District | Ventura County | 待创建 |
| 288 | California | Pasadena Unified School District | Los Angeles | 待创建 |
| 289 | California | Compton Unified School District | Los Angeles | 待创建 |
| 291 | California | Murrieta Valley Unified School District | Inland Empire | 待创建 |
| 292 | California | Temecula Valley Unified School District | Inland Empire | 待创建 |
| 293 | California | Rocklin Unified School District | Sacramento | 待创建 |
| 294 | California | Roseville City School District | Sacramento | 待创建 |
| 295 | Washington | Highline Public Schools | Seattle | 待创建 |
| 296 | Washington | Renton School District | Seattle | 待创建 |
| 297 | Colorado | Academy School District 20 | Colorado Springs | 待创建 |
| 298 | Colorado | Colorado Springs School District 11 | Colorado Springs | 待创建 |
| 299 | Alaska | Anchorage School District | Anchorage | 待创建 |
| 300 | Puerto Rico | Puerto Rico Department of Education | Territory-wide | 待创建 |



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
