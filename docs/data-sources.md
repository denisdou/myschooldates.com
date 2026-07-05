# Data Sources Specification

## 设计原则

**第一阶段不自己找 PDF**。先记录官方 Calendar 页面 URL（`calendarPage`），将其作为每个学区的稳定数据入口。PDF 链接（`sourcePdfUrl`）从 Calendar 页面发现，每学年更新。

---

## 三级数据源架构

```
Official Calendar Page（calendarPage）
        │
        ├── PDF（90% 学区）
        ├── ICS Feed（少数学区）
        ├── HTML Calendar（部分学区）
        └── Board-approved Document
                │
                ▼
        Parser（PDF / HTML / ICS）
                │
                ▼
        Structured Events（统一 JSON）
                │
                ▼
        myschooldates
```

### 为什么 calendarPage 比 PDF 更重要

- `calendarPage` 往往**多年保持不变**（学区的 Calendar 频道稳定）
- `sourcePdfUrl` 每学年都会变（新文件名、新路径）
- 更新流程：访问 `calendarPage` → 自动发现最新 PDF → 解析 → 入库

---

## 数据模型字段

### District JSON（学区元数据，每个学区一个文件）

```json
{
  "institutionId": "miami-dade",
  "name": "Miami-Dade County Public Schools",
  "slug": "miami-dade",
  "officialWebsite": "https://www.dadeschools.net",
  "calendarPage": "https://www.dadeschools.net/calendars"
}
```

| 字段 | 说明 | 稳定性 |
|------|------|--------|
| `officialWebsite` | 学区官网首页 | 极稳定（域名级别） |
| `calendarPage` | 日历发布页，= `sourcePageUrl` | 稳定（多年不变） |

> `calendarPage` 就是架构图中的 **Official Calendar Page**，是真正的数据入口。

---

### Calendar JSON（日历数据，每个学区每学年一个文件）

```json
{
  "institutionId": "miami-dade",
  "schoolYear": "2026-2027",
  "firstDay": "2026-08-17",
  "lastDay": "2027-06-04",
  "sourceUrl": "https://www.dadeschools.net/calendars",
  "sourcePdfUrl": "https://www.dadeschools.net/.../2026-2027-calendar.pdf",
  "lastVerifiedAt": "2026-06-01",
  "events": [...]
}
```

| 字段 | 说明 | 更新频率 |
|------|------|----------|
| `sourceUrl` | 指向本学年的 Calendar 页面或 PDF 页面 | 偶尔变动 |
| `sourcePdfUrl` | 直接 PDF 链接，用于解析和校验 | 每学年更新 |
| `lastVerifiedAt` | 最后一次与官方来源核对的日期（ISO 8601） | 每次 review 更新 |

---

## 25 个学区的官方来源

### Florida Cluster

| 学区 | officialWebsite | calendarPage |
|------|----------------|--------------|
| Miami-Dade County Public Schools | https://www.dadeschools.net | https://www3.dadeschools.net/Calendars/ |
| Broward County Public Schools | https://www.browardschools.com | https://www.browardschools.com/calendar-e3 |
| Palm Beach County School District | https://www.palmbeachschools.org | https://www.palmbeachschools.org/calendar |
| Orange County Public Schools | https://www.ocps.net | https://www.ocps.net/about_ocps/school_calendar |
| Hillsborough County Public Schools | https://www.hillsboroughschools.org | https://www.hillsboroughschools.org/page/calendars |
| Duval County Public Schools | https://www.duvalschools.org | https://www.duvalschools.org/page/district-calendar |
| Polk County Public Schools | https://www.polkschoolsfl.com | https://www.polkschoolsfl.com/calendars |
| Lee County School District | https://www.leeschools.net | https://www.leeschools.net/calendars |

### California Cluster

| 学区 | officialWebsite | calendarPage |
|------|----------------|--------------|
| Los Angeles Unified School District | https://www.lausd.net | https://www.lausd.net/calendar |
| San Diego Unified School District | https://www.sandiegounified.org | https://www.sandiegounified.org/academics/academic_calendars |
| Long Beach Unified School District | https://www.lbschools.net | https://www.lbschools.net/about/calendar |
| Fresno Unified School District | https://www.fresnounified.org | https://www.fresnounified.org/about/calendar |

