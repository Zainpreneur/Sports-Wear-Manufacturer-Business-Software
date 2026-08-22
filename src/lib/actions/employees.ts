"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { ROLES } from "@/lib/constants";
import { isUniqueConstraintError } from "@/lib/db-errors";

const CreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(ROLES),
  department: z.string().optional(),
});

export async function createEmployee(formData: FormData) {
  await requireRole("ADMIN");
  const data = CreateSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    department: formData.get("department") || undefined,
  });

  const passwordHash = await bcrypt.hash(data.password, 10);
  try {
    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        department: data.department,
      },
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      redirect("/employees/new?error=duplicate-email");
    }
    throw err;
  }

  revalidatePath("/employees");
  redirect("/employees");
}

const UpdateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.enum(ROLES),
  department: z.string().optional(),
  password: z.string().min(6).optional().or(z.literal("")),
});

export async function updateEmployee(id: string, formData: FormData) {
  const session = await requireRole("ADMIN");
  const data = UpdateSchema.parse({
    name: formData.get("name"),
    role: formData.get("role"),
    department: formData.get("department") || undefined,
    password: formData.get("password") || "",
  });

  if (session.userId === id && data.role !== "ADMIN") {
    redirect("/employees?error=self-demote");
  }

  await prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      role: data.role,
      department: data.department,
      ...(data.password ? { passwordHash: await bcrypt.hash(data.password, 10) } : {}),
    },
  });

  revalidatePath("/employees");
  redirect("/employees");
}

export async function toggleEmployeeActive(id: string, active: boolean) {
  const session = await requireRole("ADMIN");
  if (session.userId === id) {
    redirect("/employees?error=self-deactivate");
  }
  await prisma.user.update({ where: { id }, data: { active } });
  revalidatePath("/employees");
}
