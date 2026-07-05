# Calendar Data Calibration Status

Each district needs both school years (2025-2026 and 2026-2027) verified against official PDFs.

## How to calibrate

1. Download the official calendar PDF from the district's website (link in table below)
2. Send both PDF file paths in chat, e.g.:
   > `/path/to/2025-2026.pdf /path/to/2026-2027.pdf 这两个是 XXXX 的`
3. Claude will parse and update both JSON files, setting `lastVerifiedAt: "YYYY-MM-DD"`

---

## Status

| District | State | Status | Official Calendar URL |
|---|---|---|---|
| Miami-Dade County Public Schools | FL | ✅ 2026-07-02 | https://www.dadeschools.net/calendar |
| Houston ISD | TX | ✅ 2026-07-02 | https://www.houstonisd.org/calendar |
| Los Angeles Unified School District | CA | ✅ 2026-07-02 (+ 2027-2028 added) | https://www.lausd.net/calendar |
| Broward County Public Schools | FL | ✅ 2026-07-02 (2026-27 + 2027-28 added) | https://www.browardschools.com/calendars |
| Orange County Public Schools | FL | ✅ 2026-07-02 | https://www.ocps.net/calendar |
| Palm Beach County School District | FL | ✅ 2026-07-02 | https://www.palmbeachschools.org/calendar |
| Hillsborough County Public Schools | FL | ✅ 2026-07-02 (2025-26 via schools-calendar.com) | https://www.hillsboroughschools.org/page/calendars |
| Dallas ISD | TX | ✅ 2026-07-02 | https://www.dallasisd.org/about/about-dallas-isd/district-calendars |
| Austin ISD | TX | ✅ 2026-07-02 | https://www.austinisd.org/calendar |
| Fort Worth ISD | TX | ✅ 2026-07-02 | https://www.fwisd.org/calendar |
| Northside ISD | TX | ✅ 2026-07-02 (2027-2028 added) | https://www.nisd.net/schools/calendars |
| San Diego Unified School District | CA | ✅ 2026-07-02 | https://www.sandiegounified.org/academics/academic_calendars |
| Long Beach Unified School District | CA | ✅ 2026-07-02 (2027-2028 added) | https://www.lbschools.net/about/calendar |
| Fresno Unified School District | CA | ✅ 2026-07-02 (2027-2028 added) | https://www.fresnounified.org/about/calendar |
| Sacramento City Unified School District | CA | ✅ 2026-07-02 | https://www.scusd.edu/district-calendar |
| Wake County Public School System | NC | ✅ 2026-07-05 (2025-26 + 2026-27 + 2027-28 TRAD verified from PDF) | https://www.wcpss.net/calendars |
| Charlotte-Mecklenburg Schools | NC | ✅ 2026-07-05 (2025-26 + 2026-27 + 2027-28 verified from PDF) | https://www.cms.k12.nc.us/communications/calendars/Pages/Calendars.aspx |
| Guilford County Schools | NC | ✅ 2026-07-05 (2025-26 + 2026-27 + 2027-28 verified from PDF) | https://www.gcsnc.com/calendar |
| Cumberland County Schools | NC | ✅ 2026-07-05 (2025-26 + 2026-27 verified from PDF; no 2027-28 PDF provided) | https://www.ccs.k12.nc.us/page/districts-board-approved-calendars |
| Winston-Salem/Forsyth County Schools | NC | ✅ 2026-07-05 (2025-26 + 2026-27 verified from PDF) | https://www.wsfcs.k12.nc.us/calendars |
| Fairfax County Public Schools | VA | ✅ 2026-07-05 (2025-26 + 2026-27 + 2027-28 verified from PDF) | https://www.fcps.edu/calendars |
| Loudoun County Public Schools | VA | ✅ 2026-07-05 (2025-26 + 2026-27 verified from official site; 2027-28 added) | https://www.lcps.org/calendar |
| Prince William County Public Schools | VA | ✅ 2026-07-05 (2025-26 + 2026-27 verified from official site) | https://www.pwcs.edu/calendars |
| Chesterfield County Public Schools | VA | ✅ 2026-07-05 (2025-26 + 2026-27 + 2027-28 verified from official site) | https://www.ccpsnet.net/calendar |
| Virginia Beach City Public Schools | VA | ✅ 2026-07-05 (2025-26 + 2026-27 verified from PDF) | https://www.vbschools.com/calendars |

---

## 缺少 2027-2028 学年的学区（14个）

以下学区尚未添加 2027-2028 日历文件，需优先补充：

| District | State | Official Calendar URL |
|---|---|---|
| Miami-Dade County Public Schools | FL | https://www.dadeschools.net/calendar |
| Houston ISD | TX | https://www.houstonisd.org/calendar |
| Orange County Public Schools | FL | https://www.ocps.net/calendar |
| Palm Beach County School District | FL | https://www.palmbeachschools.org/calendar |
| Dallas ISD | TX | https://www.dallasisd.org/about/about-dallas-isd/district-calendars |
| Hillsborough County Public Schools | FL | https://www.hillsboroughschools.org/page/calendars |
| Austin ISD | TX | https://www.austinisd.org/calendar |
| Fort Worth ISD | TX | https://www.fwisd.org/calendar |
| San Diego Unified School District | CA | https://www.sandiegounified.org/academics/academic_calendars |
| Sacramento City Unified School District | CA | https://www.scusd.edu/district-calendar |
| Cumberland County Schools | NC | https://www.ccs.k12.nc.us/page/districts-board-approved-calendars |
| Winston-Salem/Forsyth County Schools | NC | https://www.wsfcs.k12.nc.us/calendars |
| Prince William County Public Schools | VA | https://www.pwcs.edu/calendars |
| Virginia Beach City Public Schools | VA | https://www.vbschools.com/calendars |

---

## Notes

- Each district has two JSON files: `content/calendars/<id>/2025-2026.json` and `2026-2027.json`
- After verification, the file will have `"lastVerifiedAt": "YYYY-MM-DD"`
- Priority: largest districts (LAUSD, Broward, Dallas, Fairfax, Wake) first for SEO impact