### Texas Cluster

| 学区 | officialWebsite | calendarPage |
|------|----------------|--------------|
| Houston Independent School District | https://www.houstonisd.org | https://www.houstonisd.org/calendar |
| Dallas Independent School District | https://www.dallasisd.org | https://www.dallasisd.org/about/about-dallas-isd/district-calendars |
| Fort Worth Independent School District | https://www.fwisd.org | https://www.fwisd.org/calendar |
| Austin Independent School District | https://www.austinisd.org | https://www.austinisd.org/calendar |
| Northside Independent School District | https://www.nisd.net | https://www.nisd.net/schools/calendars |

### Other States

| 学区 | 州 | officialWebsite | calendarPage |
|------|----|----------------|--------------|
| Chicago Public Schools | IL | https://www.cps.edu | https://www.cps.edu/calendar |
| Clark County School District | NV | https://www.ccsd.net | https://www.ccsd.net/district/calendar/ |
| Wake County Public School System | NC | https://www.wcpss.net | https://www.wcpss.net/calendars |
| Charlotte-Mecklenburg Schools | NC | https://www.cms.k12.nc.us | https://www.cms.k12.nc.us/communications/calendars/Pages/Calendars.aspx |
| Fairfax County Public Schools | VA | https://www.fcps.edu | https://www.fcps.edu/calendars |
| Montgomery County Public Schools | MD | https://www.montgomeryschoolsmd.org | https://ww2.montgomeryschoolsmd.org/calendar/ |
| Prince George's County Public Schools | MD | https://www.pgcps.org | https://www.pgcps.org/about-pgcps/school-calendar/ |
| New York City Public Schools | NY | https://www.schools.nyc.gov | https://www.schools.nyc.gov/calendar |

---

## 年度数据更新流程

每年 **5-6 月**执行以下流程：

```
1. 访问每个学区的 calendarPage
2. 发现下一学年的 PDF 链接 → 更新 sourcePdfUrl
3. 解析 PDF / HTML → 提取 events
4. 创建新学年的 calendar JSON 文件
5. 更新 lastVerifiedAt 为当前日期
6. 更新 district JSON 的 currentSchoolYear
```

### 注意事项

- `calendarPage` URL 多年稳定，优先维护这个字段
- `sourcePdfUrl` 每年变化，发现新 PDF 后及时更新
- 有些学区（如 Duval County）没有独立 PDF，使用 HTML 日历 → 需要 HTML 解析
- 有些学区提供 ICS feed → 可以直接解析，精度最高

---

## 已知的 PDF 直链（部分学区）

可作为首次数据录入的参考：

| 学区 | 2025-2026 PDF |
|------|--------------|
| Hillsborough County | https://www.hillsboroughschools.org/cms/lib/FL50000635/Centricity/Domain/119/25-26__Student_Academic_Calendar.pdf |
| Lee County | https://www.leeschools.net/common/pages/GetFile.ashx?key=vdtEDAYo |
| Fort Worth ISD | https://www.fwisd.org/fs/resource-manager/view/2a8f6917-0f71-4bee-a0e0-8fc4e8a1f995 |
| Austin ISD | https://www.austinisd.org/sites/default/files/dept/ctfc/docs/2025-2026_Calendar_Updated.pdf |
| Northside ISD | https://www.nisd.net/sites/default/files/documents/2025-2026-nisd-calendar.pdf |
| Clark County | https://ccsd.net/district/calendar/pdf/2025-2026-school-calendar-students.pdf |
| Montgomery County MD | https://ww2.montgomeryschoolsmd.org/calendar/pdfs/2025/2025-26_TRADITIONAL_SchoolCalendar.pdf |
| Prince George's County | https://www.pgcps.org/globalassets/featured-pages/about-pgcps/docs---about-pgcps/calendars/2025-2026-school-year-calendar.pdf |
| Fairfax County | https://www.fcps.edu/system/files/forms/2024-02/2025-2026-standard-school-year-calendar.pdf |
| Fresno Unified | https://www.fresnounified.org/fs/resource-manager/view/0197e98c-8b93-4c61-bb0f-aced2abc36dd |
