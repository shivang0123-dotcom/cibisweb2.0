import { NextResponse } from "next/server";
import { isStaffRequest } from "@/lib/admin-auth";
import { getSupabaseServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type CategoryRevenue = {
  category: string;
  revenue: number;
  percentage: number;
};

export async function GET() {
  if (!(await isStaffRequest())) {
    return NextResponse.json({ error: "Staff access required." }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ categories: [] });
  }

  // Get current month's served orders
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const { data, error } = await supabase
    .from("orders")
    .select("items, total_cents")
    .eq("status", "served")
    .gte("created_at", monthStart)
    .lte("created_at", monthEnd);

  if (error || !data) {
    console.error("[analytics/categories] Supabase SELECT error:", error);
    return NextResponse.json({ categories: [] });
  }

  // Group revenue by category
  const categoryMap = new Map<string, number>();
  let totalRevenue = 0;

  for (const order of data as { items: Array<{ category: string; lineTotal?: number }>; total_cents: number }[]) {
    // Use lineTotal from items if available, otherwise estimate by category
    if (Array.isArray(order.items) && order.items.length > 0) {
      for (const item of order.items) {
        if (item.category && item.lineTotal) {
          categoryMap.set(item.category, (categoryMap.get(item.category) ?? 0) + item.lineTotal);
          totalRevenue += item.lineTotal;
        }
      }
    }
  }

  // If no itemized data, fall back to distribution by item count
  if (totalRevenue === 0) {
    for (const order of data as { items: Array<{ category: string }>; total_cents: number }[]) {
      if (Array.isArray(order.items) && order.items.length > 0) {
        const revenuePerItem = (order.total_cents / 100) / order.items.length;
        for (const item of order.items) {
          if (item.category) {
            categoryMap.set(item.category, (categoryMap.get(item.category) ?? 0) + revenuePerItem);
            totalRevenue += revenuePerItem;
          }
        }
      }
    }
  }

  // Convert to array and calculate percentages
  const categories: CategoryRevenue[] = Array.from(categoryMap.entries())
    .map(([category, revenue]) => ({
      category,
      revenue: Math.round(revenue * 100) / 100,
      percentage: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return NextResponse.json({ categories, totalRevenue: Math.round(totalRevenue * 100) / 100 });
}
