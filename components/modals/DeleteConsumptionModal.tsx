import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { LockClosedIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

interface DeleteConsumptionModalProps {
    consumptionId: string;
    onClose: () => void;
}

const DeleteConsumptionModal: React.FC<DeleteConsumptionModalProps> = ({ consumptionId, onClose }) => {
    const { deleteConsommation } = useAppContext();
    const [motDePasse, setMotDePasse] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!motDePasse) {
            setError("Veuillez entrer le mot de passe.");
            return;
        }

        try {
            await deleteConsommation(consumptionId, motDePasse);
            onClose();
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de la suppression.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-vinci-primary">Confirmer la suppression</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                        <XMarkIcon className="h-6 w-6 text-gray-600"/>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <p className="text-sm text-gray-700">Pour supprimer cette consommation, veuillez entrer le mot de passe du chantier.</p>
                        <div>
                            <label htmlFor="password-delete" className="block text-sm font-medium text-gray-700 flex items-center">
                                <LockClosedIcon className="h-4 w-4 mr-1.5 text-gray-500"/> Mot de passe du chantier
                            </label>
                            <input
                                id="password-delete"
                                type="password"
                                value={motDePasse}
                                onChange={(e) => {
                                    setMotDePasse(e.target.value);
                                    setError('');
                                }}
                                required
                                autoFocus
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent"
                                placeholder="••••••••"
                            />
                        </div>
                         {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                    </div>
                    <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
                            Annuler
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center">
                            <TrashIcon className="h-5 w-5 mr-2"/>
                            Supprimer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeleteConsumptionModal;