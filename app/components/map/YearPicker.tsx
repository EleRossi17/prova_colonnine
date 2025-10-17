'use client';

import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { Control, DomEvent } from 'leaflet';
import { MarkerClusterColors } from '@/app/types/charging-station';

interface YearPickerProps {
  colors: MarkerClusterColors;
  selectedYear: number;
  minYear: number;
  maxYear: number;
  onYearChange: (year: number) => void;
}

export default function YearPicker({
  colors,
  selectedYear,
  minYear,
  maxYear,
  onYearChange
}: YearPickerProps) {
  const map = useMap();

  useEffect(() => {
    const pickerControl = new Control({ position: 'bottomleft' });

    pickerControl.onAdd = () => {
      const div = document.createElement('div');

      div.innerHTML = `
        <div id="year-picker-container" style="
          background: rgba(255, 255, 255, 0.95); 
          border: 2px solid ${colors.city_border}; 
          border-radius: 16px;
          padding: 16px; 
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
          backdrop-filter: blur(12px);
          min-width: 200px;
          user-select: none;
        ">
          
          <div style="
            text-align: center;
            margin-bottom: 16px;
          ">
            <h4 style="
              margin: 0 0 8px 0; 
              color: ${colors.city_border}; 
              font-size: 16px;
              font-weight: 700;
              letter-spacing: 0.3px;
            ">
              📅 Installation Year
            </h4>
            <div style="
              font-size: 11px;
              color: #6c757d;
              font-weight: 500;
            ">
              Stations installed up to this year
            </div>
          </div>
          
          <!-- Year Navigation -->
          <div style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
            gap: 12px;
          ">
            
            <!-- Previous Year Button -->
            <button 
              id="prev-year-btn"
              style="
                width: 44px;
                height: 44px;
                border: none;
                border-radius: 12px;
                background: ${selectedYear > minYear ? `linear-gradient(135deg, ${colors.city_border}, #1e5a8a)` : '#e9ecef'};
                color: ${selectedYear > minYear ? 'white' : '#6c757d'};
                font-size: 18px;
                font-weight: bold;
                cursor: ${selectedYear > minYear ? 'pointer' : 'not-allowed'};
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: ${selectedYear > minYear ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'};
                transition: all 0.2s ease;
              "
              ${selectedYear <= minYear ? 'disabled' : ''}
            >
              ←
            </button>
            
            <!-- Current Year Display -->
            <div style="
              flex: 1;
              text-align: center;
              background: linear-gradient(135deg, ${colors.city_border}, #1e5a8a);
              color: white;
              padding: 12px 16px;
              border-radius: 12px;
              font-size: 24px;
              font-weight: 800;
              box-shadow: 0 4px 16px rgba(0,0,0,0.2);
              letter-spacing: 0.5px;
            ">
              ${selectedYear}
            </div>
            
            <!-- Next Year Button -->
            <button 
              id="next-year-btn"
              style="
                width: 44px;
                height: 44px;
                border: none;
                border-radius: 12px;
                background: ${selectedYear < maxYear ? `linear-gradient(135deg, ${colors.city_border}, #1e5a8a)` : '#e9ecef'};
                color: ${selectedYear < maxYear ? 'white' : '#6c757d'};
                font-size: 18px;
                font-weight: bold;
                cursor: ${selectedYear < maxYear ? 'pointer' : 'not-allowed'};
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: ${selectedYear < maxYear ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'};
                transition: all 0.2s ease;
              "
              ${selectedYear >= maxYear ? 'disabled' : ''}
            >
              →
            </button>
          </div>
          
          <!-- Quick Jump Slider -->
          <div>
            <div style="
              font-size: 11px;
              color: #6c757d;
              text-align: center;
              margin-bottom: 8px;
              font-weight: 500;
            ">
              Quick jump: ${minYear} ← → ${maxYear}
            </div>
            <input 
              type="range" 
              id="year-slider"
              min="${minYear}" 
              max="${maxYear}" 
              value="${selectedYear}"
              style="
                width: 100%;
                height: 8px;
                border-radius: 4px;
                background: linear-gradient(to right, 
                  ${colors.city_border} 0%, 
                  ${colors.city_border} ${((selectedYear - minYear) / (maxYear - minYear)) * 100}%, 
                  #ddd ${((selectedYear - minYear) / (maxYear - minYear)) * 100}%, 
                  #ddd 100%);
                outline: none;
                -webkit-appearance: none;
                cursor: pointer;
              "
            />
          </div>
          
        </div>
        
        <style>
          #year-slider::-webkit-slider-thumb {
            appearance: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: linear-gradient(135deg, ${colors.city_border}, #1e5a8a);
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transition: all 0.2s ease;
          }
          
          #year-slider::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 3px 12px rgba(0,0,0,0.3);
          }
          
          #prev-year-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.2) !important;
          }
          
          #next-year-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.2) !important;
          }
          
          #prev-year-btn:active:not(:disabled),
          #next-year-btn:active:not(:disabled) {
            transform: translateY(0px);
          }
          
          /* Mobile responsive styles */
          @media (max-width: 768px) {
            #year-picker-container {
              position: fixed !important;
              bottom: 10px !important;
              left: 50% !important;
              transform: translateX(-50%) !important;
              min-width: 280px !important;
              max-width: 320px !important;
              width: 90vw !important;
              padding: 12px !important;
              border-radius: 12px !important;
              z-index: 1000 !important;
            }
            
            #year-picker-container h4 {
              font-size: 14px !important;
              margin: 0 0 6px 0 !important;
            }
            
            #year-picker-container > div:first-child {
              margin-bottom: 12px !important;
            }
            
            #year-picker-container > div:nth-child(2) {
              margin-bottom: 12px !important;
            }
            
            #year-picker-container > div:first-child > div:last-child {
              font-size: 10px !important;
            }
            
            #prev-year-btn, #next-year-btn {
              width: 36px !important;
              height: 36px !important;
              font-size: 16px !important;
            }
            
            #year-picker-container > div:nth-child(2) > div:nth-child(2) {
              font-size: 20px !important;
              padding: 8px 12px !important;
            }
            
            #year-picker-container > div:last-child > div:first-child {
              font-size: 10px !important;
              margin-bottom: 6px !important;
            }
            
            #year-slider {
              height: 6px !important;
            }
            
            #year-slider::-webkit-slider-thumb {
              width: 20px !important;
              height: 20px !important;
            }
          }
        </style>
      `;

      // Prevent map interactions
      DomEvent.disableClickPropagation(div);
      DomEvent.disableScrollPropagation(div);

      // Get elements
      const prevBtn = div.querySelector('#prev-year-btn') as HTMLButtonElement;
      const nextBtn = div.querySelector('#next-year-btn') as HTMLButtonElement;
      const slider = div.querySelector('#year-slider') as HTMLInputElement;

      // Previous year button
      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (selectedYear > minYear) {
            onYearChange(selectedYear - 1);
          }
        });
      }

      // Next year button
      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (selectedYear < maxYear) {
            onYearChange(selectedYear + 1);
          }
        });
      }

      // Slider
      if (slider) {
        slider.addEventListener('input', (e) => {
          const target = e.target as HTMLInputElement;
          const newYear = parseInt(target.value);
          onYearChange(newYear);
        });
      }

      // Keyboard navigation
      div.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && selectedYear > minYear) {
          e.preventDefault();
          onYearChange(selectedYear - 1);
        } else if (e.key === 'ArrowRight' && selectedYear < maxYear) {
          e.preventDefault();
          onYearChange(selectedYear + 1);
        }
      });

      // Make focusable for keyboard navigation
      div.setAttribute('tabindex', '0');

      return div;
    };

    pickerControl.addTo(map);

    return () => {
      pickerControl.remove();
    };
  }, [map, colors, selectedYear, minYear, maxYear, onYearChange]);

  return null;
} 