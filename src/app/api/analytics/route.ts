import { NextResponse } from "next/server";
import { isStaffRequest } from "@/lib/admin-auth";
import { getSupabaseServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type RevenuePoint = { label: string; revenue: number };

const DOW_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_LABELS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function GET() {
  if (!(await isStaffRequest())) {
    return NextResponse.json({ error: "Staff access required." }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({
      weeklyData: [1, 2, 3, 4, 5, 6, 0].map((dow) => ({ label: DOW_LABELS[dow], revenue: 0 })),
      monthlyData: MONTH_SHORT.map((label) => ({ label, revenue: 0 })),
    });
  }

  const { data, error } = await supabase
    .from("orders")
    .select("total_cents, created_at")
    .eq("status", "served")
    .limit(10000);

  if (error || !data) {
    if (error) console.error("[analytics] Supabase SELECT error:", error);
    return NextResponse.json({
      weeklyData: [1, 2, 3, 4, 5, 6, 0].map((dow) => ({ label: DOW_LABELS[dow], revenue: 0 })),
      monthlyData: MONTH_SHORT.map((label) => ({ label, revenue: 0 })),
    });
  }

  const byDow = new Array(7).fill(0) as number[];
  const byMonth = new Array(12).fill(0) as number[];

  for (const row of data as { total_cents: number; created_at: string }[]) {
    const date = new Date(row.created_at);
    byDow[date.getDay()] += row.total_cents / 100;
    byMonth[date.getMonth()] += row.total_cents / 100;
  }

  // Reorder weekday to Mon first (1,2,3,4,5,6,0)
  const weeklyData: RevenuePoint[] = [1, 2, 3, 4, 5, 6, 0].map((dow) => ({
    label: DOW_LABELS[dow],
    revenue: Math.round(byDow[dow] * 100) / 100,
  }));

  const monthlyData: RevenuePoint[] = MONTH_SHORT.map((label, i) => ({
    label,
    revenue: Math.round(byMonth[i] * 100) / 100,
  }));

  return NextResponse.json({ weeklyData, monthlyData });
}
