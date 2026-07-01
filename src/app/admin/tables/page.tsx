import { redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/admin-auth";
import { getTables } from "@/lib/tables-store";
import { TablesManager } from "@/components/tables-manager";

export const dynamic = "force-dynamic";

// Staff-only table management. Auth is the same Supabase session that gates the
// admin dashboard — unauthenticated visitors are sent to /admin to sign in.
export default async function AdminTablesPage() {
  if (!(await isAdminRequest())) {
    redirect("/admin");
  }

  const tables = await getTables();
  return <TablesManager initialTables={tables} />;
}
