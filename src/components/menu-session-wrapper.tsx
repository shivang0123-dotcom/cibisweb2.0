"use client";

import { useEffect, useState } from "react";
import { SessionInitializer } from "@/components/session-initializer";
import { MenuExperience } from "@/components/menu-experience";
import { getCurrentSession } from "@/lib/session-store";

type MenuSessionWrapperProps = {
  tableNumber: number;
  capacity?: number;
};

export function MenuSessionWrapper({ tableNumber, capacity }: MenuSessionWrapperProps) {
  const [status, setStatus] = useState<"checking" | "needsSession" | "ready">("checking");

  useEffect(() => {
    let active = true;
    (async () => {
      const session = await getCurrentSession();
      if (!active) return;
      // A session is only valid for the table whose QR was scanned. If the
      // cookie's session is for a different table, ask for a fresh one.
      setStatus(session && session.tableNumber === tableNumber ? "ready" : "needsSession");
    })();
    return () => {
      active = false;
    };
  }, [tableNumber]);

  if (status === "checking") {
    return <div className="min-h-screen bg-white" />;
  }

  if (status === "needsSession") {
    return (
      <SessionInitializer
        tableNumber={tableNumber}
        capacity={capacity}
        onSessionReady={() => setStatus("ready")}
      />
    );
  }

  return <MenuExperience tableNumber={tableNumber} />;
}
