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
  isVisible,
}: ChargingStationFormProps) {
  const map = useMap();

  useEffect(() => {
    if (!isVisible) return;

    const formControl = new Control({ position: 'bottomright' });

    formControl.onAdd = () => {
      const div = document.createElement('div');
      div.innerHTML = `
        <div id="charging-station-form" style="
          background-color: rgba(255,255,255,0.98);
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
          <h4 style="margin-top:0;color:${colors.city_border};font-weight:600;">Add Charging Station</h4>
          <form id="station-form">
            <label>Station Name:</label>
            <input id="station-title" type="text" placeholder="A2A CREMA Marconi" required style="width:100%;margin-bottom:10px;"/>

            <label>City:</label>
            <input id="station-city" type="text" placeholder="Crema" required style="width:100%;margin-bottom:10px;"/>

            <label>Charging Type:</label>
            <select id="station-type" style="width:100%;margin-bottom:10px;">
              <option value="slow">Slow</option>
              <option value="fast">Fast</option>
              <option value="ultrafast">Ultrafast</option>
            </select>

            <label>Power (kW):</label>
            <input id="station-power" type="number" min="1" max="350" value="22" required style="width:100%;margin-bottom:10px;"/>

            <label>Installation Year:</label>
            <input id="station-year" type="number" min="2010" max="2030" value="2024" required style="width:100%;margin-bottom:10px;"/>

            <label>Latitude / Longitude:</label>
            <div style="display:flex;gap:8px;margin-bottom:10px;">
              <input id="latitude" type="number" value="${position?.lat.toFixed(6) || ''}" readonly style="flex:1;background:#f8f9fa;"/>
              <input id="longitude" type="number" value="${position?.lng.toFixed(6) || ''}" readonly style="flex:1;background:#f8f9fa;"/>
            </div>

            <div style="display:flex;gap:8px;margin-top:12px;">
              <button type="button" id="cancel-btn" style="flex:1;background:#6c757d;color:#fff;border:none;padding:8px;border-radius:6px;">Cancel</button>
              <button type="submit" id="submit-btn" style="flex:2;background:${colors.city_border};color:#fff;border:none;padding:8px;border-radius:6px;">Add</button>
            </div>
          </form>
        </div>
      `;

      const form = div.querySelector('#station-form') as HTMLFormElement;
      const cancelBtn = div.querySelector('#cancel-btn') as HTMLButtonElement;

      DomEvent.disableClickPropagation(div);
      DomEvent.disableScrollPropagation(div);

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const stationData = {
          Title: (div.querySelector('#station-title') as HTMLInputElement).value,
          city: (div.querySelector('#station-city') as HTMLInputElement).value,
          charging_station_type: (div.querySelector('#station-type') as HTMLSelectElement).value,
          PowerKW: parseFloat((div.querySelector('#station-power') as HTMLInputElement).value),
          installation_year: parseInt((div.querySelector('#station-year') as HTMLInputElement).value),
          year: parseInt((div.querySelector('#station-year') as HTMLInputElement).value),
          Latitude: parseFloat((div.querySelector('#latitude') as HTMLInputElement).value),
          Longitude: parseFloat((div.querySelector('#longitude') as HTMLInputElement).value),
          monthly_consumption_kwh: 0,
        };

        onSubmit(stationData);
      });

      cancelBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onClose();
      });

      return div;
    };

    formControl.addTo(map);

    return () => formControl.remove();
  }, [map, colors, position, onSubmit, onClose, isVisible]);

  return null;
}
