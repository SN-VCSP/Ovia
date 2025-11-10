import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { PointDEau, TypePointDEau, TypePrelevement } from '../../types';
import { XMarkIcon, CalculatorIcon, LockClosedIcon, ChatBubbleBottomCenterTextIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface AddConsumptionFromMapModalProps {
    point: PointDEau;
    onClose: () => void;
}

const AddConsumptionFromMapModal: React.FC<AddConsumptionFromMapModalProps> = ({ point, onClose }) => {
    const { currentChantier, addConsommation } = useAppContext();

    const [type, setType] = useState<TypePrelevement>(TypePrelevement.BorneIncendie);
    const [volume, setVolume] = useState<string>('0');
    const [commentaire, setCommentaire] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [error, setError] = useState('');

    // Calculator state
    const [temps, setTemps] = useState<string>(''); // in minutes
    const [debit, setDebit] = useState<string>('300'); // L/min (default for fire hydrant)

    // Pre-fill type based on the point of interest
    useEffect(() => {
        setTemps('');
        setVolume('0');
        if (point.type === TypePointDEau.BorneIncendie) {
            setType(TypePrelevement.BorneIncendie);
            setDebit('300'); // Default for fire hydrant
        } else if (point.type === TypePointDEau.Robinet) {
            setType(TypePrelevement.RobinetExterieur);
            setDebit('12'); // Common default for a tap
        }
    }, [point]);
    
    // Calculate volume automatically
    useEffect(() => {
        const numTemps = parseFloat(temps);
        const numDebit = parseFloat(debit);
        if (!isNaN(numTemps) && !isNaN(numDebit) && numTemps >= 0 && numDebit >= 0) {
            setVolume(String(numTemps * numDebit));
        }
    }, [temps, debit]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentChantier) {
            setError("Aucun chantier n'est sélectionné.");
            return;
        };

        if (motDePasse !== currentChantier.motDePasse) {
            setError('Mot de passe du chantier incorrect.');
            return;
        }

        const finalVolume = parseFloat(volume);
        if (isNaN(finalVolume) || finalVolume <= 0) {
            setError('Le volume doit être supérieur à zéro.');
            return;
        }

        setError('');
        addConsommation({
            chantierId: currentChantier.id,
            type,
            volume: finalVolume,
            commentaire,
        });
        onClose();
    };
    
    const renderCalculator = () => (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="temps-map" className="block text-sm font-medium text-gray-700">Temps (minutes)</label>
                <input id="temps-map" type="number" value={temps} min="0" step="any" onChange={e => setTemps(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent"/>
            </div>
             <div>
                <label htmlFor="debit-map" className="block text-sm font-medium text-gray-700">Débit (L/min)</label>
                <input id="debit-map" type="number" value={debit} min="0" step="any" onChange={e => setDebit(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent"/>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[2000] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-vinci-primary">Ajouter une consommation</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                        <XMarkIcon className="h-6 w-6 text-gray-600"/>
                    </button>
                </div>
                 <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        <div className="p-3 bg-gray-100 rounded-md border border-gray-200">
                            <p className="text-sm font-medium text-gray-600">Point d'eau</p>
                            <p className="font-bold text-vinci-primary text-lg flex items-center"><MapPinIcon className="h-5 w-5 mr-2 text-vinci-accent" />{point.nom}</p>
                        </div>

                         <div>
                            <label className="block text-sm font-medium text-gray-900">Type de prélèvement</label>
                            <input type="text" value={type} disabled className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed" />
                        </div>
                        
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="font-semibold text-gray-800 flex items-center"><CalculatorIcon className="h-5 w-5 mr-2 text-vinci-accent"/>Aide au calcul (optionnel)</h3>
                                {renderCalculator()}
                        </div>
                        
                        <div>
                            <label htmlFor="volume-map" className="block text-sm font-medium text-gray-700">Volume total (L)</label>
                            <input id="volume-map" type="number" value={volume} min="0" step="any" onChange={e => setVolume(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent text-2xl font-bold"/>
                        </div>
                        
                         <div>
                            <label htmlFor="commentaire-map" className="block text-sm font-medium text-gray-700 flex items-center">
                              <ChatBubbleBottomCenterTextIcon className="h-4 w-4 mr-1.5 text-gray-500"/>  Commentaire (optionnel)
                            </label>
                            <textarea id="commentaire-map" value={commentaire} onChange={e => setCommentaire(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent" placeholder="Ajouter une note..."/>
                        </div>
                        <div>
                            <label htmlFor="password-map" className="block text-sm font-medium text-gray-700 flex items-center">
                                <LockClosedIcon className="h-4 w-4 mr-1.5 text-gray-500"/> Mot de passe du chantier
                            </label>
                            <input id="password-map" type="password" value={motDePasse} onChange={e => setMotDePasse(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent" placeholder="••••••••"/>
                        </div>

                        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

                    </div>
                    <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
                            Annuler
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-vinci-primary border border-transparent rounded-md hover:bg-vinci-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vinci-accent">
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddConsumptionFromMapModal;