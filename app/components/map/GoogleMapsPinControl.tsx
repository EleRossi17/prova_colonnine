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

  // Mouse down: inizia il drag
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragPosition({ x: e.clientX, y: e.clientY });
  };

  // Mouse move globale
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      // ⭐ MODIFICA: usiamo sempre il cursore come punto di riferimento
      setDragPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      if (!isDragging || !dragPosition) return;

      setIsDragging(false);

      // Ottieni il container della mappa
      const mapContainer = map.getContainer();
      const rect = mapContainer.getBoundingClientRect();

      const { x, y } = dragPosition;

      // Verifica se il cursore è sopra la mappa
      if (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      ) {
        // ⭐ MODIFICA: usiamo la posizione salvata del cursore (dragPosition)
        const containerPoint = map.containerPointToLatLng([
          x - rect.left,
          y - rect.top
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
  }, [isDragging, map, dragPosition]);

  // Previeni la selezione del testo durante il drag
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
      {/* Omino draggable fisso sulla UI */}
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
          opacity: isDragging ? 0.3 : 1,
          // ⭐ MODIFICA: lasciamo pointerEvents 'auto', non lo disattiviamo
          pointerEvents: 'auto',
        }}
      >
        <div
          className="flex flex-col items-center gap-2"
          style={{
            transform: isHovering && !isDragging ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 0.2s ease'
          }}
        >
          <div
            style={{
              fontSize: '56px',
              lineHeight: 1,
              userSelect: 'none',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }}
          >
            🚶
          </div>

          <div 
            className="text-center px-3 py-1 rounded-lg shadow-md"
            style={{
              backgroundColor: 'white',
              border: `2px solid ${colors.city_border}`
            }}
          >
            <div 
              className="text-xs font-bold"
              style={{ color: colors.city_border }}
            >
              Google Maps
            </div>
            <div className="text-[10px] text-gray-500 whitespace-nowrap">
              Trascina qui
            </div>
          </div>
        </div>
      </div>

      {/* Omino che segue il cursore durante il drag */}
      {isDragging && dragPosition && (
        <>
          {/* ⭐ MODIFICA: i piedi dell'omino coincidono col punto esatto */}
          <div
            style={{
              position: 'fixed',
              left: dragPosition.x,
              top: dragPosition.y,
              zIndex: 9999,
              pointerEvents: 'none',
              fontSize: '56px',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
              animation: 'bounce 0.5s ease infinite',
              transform: 'translate(-50%, -100%)', // centro in X, piedi sul punto
            }}
          >
            🚶
          </div>
          
          {/* Mirino di precisione centrato sul cursore */}
          <div
            style={{
              position: 'fixed',
              left: dragPosition.x,
              top: dragPosition.y,
              zIndex: 9998,
              pointerEvents: 'none',
              width: '32px',
              height: '32px',
              transform: 'translate(-50%, -50%)', // ⭐ centro esatto sul cursore
              border: `2px solid ${colors.city_border}`,
              borderRadius: '50%',
              backgroundColor: 'rgba(46, 134, 171, 0.15)',
              boxShadow: '0 0 0 2px white, 0 0 8px rgba(46, 134, 171, 0.5)'
            }}
          >
            {/* Croce centrale */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '16px',
                height: '16px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: '1px',
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
                  backgroundColor: colors.city_border,
                }}
              />
            </div>
            {/* Punto centrale */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: colors.city_border,
                boxShadow: `0 0 4px ${colors.city_border}`
              }}
            />
          </div>
        </>
      )}

      {/* Target zone indicator durante drag (facoltativo, puoi anche ridurlo se “disturba”) */}
      {isDragging && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 998,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.05)' // leggermente meno scuro
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              className="rounded-full mx-auto"
              style={{
                width: '120px',
                height: '120px',
                backgroundColor: colors.city_border,
                opacity: 0.25,
                animation: 'pulse 1.5s ease infinite',
                border: `4px dashed white`
              }}
            />
            <div
              className="text-xl font-bold mt-4 px-4 py-2 rounded-lg"
              style={{ 
                color: 'white',
                backgroundColor: colors.city_border,
                display: 'inline-block',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              📍 Il punto esatto è sotto il mirino
            </div>
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
          0%, 100% { transform: scale(1); opacity: 0.25; }
          50% { transform: scale(1.15); opacity: 0.45; }
        }
      `}</style>
    </>
  );
}
