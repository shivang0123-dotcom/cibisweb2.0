import { MenuSessionWrapper } from "@/components/menu-session-wrapper";

type MenuPageProps = {
  searchParams: Promise<{
    table?: string;
  }>;
};

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const params = await searchParams;
  const parsedTable = Number.parseInt(params.table ?? "1", 10);
  const tableNumber = Number.isFinite(parsedTable) && parsedTable > 0 ? parsedTable : 1;

  return <MenuSessionWrapper tableNumber={tableNumber} />;
}
