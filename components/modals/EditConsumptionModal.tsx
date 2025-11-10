import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { TypePrelevement, Consommation } from '../../types';
import { LockClosedIcon, ChatBubbleBottomCenterTextIcon, XMarkIcon } from '@heroicons/react/24/outline';

const EditConsumptionModal: React.FC = () => {
    const { currentChantier, editingConsommation, setEditingConsommation, updateConsommation } = useAppContext();

    const [formData, setFormData] = useState<Consommation | null>(editingConsommation);
    const [motDePasse, setMotDePasse] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        setFormData(editingConsommation);
    }, [editingConsommation]);
    
    if (!formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: name === 'volume' ? parseFloat(value) : value } : null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentChantier || !formData) return;

        if (motDePasse !== currentChantier.motDePasse) {
            setError('Mot de passe du chantier incorrect.');
            return;
        }
        if (formData.volume <= 0) {
            setError('Le volume doit être supérieur à zéro.');
            return;
        }

        setError('');
        updateConsommation(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-vinci-primary">Modifier la consommation</h2>
                    <button onClick={() => setEditingConsommation(null)} className="p-1 rounded-full hover:bg-gray-200">
                        <XMarkIcon className="h-6 w-6 text-gray-600"/>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type de prélèvement</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent">
                                {Object.values(TypePrelevement).map(typeVal => (
                                    <option key={typeVal} value={typeVal}>{typeVal}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="volume" className="block text-sm font-medium text-gray-700">Volume total (L)</label>
                            <input id="volume" name="volume" type="number" value={formData.volume} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent text-lg font-bold"/>
                        </div>
                        <div>
                            <label htmlFor="commentaire" className="block text-sm font-medium text-gray-700 flex items-center">
                                <ChatBubbleBottomCenterTextIcon className="h-4 w-4 mr-1.5 text-gray-500"/> Commentaire (optionnel)
                            </label>
                            <textarea id="commentaire" name="commentaire" value={formData.commentaire || ''} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent" placeholder="Ajouter une note..."/>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 flex items-center">
                                <LockClosedIcon className="h-4 w-4 mr-1.5 text-gray-500"/> Mot de passe du chantier
                            </label>
                            <input id="password" type="password" value={motDePasse} onChange={e => setMotDePasse(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent" placeholder="••••••••"/>
                        </div>
                         {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                    </div>
                    <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                        <button type="button" onClick={() => setEditingConsommation(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
                            Annuler
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-vinci-primary border border-transparent rounded-md hover:bg-vinci-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vinci-accent">
                            Enregistrer les modifications
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditConsumptionModal;