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
| Wake County Public School System | NC | ⏳ pending | https://www.wcpss.net/calendars |
| Charlotte-Mecklenburg Schools | NC | ⏳ pending | https://www.cms.k12.nc.us/communications/calendars/Pages/Calendars.aspx |
| Guilford County Schools | NC | ⏳ pending | https://www.gcsnc.com/calendar |
| Cumberland County Schools | NC | ⏳ pending | https://www.ccs.k12.nc.us/calendar |
| Winston-Salem/Forsyth County Schools | NC | ⏳ pending | https://www.wsfcs.k12.nc.us/calendars |
| Fairfax County Public Schools | VA | ⏳ pending | https://www.fcps.edu/calendars |
| Loudoun County Public Schools | VA | ⏳ pending | https://www.lcps.org/calendar |
| Prince William County Public Schools | VA | ⏳ pending | https://www.pwcs.edu/calendars |
| Chesterfield County Public Schools | VA | ⏳ pending | https://www.ccpsnet.net/calendar |
| Virginia Beach City Public Schools | VA | ⏳ pending | https://www.vbschools.com/calendars |

---

## Notes

- Each district has two JSON files: `content/calendars/<id>/2025-2026.json` and `2026-2027.json`
- After verification, the file will have `"lastVerifiedAt": "YYYY-MM-DD"`
- Priority: largest districts (LAUSD, Broward, Dallas, Fairfax, Wake) first for SEO impact
