export const CONNECTION_TYPES = [
  {
    value: "integrates_with",
    label: "Integrates with",
    inverseLabel: "Integrates with",
    description: "Data flows between them via API or sync",
    directional: false,
    color: "#3b82f6",
  },
  {
    value: "depends_on",
    label: "Depends on",
    inverseLabel: "Depended on by",
    description: "Requires this system to function",
    directional: true,
    color: "#f97316",
  },
  {
    value: "feeds_into",
    label: "Feeds into",
    inverseLabel: "Fed by",
    description: "Sends data one-way to this system",
    directional: true,
    color: "#22c55e",
  },
  {
    value: "overlaps_with",
    label: "Overlaps with",
    inverseLabel: "Overlaps with",
    description: "Functional overlap or redundancy",
    directional: false,
    color: "#8b5cf6",
  },
  {
    value: "duplicates",
    label: "Duplicates",
    inverseLabel: "Duplicated by",
    description: "Effectively the same capability",
    directional: false,
    color: "#ef4444",
  },
  {
    value: "replaces",
    label: "Replaces",
    inverseLabel: "Replaced by",
    description: "Is replacing this system (migration)",
    directional: true,
    color: "#eab308",
  },
];

export function getConnectionType(value) {
  return CONNECTION_TYPES.find((t) => t.value === value);
}

export function getConnectionLabel(type, isSource) {
  const ct = getConnectionType(type);
  if (!ct) return type;
  return isSource ? ct.label : ct.inverseLabel;
}

export const DOMAIN_COLORS = [
  { value: "#6366f1", label: "Indigo" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#a855f7", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#ef4444", label: "Red" },
  { value: "#f97316", label: "Orange" },
  { value: "#eab308", label: "Yellow" },
  { value: "#22c55e", label: "Green" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#64748b", label: "Slate" },
];

export const DEFAULT_DOMAINS = [
  { name: "Student Information", color: "#6366f1" },
  { name: "Learning Management", color: "#8b5cf6" },
  { name: "Assessment", color: "#ef4444" },
  { name: "Communication", color: "#3b82f6" },
  { name: "Administration", color: "#64748b" },
  { name: "Device Management", color: "#06b6d4" },
  { name: "Data & Reporting", color: "#f97316" },
  { name: "Compliance", color: "#ec4899" },
  { name: "Instruction", color: "#22c55e" },
  { name: "Finance", color: "#eab308" },
];
