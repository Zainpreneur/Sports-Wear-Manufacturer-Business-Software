import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Apex Sportswear demo data...");

  // --- Users --------------------------------------------------------
  const users = [
    { name: "Amelia Ortiz", email: "admin@apexsportswear.test", password: "admin123", role: "ADMIN", department: "Operations" },
    { name: "Marcus Chen", email: "manager@apexsportswear.test", password: "manager123", role: "MANAGER", department: "Production" },
    { name: "Priya Nair", email: "staff@apexsportswear.test", password: "staff123", role: "STAFF", department: "Warehouse" },
  ] as const;

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        passwordHash: await bcrypt.hash(u.password, 10),
        role: u.role,
        department: u.department,
      },
    });
  }

  // --- Suppliers ------------------------------------------------------
  const supplierData = [
    { name: "Textura Fabrics Ltd", contactName: "Wei Zhang", email: "sales@textura-fabrics.example", phone: "+86-21-5550-1122", country: "China" },
    { name: "ZipTech Trims Co", contactName: "Diego Ramirez", email: "orders@ziptech-trims.example", phone: "+52-55-5550-3344", country: "Mexico" },
    { name: "PrintWorks Supplies", contactName: "Hannah Fischer", email: "hello@printworks-supplies.example", phone: "+49-30-5550-7788", country: "Germany" },
  ];
  // Supplier.name has no unique constraint, so find-or-create instead of upsert.
  const [textura, ziptech, printworks] = await Promise.all(
    supplierData.map(async (s) => {
      const existing = await prisma.supplier.findFirst({ where: { name: s.name } });
      return existing ?? prisma.supplier.create({ data: s });
    })
  );

  // --- Raw Materials ----------------------------------------------------
  const materialDefs = [
    { name: "Polyester Performance Mesh", sku: "RM-FAB-001", category: "Fabric", unit: "meters", stockQty: 450, reorderLevel: 150, costPerUnit: 4.2, supplierId: textura.id },
    { name: "Moisture-Wick Interlock Fabric", sku: "RM-FAB-002", category: "Fabric", unit: "meters", stockQty: 90, reorderLevel: 120, costPerUnit: 5.8, supplierId: textura.id },
    { name: "Brushed Fleece Fabric", sku: "RM-FAB-003", category: "Fabric", unit: "meters", stockQty: 260, reorderLevel: 100, costPerUnit: 6.5, supplierId: textura.id },
    { name: "Elastic Waistband 3cm", sku: "RM-TRM-001", category: "Trim", unit: "meters", stockQty: 320, reorderLevel: 100, costPerUnit: 0.35, supplierId: ziptech.id },
    { name: "YKK Zipper 20cm", sku: "RM-ZIP-001", category: "Zipper", unit: "pcs", stockQty: 40, reorderLevel: 100, costPerUnit: 0.65, supplierId: ziptech.id },
    { name: "Woven Brand Label", sku: "RM-LBL-001", category: "Label", unit: "pcs", stockQty: 1200, reorderLevel: 300, costPerUnit: 0.08, supplierId: printworks.id },
    { name: "Polyester Sewing Thread", sku: "RM-THR-001", category: "Thread", unit: "rolls", stockQty: 75, reorderLevel: 25, costPerUnit: 2.1, supplierId: printworks.id },
    { name: "Recycled Poly Mailer Bag", sku: "RM-PKG-001", category: "Packaging", unit: "pcs", stockQty: 800, reorderLevel: 250, costPerUnit: 0.12, supplierId: printworks.id },
  ];
  const materials: Record<string, Awaited<ReturnType<typeof prisma.rawMaterial.create>>> = {};
  for (const m of materialDefs) {
    materials[m.sku] = await prisma.rawMaterial.upsert({
      where: { sku: m.sku },
      update: {},
      create: m,
    });
  }

  // --- Customers --------------------------------------------------------
  const customerDefs = [
    { name: "Jordan Blake", company: "Riverside FC", email: "jordan.blake@riversidefc.example", phone: "+1-312-555-0110", city: "Chicago", country: "USA" },
    { name: "Sofia Marin", company: "Coastal Basketball Academy", email: "sofia.marin@coastalhoops.example", phone: "+1-305-555-0199", city: "Miami", country: "USA" },
    { name: "Tom Bennett", company: "Summit Sports Retail", email: "tom@summitsportsretail.example", phone: "+44-20-5550-2211", city: "Manchester", country: "UK" },
    { name: "Ana Kovac", company: "Ironclad CrossFit Gym", email: "ana@ironcladcf.example", phone: "+385-1-555-0044", city: "Zagreb", country: "Croatia" },
  ];
  const customers = [];
  for (const c of customerDefs) {
    const existing = await prisma.customer.findFirst({ where: { email: c.email } });
    customers.push(existing ?? (await prisma.customer.create({ data: c })));
  }
  const [riverside, coastal, summit, ironclad] = customers;

  // --- Products + Variants + BOM ----------------------------------------
  type ProductDef = {
    name: string;
    sku: string;
    category: string;
    description: string;
    price: number;
    costPrice: number;
    variants: { size: string; color: string; stockQty: number; reorderLevel: number }[];
    bom: { sku: string; qtyPerUnit: number }[];
  };

  const productDefs: ProductDef[] = [
    {
      name: "Apex Performance Jersey",
      sku: "PRD-JER-001",
      category: "Jersey",
      description: "Lightweight moisture-wicking match jersey with mesh side panels.",
      price: 34.99,
      costPrice: 14.5,
      variants: [
        { size: "S", color: "Navy", stockQty: 40, reorderLevel: 20 },
        { size: "M", color: "Navy", stockQty: 8, reorderLevel: 20 },
        { size: "L", color: "Navy", stockQty: 55, reorderLevel: 20 },
        { size: "M", color: "Red", stockQty: 30, reorderLevel: 20 },
      ],
      bom: [
        { sku: "RM-FAB-002", qtyPerUnit: 1.2 },
        { sku: "RM-LBL-001", qtyPerUnit: 1 },
        { sku: "RM-THR-001", qtyPerUnit: 0.05 },
      ],
    },
    {
      name: "Apex Training Shorts",
      sku: "PRD-SHT-001",
      category: "Shorts",
      description: "Four-way stretch training shorts with elastic waistband.",
      price: 24.99,
      costPrice: 9.75,
      variants: [
        { size: "S", color: "Black", stockQty: 60, reorderLevel: 25 },
        { size: "M", color: "Black", stockQty: 18, reorderLevel: 25 },
        { size: "L", color: "Black", stockQty: 45, reorderLevel: 25 },
      ],
      bom: [
        { sku: "RM-FAB-001", qtyPerUnit: 0.8 },
        { sku: "RM-TRM-001", qtyPerUnit: 0.7 },
        { sku: "RM-THR-001", qtyPerUnit: 0.03 },
      ],
    },
    {
      name: "Storm Full-Zip Tracksuit",
      sku: "PRD-TRK-001",
      category: "Tracksuit",
      description: "Full-zip warmup tracksuit set for pre-match and travel.",
      price: 64.99,
      costPrice: 27.0,
      variants: [
        { size: "M", color: "Charcoal", stockQty: 22, reorderLevel: 15 },
        { size: "L", color: "Charcoal", stockQty: 6, reorderLevel: 15 },
        { size: "XL", color: "Charcoal", stockQty: 14, reorderLevel: 15 },
      ],
      bom: [
        { sku: "RM-FAB-003", qtyPerUnit: 2.4 },
        { sku: "RM-ZIP-001", qtyPerUnit: 1 },
        { sku: "RM-LBL-001", qtyPerUnit: 1 },
        { sku: "RM-THR-001", qtyPerUnit: 0.08 },
      ],
    },
    {
      name: "Summit Pullover Hoodie",
      sku: "PRD-HOD-001",
      category: "Hoodie",
      description: "Brushed fleece pullover hoodie for team travel wear.",
      price: 44.99,
      costPrice: 18.25,
      variants: [
        { size: "S", color: "Grey", stockQty: 25, reorderLevel: 15 },
        { size: "M", color: "Grey", stockQty: 25, reorderLevel: 15 },
        { size: "L", color: "Grey", stockQty: 12, reorderLevel: 15 },
      ],
      bom: [
        { sku: "RM-FAB-003", qtyPerUnit: 1.6 },
        { sku: "RM-LBL-001", qtyPerUnit: 1 },
        { sku: "RM-THR-001", qtyPerUnit: 0.06 },
      ],
    },
    {
      name: "Core Compression Base Layer",
      sku: "PRD-CMP-001",
      category: "Compression Wear",
      description: "Second-skin compression top for layering in cold conditions.",
      price: 29.99,
      costPrice: 11.0,
      variants: [
        { size: "S", color: "Black", stockQty: 35, reorderLevel: 20 },
        { size: "M", color: "Black", stockQty: 35, reorderLevel: 20 },
      ],
      bom: [
        { sku: "RM-FAB-002", qtyPerUnit: 0.9 },
        { sku: "RM-THR-001", qtyPerUnit: 0.04 },
      ],
    },
  ];

  const products: Record<string, Awaited<ReturnType<typeof prisma.product.create>>> = {};
  const variants: Record<string, { id: string }> = {};

  for (const p of productDefs) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        name: p.name,
        sku: p.sku,
        category: p.category,
        description: p.description,
        price: p.price,
        costPrice: p.costPrice,
      },
    });
    products[p.sku] = product;

    for (const v of p.variants) {
      const variantSku = `${p.sku}-${v.size}-${v.color.slice(0, 3).toUpperCase()}`;
      const variant = await prisma.productVariant.upsert({
        where: { sku: variantSku },
        update: {},
        create: {
          productId: product.id,
          size: v.size,
          color: v.color,
          sku: variantSku,
          stockQty: v.stockQty,
          reorderLevel: v.reorderLevel,
        },
      });
      variants[variantSku] = variant;
    }

    for (const b of p.bom) {
      await prisma.bomItem.upsert({
        where: { productId_rawMaterialId: { productId: product.id, rawMaterialId: materials[b.sku].id } },
        update: { qtyPerUnit: b.qtyPerUnit },
        create: { productId: product.id, rawMaterialId: materials[b.sku].id, qtyPerUnit: b.qtyPerUnit },
      });
    }
  }

  // --- Sales Orders + Items ---------------------------------------------
  const existingOrderCount = await prisma.salesOrder.count();
  if (existingOrderCount === 0) {
    const jersey = products["PRD-JER-001"];
    const shorts = products["PRD-SHT-001"];
    const tracksuit = products["PRD-TRK-001"];
    const hoodie = products["PRD-HOD-001"];

    const order1 = await prisma.salesOrder.create({
      data: {
        orderNumber: "SO-2026-0001",
        customerId: riverside.id,
        status: "DELIVERED",
        orderDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        items: {
          create: [
            { productId: jersey.id, variantId: variants["PRD-JER-001-L-NAV"].id, quantity: 40, unitPrice: 34.99 },
            { productId: shorts.id, variantId: variants["PRD-SHT-001-L-BLA"].id, quantity: 40, unitPrice: 24.99 },
          ],
        },
      },
    });
    await prisma.invoice.create({
      data: {
        invoiceNumber: "INV-2026-0001",
        orderId: order1.id,
        amount: 40 * 34.99 + 40 * 24.99,
        tax: Math.round((40 * 34.99 + 40 * 24.99) * 0.08 * 100) / 100,
        totalAmount: Math.round((40 * 34.99 + 40 * 24.99) * 1.08 * 100) / 100,
        status: "PAID",
        issueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        paidDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
    });

    const order2 = await prisma.salesOrder.create({
      data: {
        orderNumber: "SO-2026-0002",
        customerId: coastal.id,
        status: "IN_PRODUCTION",
        orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        items: {
          create: [
            { productId: tracksuit.id, variantId: variants["PRD-TRK-001-L-CHA"].id, quantity: 25, unitPrice: 64.99 },
          ],
        },
      },
    });
    await prisma.productionOrder.create({
      data: {
        productionNumber: "PO-2026-0001",
        salesOrderId: order2.id,
        productName: "Storm Full-Zip Tracksuit (L, Charcoal) x25",
        quantity: 25,
        stage: "STITCHING",
        status: "IN_PROGRESS",
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });

    const order3 = await prisma.salesOrder.create({
      data: {
        orderNumber: "SO-2026-0003",
        customerId: summit.id,
        status: "CONFIRMED",
        orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        items: {
          create: [
            { productId: hoodie.id, variantId: variants["PRD-HOD-001-M-GRE"].id, quantity: 30, unitPrice: 44.99 },
            { productId: jersey.id, variantId: variants["PRD-JER-001-M-RED"].id, quantity: 20, unitPrice: 34.99 },
          ],
        },
      },
    });
    await prisma.invoice.create({
      data: {
        invoiceNumber: "INV-2026-0002",
        orderId: order3.id,
        amount: 30 * 44.99 + 20 * 34.99,
        tax: Math.round((30 * 44.99 + 20 * 34.99) * 0.08 * 100) / 100,
        totalAmount: Math.round((30 * 44.99 + 20 * 34.99) * 1.08 * 100) / 100,
        status: "UNPAID",
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.salesOrder.create({
      data: {
        orderNumber: "SO-2026-0004",
        customerId: ironclad.id,
        status: "PENDING",
        orderDate: new Date(),
        items: {
          create: [
            { productId: jersey.id, variantId: variants["PRD-JER-001-M-NAV"].id, quantity: 15, unitPrice: 34.99 },
          ],
        },
      },
    });
  }

  console.log("Seed complete.");
  console.log("Login with: admin@apexsportswear.test / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
