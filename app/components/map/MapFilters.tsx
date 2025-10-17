'use client';

import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import { Control, DomEvent } from 'leaflet';
import { MarkerClusterColors } from '@/app/types/charging-station';

interface MapFiltersProps {
  colors: MarkerClusterColors;
  selectedType: string;
  selectedCity: string;
  availableTypes: string[];
  availableCities: string[];
  onTypeChange: (type: string) => void;
  onCityChange: (city: string) => void;
  onResetFilters: () => void;
}

export default function MapFilters({
  colors,
  selectedType,
  selectedCity,
  availableTypes,
  availableCities,
  onTypeChange,
  onCityChange,
  onResetFilters
}: MapFiltersProps) {
  const map = useMap();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const filterControl = new Control({ position: 'topright' });

    filterControl.onAdd = () => {
      const div = document.createElement('div');
      div.style.backgroundColor = 'transparent';
      div.style.border = 'none';

      const hasActiveFilters = selectedType || selectedCity;

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
            max-width: 220px;
            margin-top: 12px;
            margin-bottom: 12px;
            backdrop-filter: blur(10px);
            animation: slideIn 0.3s ease-out;
            z-index: 998;
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
                🔍 Filters
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
            
            <div style="margin-bottom: 16px;">
              <label style="
                display: block; 
                margin-bottom: 8px; 
                font-weight: 600; 
                color: #2c3e50;
                font-size: 12px;
                letter-spacing: 0.5px;
                text-transform: uppercase;
              ">
                ⚡ Charging Type
              </label>
              <select id="type-filter" style="
                width: 100%; 
                padding: 10px 12px; 
                border: 2px solid #e9ecef; 
                border-radius: 8px;
                font-size: 13px;
                font-weight: 500;
                background: white;
                color: #2c3e50;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                transition: all 0.2s ease;
                cursor: pointer;
              ">
                <option value="">All Types</option>
                ${availableTypes.map(type =>
          `<option value="${type}" ${selectedType === type ? 'selected' : ''}>${type.charAt(0).toUpperCase() + type.slice(1)}</option>`
        ).join('')}
              </select>
            </div>
            
            <div style="margin-bottom: 16px;">
              <label style="
                display: block; 
                margin-bottom: 8px; 
                font-weight: 600; 
                color: #2c3e50;
                font-size: 12px;
                letter-spacing: 0.5px;
                text-transform: uppercase;
              ">
                🏙️ City
              </label>
              <select id="city-filter" style="
                width: 100%; 
                padding: 10px 12px; 
                border: 2px solid #e9ecef; 
                border-radius: 8px;
                font-size: 13px;
                font-weight: 500;
                background: white;
                color: #2c3e50;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                transition: all 0.2s ease;
                cursor: pointer;
              ">
                <option value="">All Cities</option>
                ${availableCities.map(city =>
          `<option value="${city}" ${selectedCity === city ? 'selected' : ''}>${city}</option>`
        ).join('')}
              </select>
            </div>
            
            <button id="reset-btn" style="
              width: 100%; 
              padding: 12px; 
              background: ${colors.city_border}; 
              color: white; 
              border: none; 
              border-radius: 8px;
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 0.5px;
              text-transform: uppercase;
              cursor: pointer;
              transition: all 0.2s ease;
              box-shadow: 0 4px 8px rgba(46, 134, 171, 0.3);
            ">
              🔄 Reset Filters
            </button>
            
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
            z-index: 997;
          " title="Show Filters">
            <div style="
              color: ${colors.city_border};
              font-size: 20px;
              font-weight: 600;
              transition: transform 0.2s ease;
            ">
              🔍
            </div>
            ${hasActiveFilters ? `
              <div style="
                position: absolute;
                top: -3px;
                right: -3px;
                width: 16px;
                height: 16px;
                background: #dc3545;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(220, 53, 69, 0.4);
                animation: pulse 2s infinite;
              "></div>
            ` : ''}
          </div>
          
          <style>
            #expand-btn:hover {
              transform: scale(1.05) !important;
              box-shadow: 0 6px 20px rgba(0,0,0,0.2) !important;
              border-color: ${colors.city_border}dd !important;
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
        const typeSelect = div.querySelector('#type-filter') as HTMLSelectElement;
        const citySelect = div.querySelector('#city-filter') as HTMLSelectElement;
        const resetButton = div.querySelector('#reset-btn') as HTMLButtonElement;

        if (collapseBtn) {
          collapseBtn.onclick = (e) => {
            e.stopPropagation();
            setIsExpanded(false);
          };
        }

        if (typeSelect) {
          typeSelect.onchange = (e) => {
            e.stopPropagation();
            onTypeChange((e.target as HTMLSelectElement).value);
          };
        }

        if (citySelect) {
          citySelect.onchange = (e) => {
            e.stopPropagation();
            onCityChange((e.target as HTMLSelectElement).value);
          };
        }

        if (resetButton) {
          resetButton.onclick = (e) => {
            e.stopPropagation();
            onResetFilters();
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

    filterControl.addTo(map);

    return () => {
      filterControl.remove();
    };
  }, [map, colors, selectedType, selectedCity, availableTypes, availableCities, onTypeChange, onCityChange, onResetFilters, isExpanded]);

  return null;
} 