import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  addMenuItem,
  getMenuState,
  permanentlyDeleteMenuItem,
  removeMenuItem,
  restoreMenuItem,
  updateMenuItem,
  updateWeeklyPlan,
} from "@/lib/menu-store";
import { categories, type MenuCategory, type MenuItem, type WeeklyMenuPlan } from "@/lib/menu";

export const dynamic = "force-dynamic";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  return NextResponse.json(await getMenuState());
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Partial<MenuItem>;
    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const category = (body.category ?? "Starters") as MenuCategory;
    const price = Number(body.price);

    if (!title || !description || !Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Title, description, and price are required." }, { status: 400 });
    }

    if (!categories.includes(category)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }

    const item: MenuItem = {
      id: `${slugify(title)}-${Date.now()}`,
      title,
      description,
      price,
      category,
      image:
        body.image ||
        "https://images.unsplash.com/photo-1498579397066-22750a3cb424?auto=format&fit=crop&w=900&q=80",
      tags: body.tags ?? [category.toLowerCase()],
      available: body.available ?? true,
      prepMinutes: Number(body.prepMinutes) || 15,
      recommended: body.recommended ?? false,
    };

    return NextResponse.json(await addMenuItem(item), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to add dish." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body.weeklyPlan) {
      return NextResponse.json(await updateWeeklyPlan(body.weeklyPlan as WeeklyMenuPlan));
    }

    if (!body.id) {
      return NextResponse.json({ error: "Missing dish id." }, { status: 400 });
    }

    // Restore a trashed dish back to the live menu.
    if (body.restore === true) {
      return NextResponse.json(await restoreMenuItem(String(body.id)));
    }

    const { id, ...patch } = body as Partial<MenuItem> & { id: string };
    return NextResponse.json(await updateMenuItem(id, patch));
  } catch {
    return NextResponse.json({ error: "Unable to update menu." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const permanent = searchParams.get("permanent") === "true";

  if (!id) {
    return NextResponse.json({ error: "Missing dish id." }, { status: 400 });
  }

  // permanent=true purges from Trash for good; otherwise it's a soft-delete.
  return NextResponse.json(
    permanent ? await permanentlyDeleteMenuItem(id) : await removeMenuItem(id),
  );
}
