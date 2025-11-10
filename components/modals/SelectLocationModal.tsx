import React, { useEffect, useRef, useState } from 'react';
import { MapPinIcon, CheckIcon, XMarkIcon, LifebuoyIcon } from '@heroicons/react/24/solid';

// Leaflet global
declare const L: any;

interface SelectLocationModalProps {
    onClose: () => void;
    onLocationSelect: (coords: { lat: number; lng: number }) => void;
    initialCenter?: { lat: number; lng: number };
}

const SelectLocationModal: React.FC<SelectLocationModalProps> = ({ onClose, onLocationSelect, initialCenter }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const defaultCenter = { lat: 43.2965, lng: 5.3698 }; // Marseille
    const [centerCoords, setCenterCoords] = useState<{ lat: number; lng: number }>(initialCenter || defaultCenter);

    useEffect(() => {
        if (mapContainer.current && !mapInstance.current) {
            const map = L.map(mapContainer.current, { zoomControl: false }).setView([centerCoords.lat, centerCoords.lng], initialCenter ? 16 : 13);
            L.esri.basemapLayer('Imagery').addTo(map);
            L.control.zoom({ position: 'bottomright' }).addTo(map);

            map.on('move', () => {
                const center = map.getCenter();
                setCenterCoords({ lat: center.lat, lng: center.lng });
            });
            mapInstance.current = map;
        }
    }, [centerCoords.lat, centerCoords.lng, initialCenter]);

    const handleConfirm = () => {
        onLocationSelect(centerCoords);
    };

    const handleGeolocate = () => {
        if (navigator.geolocation && mapInstance.current) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    mapInstance.current.setView([latitude, longitude], 16);
                },
                (error) => {
                    alert(`Erreur de géolocalisation : ${error.message}`);
                }
            );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl h-[80vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-vinci-primary">Définir la localisation</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                        <XMarkIcon className="h-6 w-6 text-gray-600" />
                    </button>
                </div>
                <div className="flex-grow relative">
                    <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex flex-col items-center">
                            <MapPinIcon className="h-12 w-12 text-vinci-secondary drop-shadow-lg" style={{ transform: 'translateY(-50%)' }}/>
                        </div>
                    </div>
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/80 p-2 rounded-md shadow-md text-center text-sm font-semibold text-vinci-primary">
                        <p>Déplacez la carte pour positionner le marqueur</p>
                    </div>
                     <button
                        onClick={handleGeolocate}
                        className="absolute bottom-4 left-4 bg-white text-vinci-primary rounded-full p-3 shadow-lg hover:bg-gray-100 transition-transform hover:scale-110 z-[1000]"
                        aria-label="Me localiser"
                    >
                        <LifebuoyIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-4 bg-gray-50 rounded-b-lg flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                        <span className="font-semibold">Lat:</span> {centerCoords.lat.toFixed(5)}, <span className="font-semibold">Lng:</span> {centerCoords.lng.toFixed(5)}
                    </div>
                    <button onClick={handleConfirm} className="flex items-center px-6 py-2 text-sm font-medium text-white bg-vinci-primary border border-transparent rounded-md hover:bg-vinci-primary-dark">
                        <CheckIcon className="h-5 w-5 mr-2" />
                        Valider la position
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectLocationModal;
