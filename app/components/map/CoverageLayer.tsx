'use client';

import { useEffect, useMemo } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
// @ts-ignore
import * as turf from '@turf/turf';
import { ChargingStation } from '@/app/types/charging-station';
import type { Feature, Polygon, MultiPolygon } from 'geojson';

type CoverageLayerProps = {
  stations: ChargingStation[];
  cityPolygon: Feature<Polygon | MultiPolygon>;
};

export default function CoverageLayer({ stations, cityPolygon }: CoverageLayerProps) {
  const map = useMap();

  // 1️⃣ Crea cerchi intorno a ogni colonnina
  const stationBuffers = useMemo(() => {
    if (!stations.length) return null;

    const buffers = stations.map((station) => {
      const point = turf.point([station.Longitude, station.Latitude]);
      // Buffer di 500m (0.5 km) - zona ben coperta
      return turf.buffer(point, 0.5, { units: 'kilometers' });
    });

    // Unisce tutti i buffer in un unico poligono
    const union = buffers.reduce((acc, buf) => {
      if (!acc) return buf;
      return turf.union(acc, buf);
    }, buffers[0]);

    return union;
  }, [stations]);

  // 2️⃣ Calcola le zone scoperte (città - buffer)
  const uncoveredArea = useMemo(() => {
    if (!stationBuffers) return null;

    try {
      // Differenza tra il poligono città e i buffer delle colonnine
      const difference = turf.difference(cityPolygon, stationBuffers);
      return difference;
    } catch (error) {
      console.error('Error calculating uncovered area:', error);
      return null;
    }
  }, [cityPolygon, stationBuffers]);

  // 3️⃣ Calcola zone parzialmente coperte (500m - 2km)
  const partialCoverage = useMemo(() => {
    if (!stations.length) return null;

    const partialBuffers = stations.map((station) => {
      const point = turf.point([station.Longitude, station.Latitude]);
      const outer = turf.buffer(point, 2, { units: 'kilometers' });
      const inner = turf.buffer(point, 0.5, { units: 'kilometers' });
      
      try {
        return turf.difference(outer, inner);
      } catch {
        return outer;
      }
    });

    const union = partialBuffers.reduce((acc, buf) => {
      if (!acc || !buf) return buf || acc;
      try {
        return turf.union(acc, buf);
      } catch {
        return acc;
      }
    }, partialBuffers[0]);

    // Interseca con il poligono città
    try {
      return turf.intersect(cityPolygon, union);
    } catch {
      return union;
    }
  }, [stations, cityPolygon]);

  // 4️⃣ Fit bounds alla città quando viene attivato il layer
  useEffect(() => {
    if (cityPolygon) {
      try {
        const bbox = turf.bbox(cityPolygon);
        map.fitBounds([
          [bbox[1], bbox[0]],
          [bbox[3], bbox[2]]
        ], { padding: [50, 50] });
      } catch (error) {
        console.error('Error fitting bounds:', error);
      }
    }
  }, [cityPolygon, map]);

  return (
    <>
      {/* Perimetro città */}
      <GeoJSON
        data={cityPolygon}
        style={{
          color: '#2E86AB',
          weight: 3,
          opacity: 0.8,
          fillOpacity: 0,
          dashArray: '5, 10'
        }}
      />

      {/* Zone ben coperte (verde) */}
      {stationBuffers && (
        <GeoJSON
          key={`covered-${stations.length}`}
          data={stationBuffers}
          style={{
            color: '#00aa00',
            weight: 1,
            opacity: 0.6,
            fillColor: '#00aa00',
            fillOpacity: 0.3
          }}
        />
      )}

      {/* Zone parzialmente coperte (giallo) */}
      {partialCoverage && (
        <GeoJSON
          key={`partial-${stations.length}`}
          data={partialCoverage}
          style={{
            color: '#ffcc00',
            weight: 1,
            opacity: 0.6,
            fillColor: '#ffcc00',
            fillOpacity: 0.25
          }}
        />
      )}

      {/* Zone scoperte (rosso) */}
      {uncoveredArea && (
        <GeoJSON
          key={`uncovered-${stations.length}`}
          data={uncoveredArea}
          style={{
            color: '#ff0000',
            weight: 1,
            opacity: 0.6,
            fillColor: '#ff0000',
            fillOpacity: 0.2
          }}
        />
      )}
    </>
  );
}
