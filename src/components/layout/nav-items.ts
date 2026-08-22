export type NavItem = {
  href: string;
  label: string;
  icon: string; // emoji glyph — keeps the shell dependency-free
  adminOnly?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/orders", label: "Sales Orders", icon: "🧾" },
  { href: "/production", label: "Production", icon: "🏭" },
  { href: "/products", label: "Products", icon: "👕" },
  { href: "/inventory", label: "Raw Materials", icon: "🧵" },
  { href: "/customers", label: "Customers", icon: "🤝" },
  { href: "/suppliers", label: "Suppliers", icon: "🚚" },
  { href: "/invoices", label: "Invoices", icon: "💵" },
  { href: "/employees", label: "Employees", icon: "🧑‍💼", adminOnly: true },
];
