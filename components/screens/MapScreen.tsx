import React, { useEffect, useRef, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import Header from '../common/Header';
import { useAppContext } from '../../hooks/useAppContext';
import { Page, PointDEau, TypePointDEau, StatutPointDEau } from '../../types';
import { ArrowLeftIcon, PlusIcon, FireIcon, StarIcon } from '@heroicons/react/24/solid';
import { FaucetIcon } from '../common/Icons';
import AddPointDEauModal from '../modals/AddPointDEauModal';
import AddConsumptionFromMapModal from '../modals/AddConsumptionFromMapModal';


// This is a workaround because the global L variable from the script tag is not typed in TS
declare const L: any;

const MapLegend = () => (
    <div className="absolute bottom-6 left-6 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg z-[1000]">
        <h4 className="font-bold text-vinci-primary mb-2">Légende</h4>
        <ul className="space-y-2 text-sm">
            <li className="flex items-center">
                <StarIcon className="h-6 w-6 text-vinci-secondary mr-2" />
                <span>Chantier actuel</span>
            </li>
            <li className="flex items-center">
                <FireIcon className="h-6 w-6 text-red-500 mr-2" />
                <span>Borne incendie</span>
            </li>
            <li className="flex items-center">
                <FaucetIcon className="w-6 h-6 text-blue-500 mr-2"/>
                <span>Robinet</span>
            </li>
             <li className="flex items-center opacity-60">
                <div className="w-6 h-6 mr-2 flex items-center justify-center filter grayscale">
                    <FireIcon className="h-6 w-6 text-red-500" />
                </div>
                <span>Hors service</span>
            </li>
        </ul>
    </div>
);

const MapScreen: React.FC = () => {
    const { navigateTo, data, currentChantier } = useAppContext();
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markerClusterGroup = useRef<any>(null);

    const [isAddPointModalOpen, setIsAddPointModalOpen] = useState(false);
    const [modalCenter, setModalCenter] = useState<[number, number] | null>(null);
    const [pointForConsumption, setPointForConsumption] = useState<PointDEau | null>(null);
    
    // Map Initialization Effect
    useEffect(() => {
        if (mapContainer.current && !mapInstance.current) {
            
            const map = L.map(mapContainer.current).setView([46.2276, 2.2137], 6); // Default center
            mapInstance.current = map;

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);
            
            markerClusterGroup.current = L.markerClusterGroup().addTo(map);

            // Fix for map not loading tiles correctly on initial render
            setTimeout(() => {
                map.invalidateSize();
            }, 0);
        }

        // Cleanup on unmount
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);


    // Marker Management Effect
    useEffect(() => {
        if(markerClusterGroup.current && mapInstance.current) {
            markerClusterGroup.current.clearLayers();
            const allMarkers: any[] = [];
            const bounds: [number, number][] = [];

            const createDivIcon = (icon: React.ReactElement, isOutOfService: boolean) => {
                const iconHtml = ReactDOMServer.renderToString(icon);
                const containerClass = isOutOfService ? 'opacity-60 filter grayscale' : '';
                return L.divIcon({
                    html: `<div class="${containerClass}">${iconHtml}</div>`,
                    className: 'bg-transparent border-0',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32]
                });
            };

            const baseBorneIcon = <FireIcon className="h-8 w-8 text-red-600 drop-shadow-lg" />;
            const baseRobinetIcon = <FaucetIcon className="h-8 w-8 text-blue-600 drop-shadow-lg" />;
            const chantierIcon = L.divIcon({
                html: ReactDOMServer.renderToString(<StarIcon className="h-10 w-10 text-vinci-secondary drop-shadow-lg" />),
                className: 'bg-transparent border-0',
                iconSize: [40, 40],
                iconAnchor: [20, 40]
            });
            
            // Add Chantier Marker
            if (currentChantier?.latitude && currentChantier?.longitude) {
                const chantierMarker = L.marker([currentChantier.latitude, currentChantier.longitude], { icon: chantierIcon });
                chantierMarker.bindTooltip(`<b>${currentChantier.nom}</b><br/>Votre chantier actuel`);
                allMarkers.push(chantierMarker);
                bounds.push([currentChantier.latitude, currentChantier.longitude]);
            }

            // Add Points d'Eau Markers
            data.pointsDEau.forEach((point: PointDEau) => {
                const isOutOfService = point.statut === StatutPointDEau.HorsService;
                const icon = createDivIcon(
                    point.type === TypePointDEau.BorneIncendie ? baseBorneIcon : baseRobinetIcon,
                    isOutOfService
                );
                const marker = L.marker([point.latitude, point.longitude], { icon });
                
                const popupContent = `
                    <div class="p-1" style="min-width: 200px;">
                        <h3 class="font-bold text-lg text-vinci-primary mb-1">${point.nom}</h3>
                        <p class="text-sm font-semibold ${isOutOfService ? 'text-red-600' : 'text-green-600'}">${point.statut}</p>
                        <p class="text-xs text-gray-500">${point.type}</p>
                        ${(point.contactNom || point.contactTel) ? '<hr class="my-2">' : ''}
                        ${point.contactNom ? `<p class="text-sm text-gray-800"><b class="font-semibold">Contact:</b> ${point.contactNom}</p>` : ''}
                        ${point.contactTel ? `<p class="text-sm text-gray-800"><b class="font-semibold">Tél:</b> ${point.contactTel}</p>` : ''}
                        ${!isOutOfService ? `<button class="add-consumption-btn-${point.id} w-full mt-3 px-3 py-1.5 bg-vinci-secondary text-vinci-primary font-semibold rounded-md hover:bg-vinci-secondary-dark transition-colors text-sm">
                            Ajouter une consommation
                        </button>` : ''}
                    </div>
                `;
                
                marker.bindPopup(popupContent);
                
                marker.on('popupopen', () => {
                    const btn = document.querySelector(`.add-consumption-btn-${point.id}`);
                    if (btn) {
                        btn.addEventListener('click', () => {
                             if (currentChantier) {
                                setPointForConsumption(point);
                                mapInstance.current.closePopup();
                            } else {
                                alert("Veuillez d'abord sélectionner un chantier pour ajouter une consommation.");
                            }
                        });
                    }
                });

                markerClusterGroup.current.addLayer(marker);
                bounds.push([point.latitude, point.longitude]);
            });

            // Add non-clustered markers (chantier) directly to map
            allMarkers.forEach(m => m.addTo(mapInstance.current));
            
            if (bounds.length > 0) {
                 mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
            } else if (navigator.geolocation) {
                 mapInstance.current.locate({ setView: true, maxZoom: 14 });
            }
        }

    }, [data.pointsDEau, currentChantier]);

    const handleOpenAddPointModal = () => {
        if (mapInstance.current) {
            const center = mapInstance.current.getCenter();
            setModalCenter([center.lat, center.lng]);
            setIsAddPointModalOpen(true);
        }
    }

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <main className="flex-grow p-4 md:p-8 flex flex-col">
                <div className="max-w-7xl mx-auto w-full flex-col flex flex-grow">
                     <button onClick={() => navigateTo(Page.Dashboard)} className="mb-6 self-start inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vinci-primary">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Retour au tableau de bord
                    </button>
                    <div className="relative flex-grow rounded-lg shadow-lg overflow-hidden">
                        <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
                        <MapLegend />
                        <button 
                            onClick={handleOpenAddPointModal}
                            className="absolute top-4 right-4 bg-vinci-primary text-white rounded-full p-4 shadow-lg hover:bg-vinci-primary-dark transition-transform hover:scale-110 z-[1000]"
                            aria-label="Ajouter un point d'eau"
                        >
                            <PlusIcon className="h-8 w-8" />
                        </button>
                    </div>
                </div>
            </main>
             {isAddPointModalOpen && modalCenter && <AddPointDEauModal center={modalCenter} onClose={() => setIsAddPointModalOpen(false)} />}
             {pointForConsumption && <AddConsumptionFromMapModal point={pointForConsumption} onClose={() => setPointForConsumption(null)} />}
        </div>
    );
};
export default MapScreen;