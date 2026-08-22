// Canonical value lists for fields that are plain Strings at the database
// level (SQLite has no native enum type — see prisma/schema.prisma).
// Keeping the allowed values here, rather than as Prisma enums, means the
// same schema will work unmodified if the app is later pointed at Postgres.

export const ROLES = ["ADMIN", "MANAGER", "STAFF"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  MANAGER: "Manager",
  STAFF: "Staff",
};

export const PRODUCT_CATEGORIES = [
  "Jersey",
  "Shorts",
  "Tracksuit",
  "Hoodie",
  "Compression Wear",
  "Team Kit",
  "Socks",
  "Accessories",
] as const;

export const RAW_MATERIAL_CATEGORIES = [
  "Fabric",
  "Thread",
  "Zipper",
  "Label",
  "Packaging",
  "Dye",
  "Trim",
] as const;

export const UNITS = ["meters", "kg", "pcs", "rolls", "yards", "liters"] as const;

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "IN_PRODUCTION",
  "READY_TO_SHIP",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  IN_PRODUCTION: "In Production",
  READY_TO_SHIP: "Ready to Ship",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const PRODUCTION_STAGES = [
  "CUTTING",
  "STITCHING",
  "PRINTING",
  "QUALITY_CHECK",
  "PACKING",
  "COMPLETED",
] as const;
export type ProductionStage = (typeof PRODUCTION_STAGES)[number];

export const PRODUCTION_STAGE_LABELS: Record<ProductionStage, string> = {
  CUTTING: "Cutting",
  STITCHING: "Stitching",
  PRINTING: "Printing",
  QUALITY_CHECK: "Quality Check",
  PACKING: "Packing",
  COMPLETED: "Completed",
};

export const PRODUCTION_STATUSES = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
  "ON_HOLD",
] as const;
export type ProductionStatus = (typeof PRODUCTION_STATUSES)[number];

export const PRODUCTION_STATUS_LABELS: Record<ProductionStatus, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
};

export const INVOICE_STATUSES = [
  "UNPAID",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  UNPAID: "Unpaid",
  PARTIALLY_PAID: "Partially Paid",
  PAID: "Paid",
  OVERDUE: "Overdue",
};

// Badge color tokens consumed by <StatusBadge> — kept centralized so every
// status pill in the app is styled consistently.
export const STATUS_TONE: Record<string, "neutral" | "info" | "warning" | "success" | "danger"> = {
  // order statuses
  PENDING: "neutral",
  CONFIRMED: "info",
  IN_PRODUCTION: "warning",
  READY_TO_SHIP: "info",
  SHIPPED: "info",
  DELIVERED: "success",
  CANCELLED: "danger",
  // production statuses
  NOT_STARTED: "neutral",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  ON_HOLD: "danger",
  // invoice statuses
  UNPAID: "warning",
  PARTIALLY_PAID: "info",
  PAID: "success",
  OVERDUE: "danger",
};
