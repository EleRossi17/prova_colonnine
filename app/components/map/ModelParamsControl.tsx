'use client';

import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import { Control, DomEvent } from 'leaflet';
import type { MarkerClusterColors } from '@/app/types/charging-station';

type ModelParams = {
  avgConsumptionKwhKm: number;      // kWh/km
  evCagrPct: number;               // %
  publicChargingSharePct: number;  // %
};

interface ModelParamsControlProps {
  colors: MarkerClusterColors;
  params: ModelParams;
}

export default function ModelParamsControl({ colors, params }: ModelParamsControlProps) {
  const map = useMap();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const infoControl = new Control({ position: 'topright' });

    infoControl.onAdd = () => {
      const div = document.createElement('div');
      div.style.backgroundColor = 'transparent';
      div.style.border = 'none';

      if (isExpanded) {
        div.innerHTML = `
          <div style="
            background: rgba(255, 255, 255, 0.98);
            border: 2px solid ${colors.city_border};
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.12);
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 13px;
            min-width: 260px;
            margin-top: 12px;
            margin-bottom: 12px;
            backdrop-filter: blur(10px);
            animation: slideInInfo 0.3s ease-out;
            z-index: 996;
            position: relative;
          ">
            <div style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;
              padding-bottom: 8px;
              border-bottom: 2px solid ${colors.city_border}30;
            ">
              <h4 style="
                margin: 0;
                color: ${colors.city_border};
                font-size: 16px;
                font-weight: 700;
                letter-spacing: 0.5px;
              ">
                ℹ️ Parametri modello
              </h4>
              <button id="collapse-info-btn" style="
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 6px;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                color: #6c757d;
                cursor: pointer;
                transition: all 0.2s ease;
              ">
                ✕
              </button>
            </div>

            <div style="display:flex; justify-content:space-between; gap:12px; padding:8px 0; border-top:1px solid rgba(0,0,0,0.06);">
              <div style="color: rgba(0,0,0,0.70);">Consumo medio auto elettrica</div>
              <div style="font-weight:700; color: rgba(0,0,0,0.90); white-space:nowrap;">
                ${params.avgConsumptionKwhKm} kWh/km
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; gap:12px; padding:8px 0; border-top:1px solid rgba(0,0,0,0.06);">
              <div style="color: rgba(0,0,0,0.70);">CAGR crescita veicoli elettrici</div>
              <div style="font-weight:700; color: rgba(0,0,0,0.90); white-space:nowrap;">
                ${params.evCagrPct}%
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; gap:12px; padding:8px 0; border-top:1px solid rgba(0,0,0,0.06);">
              <div style="color: rgba(0,0,0,0.70);">% ricarica pubblica</div>
              <div style="font-weight:700; color: rgba(0,0,0,0.90); white-space:nowrap;">
                ${params.publicChargingSharePct}%
              </div>
            </div>

            <div style="margin-top: 10px; font-size: 12px; color: rgba(0,0,0,0.55);">
              (Valori utilizzati dal modello per gli scenari.)
            </div>
          </div>

          <style>
            @keyframes slideInInfo {
              from { opacity: 0; transform: translateX(20px) scale(0.9); }
              to   { opacity: 1; transform: translateX(0) scale(1); }
            }
          </style>
        `;
      } else {
        // Collapsed state: stesso stile/dimensioni di AddStationControl (48x48)
        div.innerHTML = `
          <div id="expand-info-btn" style="
            background: rgba(255, 255, 255, 0.95);
            border: 2px solid ${colors.city_border};
            border-radius: 50%;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
            cursor: pointer;
            margin-top: 12px;
            margin-bottom: 12px;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            position: relative;
            z-index: 995;
          " title="Parametri modello">
            <div style="
              color: ${colors.city_border};
              font-size: 20px;
              font-weight: 600;
              transition: transform 0.2s ease;
            ">ℹ️</div>
          </div>

          <style>
            #expand-info-btn:hover {
              transform: scale(1.05) !important;
              box-shadow: 0 6px 20px rgba(0,0,0,0.2) !important;
              border-color: ${colors.city_border + 'dd'} !important;
            }
            #expand-info-btn:hover div:first-child {
              transform: scale(1.1) !important;
            }
          </style>
        `;
      }

      // Prevent map interactions
      DomEvent.disableClickPropagation(div);
      DomEvent.disableScrollPropagation(div);

      // Add event listeners
      if (isExpanded) {
        const collapseBtn = div.querySelector('#collapse-info-btn') as HTMLButtonElement | null;
        if (collapseBtn) {
          collapseBtn.onclick = (e) => {
            e.stopPropagation();
            setIsExpanded(false);
          };
        }
      } else {
        const expandBtn = div.querySelector('#expand-info-btn') as HTMLDivElement | null;
        if (expandBtn) {
          expandBtn.onclick = (e) => {
            e.stopPropagation();
            setIsExpanded(true);
          };
        }
      }

      return div;
    };

    infoControl.addTo(map);

    return () => {
      infoControl.remove();
    };
  }, [map, colors.city_border, isExpanded, params.avgConsumptionKwhKm, params.evCagrPct, params.publicChargingSharePct]);

  return null;
}
