'use client';

import dynamic from 'next/dynamic';

// Dynamically import the Map component to avoid SSR issues
const Map = dynamic(() => import('./components/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="text-lg">Loading map...</div>
    </div>
  )
});

export default function Home() {
  return (
    <main className="h-screen w-full overflow-hidden">
      <Map />
    </main>
  );
}
