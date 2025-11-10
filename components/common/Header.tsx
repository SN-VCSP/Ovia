import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { PowerIcon, MapPinIcon, IdentificationIcon } from '@heroicons/react/24/solid';

const Header: React.FC = () => {
    const { currentChantier, logout, returnToLogin } = useAppContext();

    return (
        <header className="bg-vinci-primary text-white p-4 shadow-md flex justify-between items-center">
            <div className="flex items-center">
                <svg className="h-10 w-auto mr-4" viewBox="0 0 150 50" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <clipPath id="wave">
                            <path d="M 0 25 C 37.5 10, 112.5 40, 150 25 L 150 0 L 0 0 Z" />
                        </clipPath>
                    </defs>
                    {/* Bottom layer (White) */}
                    <text
                        x="0"
                        y="40"
                        fontFamily="Poppins, sans-serif"
                        fontSize="48"
                        fontWeight="900"
                        fill="white"
                        className="tracking-tight"
                    >
                        Ovia
                    </text>
                    {/* Top layer (Vinci Gold), clipped by the wave */}
                     <text
                        x="0"
                        y="40"
                        fontFamily="Poppins, sans-serif"
                        fontSize="48"
                        fontWeight="900"
                        fill="#FFC61E" 
                        className="tracking-tight"
                        clipPath="url(#wave)"
                    >
                        Ovia
                    </text>
                </svg>

                {currentChantier && (
                    <div className="hidden sm:flex items-center border-l border-white/30 pl-4">
                         <MapPinIcon className="h-5 w-5 mr-2 text-vinci-accent" />
                        <span className="font-semibold text-lg">{currentChantier.nom}</span>
                    </div>
                )}
            </div>
            
            <div className="flex items-center space-x-2">
                <button 
                    onClick={returnToLogin}
                    className="flex items-center p-2 rounded-full hover:bg-vinci-primary-dark transition-colors"
                    aria-label="Changer de chantier"
                >
                    <IdentificationIcon className="h-6 w-6" />
                </button>
                <button 
                    onClick={logout} 
                    className="flex items-center p-2 rounded-full hover:bg-vinci-primary-dark transition-colors"
                    aria-label="Déconnexion"
                >
                    <PowerIcon className="h-6 w-6" />
                </button>
            </div>
        </header>
    );
};

export default Header;