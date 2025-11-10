import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Page, TypePrelevement } from '../../types';
import Header from '../common/Header';
import Card from '../common/Card';
import { ArrowLeftIcon, CalculatorIcon, LockClosedIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

const AddConsumptionScreen: React.FC = () => {
    const { currentChantier, addConsommation, navigateTo } = useAppContext();

    const [type, setType] = useState<TypePrelevement>(TypePrelevement.BorneIncendie);
    const [volume, setVolume] = useState<string>('0');
    const [commentaire, setCommentaire] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [error, setError] = useState('');

    // Calculator state
    const [temps, setTemps] = useState<string>(''); // in minutes
    const [debit, setDebit] = useState<string>('300'); // L/min

    // Update debit and clear calculator when type changes
    useEffect(() => {
        setTemps('');
        setVolume('0');
        if (type === TypePrelevement.BorneIncendie) {
            setDebit('300');
        } else if (type === TypePrelevement.RobinetExterieur) {
            setDebit('12');
        } else {
            setDebit(''); // No default debit for bottles
        }
    }, [type]);

    // Calculate volume automatically when calculator inputs change
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
        }

        if (motDePasse !== currentChantier.motDePasse) {
            setError('Mot de passe du chantier incorrect.');
            return;
        }
        
        const finalVolume = parseFloat(volume);
        if (isNaN(finalVolume) || finalVolume <= 0) {
            setError('Le volume doit être un nombre supérieur à zéro.');
            return;
        }

        setError('');
        addConsommation({
            chantierId: currentChantier.id,
            type,
            volume: finalVolume,
            commentaire,
        });
        navigateTo(Page.Dashboard);
    };
    
    const showCalculator = type !== TypePrelevement.Bouteilles;

    return (
        <div className="flex flex-col min-h-screen bg-vinci-gray">
            <Header />
            <main className="flex-grow p-4 md:p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    <button onClick={() => navigateTo(Page.Dashboard)} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vinci-primary">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Retour au tableau de bord
                    </button>
                    <Card>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h2 className="text-2xl font-bold text-vinci-primary">Ajouter une consommation</h2>
                            
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type de prélèvement</label>
                                <select id="type" value={type} onChange={e => setType(e.target.value as TypePrelevement)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent sm:text-sm rounded-md">
                                    {Object.values(TypePrelevement).map(typeVal => (
                                        <option key={typeVal} value={typeVal}>{typeVal}</option>
                                    ))}
                                </select>
                            </div>

                            {showCalculator && (
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="font-semibold text-gray-800 flex items-center"><CalculatorIcon className="h-5 w-5 mr-2 text-vinci-accent"/>Aide au calcul (optionnel)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="temps" className="block text-sm font-medium text-gray-700">Temps (minutes)</label>
                                            <input id="temps" type="number" value={temps} min="0" step="any" onChange={e => setTemps(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent"/>
                                        </div>
                                        <div>
                                            <label htmlFor="debit" className="block text-sm font-medium text-gray-700">Débit (L/min)</label>
                                            <input id="debit" type="number" value={debit} min="0" step="any" onChange={e => setDebit(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent"/>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label htmlFor="volume" className="block text-sm font-medium text-gray-700">Volume total (L)</label>
                                <input id="volume" type="number" value={volume} min="0" step="any" onChange={e => setVolume(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent text-2xl font-bold"/>
                            </div>

                            <div>
                                <label htmlFor="commentaire" className="block text-sm font-medium text-gray-700 flex items-center">
                                    <ChatBubbleBottomCenterTextIcon className="h-4 w-4 mr-1.5 text-gray-500"/> Commentaire (optionnel)
                                </label>
                                <textarea id="commentaire" value={commentaire} onChange={e => setCommentaire(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent" placeholder="Ajouter une note..."/>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 flex items-center">
                                    <LockClosedIcon className="h-4 w-4 mr-1.5 text-gray-500"/> Mot de passe du chantier
                                </label>
                                <input id="password" type="password" value={motDePasse} onChange={e => setMotDePasse(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent" placeholder="••••••••"/>
                            </div>

                            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

                            <div className="flex justify-end pt-4">
                                <button type="submit" className="px-6 py-2 text-base font-medium text-white bg-vinci-primary border border-transparent rounded-md shadow-sm hover:bg-vinci-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vinci-accent">
                                    Enregistrer la consommation
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default AddConsumptionScreen;
