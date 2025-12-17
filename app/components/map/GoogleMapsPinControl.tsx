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

  // Handle mouse down per iniziare il drag
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragPosition({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse move globale
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setDragPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      
      setIsDragging(false);
      setDragPosition(null);

      // Ottieni il container della mappa
      const mapContainer = map.getContainer();
      const rect = mapContainer.getBoundingClientRect();

      // Verifica se il mouse è sopra la mappa
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        // Converti coordinate schermo a coordinate geografiche
        const containerPoint = map.containerPointToLatLng([
          e.clientX - rect.left,
          e.clientY - rect.top
        ]);
        
        const lat = containerPoint.lat.toFixed(6);
        const lng = containerPoint.lng.toFixed(6);

        console.log('📍 Apertura Google Maps a:', lat, lng);

        // Apri Google Maps
        const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&ll=${lat},${lng}&z=18`;
        window.open(googleMapsUrl, '_blank');
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, map]);

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
      {/* Omino draggable */}
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
          pointerEvents: isDragging ? 'none' : 'auto'
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
            backgroundColor: 'rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              className="rounded-full mx-auto"
              style={{
                width: '120px',
                height: '120px',
                backgroundColor: colors.city_border,
                opacity: 0.3,
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
              📍 Rilascia sulla mappa per aprire Google Maps
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
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.15); opacity: 0.5; }
        }
      `}</style>
    </>
  );
}
