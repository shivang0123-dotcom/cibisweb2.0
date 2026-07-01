import { MenuSessionWrapper } from "@/components/menu-session-wrapper";

// The site root goes straight into the ordering flow — no landing splash. A
// visitor lands directly on the name screen (table 1 by default, same as /menu);
// if a session already exists they go straight to the menu.
export default function Home() {
  return <MenuSessionWrapper tableNumber={1} />;
}
