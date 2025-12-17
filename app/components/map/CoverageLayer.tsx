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
  colors: {
    excellent: string;
    good: string;
    poor: string;
  };
};

export default function CoverageLayer({ stations, cityPolygon, colors }: CoverageLayerProps) {
  const map = useMap();

  // 🔝 Crea i pane con z-index per controllare l'ordine:
  //   city   (perimetro) > excellent (ottima) > good (buona) > poor (scarsa)
  useEffect(() => {
    // scarsa copertura (più in basso)
    if (!map.getPane('coverage-poor')) {
      const pane = map.createPane('coverage-poor');
      pane.style.zIndex = '410';
    }

    // buona copertura
    if (!map.getPane('coverage-good')) {
      const pane = map.createPane('coverage-good');
      pane.style.zIndex = '420';
    }

    // ottima copertura
    if (!map.getPane('coverage-excellent')) {
      const pane = map.createPane('coverage-excellent');
      pane.style.zIndex = '430';
    }

    // perimetro città (più in alto)
    if (!map.getPane('coverage-city')) {
      const pane = map.createPane('coverage-city');
      pane.style.zIndex = '440';
    }
  }, [map]);

  // 1️⃣ Fit bounds alla città quando viene attivato il layer
  useEffect(() => {
    if (cityPolygon) {
      try {
        const bbox = turf.bbox(cityPolygon);
        console.log('📍 Fitting bounds to city:', bbox);
        map.fitBounds(
          [
            [bbox[1], bbox[0]],
            [bbox[3], bbox[2]],
          ],
          { padding: [50, 50] }
        );
      } catch (error) {
        console.error('Error fitting bounds:', error);
      }
    }
  }, [cityPolygon, map]);

  // 2️⃣ Crea cerchi intorno a ogni colonnina (buffer 500m)
  const stationBuffers = useMemo(() => {
    if (!stations || stations.length === 0) {
      console.log('⚠️ Nessuna stazione da mostrare');
      return null;
    }

    console.log('🔵 Creando buffer per', stations.length, 'stazioni');

    try {
      const buffers = stations.map((station) => {
        const point = turf.point([station.Longitude, station.Latitude]);
        return turf.buffer(point, 0.5, { units: 'kilometers' });
      });

      // Unisce tutti i buffer in un unico poligono
      let union = buffers[0];
      for (let i = 1; i < buffers.length; i++) {
        try {
          union = turf.union(union, buffers[i]);
        } catch (e) {
          console.warn('Errore unione buffer', i, e);
        }
      }

      console.log('✅ Buffer creati e uniti');
      return union;
    } catch (error) {
      console.error('Errore creazione buffer:', error);
      return null;
    }
  }, [stations]);

  // 3️⃣ Calcola zone parzialmente coperte (500m - 2km)
  const partialCoverage = useMemo(() => {
    if (!stations || stations.length === 0) return null;

    console.log('🟡 Creando zone parziali');

    try {
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

      let union = partialBuffers[0];
      for (let i = 1; i < partialBuffers.length; i++) {
        if (partialBuffers[i]) {
          try {
            union = turf.union(union, partialBuffers[i]);
          } catch (e) {
            console.warn('Errore unione partial buffer', i);
          }
        }
      }

      // Interseca con il poligono città
      try {
        const result = turf.intersect(cityPolygon, union);
        console.log('✅ Zone parziali create');
        return result;
      } catch (e) {
        console.warn('Errore intersezione città/partial:', e);
        return union;
      }
    } catch (error) {
      console.error('Errore creazione zone parziali:', error);
      return null;
    }
  }, [stations, cityPolygon]);

  // 4️⃣ Calcola le zone scoperte (città - buffer)
  const uncoveredArea = useMemo(() => {
    if (!stationBuffers) {
      console.log('⚠️ Nessun buffer per calcolare zone scoperte');
      return null;
    }

    console.log('🔴 Creando zone scoperte');

    try {
      const difference = turf.difference(cityPolygon, stationBuffers);
      console.log('✅ Zone scoperte create');
      return difference;
    } catch (error) {
      console.error('Errore calcolo zone scoperte:', error);
      return null;
    }
  }, [cityPolygon, stationBuffers]);

  console.log('🗺️ Rendering CoverageLayer:', {
    cityPolygon: !!cityPolygon,
    stations: stations.length,
    stationBuffers: !!stationBuffers,
    partialCoverage: !!partialCoverage,
    uncoveredArea: !!uncoveredArea,
  });

  return (
    <>
      {/* Zone scoperte (scarsa copertura) - IN BASSO */}
      {uncoveredArea && (
        <GeoJSON
          key={`uncovered-${stations.length}-${Date.now()}`}
          data={uncoveredArea}
          pane="coverage-poor"
          style={{
            color: colors.poor,
            weight: 1,
            opacity: 0.35,
            fillColor: colors.poor,
            fillOpacity: 0.1,
          }}
          onEachFeature={(feature, layer) => {
            console.log('✅ Zone scoperte (poor) renderizzate');
          }}
        />
      )}

      {/* Zone parzialmente coperte (buona copertura) */}
      {partialCoverage && (
        <GeoJSON
          key={`partial-${stations.length}-${Date.now()}`}
          data={partialCoverage}
          pane="coverage-good"
          style={{
            color: colors.good,
            weight: 1,
            opacity: 0.35,
            fillColor: colors.good,
            fillOpacity: 0.12,
          }}
          onEachFeature={(feature, layer) => {
            console.log('✅ Zone parziali (good) renderizzate');
          }}
        />
      )}

      {/* Zone ben coperte (ottima copertura) */}
      {stationBuffers && (
        <GeoJSON
          key={`covered-${stations.length}-${Date.now()}`}
          data={stationBuffers}
          pane="coverage-excellent"
          style={{
            color: colors.excellent,
            weight: 1,
            opacity: 0.4,
            fillColor: colors.excellent,
            fillOpacity: 0.15,
          }}
          onEachFeature={(feature, layer) => {
            console.log('✅ Zone ben coperte (excellent) renderizzate');
          }}
        />
      )}

      {/* Perimetro città - SEMPRE IN PRIMO PIANO */}
      {cityPolygon && (
        <GeoJSON
          key={`city-${JSON.stringify(cityPolygon.geometry.coordinates[0][0])}`}
          data={cityPolygon}
          pane="coverage-city"
          style={{
            color: '#2E86AB',
            weight: 4,
            opacity: 1,
            fillOpacity: 0,
            dashArray: '10, 10',
          }}
          onEachFeature={(feature, layer) => {
            console.log('✅ Perimetro città renderizzato (in primo piano)');
          }}
        />
      )}
    </>
  );
}
