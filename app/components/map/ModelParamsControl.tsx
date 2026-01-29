'use client';

import { useEffect, useRef, useState } from 'react';
import type { MarkerClusterColors } from '@/app/types/charging-station';

type ModelParams = {
  avgConsumptionKwhKm: number;      // kWh/km
  evCagrPct: number;               // %
  publicChargingSharePct: number;   // %
};

export default function ModelParamsControl({
  colors,
  params,
}: {
  colors: MarkerClusterColors;
  params: ModelParams;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Chiudi con ESC
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Chiudi cliccando fuori
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!open) return;
      const target = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(target)) setOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control" style={{ marginTop: 12 }}>
        <div style={{ position: 'relative' }}>
          {/* Bottone rotondo */}
          <button
            type="button"
            aria-label="Info parametri modello"
            title="Info parametri modello"
            onClick={() => setOpen((v) => !v)}
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: `3px solid ${colors.city_border}`,
              background: 'white',
              boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>ℹ️</span>
          </button>

          {/* Pannello */}
          {open && (
            <div
              ref={panelRef}
              style={{
                position: 'absolute',
                right: 0,
                top: 62,
                width: 340,
                background: 'white',
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: 14,
                boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
                overflow: 'hidden',
                zIndex: 9999,
              }}
            >
              <div
                style={{
                  background: colors.city_border,
                  color: 'white',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontWeight: 800 }}>Parametri modello</div>
                <button
                  type="button"
                  aria-label="Chiudi"
                  onClick={() => setOpen(false)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: 16,
                    lineHeight: 1,
                    padding: 6,
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ padding: 14 }}>
                <Row label="Consumo medio auto elettrica" value={`${params.avgConsumptionKwhKm} kWh/km`} />
                <Row label="CAGR crescita veicoli elettrici" value={`${params.evCagrPct}%`} />
                <Row label="% ricarica pubblica" value={`${params.publicChargingSharePct}%`} />

                <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(0,0,0,0.55)' }}>
                  (Valori utilizzati dal modello per gli scenari.)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        padding: '8px 0',
        borderTop: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.70)' }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: 'rgba(0,0,0,0.90)', whiteSpace: 'nowrap' }}>
        {value}
      </div>
    </div>
  );
}
