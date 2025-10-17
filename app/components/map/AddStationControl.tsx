'use client';

import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import { Control, DomEvent, Marker, Icon } from 'leaflet';
import { MarkerClusterColors } from '@/app/types/charging-station';

interface AddStationControlProps {
  colors: MarkerClusterColors;
  isAddMode: boolean;
  onToggleAddMode: (active: boolean) => void;
  onPositionSelected: (position: { lat: number; lng: number }) => void;
}

export default function AddStationControl({
  colors,
  isAddMode,
  onToggleAddMode,
  onPositionSelected
}: AddStationControlProps) {
  const map = useMap();
  const [tempMarker, setTempMarker] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const addControl = new Control({ position: 'topright' });

    addControl.onAdd = () => {
      const div = document.createElement('div');
      div.style.backgroundColor = 'transparent';
      div.style.border = 'none';

      if (isExpanded) {
        // Expanded state
        div.innerHTML = `
          <div style="
            background: rgba(255, 255, 255, 0.98); 
            border: 2px solid ${colors.city_border}; 
            border-radius: 12px;
            padding: 16px; 
            box-shadow: 0 8px 24px rgba(0,0,0,0.12);
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 13px;
            min-width: 200px;
            margin-top: 12px;
            margin-bottom: 12px;
            backdrop-filter: blur(10px);
            animation: slideIn 0.3s ease-out;
            z-index: 996;
            position: relative;
          ">
            
            <div style="
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              margin-bottom: 16px;
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
                ⚙️ Station Management
              </h4>
              <button id="collapse-btn" style="
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
            
            <button id="toggle-btn" style="
              width: 100%; 
              padding: 12px; 
              background: ${isAddMode ? '#dc3545' : colors.city_border}; 
              color: white; 
              border: none; 
              border-radius: 8px;
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 0.5px;
              text-transform: uppercase;
              cursor: pointer;
              transition: all 0.2s ease;
              box-shadow: 0 4px 8px ${isAddMode ? 'rgba(220, 53, 69, 0.3)' : 'rgba(46, 134, 171, 0.3)'};
            ">
              ${isAddMode ? '✕ Cancel Add' : '+ Add Station'}
            </button>
            
            ${isAddMode ? `
              <div style="
                margin-top: 12px;
                padding: 12px;
                background: #e7f3ff;
                border-radius: 8px;
                border: 1px solid #b3d9ff;
              ">
                <div style="
                  font-size: 12px;
                  color: #0066cc;
                  font-weight: 600;
                  text-align: center;
                  line-height: 1.4;
                ">
                  📍 Click on the map to place a new charging station
                </div>
              </div>
            ` : ''}
            
          </div>
        `;
      } else {
        // Collapsed state
        div.innerHTML = `
          <div id="expand-btn" style="
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
          " title="Station Management">
            <div style="
              color: ${isAddMode ? '#dc3545' : colors.city_border};
              font-size: 20px;
              font-weight: 600;
              transition: transform 0.2s ease;
            ">
              ${isAddMode ? '✕' : '⚙️'}
            </div>
            ${isAddMode ? `
              <div style="
                position: absolute;
                top: -3px;
                right: -3px;
                width: 16px;
                height: 16px;
                background: #28a745;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(40, 167, 69, 0.4);
                animation: pulse 2s infinite;
              "></div>
            ` : ''}
          </div>
          
          <style>
            #expand-btn:hover {
              transform: scale(1.05) !important;
              box-shadow: 0 6px 20px rgba(0,0,0,0.2) !important;
              border-color: ${isAddMode ? '#dc3545dd' : colors.city_border + 'dd'} !important;
            }
            
            #expand-btn:hover div:first-child {
              transform: scale(1.1) !important;
            }
            
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateX(20px) scale(0.9);
              }
              to {
                opacity: 1;
                transform: translateX(0) scale(1);
              }
            }
            
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.1); opacity: 0.8; }
            }
          </style>
        `;
      }

      // Prevent map interactions
      DomEvent.disableClickPropagation(div);
      DomEvent.disableScrollPropagation(div);

      // Add event listeners
      if (isExpanded) {
        const collapseBtn = div.querySelector('#collapse-btn') as HTMLButtonElement;
        const toggleBtn = div.querySelector('#toggle-btn') as HTMLButtonElement;

        if (collapseBtn) {
          collapseBtn.onclick = (e) => {
            e.stopPropagation();
            setIsExpanded(false);
          };
        }

        if (toggleBtn) {
          toggleBtn.onclick = (e) => {
            e.stopPropagation();
            onToggleAddMode(!isAddMode);
          };
        }
      } else {
        const expandBtn = div.querySelector('#expand-btn') as HTMLDivElement;
        if (expandBtn) {
          expandBtn.onclick = (e) => {
            e.stopPropagation();
            setIsExpanded(true);
          };
        }
      }

      return div;
    };

    addControl.addTo(map);

    return () => {
      addControl.remove();
    };
  }, [map, colors, isAddMode, onToggleAddMode, isExpanded]);

  // Handle map click when in add mode
  useEffect(() => {
    if (!isAddMode) {
      if (tempMarker) {
        map.removeLayer(tempMarker);
        setTempMarker(null);
      }
      return;
    }

    const handleMapClick = (e: any) => {
      const { lat, lng } = e.latlng;

      if (tempMarker) {
        map.removeLayer(tempMarker);
      }

      const newStationIcon = new Icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" fill="${colors.city_border}" stroke="white" stroke-width="2"/>
            <text x="16" y="12" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="Arial, sans-serif">+</text>
            <text x="16" y="24" text-anchor="middle" fill="white" font-size="8" font-family="Arial, sans-serif">NEW</text>
          </svg>
        `),
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });

      const marker = new Marker([lat, lng], {
        icon: newStationIcon,
        draggable: true
      });

      marker.addTo(map);

      marker.on('dragend', (dragEvent: any) => {
        const newPos = dragEvent.target.getLatLng();
        onPositionSelected({ lat: newPos.lat, lng: newPos.lng });
      });

      marker.on('click', () => {
        onPositionSelected({ lat, lng });
      });

      setTempMarker(marker);
      onPositionSelected({ lat, lng });
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, isAddMode, tempMarker, onPositionSelected, colors]);

  return null;
} 