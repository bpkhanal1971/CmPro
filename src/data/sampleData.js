/* ============================================================
   ConPro — Centralized Sample Data
   Realistic construction data for a Nepali construction company.
   All pages import from this single source of truth.
   ============================================================ */

// ── Team Members ──
export const TEAM = [
  { name: "Ramesh Sharma", role: "Project Manager", email: "ramesh@conpro.com.np", phone: "+977-9801234567", color: "#1b5e20" },
  { name: "Sita Gurung", role: "Structural Engineer", email: "sita@conpro.com.np", phone: "+977-9812345678", color: "#0288d1" },
  { name: "Bikash Thapa", role: "Site Supervisor", email: "bikash@conpro.com.np", phone: "+977-9823456789", color: "#7c3aed" },
  { name: "David Rai", role: "MEP Engineer", email: "david@conpro.com.np", phone: "+977-9834567890", color: "#d97706" },
  { name: "Anita KC", role: "QA & Safety Officer", email: "anita@conpro.com.np", phone: "+977-9845678901", color: "#dc2626" },
  { name: "Prakash Adhikari", role: "Cost Estimator", email: "prakash@conpro.com.np", phone: "+977-9856789012", color: "#059669" },
  { name: "Sunita Maharjan", role: "Architect", email: "sunita@conpro.com.np", phone: "+977-9867890123", color: "#be185d" },
  { name: "Nabin Shrestha", role: "Surveyor", email: "nabin@conpro.com.np", phone: "+977-9878901234", color: "#4f46e5" },
];

export const PEOPLE = TEAM.map((t) => t.name);

// ── 5 Projects ──
export const PROJECTS = [
  { id: 1, name: "Kathmandu Business Park",       client: "Himalayan Capital Group",   location: "Kathmandu",  start: "2025-08-01", end: "2027-06-30", status: "In Progress", progress: 62, budget: 480000000 },
  { id: 2, name: "Pokhara Lakeside Hotel",         client: "Nepal Tourism Ventures",    location: "Pokhara",    start: "2025-11-15", end: "2027-09-30", status: "In Progress", progress: 38, budget: 320000000 },
  { id: 3, name: "Bharatpur Ring Road Flyover",    client: "Dept of Roads, Chitwan",    location: "Bharatpur",  start: "2025-03-01", end: "2026-12-31", status: "In Progress", progress: 75, budget: 850000000 },
  { id: 4, name: "Chitwan Medical College",        client: "Province 3 Health Board",   location: "Chitwan",    start: "2026-02-01", end: "2028-04-30", status: "Planning",    progress: 12, budget: 620000000 },
  { id: 5, name: "Biratnagar Industrial Warehouse",client: "Eastern Logistics Pvt Ltd", location: "Biratnagar", start: "2024-10-01", end: "2026-08-30", status: "On Hold",     progress: 85, budget: 180000000 },
];

export const PROJECT_NAMES = PROJECTS.map((p) => p.name);

