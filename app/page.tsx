"use client";

import dynamic from "next/dynamic";

// ✅ Import dinamico di `Map` (niente SSR)
const Map = dynamic(() => import("./map"), { ssr: false });

export default function HomePage() {
  return (
    <main className="w-full h-screen">
      <Map />
    </main>
  );
}
