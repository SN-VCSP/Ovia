import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Page, Consommation, TypePrelevement } from '../../types';
import Header from '../common/Header';
import Card from '../common/Card';
import { PlusIcon, MapIcon, ChartBarIcon, ClockIcon, FireIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import EditConsumptionModal from '../modals/EditConsumptionModal';
import DeleteConsumptionModal from '../modals/DeleteConsumptionModal';
import { BottleIcon, FaucetIcon } from '../common/Icons';


const DashboardScreen: React.FC = () => {
    const { currentChantier, navigateTo, setEditingConsommation, editingConsommation } = useAppContext();
    const [consumptionIdToDelete, setConsumptionIdToDelete] = useState<string | null>(null);

    if (!currentChantier) return null;

    const sortedConsommations = currentChantier.consommations.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const getIconForType = (type: TypePrelevement) => {
        switch (type) {
            case TypePrelevement.BorneIncendie:
                return <FireIcon className="h-6 w-6 text-red-500" />;
            case TypePrelevement.Bouteilles:
                return <BottleIcon />;
            case TypePrelevement.RobinetExterieur:
                return <FaucetIcon />;
            default:
                return null;
        }
    };

    const handleDelete = (consommationId: string) => {
        setConsumptionIdToDelete(consommationId);
    };
    
    const handleEdit = (consommation: Consommation) => {
        setEditingConsommation(consommation);
    };

    const QuickActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
        <button onClick={onClick} className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all space-y-2 text-center">
            <div className="bg-vinci-secondary text-vinci-primary p-3 rounded-full">{icon}</div>
            <span className="font-semibold text-vinci-primary">{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow p-4 md:p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Quick Actions */}
                    <section>
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                            <QuickActionButton icon={<PlusIcon className="h-7 w-7" />} label="Ajouter consommation" onClick={() => navigateTo(Page.AddConsumption)} />
                            <QuickActionButton icon={<MapIcon className="h-7 w-7" />} label="Voir la carte" onClick={() => navigateTo(Page.Map)} />
                            <QuickActionButton icon={<ChartBarIcon className="h-7 w-7" />} label="Analyse" onClick={() => navigateTo(Page.Analysis)} />
                        </div>
                    </section>
                    
                    {/* Recent Consumptions */}
                    <section>
                        <Card>
                            <h2 className="text-2xl font-bold text-vinci-primary mb-4">Consommations Récentes</h2>
                            {sortedConsommations.length > 0 ? (
                                <ul className="space-y-4">
                                    {sortedConsommations.map(conso => (
                                        <li key={conso.id} className="p-4 border rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                                            <div className="flex items-center space-x-4">
                                                {getIconForType(conso.type)}
                                                <div>
                                                    <p className="font-bold text-lg">{conso.volume.toLocaleString()} L <span className="text-sm font-normal text-gray-500">- {conso.type}</span></p>
                                                    <p className="text-sm text-gray-600 flex items-center"><ClockIcon className="h-4 w-4 mr-1 text-gray-400"/>{new Date(conso.date).toLocaleString('fr-FR')}</p>
                                                    {conso.commentaire && <p className="text-sm text-gray-500 mt-1 italic">"{conso.commentaire}"</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 self-end sm:self-center">
                                                <button onClick={() => handleEdit(conso)} className="p-2 text-gray-500 hover:text-vinci-primary hover:bg-gray-100 rounded-full transition-colors"><PencilIcon className="h-5 w-5"/></button>
                                                <button onClick={() => handleDelete(conso.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"><TrashIcon className="h-5 w-5"/></button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">Aucune consommation enregistrée pour ce chantier.</p>
                                    <button onClick={() => navigateTo(Page.AddConsumption)} className="mt-4 px-4 py-2 bg-vinci-secondary text-vinci-primary font-semibold rounded-md hover:bg-vinci-secondary-dark transition-colors">
                                        Enregistrer la première
                                    </button>
                                </div>
                            )}
                        </Card>
                    </section>
                </div>
            </main>
            {editingConsommation && <EditConsumptionModal />}
            {consumptionIdToDelete && <DeleteConsumptionModal consumptionId={consumptionIdToDelete} onClose={() => setConsumptionIdToDelete(null)} />}
        </div>
    );
};

export default DashboardScreen;