// ── 20 Tasks ──
export const TASKS = [
  { id: 1,  title: "Complete RCC column pour - Block A",         project: "Kathmandu Business Park",        assignee: "Bikash Thapa",       priority: "High",   deadline: "2026-04-22", status: "In Progress" },
  { id: 2,  title: "Install curtain wall framing - Level 3",     project: "Kathmandu Business Park",        assignee: "Sita Gurung",        priority: "High",   deadline: "2026-04-28", status: "To Do" },
  { id: 3,  title: "Review MEP coordination drawings",           project: "Kathmandu Business Park",        assignee: "David Rai",          priority: "Medium", deadline: "2026-04-20", status: "In Progress" },
  { id: 4,  title: "Procure elevator shaft steel",               project: "Kathmandu Business Park",        assignee: "Prakash Adhikari",   priority: "High",   deadline: "2026-04-25", status: "To Do" },
  { id: 5,  title: "Waterproofing basement level B2",            project: "Kathmandu Business Park",        assignee: "Bikash Thapa",       priority: "High",   deadline: "2026-04-18", status: "Done" },
  { id: 6,  title: "Foundation pile load test",                   project: "Pokhara Lakeside Hotel",         assignee: "Sita Gurung",        priority: "High",   deadline: "2026-04-30", status: "In Progress" },
  { id: 7,  title: "Submit landscape design revision",           project: "Pokhara Lakeside Hotel",         assignee: "Sunita Maharjan",    priority: "Medium", deadline: "2026-05-05", status: "To Do" },
  { id: 8,  title: "Install temporary site fencing",             project: "Pokhara Lakeside Hotel",         assignee: "Bikash Thapa",       priority: "Low",    deadline: "2026-04-15", status: "Done" },
  { id: 9,  title: "Order pre-stressed concrete girders",        project: "Bharatpur Ring Road Flyover",    assignee: "Prakash Adhikari",   priority: "High",   deadline: "2026-04-19", status: "In Progress" },
  { id: 10, title: "Bridge pier rebar inspection",               project: "Bharatpur Ring Road Flyover",    assignee: "Anita KC",           priority: "High",   deadline: "2026-04-21", status: "In Progress" },
  { id: 11, title: "Traffic diversion plan approval",            project: "Bharatpur Ring Road Flyover",    assignee: "Ramesh Sharma",      priority: "Medium", deadline: "2026-04-17", status: "Done" },
  { id: 12, title: "Asphalt batch plant calibration",            project: "Bharatpur Ring Road Flyover",    assignee: "David Rai",          priority: "Medium", deadline: "2026-05-01", status: "To Do" },
  { id: 13, title: "Geotechnical survey - Phase 2",              project: "Chitwan Medical College",        assignee: "Nabin Shrestha",     priority: "High",   deadline: "2026-05-10", status: "To Do" },
  { id: 14, title: "Prepare EIA submission documents",           project: "Chitwan Medical College",        assignee: "Ramesh Sharma",      priority: "Medium", deadline: "2026-05-15", status: "To Do" },
  { id: 15, title: "Architectural concept finalization",         project: "Chitwan Medical College",        assignee: "Sunita Maharjan",    priority: "High",   deadline: "2026-05-08", status: "In Progress" },
  { id: 16, title: "Fire suppression system compliance check",   project: "Biratnagar Industrial Warehouse",assignee: "David Rai",          priority: "High",   deadline: "2026-04-10", status: "Done" },
  { id: 17, title: "Resolve land boundary dispute",              project: "Biratnagar Industrial Warehouse",assignee: "Ramesh Sharma",      priority: "High",   deadline: "2026-06-01", status: "In Progress" },
  { id: 18, title: "Steel truss fabrication QC",                 project: "Biratnagar Industrial Warehouse",assignee: "Anita KC",           priority: "Medium", deadline: "2026-04-12", status: "Done" },
  { id: 19, title: "Conduct weekly safety toolbox talk",         project: "Kathmandu Business Park",        assignee: "Anita KC",           priority: "Medium", deadline: "2026-04-23", status: "To Do" },
  { id: 20, title: "Submit monthly progress report",             project: "Pokhara Lakeside Hotel",         assignee: "Ramesh Sharma",      priority: "Low",    deadline: "2026-04-30", status: "To Do" },
];

// ── Schedule: 20 activities + 10 milestones for Kathmandu Business Park ──
export const SCHEDULE_ACTIVITIES = [
  { id: 1,  task: "Site Clearing & Demolition",      start: "2026-01-05", end: "2026-01-25", person: "Bikash Thapa",       status: "Completed",   dependency: "—",                    type: "task" },
  { id: 2,  task: "Topographic Survey",               start: "2026-01-15", end: "2026-01-28", person: "Nabin Shrestha",     status: "Completed",   dependency: "Site Clearing",         type: "task" },
  { id: 3,  task: "Soil Investigation & Testing",     start: "2026-01-28", end: "2026-02-15", person: "Sita Gurung",        status: "Completed",   dependency: "Survey",                type: "task" },
  { id: 4,  task: "Design Approval",                  start: "2026-02-16", end: "2026-02-16", person: "Ramesh Sharma",      status: "Completed",   dependency: "Soil Testing",          type: "milestone" },
  { id: 5,  task: "Piling Work - Block A",            start: "2026-02-17", end: "2026-03-20", person: "Bikash Thapa",       status: "Completed",   dependency: "Design Approval",       type: "task" },
  { id: 6,  task: "Piling Work - Block B",            start: "2026-03-01", end: "2026-04-05", person: "Bikash Thapa",       status: "Completed",   dependency: "Design Approval",       type: "task" },
  { id: 7,  task: "Pile Cap & Raft Foundation",       start: "2026-03-21", end: "2026-04-20", person: "Sita Gurung",        status: "Completed",   dependency: "Piling A",              type: "task" },
  { id: 8,  task: "Foundation Inspection",             start: "2026-04-21", end: "2026-04-21", person: "Anita KC",           status: "Completed",   dependency: "Foundation",            type: "milestone" },
  { id: 9,  task: "Basement Retaining Wall",          start: "2026-04-22", end: "2026-05-15", person: "Bikash Thapa",       status: "In Progress", dependency: "Foundation Inspection", type: "task" },
  { id: 10, task: "Basement Waterproofing",           start: "2026-05-05", end: "2026-05-25", person: "Bikash Thapa",       status: "In Progress", dependency: "Retaining Wall",       type: "task" },
  { id: 11, task: "RCC Column Pour - Ground to L3",   start: "2026-05-16", end: "2026-06-30", person: "Sita Gurung",        status: "Upcoming",    dependency: "Waterproofing",        type: "task" },
  { id: 12, task: "Structural Frame Completion",       start: "2026-07-01", end: "2026-07-01", person: "Sita Gurung",        status: "Upcoming",    dependency: "RCC Pour",             type: "milestone" },
  { id: 13, task: "MEP Rough-In - Electrical",        start: "2026-06-01", end: "2026-07-15", person: "David Rai",          status: "Upcoming",    dependency: "Column Pour (partial)", type: "task" },
  { id: 14, task: "MEP Rough-In - Plumbing & HVAC",  start: "2026-06-10", end: "2026-07-20", person: "David Rai",          status: "Upcoming",    dependency: "Column Pour (partial)", type: "task" },
  { id: 15, task: "Curtain Wall Installation",        start: "2026-07-01", end: "2026-08-30", person: "Bikash Thapa",       status: "Upcoming",    dependency: "Structural Frame",     type: "task" },
  { id: 16, task: "Elevator & Lift Installation",     start: "2026-07-15", end: "2026-09-15", person: "David Rai",          status: "Upcoming",    dependency: "Structural Frame",     type: "task" },
  { id: 17, task: "Building Envelope Complete",        start: "2026-08-31", end: "2026-08-31", person: "Ramesh Sharma",      status: "Upcoming",    dependency: "Curtain Wall",         type: "milestone" },
  { id: 18, task: "Interior Partition & Drywall",     start: "2026-08-01", end: "2026-09-30", person: "Sunita Maharjan",    status: "Upcoming",    dependency: "Curtain Wall (partial)",type: "task" },
  { id: 19, task: "Floor Tiling & Stone Work",        start: "2026-09-01", end: "2026-10-15", person: "Bikash Thapa",       status: "Upcoming",    dependency: "Partition",            type: "task" },
  { id: 20, task: "Fire Protection System",           start: "2026-09-15", end: "2026-10-30", person: "David Rai",          status: "Upcoming",    dependency: "MEP Rough-In",         type: "task" },
  { id: 21, task: "MEP Fit-Out Complete",              start: "2026-10-31", end: "2026-10-31", person: "David Rai",          status: "Upcoming",    dependency: "Fire Protection",      type: "milestone" },
  { id: 22, task: "Painting & Wall Finishing",        start: "2026-10-01", end: "2026-11-15", person: "Bikash Thapa",       status: "Upcoming",    dependency: "Tiling",              type: "task" },
  { id: 23, task: "Landscaping & External Works",     start: "2026-10-15", end: "2026-12-15", person: "Sunita Maharjan",    status: "Upcoming",    dependency: "Envelope Complete",    type: "task" },
  { id: 24, task: "Parking & Road Finishing",         start: "2026-11-01", end: "2026-12-20", person: "Nabin Shrestha",     status: "Upcoming",    dependency: "Landscaping",         type: "task" },
  { id: 25, task: "Final MEP Testing & Commissioning",start: "2026-11-15", end: "2026-12-30", person: "David Rai",          status: "Upcoming",    dependency: "MEP Fit-Out",         type: "task" },
  { id: 26, task: "Interior Handover Ready",           start: "2026-11-16", end: "2026-11-16", person: "Ramesh Sharma",      status: "Upcoming",    dependency: "Painting",            type: "milestone" },
  { id: 27, task: "Punch List & Snag Rectification",  start: "2027-01-01", end: "2027-02-15", person: "Anita KC",           status: "Upcoming",    dependency: "Testing",             type: "task" },
  { id: 28, task: "Occupancy Certificate Obtained",    start: "2027-02-16", end: "2027-02-16", person: "Ramesh Sharma",      status: "Upcoming",    dependency: "Punch List",          type: "milestone" },
  { id: 29, task: "Client Handover & Documentation",  start: "2027-02-17", end: "2027-03-15", person: "Ramesh Sharma",      status: "Upcoming",    dependency: "OC",                  type: "task" },
  { id: 30, task: "Project Completion",                start: "2027-03-15", end: "2027-03-15", person: "Ramesh Sharma",      status: "Upcoming",    dependency: "Handover",            type: "milestone" },
];

export const SCHEDULE_PROJECT = "Kathmandu Business Park";
export const SCHEDULE_TIMELINE_START = new Date("2026-01-01");
export const SCHEDULE_TIMELINE_END = new Date("2027-03-31");

// ── 8 Budget Entries (Kathmandu Business Park) ──
export const BUDGET_EXPENSES = [
  { id: 1, category: "Piling & Foundation",         planned: 72000000,  actual: 74500000 },
  { id: 2, category: "RCC Structural Frame",        planned: 118000000, actual: 105000000 },
  { id: 3, category: "MEP Systems (Elec/Plumb/HVAC)", planned: 68000000,  actual: 42000000 },
  { id: 4, category: "Curtain Wall & Facade",       planned: 54000000,  actual: 38000000 },
  { id: 5, category: "Interior Finishing",           planned: 46000000,  actual: 22000000 },
  { id: 6, category: "External Works & Landscaping", planned: 28000000,  actual: 8500000 },
  { id: 7, category: "Labour & Manpower",           planned: 62000000,  actual: 58000000 },
  { id: 8, category: "Equipment & Machinery Rental", planned: 32000000,  actual: 29500000 },
];

export const BUDGET_PROJECT = "Kathmandu Business Park";

// ── 10 Risk Records ──
export const RISKS = [
  { id: "R-001", title: "Foundation settlement on soft alluvial soil", description: "Geotechnical report shows compressible clay at 6m depth near Block B piling zone", probability: 4, impact: 5, mitigation: "Deep bored piles to bedrock; continuous settlement monitoring with tell-tales", owner: "Sita Gurung", status: "Mitigating" },
  { id: "R-002", title: "Steel rebar price escalation",               description: "Indian export duty changes may increase TMT bar prices by 18-22% in Q3", probability: 4, impact: 4, mitigation: "Lock in 6-month pricing with Himal Iron & Steel; pre-purchase 200 MT buffer stock", owner: "Prakash Adhikari", status: "Open" },
  { id: "R-003", title: "Monsoon work stoppage",                      description: "Jun-Aug heavy rainfall historically halts exterior concreting for 5-7 weeks per year", probability: 5, impact: 3, mitigation: "Accelerate exterior RCC to complete by May; deploy rain shelters for critical pours", owner: "Bikash Thapa", status: "Open" },
  { id: "R-004", title: "Skilled labour shortage during Dashain",     description: "Festival migration in Oct-Nov typically reduces workforce by 35-40%", probability: 4, impact: 3, mitigation: "Advance bonus disbursement; recruit backup crews from Terai region", owner: "Ramesh Sharma", status: "Open" },
  { id: "R-005", title: "Municipal permit renewal delay",             description: "KMC building permit extension pending for 3+ weeks; risk of stop-work order", probability: 3, impact: 5, mitigation: "Engage ward liaison; prepare all documentation; escalate to Chief Engineer", owner: "Ramesh Sharma", status: "Mitigating" },
  { id: "R-006", title: "Tower crane hydraulic failure",              description: "Crane #1 showing intermittent hydraulic pressure drops during heavy lifts", probability: 3, impact: 5, mitigation: "Weekly hydraulic fluid analysis; standby crane rental agreement with United Cranes", owner: "David Rai", status: "Mitigating" },
  { id: "R-007", title: "Concrete cube test failure",                 description: "Two batches from Batch Plant B failed 28-day compressive strength (< 25 MPa)", probability: 2, impact: 4, mitigation: "Core testing on placed concrete; switch to alternate RMC supplier; increase QC frequency", owner: "Anita KC", status: "Closed" },
  { id: "R-008", title: "Adjacent building excavation impact",        description: "Deep excavation may cause settlement in neighbouring Kumari Complex foundation", probability: 3, impact: 4, mitigation: "Install inclinometers; sheet pile support; weekly crack monitoring on adjacent structure", owner: "Sita Gurung", status: "Open" },
  { id: "R-009", title: "Electrical load miscalculation",             description: "Preliminary load analysis for HVAC may exceed Nepal Electricity Authority sanctioned load", probability: 2, impact: 3, mitigation: "Conduct detailed load audit; apply for enhanced power connection; plan for backup DG set", owner: "David Rai", status: "Open" },
  { id: "R-010", title: "Design change — client scope creep",         description: "Client requesting additional mezzanine floor not in original contract", probability: 3, impact: 3, mitigation: "Issue formal variation order; assess structural implications; negotiate revised timeline & cost", owner: "Ramesh Sharma", status: "Open" },
];

// ── 10 Document Records ──
export const DOCUMENTS = [
  { id: 1,  name: "KBP - Architectural Floor Plans (All Levels).dwg", category: "Drawings",         ext: "dwg",  size: 8400,  uploadedBy: "Sunita Maharjan",   date: "2026-03-10" },
  { id: 2,  name: "Structural Design Report - Block A.pdf",           category: "Reports",           ext: "pdf",  size: 3200,  uploadedBy: "Sita Gurung",       date: "2026-03-25" },
  { id: 3,  name: "Main Contractor Agreement - HCG.pdf",              category: "Contracts",         ext: "pdf",  size: 1450,  uploadedBy: "Ramesh Sharma",     date: "2025-12-15" },
  { id: 4,  name: "Bill of Quantities - Foundation Phase.xlsx",        category: "BOQ",               ext: "xlsx", size: 920,   uploadedBy: "Prakash Adhikari",  date: "2026-01-20" },
  { id: 5,  name: "KMC Building Permit - 2026.pdf",                   category: "Permits",           ext: "pdf",  size: 680,   uploadedBy: "Ramesh Sharma",     date: "2026-01-05" },
  { id: 6,  name: "Weekly Safety Inspection Report - W15.docx",       category: "Safety Documents",  ext: "docx", size: 380,   uploadedBy: "Anita KC",          date: "2026-04-12" },
  { id: 7,  name: "MEP Coordination Drawing - Level 2.dwg",           category: "Drawings",         ext: "dwg",  size: 5600,  uploadedBy: "David Rai",         date: "2026-04-05" },
  { id: 8,  name: "Subcontractor Agreement - Piling Works.pdf",       category: "Contracts",         ext: "pdf",  size: 1100,  uploadedBy: "Ramesh Sharma",     date: "2026-02-01" },
  { id: 9,  name: "Environmental Clearance Certificate.pdf",          category: "Permits",           ext: "pdf",  size: 520,   uploadedBy: "Ramesh Sharma",     date: "2025-11-28" },
  { id: 10, name: "Monthly Progress Report - March 2026.pdf",         category: "Reports",           ext: "pdf",  size: 2100,  uploadedBy: "Ramesh Sharma",     date: "2026-04-03" },
];

