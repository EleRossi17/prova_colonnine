'use client';

import { useEffect, useState, useRef } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { MarkerClusterColors } from '@/app/types/charging-station';

type GoogleMapsPinControlProps = {
  colors: MarkerClusterColors;
};

export default function GoogleMapsPinControl({ colors }: GoogleMapsPinControlProps) {
  const map = useMap();
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    // Crea un'immagine trasparente per il drag
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  // Handle dragging over map
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.clientX === 0 && e.clientY === 0) return; // Ignora l'ultimo evento
    setDragPosition({ x: e.clientX, y: e.clientY });
  };

  // Handle drop
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    setDragPosition(null);

    // Converti coordinate schermo a coordinate mappa
    const containerPoint = map.containerPointToLatLng([e.clientX, e.clientY]);
    const lat = containerPoint.lat;
    const lng = containerPoint.lng;

    // Apri Google Maps nella nuova tab
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&ll=${lat},${lng}&z=18`;
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <>
      {/* Omino draggable */}
      <div
        ref={pinRef}
        draggable
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="leaflet-control"
        style={{
          position: 'absolute',
          top: '50%',
          right: '20px',
          transform: 'translateY(-50%)',
          zIndex: 1000,
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'all 0.2s ease',
          opacity: isDragging ? 0.3 : 1
        }}
      >
        <div
          className="rounded-2xl shadow-lg overflow-hidden"
          style={{
            backgroundColor: 'white',
            border: `3px solid ${colors.city_border}`,
            padding: '12px',
            transform: isHovering && !isDragging ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 0.2s ease'
          }}
        >
          <div className="flex flex-col items-center gap-2">
            {/* Icona omino */}
            <div
              style={{
                fontSize: '48px',
                lineHeight: 1,
                userSelect: 'none'
              }}
            >
              🚶
            </div>
            
            {/* Testo */}
            <div className="text-center">
              <div 
                className="text-xs font-bold"
                style={{ color: colors.city_border }}
              >
                Google Maps
              </div>
              <div className="text-[10px] text-gray-500 whitespace-nowrap">
                Trascina sulla mappa
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Omino che segue il cursore durante il drag */}
      {isDragging && dragPosition && (
        <div
          style={{
            position: 'fixed',
            left: dragPosition.x - 30,
            top: dragPosition.y - 60,
            zIndex: 9999,
            pointerEvents: 'none',
            fontSize: '60px',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
            animation: 'bounce 0.5s ease infinite'
          }}
        >
          🚶
        </div>
      )}

      {/* Target zone indicator durante drag */}
      {isDragging && (
        <div
          className="leaflet-control"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 999,
            pointerEvents: 'none',
            textAlign: 'center'
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: '100px',
              height: '100px',
              backgroundColor: colors.city_border,
              opacity: 0.2,
              animation: 'pulse 1s ease infinite',
              border: `4px dashed ${colors.city_border}`
            }}
          />
          <div
            className="text-lg font-bold mt-2"
            style={{ 
              color: colors.city_border,
              textShadow: '0 2px 4px rgba(255,255,255,0.8)'
            }}
          >
            📍 Rilascia qui
          </div>
        </div>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.2); opacity: 0.3; }
        }
      `}</style>
    </>
  );
}
