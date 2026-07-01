import Link from "next/link";
import { DishDetailExperience } from "@/components/dish-detail-experience";
import { getMenuItemById } from "@/lib/menu";
import { getMenuState } from "@/lib/menu-store";

type DishPageProps = {
  params: Promise<{ dishId: string }>;
};

export default async function DishPage({ params }: DishPageProps) {
  const { dishId } = await params;
  const menuState = await getMenuState();
  const dish = getMenuItemById(dishId, menuState.items);

  if (!dish) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF8F1] px-4 text-[#191614]">
        <div className="max-w-sm text-center">
          <h1 className="text-2xl font-extrabold">Dish not found</h1>
          <Link href="/menu" className="mt-5 inline-flex h-12 items-center rounded-2xl bg-[#D06A49] px-5 text-sm font-bold text-white">
            Back to menu
          </Link>
        </div>
      </main>
    );
  }

  return <DishDetailExperience dish={dish} />;
}
