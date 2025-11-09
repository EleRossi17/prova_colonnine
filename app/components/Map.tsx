'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ChargingStation, MarkerClusterColors } from '@/app/types/charging-station';
import { ChargingStationService } from '@/app/services/chargingStationService';

// Custom hook for responsive design
function useResponsive() {
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    function handleResize() {
      // Tailwind lg breakpoint is 1024px
      setIsLargeScreen(window.innerWidth >= 1024);
    }

    // Initial size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isLargeScreen };
}

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });

// Dynamically import custom components
const ChargingStationMarker = dynamic(() => import('./map/ChargingStationMarker'), { ssr: false });
const MapLegend = dynamic(() => import('./map/MapLegend'), { ssr: false });
const MapFilters = dynamic(() => import('./map/MapFilters'), { ssr: false });
const YearPicker = dynamic(() => import('./map/YearPicker'), { ssr: false });
const AddStationControl = dynamic(() => import('./map/AddStationControl'), { ssr: false });
const ChargingStationForm = dynamic(() => import('./map/ChargingStationForm'), { ssr: false });

export default function Map() {
  const { isLargeScreen } = useResponsive();

  const [leaflet, setLeaflet] = useState<any>(null);
  const [chargingStations, setChargingStations] = useState<ChargingStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  // Add station UI state
  const [isAddMode, setIsAddMode] = useState<boolean>(false);
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Color palette
  const colors: MarkerClusterColors = useMemo(
    () => ({
      city_border: '#2E86AB',
      istat_cells: '#A23B72',
      fast: '#F18F01',
      ultrafast: '#C73E1D',
      slow: '#4A90E2',
      other: '#6c757d',
    }),
    []
  );

  // Load Leaflet CSS and library
  useEffect(() => {
    import('leaflet').then((L) => {
      setLeaflet(L);

      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    });

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);

  // Fetch charging stations
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await ChargingStationService.fetchChargingStations();
        if (response.success) {
          setChargingStations(response.data);
          const years = response.data
            .map((station) => station.installation_year || station.year)
            .filter((year): year is number => Boolean(year));
          const maxYear = years.length ? Math.max(...years) : 2024;
          setSelectedYear(maxYear);
        } else {
          setError(response.error || 'Failed to fetch charging stations');
        }
      } catch (err) {
        console.error('Error fetching charging stations:', err);
        setError('Network error: Unable to fetch charging stations');
      } finally {
        setLoading(false);
      }
    };

    if (leaflet) fetchData();
  }, [leaflet]);

  // Apply filters
  const filteredStations = useMemo(() => {
    let filtered = chargingStations;

    // Filter by installation year
    filtered = filtered.filter((station) => {
      const installationYear = station.installation_year || station.year;
      return installationYear <= selectedYear;
    });

    // Filter by charging type
    if (selectedType) {
      filtered = filtered.filter((station) => station.charging_station_type === selectedType);
    }

    // Filter by city
    if (selectedCity) {
      filtered = filtered.filter((station) => station.city === selectedCity);
    }

    return filtered;
  }, [chargingStations, selectedYear, selectedType, selectedCity]);

  // Filter handlers
  const handleYearChange = (year: number) => setSelectedYear(year);
  const handleTypeChange = (type: string) => setSelectedType(type);
  const handleCityChange = (city: string) => setSelectedCity(city);

  const handleResetFilters = useCallback(() => {
    setSelectedType('');
    setSelectedCity('');
    const years = chargingStations
      .map((station) => station.installation_year || station.year)
      .filter((year): year is number => Boolean(year));
    if (years.length > 0) setSelectedYear(Math.max(...years));
  }, [chargingStations]);

  // Add / form logic
  const handleToggleAddMode = (active: boolean) => {
    setIsAddMode(active);
    if (!active) {
      setSelectedPosition(null);
      setShowForm(false);
    }
  };

  const handlePositionSelected = (position: { lat: number; lng: number }) => {
    setSelectedPosition(position);
    setShowForm(true);
  };

  const handleFormSubmit = useCallback(
    async (stationData: Partial<ChargingStation>) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        const response = await ChargingStationService.createChargingStation(stationData);
        if (response.success && response.data) {
          setChargingStations((prev) => [...prev, response.data!]);
          setShowForm(false);
          setIsAddMode(false);
          setSelectedPosition(null);
          alert('Charging station added successfully!');
        } else {
          alert('Error adding charging station: ' + (response.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error adding charging station:', error);
        alert('Error adding charging station. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting]
  );

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedPosition(null);
    setIsAddMode(false);
  };

  const handleStationDelete = useCallback(async (station: ChargingStation) => {
    if (!station.id) {
      console.warn('⚠️ Cannot delete station without ID:', station);
      return;
    }

    try {
      const response = await ChargingStationService.deleteChargingStation(station.id);
      if (response.success) {
        setChargingStations((prev) => prev.filter((s) => s.id !== station.id));
        alert('Charging station deleted successfully!');
      } else {
        alert('Error deleting charging station: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting charging station:', error);
      alert('Error deleting charging station. Please try again.');
    }
  }, []);

  // ✅ Fix for undefined type values
  const availableTypes = useMemo(() => {
    const types = new Set(
      chargingStations.map((station) => station.charging_station_type).filter((t): t is string => Boolean(t))
    );
    return Array.from(types).sort();
  }, [chargingStations]);

  // ✅ Fix for undefined city values
  const availableCities = useMemo(() => {
    const cities = new Set(
      chargingStations.map((station) => station.city).filter((c): c is string => Boolean(c))
    );
    return Array.from(cities).sort();
  }, [chargingStations]);

  // Year range
  const yearRange = useMemo(() => {
    const years = chargingStations
      .map((station) => station.installation_year || station.year)
      .filter((year): year is number => Boolean(year));
    if (years.length === 0) return { min: 2020, max: 2024 };
    return { min: Math.min(...years), max: Math.max(...years) };
  }, [chargingStations]);

  // Legend counts
  const stationCounts = useMemo(() => {
    const counts = {
      total: filteredStations.length,
      fast: 0,
      ultrafast: 0,
      slow: 0,
      other: 0,
    };
    filteredStations.forEach((station) => {
      switch (station.charging_station_type) {
        case 'fast':
          counts.fast++;
          break;
        case 'ultrafast':
          counts.ultrafast++;
          break;
        case 'slow':
          counts.slow++;
          break;
        default:
          counts.other++;
      }
    });
    return counts;
  }, [filteredStations]);

  const mapCenter: [number, number] = [45.5415, 10.2118]; // Brescia
  const mapZoom = 9;

  // Reset add mode on mobile
  useEffect(() => {
    if (!isLargeScreen) {
      setIsAddMode(false);
      setSelectedPosition(null);
      setShowForm(false);
      setSelectedType('');
      setSelectedCity('');
    }
  }, [isLargeScreen]);

  // Loading
  if (!leaflet || loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-lg font-semibold text-gray-700">
            {!leaflet ? 'Loading map...' : 'Loading charging stations...'}
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-600 text-2xl mb-4">⚠️</div>
          <div className="text-lg font-semibold text-gray-700 mb-2">Error Loading Map</div>
          <div className="text-gray-600">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full"
        zoomControl={true}
        scrollWheelZoom={true}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
        keyboard={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Markers */}
        {filteredStations.map((station) => (
          <ChargingStationMarker
            key={station.id || `${station.Title}-${station.Latitude}-${station.Longitude}`}
            station={station}
            colors={colors}
            onDelete={isLargeScreen ? handleStationDelete : undefined}
          />
        ))}

        {/* Year Picker */}
        <YearPicker
          colors={colors}
          selectedYear={selectedYear}
          minYear={yearRange.min}
          maxYear={yearRange.max}
          onYearChange={handleYearChange}
        />

        {/* Controls for large screen */}
        {isLargeScreen && (
          <>
            <MapLegend colors={colors} stationCounts={stationCounts} />
            <MapFilters
              colors={colors}
              selectedType={selectedType}
              selectedCity={selectedCity}
              availableTypes={availableTypes}
              availableCities={availableCities}
              onTypeChange={handleTypeChange}
              onCityChange={handleCityChange}
              onResetFilters={handleResetFilters}
            />
            <AddStationControl
              colors={colors}
              isAddMode={isAddMode}
              onToggleAddMode={handleToggleAddMode}
              onPositionSelected={handlePositionSelected}
            />
            {showForm && selectedPosition && (
              <ChargingStationForm
                colors={colors}
                position={selectedPosition}
                onSubmit={handleFormSubmit}
                onClose={handleFormClose}
                isVisible={showForm}
              />
            )}
          </>
        )}
      </MapContainer>

      {/* Loading overlay while submitting */}
      {isSubmitting && isLargeScreen && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-lg font-semibold text-gray-700">Adding charging station...</div>
          </div>
        </div>
      )}
    </div>
  );
}