// ── Reports Data ──
export const REPORT_PROGRESS = [
  { project: "Kathmandu Business Park",        planned: 65, actual: 62, status: "In Progress" },
  { project: "Pokhara Lakeside Hotel",          planned: 42, actual: 38, status: "In Progress" },
  { project: "Bharatpur Ring Road Flyover",     planned: 78, actual: 75, status: "In Progress" },
  { project: "Chitwan Medical College",         planned: 15, actual: 12, status: "Planning" },
  { project: "Biratnagar Industrial Warehouse", planned: 88, actual: 85, status: "On Hold" },
];

export const REPORT_BUDGET = [
  { project: "Kathmandu Business Park",        allocated: 480000000, spent: 377500000 },
  { project: "Pokhara Lakeside Hotel",          allocated: 320000000, spent: 121600000 },
  { project: "Bharatpur Ring Road Flyover",     allocated: 850000000, spent: 637500000 },
  { project: "Chitwan Medical College",         allocated: 620000000, spent: 74400000 },
  { project: "Biratnagar Industrial Warehouse", allocated: 180000000, spent: 153000000 },
];

export const REPORT_RISKS = [
  { level: "Critical", count: 2, color: "#e53935" },
  { level: "High",     count: 4, color: "#f57f17" },
  { level: "Medium",   count: 3, color: "#2e7d32" },
  { level: "Low",      count: 1, color: "#42a5f5" },
];

export const REPORT_DELAYED_TASKS = [
  { task: "Elevator shaft steel procurement",     project: "Kathmandu Business Park",        assignee: "Prakash Adhikari", due: "2026-04-08", daysLate: 10 },
  { task: "Foundation pile load test",             project: "Pokhara Lakeside Hotel",         assignee: "Sita Gurung",      due: "2026-04-05", daysLate: 13 },
  { task: "Asphalt overlay - Sector 3",           project: "Bharatpur Ring Road Flyover",    assignee: "Bikash Thapa",     due: "2026-04-10", daysLate: 8 },
  { task: "EIA report submission",                project: "Chitwan Medical College",         assignee: "Ramesh Sharma",    due: "2026-04-12", daysLate: 6 },
  { task: "Rooftop waterproofing remediation",    project: "Biratnagar Industrial Warehouse", assignee: "Bikash Thapa",    due: "2026-04-02", daysLate: 16 },
  { task: "MEP coordination drawing sign-off",    project: "Kathmandu Business Park",        assignee: "David Rai",        due: "2026-04-14", daysLate: 4 },
  { task: "Traffic diversion barrier installation",project: "Bharatpur Ring Road Flyover",   assignee: "Anita KC",         due: "2026-04-11", daysLate: 7 },
];

export const REPORT_SAFETY_INCIDENTS = [
  { id: "SI-001", date: "2026-03-18", project: "Kathmandu Business Park",     type: "Near Miss",        description: "Unsecured scaffolding plank fell from Level 5 during high winds",            severity: "High",   actionTaken: "All scaffolding re-inspected; wind speed protocol updated" },
  { id: "SI-002", date: "2026-03-25", project: "Bharatpur Ring Road Flyover", type: "Minor Injury",     description: "Worker sustained laceration from rebar tie wire",                             severity: "Low",    actionTaken: "First aid administered; cut-resistant gloves mandated" },
  { id: "SI-003", date: "2026-04-02", project: "Kathmandu Business Park",     type: "Equipment Damage", description: "Concrete pump boom hose burst during basement pour",                          severity: "Medium", actionTaken: "Hose replaced; maintenance intervals reduced to weekly" },
  { id: "SI-004", date: "2026-04-06", project: "Pokhara Lakeside Hotel",      type: "Near Miss",        description: "Excavator bucket struck underground electrical cable",                        severity: "High",   actionTaken: "GPR survey conducted; all utilities marked before digging" },
  { id: "SI-005", date: "2026-04-10", project: "Bharatpur Ring Road Flyover", type: "PPE Violation",    description: "4 workers operating without safety harness on bridge deck edge",              severity: "Medium", actionTaken: "Warning issued; mandatory harness checkpoint at access ladder" },
  { id: "SI-006", date: "2026-04-12", project: "Kathmandu Business Park",     type: "Minor Injury",     description: "Carpenter hit thumb with framing hammer",                                     severity: "Low",    actionTaken: "First aid applied; tool safety refresher conducted" },
  { id: "SI-007", date: "2026-04-15", project: "Biratnagar Industrial Warehouse", type: "Fire Hazard", description: "Welding sparks ignited debris near stored timber",                            severity: "High",   actionTaken: "Fire extinguished immediately; hot work permit procedure enforced" },
];

