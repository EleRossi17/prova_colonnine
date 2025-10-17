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

function ChargingStationMarker({
  station,
  colors,
  onDelete
}: ChargingStationMarkerProps) {
  const map = useMap();

  useEffect(() => {
    // Determine marker color and size based on charging type and installation year
    const getMarkerColor = () => {
      switch (station.charging_station_type) {
        case 'fast': return colors.fast;
        case 'ultrafast': return colors.ultrafast;
        case 'slow': return colors.slow;
        default: return colors.other;
      }
    };

    const getMarkerSize = () => {
      // Check if we're on mobile (using window width)
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

      if (isMobile) {
        // Smaller sizes for mobile
        switch (station.charging_station_type) {
          case 'ultrafast': return { size: 14, fontSize: 10 };
          case 'fast': return { size: 12, fontSize: 9 };
          case 'slow': return { size: 10, fontSize: 8 };
          default: return { size: 8, fontSize: 7 };
        }
      } else {
        // Original sizes for desktop
        switch (station.charging_station_type) {
          case 'ultrafast': return { size: 20, fontSize: 14 };
          case 'fast': return { size: 18, fontSize: 12 };
          case 'slow': return { size: 16, fontSize: 10 };
          default: return { size: 14, fontSize: 9 };
        }
      }
    };

    const getMarkerSymbol = () => {
      switch (station.charging_station_type) {
        case 'ultrafast': return 'U';
        case 'fast': return 'F';
        case 'slow': return 'S';
        default: return 'C';
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
    const markerSymbol = getMarkerSymbol(); // For SVG (Latin1 compatible)
    const displaySymbol = getDisplaySymbol(); // For popup display
    const isNewStation = (station.installation_year || station.year) === 2024;

    // Create custom icon based on station type and year
    const customIcon = new L.Icon({
      iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="${markerSize.size + 4}" height="${markerSize.size + 4}" viewBox="0 0 ${markerSize.size + 4} ${markerSize.size + 4}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            ${isNewStation ? `
              <linearGradient id="newGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#F18F01;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#C73E1D;stop-opacity:1" />
              </linearGradient>
            ` : ''}
          </defs>
          <circle 
            cx="${(markerSize.size + 4) / 2}" 
            cy="${(markerSize.size + 4) / 2}" 
            r="${markerSize.size / 2}" 
            fill="${isNewStation ? 'url(#newGradient)' : markerColor}" 
            stroke="white" 
            stroke-width="1.5"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
          />
          ${isNewStation ? `
            <circle 
              cx="${(markerSize.size + 4) / 2 + 6}" 
              cy="${(markerSize.size + 4) / 2 - 6}" 
              r="4" 
              fill="#28a745" 
              stroke="white" 
              stroke-width="1"
            />
          ` : ''}
          <text 
            x="${(markerSize.size + 4) / 2}" 
            y="${(markerSize.size + 4) / 2 + 4}" 
            text-anchor="middle" 
            fill="white" 
            font-size="${markerSize.fontSize}" 
            font-weight="bold"
            font-family="Arial, sans-serif"
          >${markerSymbol}</text>
        </svg>
      `),
      iconSize: [markerSize.size + 4, markerSize.size + 4],
      iconAnchor: [(markerSize.size + 4) / 2, (markerSize.size + 4) / 2],
      popupAnchor: [0, -(markerSize.size / 2)],
    });

    // Create marker
    const marker = new L.Marker([station.latitude, station.longitude], {
      icon: customIcon,
    });

    // Create popup content with enhanced styling and delete button
    const popupContent = document.createElement('div');
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

    popupContent.innerHTML = `
      <div style="
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        min-width: ${isMobile ? '150px' : '200px'};
        max-width: ${isMobile ? '200px' : '280px'};
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: ${isMobile ? '6px' : '8px'};
        ">
          <h3 style="
            margin: 0;
            color: ${colors.city_border};
            font-size: ${isMobile ? '14px' : '16px'};
            font-weight: 600;
            line-height: 1.2;
            flex: 1;
          ">
            ${station.charging_station}
          </h3>
          ${onDelete ? `
            <button id="delete-station-${station.id}" style="
              background: #dc3545;
              color: white;
              border: none;
              border-radius: 4px;
              padding: ${isMobile ? '2px 6px' : '4px 8px'};
              font-size: ${isMobile ? '9px' : '10px'};
              font-weight: 600;
              cursor: pointer;
              margin-left: ${isMobile ? '6px' : '8px'};
              transition: background-color 0.2s ease;
            " onmouseover="this.style.backgroundColor='#c82333';" onmouseout="this.style.backgroundColor='#dc3545';">
              🗑️ DELETE
            </button>
          ` : ''}
        </div>
        
        <div style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: ${isMobile ? '6px' : '8px'};
          margin-bottom: ${isMobile ? '6px' : '8px'};
        ">
          <div style="
            background-color: ${markerColor};
            color: white;
            padding: ${isMobile ? '4px 6px' : '6px 8px'};
            border-radius: ${isMobile ? '4px' : '6px'};
            text-align: center;
            font-size: ${isMobile ? '9px' : '11px'};
            font-weight: 600;
          ">
            ${displaySymbol} ${station.charging_station_type.toUpperCase()}
          </div>
          <div style="
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            padding: ${isMobile ? '4px 6px' : '6px 8px'};
            border-radius: ${isMobile ? '4px' : '6px'};
            text-align: center;
            font-size: ${isMobile ? '9px' : '11px'};
            font-weight: 600;
            color: #495057;
          ">
            ${station.power_kw} kW
          </div>
        </div>
        
        <div style="
          background-color: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: ${isMobile ? '4px' : '6px'};
          padding: ${isMobile ? '6px' : '8px'};
          margin-bottom: ${isMobile ? '4px' : '6px'};
        ">
          <div style="font-size: ${isMobile ? '9px' : '11px'}; color: #6c757d; margin-bottom: ${isMobile ? '2px' : '4px'};">Installation</div>
          <div style="font-size: ${isMobile ? '11px' : '13px'}; font-weight: 600; color: #2c3e50;">
            ${station.installation_year || station.year}
            ${isNewStation ? `
              <span style="
                background: #28a745;
                color: white;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 9px;
                margin-left: 6px;
              ">AS-IS</span>
            ` : ''}
          </div>
        </div>
        
        <div style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          font-size: 11px;
          color: #6c757d;
          margin-bottom: ${isMobile ? '6px' : '8px'};
        ">
          <div>
            <strong style="color: #2c3e50;">Lat:</strong> ${station.latitude.toFixed(6)}
          </div>
          <div>
            <strong style="color: #2c3e50;">Lng:</strong> ${station.longitude.toFixed(6)}
          </div>
        </div>
        
        <button id="google-maps-${station.id}" style="
          width: 100%;
          background: linear-gradient(135deg, #4285f4, #34a853);
          color: white;
          border: none;
          border-radius: ${isMobile ? '6px' : '8px'};
          padding: ${isMobile ? '8px 12px' : '10px 16px'};
          font-size: ${isMobile ? '11px' : '12px'};
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-bottom: ${isMobile ? '6px' : '8px'};
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(66, 133, 244, 0.3);
        " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(66, 133, 244, 0.4)';" onmouseout="this.style.transform='translateY(0px)'; this.style.boxShadow='0 2px 8px rgba(66, 133, 244, 0.3)';">
          🗺️ View on Google Maps
        </button>
        
        ${station.monthly_consumption_kwh > 0 ? `
          <div style="
            margin-top: 6px;
            padding: 6px 8px;
            background-color: #e7f3ff;
            border: 1px solid #b3d9ff;
            border-radius: 6px;
            font-size: 11px;
            color: #0066cc;
          ">
            <strong>Monthly Usage:</strong> ${station.monthly_consumption_kwh} kWh
          </div>
        ` : ''}
      </div>
    `;

    // Add delete button event listener if onDelete is provided
    if (onDelete) {
      const deleteBtn = popupContent.querySelector(`#delete-station-${station.id}`) as HTMLButtonElement;
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`Are you sure you want to delete "${station.charging_station}"?`)) {
            onDelete(station);
          }
        });
      }
    }

    // Add Google Maps button event listener
    const googleMapsBtn = popupContent.querySelector(`#google-maps-${station.id}`) as HTMLButtonElement;
    if (googleMapsBtn) {
      googleMapsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Create Google Maps URL with the exact coordinates
        const googleMapsUrl = `https://www.google.com/maps?q=${station.latitude},${station.longitude}&t=h&z=18`;
        // Open in new tab/window
        window.open(googleMapsUrl, '_blank');
      });
    }

    // Create popup with custom content
    const popup = new L.Popup({
      maxWidth: 300,
      className: 'custom-popup',
    }).setContent(popupContent);

    marker.bindPopup(popup);
    marker.addTo(map);

    return () => {
      marker.remove();
    };
  }, [map, station, colors, onDelete]);

  return null;
}

// Export with React.memo for performance optimization
export default React.memo(ChargingStationMarker); 