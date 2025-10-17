'use client';

import { useState, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { Control, DomEvent } from 'leaflet';
import { ChargingStation, MarkerClusterColors } from '@/app/types/charging-station';

interface ChargingStationFormProps {
  colors: MarkerClusterColors;
  position: { lat: number; lng: number } | null;
  onSubmit: (stationData: Partial<ChargingStation>) => void;
  onClose: () => void;
  isVisible: boolean;
}

export default function ChargingStationForm({
  colors,
  position,
  onSubmit,
  onClose,
  isVisible
}: ChargingStationFormProps) {
  const map = useMap();
  const [formData, setFormData] = useState<Partial<ChargingStation>>({
    charging_station: '',
    city: '',
    charging_station_type: 'fast',
    power_kw: 50,
    monthly_consumption_kwh: 0,
    installation_year: 2024,
    year: 2024,
    month: new Date().toLocaleDateString('en-US', { month: 'long' }),
    latitude: position?.lat || 0,
    longitude: position?.lng || 0,
  });

  // Update form position when position changes
  useEffect(() => {
    if (position) {
      setFormData(prev => ({
        ...prev,
        latitude: position.lat,
        longitude: position.lng,
      }));
    }
  }, [position]);

  useEffect(() => {
    if (!isVisible) return;

    const formControl = new Control({ position: 'bottomright' });

    formControl.onAdd = () => {
      const div = document.createElement('div');
      div.innerHTML = `
        <div id="charging-station-form" style="
          background-color: rgba(255, 255, 255, 0.98); 
          border: 2px solid ${colors.city_border}; 
          border-radius: 8px;
          padding: 16px; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 13px;
          min-width: 300px;
          max-width: 350px;
          max-height: 80vh;
          overflow-y: auto;
        ">
          
          <div style="
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 14px;
          ">
            <h4 style="
              margin: 0; 
              color: ${colors.city_border}; 
              font-size: 16px;
              font-weight: 600;
              letter-spacing: 0.3px;
            ">
              Add Charging Station
            </h4>
            <button id="close-form" style="
              background: transparent;
              border: none;
              font-size: 20px;
              color: #6c757d;
              cursor: pointer;
              padding: 2px 6px;
              border-radius: 4px;
            " onmouseover="this.style.backgroundColor='#f8f9fa';" onmouseout="this.style.backgroundColor='transparent';">
              ✕
            </button>
          </div>
          
          <form id="station-form">
            <div style="margin-bottom: 12px;">
              <label style="
                display: block; 
                margin-bottom: 4px; 
                font-weight: 500; 
                color: #2c3e50;
                font-size: 12px;
              ">
                Station Name:
              </label>
              <input 
                type="text" 
                id="station-name"
                required
                style="
                  width: 100%; 
                  padding: 8px 10px; 
                  border: 1px solid #ced4da; 
                  border-radius: 6px;
                  font-size: 13px;
                  font-weight: 500;
                  color: #2c3e50;
                "
                placeholder="Enter station name..."
              />
            </div>
            
            <div style="margin-bottom: 12px;">
              <label style="
                display: block; 
                margin-bottom: 4px; 
                font-weight: 500; 
                color: #2c3e50;
                font-size: 12px;
              ">
                City:
              </label>
              <input 
                type="text" 
                id="station-city"
                required
                style="
                  width: 100%; 
                  padding: 8px 10px; 
                  border: 1px solid #ced4da; 
                  border-radius: 6px;
                  font-size: 13px;
                  font-weight: 500;
                  color: #2c3e50;
                "
                placeholder="Enter city name..."
              />
            </div>
            
            <div style="margin-bottom: 12px;">
              <label style="
                display: block; 
                margin-bottom: 4px; 
                font-weight: 500; 
                color: #2c3e50;
                font-size: 12px;
              ">
                Charging Type:
              </label>
              <select id="station-type" style="
                width: 100%; 
                padding: 8px 10px; 
                border: 1px solid #ced4da; 
                border-radius: 6px;
                font-size: 13px;
                font-weight: 500;
                color: #2c3e50;
              ">
                <option value="slow">Slow Charging</option>
                <option value="fast" selected>Fast Charging</option>
                <option value="ultrafast">Ultrafast Charging</option>
              </select>
            </div>
            
            <div style="margin-bottom: 12px;">
              <label style="
                display: block; 
                margin-bottom: 4px; 
                font-weight: 500; 
                color: #2c3e50;
                font-size: 12px;
              ">
                Power (kW):
              </label>
              <input 
                type="number" 
                id="station-power"
                min="1"
                max="350"
                required
                style="
                  width: 100%; 
                  padding: 8px 10px; 
                  border: 1px solid #ced4da; 
                  border-radius: 6px;
                  font-size: 13px;
                  font-weight: 500;
                  color: #2c3e50;
                "
                placeholder="50"
                value="50"
              />
            </div>
            
            <div style="margin-bottom: 12px;">
              <label style="
                display: block; 
                margin-bottom: 4px; 
                font-weight: 500; 
                color: #2c3e50;
                font-size: 12px;
              ">
                Installation Year:
              </label>
              <input 
                type="number" 
                id="installation-year"
                min="2010"
                max="2030"
                required
                style="
                  width: 100%; 
                  padding: 8px 10px; 
                  border: 1px solid #ced4da; 
                  border-radius: 6px;
                  font-size: 13px;
                  font-weight: 500;
                  color: #2c3e50;
                "
                value="2024"
              />
            </div>
            
            <div style="margin-bottom: 12px;">
              <label style="
                display: block; 
                margin-bottom: 4px; 
                font-weight: 500; 
                color: #2c3e50;
                font-size: 12px;
              ">
                Position:
              </label>
              <div style="
                display: flex; 
                gap: 8px;
              ">
                <input 
                  type="number" 
                  id="latitude"
                  step="0.000001"
                  required
                  readonly
                  style="
                    flex: 1; 
                    padding: 8px 10px; 
                    border: 1px solid #ced4da; 
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 500;
                    color: #2c3e50;
                    background-color: #f8f9fa;
                  "
                  placeholder="Latitude"
                  value="${position?.lat.toFixed(6) || ''}"
                />
                <input 
                  type="number" 
                  id="longitude"
                  step="0.000001"
                  required
                  readonly
                  style="
                    flex: 1; 
                    padding: 8px 10px; 
                    border: 1px solid #ced4da; 
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 500;
                    color: #2c3e50;
                    background-color: #f8f9fa;
                  "
                  placeholder="Longitude"
                  value="${position?.lng.toFixed(6) || ''}"
                />
              </div>
            </div>
            
            <div style="
              display: flex; 
              gap: 8px; 
              margin-top: 16px;
            ">
              <button 
                type="button" 
                id="cancel-btn"
                style="
                  flex: 1;
                  padding: 10px; 
                  background-color: #6c757d; 
                  color: white; 
                  border: none; 
                  border-radius: 6px;
                  font-size: 12px;
                  font-weight: 600;
                  cursor: pointer;
                "
                onmouseover="this.style.backgroundColor='#545b62';" 
                onmouseout="this.style.backgroundColor='#6c757d';"
              >
                CANCEL
              </button>
              <button 
                type="submit"
                id="submit-btn"
                style="
                  flex: 2;
                  padding: 10px; 
                  background-color: ${colors.city_border}; 
                  color: white; 
                  border: none; 
                  border-radius: 6px;
                  font-size: 12px;
                  font-weight: 600;
                  cursor: pointer;
                "
                onmouseover="this.style.backgroundColor='#1a5f80';" 
                onmouseout="this.style.backgroundColor='${colors.city_border}';"
              >
                ADD STATION
              </button>
            </div>
          </form>
          
        </div>
      `;

      div.style.backgroundColor = 'transparent';
      div.style.border = 'none';

      // Prevent map interactions when interacting with the form
      const container = div.querySelector('#charging-station-form') as HTMLDivElement;
      if (container) {
        DomEvent.disableClickPropagation(container);
        DomEvent.disableScrollPropagation(container);
      }

      // Add event listeners
      const form = div.querySelector('#station-form') as HTMLFormElement;
      const closeBtn = div.querySelector('#close-form') as HTMLButtonElement;
      const cancelBtn = div.querySelector('#cancel-btn') as HTMLButtonElement;

      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          e.stopPropagation();

          const formData = new FormData(form);
          const stationData = {
            charging_station: (div.querySelector('#station-name') as HTMLInputElement).value,
            city: (div.querySelector('#station-city') as HTMLInputElement).value,
            charging_station_type: (div.querySelector('#station-type') as HTMLSelectElement).value,
            power_kw: parseInt((div.querySelector('#station-power') as HTMLInputElement).value),
            installation_year: parseInt((div.querySelector('#installation-year') as HTMLInputElement).value),
            year: parseInt((div.querySelector('#installation-year') as HTMLInputElement).value),
            month: new Date().toLocaleDateString('en-US', { month: 'long' }),
            latitude: parseFloat((div.querySelector('#latitude') as HTMLInputElement).value),
            longitude: parseFloat((div.querySelector('#longitude') as HTMLInputElement).value),
            monthly_consumption_kwh: 0,
          };

          onSubmit(stationData);
        });
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          onClose();
        });
      }

      if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          onClose();
        });
      }

      return div;
    };

    formControl.addTo(map);

    return () => {
      formControl.remove();
    };
  }, [map, colors, position, onSubmit, onClose, isVisible]);

  return null;
} 