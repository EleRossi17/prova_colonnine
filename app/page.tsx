"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

type Station = {
  id?: string;
  Title?: string;
  Latitude?: number;
  Longitude?: number;
  anno?: number;
  charging_station_type?: string;
  PowerKW?: number;
  [key: string]: any;
};

export default function HomePage() {
  const [rows, setRows] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 📍 Icona personalizzata per i marker
  const markerIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  useEffect(() => {
    fetch("/api/charging-stations")
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        return Array.isArray(json) ? json : [];
      })
      .then((data) => setRows(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <main className="p-6">⏳ Caricamento mappa...</main>;
  if (error) return <main className="p-6 text-red-600">❌ Errore: {error}</main>;

  // Calcola centro della mappa (prima stazione o default Milano)
  const center: [number, number] = rows.length
    ? [rows[0].Latitude || 45.4642, rows[0].Longitude || 9.19]
    : [45.4642, 9.19];

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">⚡ Mappa Colonnine di Ricarica</h1>

      {rows.length === 0 ? (
        <p>Nessuna colonnina trovata.</p>
      ) : (
        <MapContainer center={center} zoom={12} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {rows.map((r, i) =>
            r.Latitude && r.Longitude ? (
              <Marker
                key={i}
                position={[r.Latitude, r.Longitude]}
                icon={markerIcon}
              >
                <Popup>
                  <b>{r.Title || `Stazione #${i + 1}`}</b>
                  <br />
                  Tipo: {r.charging_station_type}
                  <br />
                  Potenza: {r.PowerKW} kW
                  <br />
                  Anno: {r.anno}
                </Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>
      )}
    </main>
  );
}
