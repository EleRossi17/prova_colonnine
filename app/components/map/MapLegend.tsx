'use client';

import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import { Control, DomEvent } from 'leaflet';
import { MarkerClusterColors } from '@/app/types/charging-station';

interface MapLegendProps {
  colors: MarkerClusterColors;
  stationCounts: {
    total: number;
    fast: number;
    ultrafast: number;
    slow: number;
    other: number;
  };
}

export default function MapLegend({ colors, stationCounts }: MapLegendProps) {
  const map = useMap();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const legend = new Control({ position: 'topright' });

    legend.onAdd = () => {
      const div = document.createElement('div');
      div.style.backgroundColor = 'transparent';
      div.style.border = 'none';

      if (isExpanded) {
        // Expanded state
        div.innerHTML = `
          <div style="
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%); 
            border: 2px solid ${colors.city_border}; 
            border-radius: 12px;
            padding: 16px; 
            box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 13px;
            min-width: 200px;
            max-width: 220px;
            margin-bottom: 12px;
            backdrop-filter: blur(10px);
            animation: slideIn 0.3s ease-out;
            z-index: 1000;
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
                📊 Charging Stations
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
            
            <div style="
              margin-bottom: 16px; 
              padding: 12px; 
              background: #f8f9fa; 
              border-radius: 8px; 
              text-align: center;
              border: 1px solid #e9ecef;
            ">
              <div style="
                color: ${colors.city_border}; 
                font-size: 24px;
                font-weight: 800;
                line-height: 1;
              ">
                ${stationCounts.total}
              </div>
              <div style="
                color: #495057; 
                font-size: 11px; 
                font-weight: 600;
                margin-top: 4px;
                letter-spacing: 0.5px;
                text-transform: uppercase;
              ">
                Total Stations
              </div>
            </div>
            
            <div style="margin-bottom: 12px;">
              <div style="display: flex; align-items: center; margin-bottom: 8px; padding: 6px 8px; border-radius: 6px;">
                <div style="
                  width: 16px; 
                  height: 16px; 
                  background: ${colors.slow}; 
                  border-radius: 50%; 
                  margin-right: 10px;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                "></div>
                <span style="color: #2c3e50; font-weight: 600; font-size: 12px; flex: 1;">
                  Slow
                </span>
                <span style="
                  color: #6c757d; 
                  font-size: 11px; 
                  font-weight: 600;
                  background: #e9ecef;
                  padding: 2px 6px;
                  border-radius: 10px;
                ">
                  ${stationCounts.slow}
                </span>
              </div>
              
              <div style="display: flex; align-items: center; margin-bottom: 8px; padding: 6px 8px; border-radius: 6px;">
                <div style="
                  width: 16px; 
                  height: 16px; 
                  background: ${colors.fast}; 
                  border-radius: 50%; 
                  margin-right: 10px;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                "></div>
                <span style="color: #2c3e50; font-weight: 600; font-size: 12px; flex: 1;">
                  Fast
                </span>
                <span style="
                  color: #6c757d; 
                  font-size: 11px; 
                  font-weight: 600;
                  background: #e9ecef;
                  padding: 2px 6px;
                  border-radius: 10px;
                ">
                  ${stationCounts.fast}
                </span>
              </div>
              
              <div style="display: flex; align-items: center; margin-bottom: 8px; padding: 6px 8px; border-radius: 6px;">
                <div style="
                  width: 16px; 
                  height: 16px; 
                  background: ${colors.ultrafast}; 
                  border-radius: 50%; 
                  margin-right: 10px;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                "></div>
                <span style="color: #2c3e50; font-weight: 600; font-size: 12px; flex: 1;">
                  Ultrafast
                </span>
                <span style="
                  color: #6c757d; 
                  font-size: 11px; 
                  font-weight: 600;
                  background: #e9ecef;
                  padding: 2px 6px;
                  border-radius: 10px;
                ">
                  ${stationCounts.ultrafast}
                </span>
              </div>
              
              ${stationCounts.other > 0 ? `
                <div style="display: flex; align-items: center; margin-bottom: 8px; padding: 6px 8px; border-radius: 6px;">
                  <div style="
                    width: 16px; 
                    height: 16px; 
                    background: ${colors.other}; 
                    border-radius: 50%; 
                    margin-right: 10px;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                  "></div>
                  <span style="color: #2c3e50; font-weight: 600; font-size: 12px; flex: 1;">
                    Other
                  </span>
                  <span style="
                    color: #6c757d; 
                    font-size: 11px; 
                    font-weight: 600;
                    background: #e9ecef;
                    padding: 2px 6px;
                    border-radius: 10px;
                  ">
                    ${stationCounts.other}
                  </span>
                </div>
              ` : ''}
            </div>
            
            <div style="
              text-align: center; 
              margin-top: 12px; 
              font-size: 10px; 
              color: #6c757d;
              font-weight: 500;
              padding: 6px;
              background: #f8f9fa;
              border-radius: 4px;
            ">
              ⚡ Updated ${new Date().getFullYear()}
            </div>
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
            margin-bottom: 12px;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            z-index: 999;
            position: relative;
          " title="Show Legend">
            <div style="
              color: ${colors.city_border};
              font-size: 20px;
              font-weight: 600;
              transition: transform 0.2s ease;
            ">
              📊
            </div>
          </div>
          
          <style>
            #expand-btn:hover {
              transform: scale(1.05) !important;
              box-shadow: 0 6px 20px rgba(0,0,0,0.2) !important;
              border-color: ${colors.city_border}dd !important;
            }
            
            #expand-btn:hover div {
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
          </style>
        `;
      }

      // Prevent map interactions
      DomEvent.disableClickPropagation(div);
      DomEvent.disableScrollPropagation(div);

      // Add event listeners
      if (isExpanded) {
        const collapseBtn = div.querySelector('#collapse-btn') as HTMLButtonElement;
        if (collapseBtn) {
          collapseBtn.onclick = (e) => {
            e.stopPropagation();
            setIsExpanded(false);
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

    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map, colors, stationCounts, isExpanded]);

  return null;
} 