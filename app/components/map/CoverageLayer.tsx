'use client';

import { useMemo } from 'react';
import { GeoJSON } from 'react-leaflet';
import * as turf from '@turf/turf';
import { ChargingStation } from '@/app/types/charging-station';

type CoverageLayerProps = {
  stations: ChargingStation[];
  cityPolygon: turf.helpers.Feature<
    turf.helpers.Polygon | turf.helpers.MultiPolygon
  >;
};

const MAX_GOOD_KM = 0.5; // 500 m
const MAX_MEDIUM_KM = 2; // 2 km

function getColor(distanceKm: number) {
  if (distanceKm <= MAX_GOOD_KM) return '#00aa00';   // verde
  if (distanceKm <= MAX_MEDIUM_KM) return '#ffcc00'; // giallo
  return '#ff0000';                                  // rosso
}

export default function CoverageLayer({
  stations,
  cityPolygon,
}: CoverageLayerProps) {
  const gridWithProps = useMemo(() => {
    if (!stations.length || !cityPolygon) return null;

    const bbox = turf.bbox(cityPolygon);
    const cellSizeKm = 0.4; // ~400 m

    let grid = turf.hexGrid(bbox, cellSizeKm, { units: 'kilometers' });

    const filteredFeatures: turf.helpers.Feature<turf.helpers.Polygon>[] = [];

    for (const cell of grid
      .features as turf.helpers.Feature<turf.helpers.Polygon>[]) {
      const intersection = turf.intersect(cell, cityPolygon);
      if (intersection) {
        filteredFeatures.push(
          intersection as turf.helpers.Feature<turf.helpers.Polygon>,
        );
      }
    }

    if (!filteredFeatures.length) return null;

    const stationPoints = turf.featureCollection(
      stations.map((s) =>
        turf.point([s.Longitude, s.Latitude], {
          id: s.id ?? s.Title,
        }),
      ),
    );

    const finalFeatures = filteredFeatures.map((cell) => {
      const centroid = turf.centroid(cell);
      const nearest = turf.nearestPoint(centroid, stationPoints);
      const distKm = turf.distance(centroid, nearest, {
        units: 'kilometers',
      });

      cell.properties = {
        ...cell.properties,
        distanceKm: distKm,
        color: getColor(distKm),
      };

      return cell;
    });

    return turf.featureCollection(finalFeatures);
  }, [stations, cityPolygon]);

  if (!gridWithProps) return null;

  return (
    <GeoJSON
      data={gridWithProps as any}
      style={(feature: any) => ({
        color: 'transparent',
        weight: 0,
        fillColor: feature?.properties?.color || '#000000',
        fillOpacity: 0.25,
      })}
    />
  );
}
