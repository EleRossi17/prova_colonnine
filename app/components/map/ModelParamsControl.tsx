import React, { useEffect, useRef, useState } from "react";

type ModelParams = {
  avgConsumptionKwhKm: number; // kWh/km
  evCagrPct: number;           // %
  publicChargingSharePct: number; // %
};

const DEFAULT_PARAMS: ModelParams = {
  avgConsumptionKwhKm: 0.2,
  evCagrPct: 29,
  publicChargingSharePct: 50,
};

export default function ModelParamsControl({
  params = DEFAULT_PARAMS,
}: {
  params?: ModelParams;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Chiudi con ESC
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Chiudi cliccando fuori
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!open) return;
      const target = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(target)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Info parametri modello"
        title="Info parametri modello"
        style={styles.circleButton}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>ℹ️</span>
      </button>

      {open && (
        <div ref={panelRef} style={styles.panel}>
          <div style={styles.panelHeader}>
            <div style={{ fontWeight: 700 }}>Parametri modello</div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Chiudi"
              style={styles.closeButton}
            >
              ✕
            </button>
          </div>

          <div style={styles.row}>
            <div style={styles.label}>Consumo medio auto elettrica</div>
            <div style={styles.value}>{params.avgConsumptionKwhKm} kWh/km</div>
          </div>

          <div style={styles.row}>
            <div style={styles.label}>CAGR crescita veicoli elettrici</div>
            <div style={styles.value}>{params.evCagrPct}%</div>
          </div>

          <div style={styles.row}>
            <div style={styles.label}>% ricarica pubblica</div>
            <div style={styles.value}>{params.publicChargingSharePct}%</div>
          </div>

          <div style={styles.note}>
            (Valori utilizzati dal modello per gli scenari.)
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  circleButton: {
    width: 54,
    height: 54,
    borderRadius: "999px",
    border: "3px solid #2F6FA3",
    background: "#FFFFFF",
    boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
  },
  panel: {
    position: "absolute",
    right: 0,
    top: 62,
    width: 320,
    background: "#FFFFFF",
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 14,
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
    padding: 14,
    zIndex: 9999,
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  closeButton: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 16,
    lineHeight: 1,
    padding: 6,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "8px 0",
    borderTop: "1px solid rgba(0,0,0,0.06)",
  },
  label: {
    fontSize: 13,
    color: "rgba(0,0,0,0.70)",
  },
  value: {
    fontSize: 13,
    fontWeight: 700,
    color: "rgba(0,0,0,0.90)",
    whiteSpace: "nowrap",
  },
  note: {
    marginTop: 10,
    fontSize: 12,
    color: "rgba(0,0,0,0.55)",
  },
};
