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
    // Responsive hook - mobile first approach
    const { isLargeScreen } = useResponsive();

    const [leaflet, setLeaflet] = useState<any>(null);
    const [chargingStations, setChargingStations] = useState<ChargingStation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<number>(2024);
    const [selectedType, setSelectedType] = useState<string>('');
    const [selectedCity, setSelectedCity] = useState<string>('');

    // State for add station functionality - only relevant for large screens
    const [isAddMode, setIsAddMode] = useState<boolean>(false);
    const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Professional color scheme - memoized to prevent recreation
    const colors: MarkerClusterColors = useMemo(() => ({
        city_border: '#2E86AB',  // Professional blue
        istat_cells: '#A23B72',  // Deep purple
        fast: '#F18F01',         // Orange for fast charging
        ultrafast: '#C73E1D',    // Red for ultrafast
        slow: '#4A90E2',         // Light blue for slow
        other: '#6c757d'         // Gray for others
    }), []);

    // Load Leaflet CSS and library on client side
    useEffect(() => {
        import('leaflet').then((L) => {
            setLeaflet(L);

            // Fix for default markers in React-Leaflet
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });
        });

        // Load Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
        document.head.appendChild(link);

        return () => {
            if (document.head.contains(link)) {
                document.head.removeChild(link);
            }
        };
    }, []);

    // Fetch charging stations data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await ChargingStationService.fetchChargingStations();
                if (response.success) {
                    setChargingStations(response.data);
                    // Set initial year to the maximum year in the dataset
                    const years = response.data.map(station =>
                        station.installation_year || station.year
                    ).filter(year => year);
                    const maxYear = Math.max(...years);
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

        if (leaflet) {
            fetchData();
        }
    }, [leaflet]);

    // Apply filters - optimized with useMemo
    const filteredStations = useMemo(() => {
        let filtered = chargingStations;

        // Filter by installation year (show all stations installed up to selected year)
        filtered = filtered.filter(station => {
            const installationYear = station.installation_year || station.year;
            return installationYear <= selectedYear;
        });

        // Filter by charging type
        if (selectedType) {
            filtered = filtered.filter(station =>
                station.charging_station_type === selectedType
            );
        }

        // Filter by city
        if (selectedCity) {
            filtered = filtered.filter(station =>
                station.city === selectedCity
            );
        }

        return filtered;
    }, [chargingStations, selectedYear, selectedType, selectedCity]);

    // Handle filter changes
    const handleYearChange = (year: number) => setSelectedYear(year);
    const handleTypeChange = (type: string) => setSelectedType(type);
    const handleCityChange = (city: string) => setSelectedCity(city);

    // Reset filters - memoized
    const handleResetFilters = useCallback(() => {
        setSelectedType('');
        setSelectedCity('');
        // Reset year to maximum available year
        const years = chargingStations.map(station =>
            station.installation_year || station.year
        ).filter(year => year);
        if (years.length > 0) {
            setSelectedYear(Math.max(...years));
        }
    }, [chargingStations]);

    // Handle add station mode and form interactions
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

    // Handle form submission for new station - memoized
    const handleFormSubmit = useCallback(async (stationData: Partial<ChargingStation>) => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await ChargingStationService.createChargingStation(stationData);
            if (response.success && response.data) {
                // Add the new station to the list
                setChargingStations(prev => [...prev, response.data!]);

                // Close form and reset add mode
                setShowForm(false);
                setIsAddMode(false);
                setSelectedPosition(null);

                // Show success message
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
    }, [isSubmitting]);

    const handleFormClose = () => {
        setShowForm(false);
        setSelectedPosition(null);
        setIsAddMode(false);
    };

    // Handle station deletion - memoized
    const handleStationDelete = useCallback(async (station: ChargingStation) => {
        if (!window.confirm('Are you sure you want to delete this charging station?')) {
            return;
        }

        try {
            const response = await ChargingStationService.deleteChargingStation(station.id);
            if (response.success) {
                // Remove the station from the list
                setChargingStations(prev => prev.filter(s => s.id !== station.id));
                alert('Charging station deleted successfully!');
            } else {
                alert('Error deleting charging station: ' + (response.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error deleting charging station:', error);
            alert('Error deleting charging station. Please try again.');
        }
    }, []);

    // Get unique values for filters - memoized
    const availableTypes = useMemo(() => {
        const types = new Set(chargingStations.map(station => station.charging_station_type));
        return Array.from(types).filter(type => type).sort();
    }, [chargingStations]);

    // Get unique cities for filter - memoized
    const availableCities = useMemo(() => {
        const cities = new Set(chargingStations.map(station => station.city));
        return Array.from(cities).filter(city => city).sort();
    }, [chargingStations]);

    // Get year range for slider - memoized
    const yearRange = useMemo(() => {
        const years = chargingStations.map(station =>
            station.installation_year || station.year
        ).filter(year => year);

        if (years.length === 0) return { min: 2020, max: 2024 };

        return {
            min: Math.min(...years),
            max: Math.max(...years)
        };
    }, [chargingStations]);

    // Calculate station counts for legend - memoized
    const stationCounts = useMemo(() => {
        const counts = {
            total: filteredStations.length,
            fast: 0,
            ultrafast: 0,
            slow: 0,
            other: 0
        };

        filteredStations.forEach(station => {
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

    // Fixed map center on Brescia, Italy with zoom level 8
    const mapCenter: [number, number] = [45.5415, 10.2118]; // Brescia, Italy
    const mapZoom = 9;

    // Reset add mode when switching to mobile view
    useEffect(() => {
        if (!isLargeScreen) {
            setIsAddMode(false);
            setSelectedPosition(null);
            setShowForm(false);
            // Reset type and city filters on mobile for cleaner experience
            setSelectedType('');
            setSelectedCity('');
        }
    }, [isLargeScreen]);

    // Loading state
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

    // Error state
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

                {/* Render all charging station markers */}
                {filteredStations.map((station) => (
                    <ChargingStationMarker
                        key={station.id}
                        station={station}
                        colors={colors}
                        onDelete={isLargeScreen ? handleStationDelete : undefined}
                    />
                ))}

                {/* Year Picker - Simple and intuitive for all devices */}
                <YearPicker
                    colors={colors}
                    selectedYear={selectedYear}
                    minYear={yearRange.min}
                    maxYear={yearRange.max}
                    onYearChange={handleYearChange}
                />

                {/* Large Screen Controls - Only render on large screens */}
                {isLargeScreen && (
                    <>
                        <MapLegend
                            colors={colors}
                            stationCounts={stationCounts}
                        />

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

                        {/* Form for adding new stations */}
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

            {/* Loading overlay when submitting - only on large screens */}
            {isSubmitting && isLargeScreen && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                        <div className="text-lg font-semibold text-gray-700">
                            Adding charging station...
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 