export const REPORT_MONTHLY_COMPLETION = [
  { month: "Nov",  planned: 45, actual: 42 },
  { month: "Dec",  planned: 55, actual: 50 },
  { month: "Jan",  planned: 68, actual: 65 },
  { month: "Feb",  planned: 78, actual: 72 },
  { month: "Mar",  planned: 88, actual: 80 },
  { month: "Apr",  planned: 65, actual: 58 },
];

// ── S-Curve & EVM Data (per-project monthly cumulative data) ──
// PV = Planned Value (cumulative budgeted cost of scheduled work)
// EV = Earned Value (cumulative budgeted cost of completed work)
// AC = Actual Cost (cumulative actual cost of completed work)
// plannedPct / actualPct = cumulative progress percentage for S-Curve
export const EVM_DATA = {
  "Kathmandu Business Park": {
    BAC: 480000000,
    months: [
      { month: "Aug 25", plannedPct: 2,  actualPct: 1,  PV: 9600000,   EV: 4800000,   AC: 5200000 },
      { month: "Sep 25", plannedPct: 5,  actualPct: 4,  PV: 24000000,  EV: 19200000,  AC: 20800000 },
      { month: "Oct 25", plannedPct: 9,  actualPct: 8,  PV: 43200000,  EV: 38400000,  AC: 41000000 },
      { month: "Nov 25", plannedPct: 14, actualPct: 12, PV: 67200000,  EV: 57600000,  AC: 62500000 },
      { month: "Dec 25", plannedPct: 20, actualPct: 18, PV: 96000000,  EV: 86400000,  AC: 93000000 },
      { month: "Jan 26", plannedPct: 27, actualPct: 25, PV: 129600000, EV: 120000000, AC: 128000000 },
      { month: "Feb 26", plannedPct: 35, actualPct: 32, PV: 168000000, EV: 153600000, AC: 165000000 },
      { month: "Mar 26", plannedPct: 44, actualPct: 40, PV: 211200000, EV: 192000000, AC: 210000000 },
      { month: "Apr 26", plannedPct: 53, actualPct: 48, PV: 254400000, EV: 230400000, AC: 252000000 },
      { month: "May 26", plannedPct: 62, actualPct: 56, PV: 297600000, EV: 268800000, AC: 296000000 },
      { month: "Jun 26", plannedPct: 70, actualPct: 62, PV: 336000000, EV: 297600000, AC: 332000000 },
      { month: "Jul 26", plannedPct: 77, actualPct: 0,  PV: 369600000, EV: 0,         AC: 0 },
      { month: "Aug 26", plannedPct: 83, actualPct: 0,  PV: 398400000, EV: 0,         AC: 0 },
      { month: "Sep 26", plannedPct: 88, actualPct: 0,  PV: 422400000, EV: 0,         AC: 0 },
      { month: "Oct 26", plannedPct: 92, actualPct: 0,  PV: 441600000, EV: 0,         AC: 0 },
      { month: "Nov 26", plannedPct: 95, actualPct: 0,  PV: 456000000, EV: 0,         AC: 0 },
      { month: "Dec 26", plannedPct: 97, actualPct: 0,  PV: 465600000, EV: 0,         AC: 0 },
      { month: "Jan 27", plannedPct: 99, actualPct: 0,  PV: 475200000, EV: 0,         AC: 0 },
      { month: "Feb 27", plannedPct: 100,actualPct: 0,  PV: 480000000, EV: 0,         AC: 0 },
    ],
  },
  "Pokhara Lakeside Hotel": {
    BAC: 320000000,
    months: [
      { month: "Nov 25", plannedPct: 2,  actualPct: 1,  PV: 6400000,   EV: 3200000,   AC: 3800000 },
      { month: "Dec 25", plannedPct: 5,  actualPct: 4,  PV: 16000000,  EV: 12800000,  AC: 14200000 },
      { month: "Jan 26", plannedPct: 9,  actualPct: 7,  PV: 28800000,  EV: 22400000,  AC: 25000000 },
      { month: "Feb 26", plannedPct: 15, actualPct: 13, PV: 48000000,  EV: 41600000,  AC: 44500000 },
      { month: "Mar 26", plannedPct: 22, actualPct: 19, PV: 70400000,  EV: 60800000,  AC: 65000000 },
      { month: "Apr 26", plannedPct: 30, actualPct: 26, PV: 96000000,  EV: 83200000,  AC: 90000000 },
      { month: "May 26", plannedPct: 38, actualPct: 33, PV: 121600000, EV: 105600000, AC: 115000000 },
      { month: "Jun 26", plannedPct: 42, actualPct: 38, PV: 134400000, EV: 121600000, AC: 121600000 },
      { month: "Jul 26", plannedPct: 50, actualPct: 0,  PV: 160000000, EV: 0,         AC: 0 },
      { month: "Aug 26", plannedPct: 58, actualPct: 0,  PV: 185600000, EV: 0,         AC: 0 },
      { month: "Sep 26", plannedPct: 66, actualPct: 0,  PV: 211200000, EV: 0,         AC: 0 },
      { month: "Oct 26", plannedPct: 74, actualPct: 0,  PV: 236800000, EV: 0,         AC: 0 },
      { month: "Nov 26", plannedPct: 82, actualPct: 0,  PV: 262400000, EV: 0,         AC: 0 },
      { month: "Dec 26", plannedPct: 89, actualPct: 0,  PV: 284800000, EV: 0,         AC: 0 },
      { month: "Jan 27", plannedPct: 94, actualPct: 0,  PV: 300800000, EV: 0,         AC: 0 },
      { month: "Feb 27", plannedPct: 97, actualPct: 0,  PV: 310400000, EV: 0,         AC: 0 },
      { month: "Mar 27", plannedPct: 99, actualPct: 0,  PV: 316800000, EV: 0,         AC: 0 },
      { month: "Apr 27", plannedPct: 100,actualPct: 0,  PV: 320000000, EV: 0,         AC: 0 },
    ],
  },
  "Bharatpur Ring Road Flyover": {
    BAC: 850000000,
    months: [
      { month: "Mar 25", plannedPct: 3,  actualPct: 2,  PV: 25500000,  EV: 17000000,  AC: 19000000 },
      { month: "Apr 25", plannedPct: 7,  actualPct: 6,  PV: 59500000,  EV: 51000000,  AC: 54000000 },
      { month: "May 25", plannedPct: 12, actualPct: 11, PV: 102000000, EV: 93500000,  AC: 97000000 },
      { month: "Jun 25", plannedPct: 18, actualPct: 16, PV: 153000000, EV: 136000000, AC: 142000000 },
      { month: "Jul 25", plannedPct: 24, actualPct: 22, PV: 204000000, EV: 187000000, AC: 195000000 },
      { month: "Aug 25", plannedPct: 31, actualPct: 28, PV: 263500000, EV: 238000000, AC: 248000000 },
      { month: "Sep 25", plannedPct: 38, actualPct: 35, PV: 323000000, EV: 297500000, AC: 310000000 },
      { month: "Oct 25", plannedPct: 46, actualPct: 43, PV: 391000000, EV: 365500000, AC: 378000000 },
      { month: "Nov 25", plannedPct: 53, actualPct: 50, PV: 450500000, EV: 425000000, AC: 440000000 },
      { month: "Dec 25", plannedPct: 60, actualPct: 57, PV: 510000000, EV: 484500000, AC: 502000000 },
      { month: "Jan 26", plannedPct: 66, actualPct: 63, PV: 561000000, EV: 535500000, AC: 555000000 },
      { month: "Feb 26", plannedPct: 72, actualPct: 68, PV: 612000000, EV: 578000000, AC: 600000000 },
      { month: "Mar 26", plannedPct: 78, actualPct: 75, PV: 663000000, EV: 637500000, AC: 637500000 },
      { month: "Apr 26", plannedPct: 84, actualPct: 0,  PV: 714000000, EV: 0,         AC: 0 },
      { month: "May 26", plannedPct: 89, actualPct: 0,  PV: 756500000, EV: 0,         AC: 0 },
      { month: "Jun 26", plannedPct: 93, actualPct: 0,  PV: 790500000, EV: 0,         AC: 0 },
      { month: "Jul 26", plannedPct: 96, actualPct: 0,  PV: 816000000, EV: 0,         AC: 0 },
      { month: "Aug 26", plannedPct: 98, actualPct: 0,  PV: 833000000, EV: 0,         AC: 0 },
      { month: "Sep 26", plannedPct: 99, actualPct: 0,  PV: 841500000, EV: 0,         AC: 0 },
      { month: "Oct 26", plannedPct: 100,actualPct: 0,  PV: 850000000, EV: 0,         AC: 0 },
    ],
  },
  "Chitwan Medical College": {
    BAC: 620000000,
    months: [
      { month: "Feb 26", plannedPct: 2,  actualPct: 1,  PV: 12400000,  EV: 6200000,   AC: 7500000 },
      { month: "Mar 26", plannedPct: 5,  actualPct: 4,  PV: 31000000,  EV: 24800000,  AC: 28000000 },
      { month: "Apr 26", plannedPct: 9,  actualPct: 7,  PV: 55800000,  EV: 43400000,  AC: 48000000 },
      { month: "May 26", plannedPct: 13, actualPct: 12, PV: 80600000,  EV: 74400000,  AC: 74400000 },
      { month: "Jun 26", plannedPct: 18, actualPct: 0,  PV: 111600000, EV: 0,         AC: 0 },
      { month: "Jul 26", plannedPct: 24, actualPct: 0,  PV: 148800000, EV: 0,         AC: 0 },
    ],
  },
  "Biratnagar Industrial Warehouse": {
    BAC: 180000000,
    months: [
      { month: "Oct 24", plannedPct: 4,  actualPct: 3,  PV: 7200000,   EV: 5400000,   AC: 6000000 },
      { month: "Nov 24", plannedPct: 10, actualPct: 9,  PV: 18000000,  EV: 16200000,  AC: 17500000 },
      { month: "Dec 24", plannedPct: 18, actualPct: 17, PV: 32400000,  EV: 30600000,  AC: 32000000 },
      { month: "Jan 25", plannedPct: 27, actualPct: 26, PV: 48600000,  EV: 46800000,  AC: 48000000 },
      { month: "Feb 25", plannedPct: 37, actualPct: 35, PV: 66600000,  EV: 63000000,  AC: 65000000 },
      { month: "Mar 25", plannedPct: 47, actualPct: 45, PV: 84600000,  EV: 81000000,  AC: 83000000 },
      { month: "Apr 25", plannedPct: 56, actualPct: 54, PV: 100800000, EV: 97200000,  AC: 99000000 },
      { month: "May 25", plannedPct: 65, actualPct: 63, PV: 117000000, EV: 113400000, AC: 115000000 },
      { month: "Jun 25", plannedPct: 73, actualPct: 71, PV: 131400000, EV: 127800000, AC: 130000000 },
      { month: "Jul 25", plannedPct: 80, actualPct: 78, PV: 144000000, EV: 140400000, AC: 142000000 },
      { month: "Aug 25", plannedPct: 85, actualPct: 82, PV: 153000000, EV: 147600000, AC: 150000000 },
      { month: "Sep 25", plannedPct: 89, actualPct: 85, PV: 160200000, EV: 153000000, AC: 153000000 },
      { month: "Oct 25", plannedPct: 92, actualPct: 0,  PV: 165600000, EV: 0,         AC: 0 },
      { month: "Nov 25", plannedPct: 95, actualPct: 0,  PV: 171000000, EV: 0,         AC: 0 },
      { month: "Dec 25", plannedPct: 97, actualPct: 0,  PV: 174600000, EV: 0,         AC: 0 },
      { month: "Jan 26", plannedPct: 99, actualPct: 0,  PV: 178200000, EV: 0,         AC: 0 },
      { month: "Feb 26", plannedPct: 100,actualPct: 0,  PV: 180000000, EV: 0,         AC: 0 },
    ],
  },
};

