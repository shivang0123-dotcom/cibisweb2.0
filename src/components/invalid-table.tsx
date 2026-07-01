import Image from "next/image";
import { AlertTriangle } from "lucide-react";

// Shown when a scanned QR points at a table that does not exist or is inactive.
// Ordering is blocked — there is no path forward from here except asking staff.
export function InvalidTable() {
  return (
    <main className="fixed inset-0 z-50 flex items-center justify-center bg-[#faf0e8] px-5 text-[#1a1410]">
      <div className="w-full max-w-sm rounded-[28px] border border-[#e8ddd2] bg-white p-7 text-center shadow-[0_24px_60px_-28px_rgba(26,20,16,0.5)]">
        <Image
          src="/images/logo.png"
          alt="Circolo del Bridge"
          width={546}
          height={424}
          priority
          unoptimized
          className="mx-auto h-20 w-auto"
        />

        <div className="mx-auto mt-5 grid h-12 w-12 place-items-center rounded-full bg-[#f7e1de] text-[#9a2f25]">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <h1 className="mt-4 font-serif text-[22px] font-extrabold leading-tight text-[#1a1410]">
          This table QR code is invalid.
        </h1>
        <p className="mt-2 text-[15px] leading-6 text-[#736860]">
          Please ask our staff for assistance.
        </p>
      </div>
    </main>
  );
}
