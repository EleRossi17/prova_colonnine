"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

// ✅ Import dinamico: Leaflet viene caricato solo sul client
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

import L from "leaflet";

type Station = {
  Title?: string;
  Latitude?: number;
  Longitude?: number;
  anno?: number;
  charging_station_type?: string;
  PowerKW?: number;
};

export default function HomePage() {
  const [rows, setRows] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        return Array.isArray(json)
          ? json.map((s: any) => ({
              ...s,
              Latitude: parseFloat(s.Latitude),
              Longitude: parseFloat(s.Longitude),
            }))
          : [];
      })
      .then((data) => setRows(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <main className="p-6">⏳ Caricamento mappa...</main>;
  if (error) return <main className="p-6 text-red-600">❌ Errore: {error}</main>;

  const center: [number, number] = rows.length
    ? [rows[0].Latitude || 45.364, rows[0].Longitude || 9.684]
    : [45.364, 9.684];

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">⚡ Mappa Colonnine di Ricarica</h1>

      {rows.length === 0 ? (
        <p>Nessuna colonnina trovata.</p>
      ) : (
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "80vh", width: "100%" }}
        >
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
                  <b>{r.Title}</b>
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