// ── Dashboard Stats ──
export const DASHBOARD_STATS = [
  { icon: "\u{1F3D7}", color: "green", value: "5",          label: "Total Projects" },
  { icon: "\u{1F4CB}", color: "blue",  value: "20",         label: "Active Tasks" },
  { icon: "\u23F0",    color: "red",   value: "7",          label: "Delayed Tasks" },
  { icon: "\u{1F4DD}", color: "amber", value: "10",         label: "Open Risks" },
  { icon: "\u{1F4B0}", color: "green", value: "\u0930\u0942 245 Cr", label: "Total Budget" },
  { icon: "\u{1F6E1}", color: "blue",  value: "7",          label: "Safety Incidents" },
];

export const DASHBOARD_ACTIVITIES = [
  { color: "green", person: "Sita Gurung",      action: "approved pile load test results for Pokhara Lakeside Hotel",           time: "15 minutes ago" },
  { color: "blue",  person: "Bikash Thapa",      action: "completed basement retaining wall pour at Kathmandu Business Park",   time: "2 hours ago" },
  { color: "amber", person: "Prakash Adhikari",  action: "flagged steel rebar price increase — variance report updated",        time: "4 hours ago" },
  { color: "red",   person: "System",            action: "detected 3 overdue tasks in Bharatpur Ring Road Flyover",             time: "6 hours ago" },
  { color: "green", person: "Anita KC",          action: "uploaded weekly safety inspection report for KBP",                    time: "Yesterday" },
  { color: "blue",  person: "Ramesh Sharma",     action: "submitted municipal permit renewal application",                      time: "Yesterday" },
];
