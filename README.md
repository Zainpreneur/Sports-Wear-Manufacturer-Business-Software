# Apex Sportswear — Manufacturing & Operations Suite

A full-stack business management application for a sportswear manufacturer:
catalog & bill-of-materials, raw-material inventory, customers/suppliers,
sales orders, production (manufacturing) work orders, invoicing, and
role-based staff accounts — with a live KPI dashboard.

Built with **Next.js (App Router) + TypeScript + Prisma/SQLite + Tailwind CSS**,
using Server Actions as the backend (no separate API server to run).

## Features

- **Auth & roles** — email/password login, signed JWT session cookie
  (`jose`), bcrypt password hashing, three roles (Admin / Manager / Staff)
  with route- and action-level authorization.
- **Dashboard** — revenue trend, open orders, in-production count, low-stock
  alerts, production pipeline breakdown, recent orders.
- **Products** — catalog with categories, price/cost, size×color **variants**
  (each with its own stock + reorder level), and a **bill of materials**
  (raw materials consumed per unit, with estimated unit cost).
- **Raw materials (inventory)** — stock levels, reorder thresholds, supplier
  links, and an auditable stock-movement ledger (stock in/out with reason).
- **Customers & Suppliers** — CRM-lite records with order/material history;
  deletion is blocked while referenced by orders or materials.
- **Sales orders** — multi-line orders against products/variants, status
  workflow (Pending → Confirmed → In Production → Ready to Ship → Shipped →
  Delivered / Cancelled). Shipping an order automatically decrements
  finished-goods stock and logs the movement.
- **Production** — manufacturing work orders with stage (Cutting → Stitching
  → Printing → Quality Check → Packing → Completed) and status tracking,
  either generated from a sales order or created standalone.
- **Invoices** — generated from an order (8% tax), with payment-status
  tracking (Unpaid / Partially Paid / Paid / Overdue).
- **Employees** — admin-only staff management: roles, departments, password
  resets, activate/deactivate (with self-lockout guards).

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions, Turbopack) |
| Language | TypeScript |
| Database | SQLite via Prisma 7 (driver adapter: `@prisma/adapter-better-sqlite3`) — swap the datasource/adapter for Postgres in production |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Auth | Custom JWT session cookie (`jose`) + `bcryptjs`, following the [Next.js authentication guide](https://nextjs.org/docs/app/guides/authentication) |
| Validation | Zod |

## Getting started

```bash
npm install
cp .env.example .env          # then edit SESSION_SECRET for anything beyond local dev
npm run db:push               # create the SQLite schema
npm run db:seed               # load demo data
npm run dev                   # http://localhost:3000
```

Demo logins (from the seed data):

| Email | Password | Role |
|---|---|---|
| `admin@apexsportswear.test` | `admin123` | Admin |
| `manager@apexsportswear.test` | `manager123` | Manager |
| `staff@apexsportswear.test` | `staff123` | Staff |

Other useful scripts:

```bash
npm run build       # production build
npm run start       # run the production build
npm run db:studio   # Prisma Studio — browse/edit data visually
npm run db:reset    # wipe the SQLite db, re-push schema, reseed demo data
```

## Project structure

```
prisma/
  schema.prisma          # data model (SQLite; String fields stand in for enums)
  seed.ts                # demo data: users, suppliers, materials, products, orders
src/
  app/
    login/                # public login page
    (app)/                # authenticated app shell (sidebar + topbar)
      dashboard/
      products/  inventory/  customers/  suppliers/
      orders/    production/  invoices/   employees/
  components/             # shared UI (status badges, page header, charts, layout)
  lib/
    actions/              # "use server" mutations, one file per module
    queries/              # read-side data aggregation (e.g. dashboard KPIs)
    prisma.ts             # Prisma Client singleton (SQLite driver adapter)
    session.ts, dal.ts    # JWT session + auth/authorization helpers
    constants.ts          # canonical status/category value lists + labels
  proxy.ts                # optimistic auth redirect (Next 16's Proxy, formerly Middleware)
```

## Notes on the data model

SQLite has no native enum type, so status/role/category columns are plain
`String` fields; the allowed values and display labels live in
`src/lib/constants.ts` and are enforced by Zod in the server actions. This
also means the schema will work unmodified if you later point Prisma at
Postgres/MySQL and want to promote those to real enums.

Every mutation goes through a `"use server"` action in `src/lib/actions/`,
guarded by `requireSession()` / `requireRole()` from `src/lib/dal.ts` —
there is no unauthenticated write path.
