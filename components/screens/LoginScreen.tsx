// FIX: Implemented the LoginScreen component.
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import Card from '../common/Card';
import CreateChantierModal from '../modals/CreateChantierModal';
import ManageDataModal from '../modals/ManageDataModal';
import { Cog6ToothIcon, ArrowRightOnRectangleIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

const LoginScreen: React.FC = () => {
    const { data, selectChantier } = useAppContext();
    const [selectedChantierId, setSelectedChantierId] = useState<string>(data.chantiers[0]?.id || '');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isManageDataModalOpen, setManageDataModalOpen] = useState(false);

    const hasChantiers = data.chantiers.length > 0;

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedChantierId) {
            setError('Veuillez sélectionner un chantier.');
            return;
        }

        const chantier = data.chantiers.find(c => c.id === selectedChantierId);
        if (!chantier) {
            setError('Chantier non trouvé.');
            return;
        }

        if (chantier.motDePasse === password) {
            selectChantier(chantier);
        } else {
            setError('Mot de passe incorrect.');
        }
    };

    return (
        <>
            <div className="min-h-screen bg-vinci-gray flex flex-col justify-center items-center p-4">
                <header className="absolute top-0 right-0 p-4">
                    <button onClick={() => setManageDataModalOpen(true)} className="p-2 text-gray-500 hover:text-vinci-primary transition-colors" aria-label="Gérer les données">
                        <Cog6ToothIcon className="h-6 w-6" />
                    </button>
                </header>
                <div className="text-center mb-8">
                    <svg className="h-20 w-auto mx-auto" viewBox="0 0 150 50" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <clipPath id="waveLogin">
                                <path d="M 0 25 C 37.5 10, 112.5 40, 150 25 L 150 0 L 0 0 Z" />
                            </clipPath>
                        </defs>
                        {/* Bottom layer (Vinci Blue) */}
                        <text
                            x="0"
                            y="40"
                            fontFamily="Poppins, sans-serif"
                            fontSize="48"
                            fontWeight="900"
                            fill="#002D5B"
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
                            clipPath="url(#waveLogin)"
                        >
                            Ovia
                        </text>
                    </svg>
                    <h1 className="mt-2 text-3xl font-bold text-vinci-primary">Suivi de Consommation d'Eau</h1>
                    <p className="text-gray-600 mt-2">Connectez-vous à votre chantier pour commencer.</p>
                </div>

                <Card className="w-full max-w-md">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="chantier" className="block text-sm font-medium text-gray-700">
                                Sélectionner un chantier
                            </label>
                            <select
                                id="chantier"
                                value={selectedChantierId}
                                onChange={(e) => setSelectedChantierId(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent sm:text-sm rounded-md"
                                required={hasChantiers}
                            >
                                {hasChantiers ? (
                                    data.chantiers.map(chantier => (
                                        <option key={chantier.id} value={chantier.id}>
                                            {chantier.nom}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>
                                        Créer ton chantier
                                    </option>
                                )}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-gray-700">
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent sm:text-sm disabled:bg-gray-200"
                                placeholder="••••••••"
                                disabled={!hasChantiers}
                            />
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-vinci-primary hover:bg-vinci-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={!hasChantiers}
                            >
                                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                                Se connecter
                            </button>
                        </div>
                    </form>
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Ou</span>
                            </div>
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={() => setCreateModalOpen(true)}
                                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <PlusCircleIcon className="h-5 w-5 mr-2 text-vinci-accent" />
                                Créer un nouveau chantier
                            </button>
                        </div>
                    </div>
                </Card>
            </div>
            {isCreateModalOpen && <CreateChantierModal onClose={() => setCreateModalOpen(false)} />}
            {isManageDataModalOpen && <ManageDataModal onClose={() => setManageDataModalOpen(false)} />}
        </>
    );
};

export default LoginScreen;