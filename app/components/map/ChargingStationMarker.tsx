'use client';

import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';
import { ChargingStation, MarkerClusterColors } from '@/app/types/charging-station';

interface ChargingStationMarkerProps {
  station: ChargingStation;
  colors: MarkerClusterColors;
  onDelete?: (station: ChargingStation) => void;
}

// ✅ funzione sicura per codificare in base64 anche caratteri Unicode
function safeBtoa(str: string): string {
  return window.btoa(unescape(encodeURIComponent(str)));
}

function ChargingStationMarker({ station, colors, onDelete }: ChargingStationMarkerProps) {
  const map = useMap();

  useEffect(() => {
    const getMarkerColor = () => {
      switch (station.charging_station_type) {
        case 'fast': return colors.fast;
        case 'ultrafast': return colors.ultrafast;
        case 'slow': return colors.slow;
        default: return colors.other;
      }
    };

    const getMarkerSize = () => {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
      return isMobile
        ? { size: 14, fontSize: 10 }
        : { size: 20, fontSize: 14 };
    };

    const markerSymbol =
      station.charging_station_type === 'ultrafast' ? 'U' :
      station.charging_station_type === 'fast' ? 'F' :
      station.charging_station_type === 'slow' ? 'S' : 'C';


    const displaySymbol =
      station.charging_station_type === 'ultrafast' ? '⚡' :
      station.charging_station_type === 'fast' ? '⚡' :
      station.charging_station_type === 'slow' ? '🔋' : '🔌';

    const markerColor = getMarkerColor();
    const markerSize = getMarkerSize();
    const isNewStation = (station.installation_year || station.year) === 2024;

    // ✅ usa safeBtoa invece di btoa
    const svgString = `
      <svg width="${markerSize.size + 4}" height="${markerSize.size + 4}" xmlns="http://www.w3.org/2000/svg">
        <circle 
          cx="${(markerSize.size + 4) / 2}" 
          cy="${(markerSize.size + 4) / 2}" 
          r="${markerSize.size / 2}" 
          fill="${markerColor}" 
          stroke="white" 
          stroke-width="1.5"
        />
        <text 
          x="${(markerSize.size + 4) / 2}" 
          y="${(markerSize.size + 4) / 2 + 4}" 
          text-anchor="middle" 
          fill="white" 
          font-size="${markerSize.fontSize}" 
          font-weight="bold"
          font-family="Arial, sans-serif"
        >${displaySymbol}</text>
      </svg>
    `;

    const encodedSvg = safeBtoa(svgString);

    const customIcon = new L.Icon({
      iconUrl: `data:image/svg+xml;base64,${encodedSvg}`,
      iconSize: [markerSize.size + 4, markerSize.size + 4],
      iconAnchor: [(markerSize.size + 4) / 2, (markerSize.size + 4) / 2],
      popupAnchor: [0, -(markerSize.size / 2)],
    });

    const marker = new L.Marker([station.Latitude, station.Longitude], { icon: customIcon });

    const popupContent = document.createElement('div');
    popupContent.innerHTML = `
      <div style="font-family:'Segoe UI';min-width:180px;">
        <h3 style="margin:0 0 8px 0;color:${colors.city_border};font-size:15px;">${station.Title}</h3>
        <div><b>Type:</b> ${station.charging_station_type}</div>
        <div><b>Power:</b> ${station.PowerKW} kW</div>
        <div><b>Year:</b> ${station.installation_year || station.year}</div>
        <div><b>City:</b> ${station.city || '—'}</div>
        <div style="font-size:12px;color:#666;margin-top:4px;">
          ${station.Latitude.toFixed(6)}, ${station.Longitude.toFixed(6)}
        </div>
      </div>
    `;

    const popup = new L.Popup({ maxWidth: 300 }).setContent(popupContent);
    marker.bindPopup(popup);
    marker.addTo(map);

    return () => { marker.remove(); };
  }, [map, station, colors, onDelete]);

  return null;
}

export default React.memo(ChargingStationMarker);
