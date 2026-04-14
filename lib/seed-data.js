import { createId } from "@/lib/id";

export function generateSeedData() {
  const domainDefs = [
    { name: "Student Information", color: "#6366f1", description: "Core student records, enrollment, and demographics" },
    { name: "Learning Management", color: "#8b5cf6", description: "Course delivery, assignments, and digital curriculum" },
    { name: "Assessment", color: "#ef4444", description: "Testing, benchmarks, and formative assessment" },
    { name: "Communication", color: "#3b82f6", description: "Staff, student, and family communication channels" },
    { name: "Administration", color: "#64748b", description: "HR, scheduling, and operational management" },
    { name: "Device Management", color: "#06b6d4", description: "Endpoint management, inventory, and provisioning" },
    { name: "Data & Reporting", color: "#f97316", description: "Analytics, dashboards, and state reporting" },
    { name: "Compliance", color: "#ec4899", description: "FERPA, CIPA, and regulatory compliance" },
    { name: "Instruction", color: "#22c55e", description: "Classroom tools and instructional resources" },
    { name: "Finance", color: "#eab308", description: "Budgeting, purchasing, and financial management" },
  ];

  const domains = domainDefs.map((d, i) => ({
    id: createId(),
    name: d.name,
    color: d.color,
    description: d.description,
    position: i,
    createdAt: Date.now() - (domainDefs.length - i) * 60000,
  }));

  const domainByName = {};
  for (const d of domains) domainByName[d.name] = d.id;

  const systemDefs = [
    { name: "PowerSchool SIS", vendor: "PowerSchool", domains: ["Student Information", "Administration", "Compliance"], description: "Core student information system for enrollment, grades, and attendance" },
    { name: "Canvas LMS", vendor: "Instructure", domains: ["Learning Management", "Instruction", "Assessment"], description: "Learning management system for course delivery and assignments" },
    { name: "Google Workspace", vendor: "Google", domains: ["Communication", "Instruction", "Administration"], description: "Email, Drive, Docs, and collaboration suite" },
    { name: "Clever", vendor: "Clever", domains: ["Student Information", "Data & Reporting"], description: "SSO and rostering middleware for EdTech integrations" },
    { name: "NWEA MAP", vendor: "NWEA", domains: ["Assessment", "Data & Reporting"], description: "Adaptive assessment platform for reading and math benchmarks" },
    { name: "ParentSquare", vendor: "ParentSquare", domains: ["Communication"], description: "Unified family engagement and communication platform" },
    { name: "Jamf Pro", vendor: "Jamf", domains: ["Device Management"], description: "Apple device management for iPads and Macs" },
    { name: "GoGuardian", vendor: "GoGuardian", domains: ["Device Management", "Compliance", "Instruction"], description: "Web filtering, classroom management, and student safety" },
    { name: "Frontline", vendor: "Frontline Education", domains: ["Administration", "Finance", "Compliance"], description: "HR, absence management, and professional development" },
    { name: "Illuminate DnA", vendor: "Illuminate Education", domains: ["Assessment", "Data & Reporting", "Instruction"], description: "Assessment creation, data analysis, and reporting" },
    { name: "Schoology", vendor: "PowerSchool", domains: ["Learning Management", "Instruction"], description: "Learning management and curriculum platform" },
    { name: "Aeries", vendor: "Aeries Software", domains: ["Student Information", "Data & Reporting", "Compliance"], description: "Student information system with state reporting" },
    { name: "Zoom", vendor: "Zoom", domains: ["Communication", "Instruction"], description: "Video conferencing for virtual classes and meetings" },
    { name: "Munis", vendor: "Tyler Technologies", domains: ["Finance", "Administration"], description: "Enterprise financial management and ERP" },
    { name: "Securly", vendor: "Securly", domains: ["Device Management", "Compliance"], description: "Web filtering and student online safety monitoring" },
  ];

  const systems = systemDefs.map((s, i) => ({
    id: createId(),
    name: s.name,
    vendor: s.vendor,
    description: s.description,
    url: null,
    domainIds: s.domains.map((name) => domainByName[name]).filter(Boolean),
    createdAt: Date.now() - (systemDefs.length - i) * 30000,
  }));

  const systemByName = {};
  for (const s of systems) systemByName[s.name] = s.id;

  const connectionDefs = [
    { source: "PowerSchool SIS", target: "Canvas LMS", type: "feeds_into", note: "Student rosters sync nightly" },
    { source: "PowerSchool SIS", target: "Clever", type: "integrates_with", note: "Roster and demographic data via SFTP" },
    { source: "Clever", target: "Canvas LMS", type: "feeds_into", note: "SSO and roster provisioning" },
    { source: "Clever", target: "NWEA MAP", type: "feeds_into", note: "Student rostering" },
    { source: "Canvas LMS", target: "Google Workspace", type: "integrates_with", note: "Google Assignments LTI integration" },
    { source: "NWEA MAP", target: "Illuminate DnA", type: "feeds_into", note: "Assessment scores for analysis" },
    { source: "Canvas LMS", target: "Schoology", type: "overlaps_with", note: "Both serve as LMS" },
    { source: "GoGuardian", target: "Securly", type: "overlaps_with", note: "Both provide web filtering" },
    { source: "GoGuardian", target: "Jamf Pro", type: "depends_on", note: "Requires MDM enrollment" },
    { source: "Illuminate DnA", target: "PowerSchool SIS", type: "depends_on", note: "Pulls student demographics" },
    { source: "Frontline", target: "Munis", type: "integrates_with", note: "Payroll data exchange" },
    { source: "ParentSquare", target: "PowerSchool SIS", type: "depends_on", note: "Pulls family contact info" },
    { source: "PowerSchool SIS", target: "Aeries", type: "duplicates", note: "Evaluating migration from Aeries to PowerSchool" },
  ];

  const connections = connectionDefs.map((c) => ({
    id: createId(),
    sourceId: systemByName[c.source],
    targetId: systemByName[c.target],
    type: c.type,
    note: c.note,
    createdAt: Date.now(),
  })).filter((c) => c.sourceId && c.targetId);

  return { domains, systems, connections };
}
