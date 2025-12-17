'use client';

import { useState, useRef, useEffect } from 'react';
import { useMap } from 'react-leaflet';
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

  const handleMouseDown = (e: React.MouseEvent) => {
    // Solo tasto sinistro
    if (e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    setDragPosition({ x: e.clientX, y: e.clientY });

    // 🔒 Disabilita il drag/pan della mappa mentre trascini
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setDragPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      if (!isDragging || !dragPosition) return;

      setIsDragging(false);

      // ✅ Riabilita interazioni mappa
      map.dragging.enable();
      map.scrollWheelZoom.enable();
      map.doubleClickZoom.enable();
      map.boxZoom.enable();

      const mapContainer = map.getContainer();
      const rect = mapContainer.getBoundingClientRect();

      const { x, y } = dragPosition;

      // Il punto esatto è il cursore (dragPosition)
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        const containerPoint = map.containerPointToLatLng([
          x - rect.left,
          y - rect.top,
        ]);

        const lat = containerPoint.lat.toFixed(6);
        const lng = containerPoint.lng.toFixed(6);

        console.log('📍 Apertura Google Maps a:', lat, lng);

        const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&ll=${lat},${lng}&z=18`;
        window.open(googleMapsUrl, '_blank');
      }

      setDragPosition(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    // ⚠️ IMPORTANTE: NIENTE dragPosition QUI
  }, [isDragging, map, dragPosition]);

  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  return (
    <>
      {/* Omino di controllo fisso */}
      <div
        ref={pinRef}
        onMouseDown={handleMouseDown}
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
          opacity: isDragging ? 0.4 : 1,
          pointerEvents: 'auto',
        }}
      >
        <div
          className="flex flex-col items-center gap-2"
          style={{
            transform: isHovering && !isDragging ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 0.2s ease',
          }}
        >
          <div
            style={{
              fontSize: '56px',
              lineHeight: 1,
              userSelect: 'none',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }}
          >
            🚶
          </div>

          <div
            className="text-center px-3 py-1 rounded-lg shadow-md"
            style={{
              backgroundColor: 'white',
              border: `2px solid ${colors.city_border}`,
            }}
          >
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

      {/* Omino + mirino durante il drag */}
      {isDragging && dragPosition && (
        <>
          {/* Omino che segue il cursore */}
          <div
            style={{
              position: 'fixed',
              left: dragPosition.x,
              top: dragPosition.y,
              zIndex: 9999,
              pointerEvents: 'none',
              fontSize: '56px',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
              transform: 'translate(-50%, -95%)', // piedi quasi sul punto
              animation: 'bounce 0.5s ease infinite',
            }}
          >
            🚶
          </div>

          {/* Mirino piccolo e preciso */}
          <div
            style={{
              position: 'fixed',
              left: dragPosition.x,
              top: dragPosition.y,
              zIndex: 10000,
              pointerEvents: 'none',
              width: '14px',
              height: '14px',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              border: `1px solid ${colors.city_border}`,
              backgroundColor: 'transparent',
              boxShadow: '0 0 3px rgba(0,0,0,0.6)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '1px',
                transform: 'translateY(-50%)',
                backgroundColor: colors.city_border,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: '1px',
                transform: 'translateX(-50%)',
                backgroundColor: colors.city_border,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                backgroundColor: colors.city_border,
              }}
            />
          </div>
        </>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
