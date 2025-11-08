"use client";

import { useEffect, useState } from "react";

type Station = {
  id?: string;
  nome?: string;
  indirizzo?: string;
  lat?: string | number;
  lon?: string | number;
  [key: string]: any;
};

export default function HomePage() {
  const [rows, setRows] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/data")
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
              <div className="font-medium">{r.nome || r.name || `Stazione #${i + 1}`}</div>
              <div className="text-sm opacity-80">
                {r.indirizzo || r.address || "Indirizzo non disponibile"}
                {r.lat && r.lon ? ` — (${r.lat}, ${r.lon})` : ""}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
