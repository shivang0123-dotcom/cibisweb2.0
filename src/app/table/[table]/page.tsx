import { MenuSessionWrapper } from "@/components/menu-session-wrapper";
import { InvalidTable } from "@/components/invalid-table";
import { getTable } from "@/lib/tables-store";

type TablePageProps = {
  params: Promise<{ table: string }>;
};

// Per-table QR entry point, e.g. /table/1, /table/2 …
// Each table's permanent QR code encodes its own unique URL. The table is the
// source of truth: it is validated against the database (must exist and be
// active), and its seating capacity is passed through to the welcome screen.
export default async function TablePage({ params }: TablePageProps) {
  const { table } = await params;
  const parsed = Number.parseInt(table, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return <InvalidTable />;
  }

  const tableRecord = await getTable(parsed);
  if (!tableRecord || !tableRecord.active) {
    return <InvalidTable />;
  }

  return (
    <MenuSessionWrapper
      tableNumber={tableRecord.tableNumber}
      capacity={tableRecord.capacity}
    />
  );
}
