"use client";

import dynamic from "next/dynamic";

// ✅ Import corretto: percorso completo della mappa
const Map = dynamic(() => import("./components/map/Map"), { ssr: false });

export default function HomePage() {
  return (
    <main className="w-full h-screen">
      <Map />
    </main>
  );
}
