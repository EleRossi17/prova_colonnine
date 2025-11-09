"use client";
import { useEffect, useState } from "react";

type Station = {
  Title?: string;
  Latitude?: string;
  Longitude?: string;
  anno?: string;
  charging_station_type?: string;
  PowerKW?: string;
  [key: string]: any;
};

export default function HomePage() {
  const [rows, setRows] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/charging-stations")  // ⬅️ CAMBIATO DA /api/data
      .then((r) => r.json())
      .then((json) => {
        if (json?.error) throw new Error(json.error);
        setRows(json);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <main className="p-6">⏳ Caricamento dati...</main>;
  if (error) return <main className="p-6 text-red-600">❌ Errore: {error}</main>;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">⚡ Stazioni di Ricarica</h1>
      {rows.length === 0 ? (
        <p>Nessuna stazione trovata nel file CSV.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r, i) => (
            <li key={i} className="border rounded p-3 shadow-sm">
              <div className="font-medium">{r.Title || `Stazione #${i + 1}`}</div>
              <div className="text-sm opacity-80">
                {r.charging_station_type} - {r.PowerKW}kW - Anno: {r.anno}
                {r.Latitude && r.Longitude ? ` — (${r.Latitude}, ${r.Longitude})` : ""}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
