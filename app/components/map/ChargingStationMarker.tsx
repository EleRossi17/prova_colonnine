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

function ChargingStationMarker({ station, colors, onDelete }: ChargingStationMarkerProps) {
  const map = useMap();

  useEffect(() => {
    const getMarkerColor = () => {
      switch (station.charging_station_type) {
        case 'fast':
          return colors.fast;
        case 'ultrafast':
          return colors.ultrafast;
        case 'slow':
          return colors.slow;
        default:
          return colors.other;
      }
    };

    const getMarkerSize = () => {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
      if (isMobile) {
        switch (station.charging_station_type) {
          case 'ultrafast': return { size: 14, fontSize: 10 };
          case 'fast': return { size: 12, fontSize: 9 };
          case 'slow': return { size: 10, fontSize: 8 };
          default: return { size: 8, fontSize: 7 };
        }
      } else {
        switch (station.charging_station_type) {
          case 'ultrafast': return { size: 20, fontSize: 14 };
          case 'fast': return { size: 18, fontSize: 12 };
          case 'slow': return { size: 16, fontSize: 10 };
          default: return { size: 14, fontSize: 9 };
        }
      }
    };

    const getDisplaySymbol = () => {
      switch (station.charging_station_type) {
        case 'ultrafast': return '⚡';
        case 'fast': return '⚡';
        case 'slow': return '🔋';
        default: return '🔌';
      }
    };

    const markerColor = getMarkerColor();
    const markerSize = getMarkerSize();
    const displaySymbol = getDisplaySymbol();
    const isNewStation = (station.installation_year || station.year) === 2024;

    const customIcon = new L.Icon({
      iconUrl:
        'data:image/svg+xml;base64,' +
        btoa(`
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
        `),
      iconSize: [markerSize.size + 4, markerSize.size + 4],
      iconAnchor: [(markerSize.size + 4) / 2, (markerSize.size + 4) / 2],
      popupAnchor: [0, -(markerSize.size / 2)],
    });

    // ✅ Usa i nomi corretti: Latitude / Longitude
    const marker = new L.Marker([station.Latitude, station.Longitude], { icon: customIcon });

    const popupContent = document.createElement('div');
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

    popupContent.innerHTML = `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; min-width: 180px;">
        <h3 style="
          margin: 0 0 8px 0;
          color: ${colors.city_border};
          font-size: ${isMobile ? '14px' : '16px'};
          font-weight: 600;
        ">
          ${station.Title}
        </h3>

        <div style="font-size: 13px; margin-bottom: 6px;">
          <strong>Type:</strong> ${station.charging_station_type}
        </div>
        <div style="font-size: 13px; margin-bottom: 6px;">
          <strong>Power:</strong> ${station.PowerKW} kW
        </div>
        <div style="font-size: 13px; margin-bottom: 6px;">
          <strong>Year:</strong> ${station.installation_year || station.year}
        </div>
        <div style="font-size: 13px; margin-bottom: 6px;">
          <strong>City:</strong> ${station.city || '—'}
        </div>

        <div style="font-size: 12px; color: #6c757d; margin-bottom: 6px;">
          <strong>Lat:</strong> ${station.Latitude.toFixed(6)} <br/>
          <strong>Lng:</strong> ${station.Longitude.toFixed(6)}
        </div>

        <button id="google-maps-${station.id}" style="
          width: 100%;
          background: linear-gradient(135deg, #4285f4, #34a853);
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 6px;
        ">
          🗺️ View on Google Maps
        </button>

        ${
          onDelete
            ? `
          <button id="delete-station-${station.id}" style="
            width: 100%;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 12px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 6px;
          ">
            🗑️ Delete
          </button>
        `
            : ''
        }
      </div>
    `;

    // ✅ Delete button event
    if (onDelete) {
      const deleteBtn = popupContent.querySelector(
        `#delete-station-${station.id}`
      ) as HTMLButtonElement;
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`Are you sure you want to delete "${station.Title}"?`)) {
            onDelete(station);
          }
        });
      }
    }

    // ✅ Google Maps event
    const googleMapsBtn = popupContent.querySelector(
      `#google-maps-${station.id}`
    ) as HTMLButtonElement;
    if (googleMapsBtn) {
      googleMapsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const googleMapsUrl = `https://www.google.com/maps?q=${station.Latitude},${station.Longitude}&t=h&z=18`;
        window.open(googleMapsUrl, '_blank');
      });
    }

    const popup = new L.Popup({ maxWidth: 300 }).setContent(popupContent);
    marker.bindPopup(popup);
    marker.addTo(map);

    return () => {
      marker.remove();
    };
  }, [map, station, colors, onDelete]);

  return null;
}

export default React.memo(ChargingStationMarker);
