import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { TypePointDEau, StatutPointDEau } from '../../types';
import { CameraIcon } from '@heroicons/react/24/solid';

interface AddPointDEauModalProps {
    onClose: () => void;
    center: [number, number];
}

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });


const AddPointDEauModal: React.FC<AddPointDEauModalProps> = ({ onClose, center }) => {
    const { addPointDEau } = useAppContext();

    const [nom, setNom] = useState('');
    const [type, setType] = useState<TypePointDEau>(TypePointDEau.BorneIncendie);
    const [statut, setStatut] = useState<StatutPointDEau>(StatutPointDEau.EnService);
    const [contactNom, setContactNom] = useState('');
    const [contactTel, setContactTel] = useState('');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const previewUrl = URL.createObjectURL(file);
            setPhotoPreview(previewUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nom) {
            alert("Veuillez donner un nom au point d'eau.");
            return;
        }

        let finalPhotoUrl = `https://picsum.photos/seed/${nom}/200/150`;
        if(photoFile) {
            finalPhotoUrl = await fileToBase64(photoFile);
        }

        addPointDEau({
            nom,
            type,
            latitude: center[0],
            longitude: center[1],
            photoUrl: finalPhotoUrl,
            statut,
            contactNom,
            contactTel,
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[2000] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6 border-b">
                     <h2 className="text-xl font-bold text-vinci-primary">Ajouter un point d'eau</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <p className="text-sm text-gray-600">Les coordonnées GPS sont automatiquement enregistrées depuis le centre de la carte.</p>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Coordonnées (Lat, Lng)</label>
                            <input type="text" value={`${center[0].toFixed(5)}, ${center[1].toFixed(5)}`} disabled className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nom du point d'eau*</label>
                            <input type="text" value={nom} onChange={e => setNom(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Type de point d'eau</label>
                            <select value={type} onChange={e => setType(e.target.value as TypePointDEau)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent">
                                {Object.values(TypePointDEau).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Statut opérationnel</label>
                            <select value={statut} onChange={e => setStatut(e.target.value as StatutPointDEau)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent">
                                {Object.values(StatutPointDEau).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <hr/>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Nom du contact (optionnel)</label>
                            <input type="text" value={contactNom} onChange={e => setContactNom(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent" placeholder="Ex: Service des eaux"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Téléphone du contact (optionnel)</label>
                            <input type="tel" value={contactTel} onChange={e => setContactTel(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent" placeholder="Ex: 01 23 45 67 89"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Photo (optionnel)</label>
                             <div className="mt-1 flex items-center space-x-4">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Aperçu" className="h-16 w-16 rounded-md object-cover" />
                                ) : (
                                    <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                        <CameraIcon className="h-8 w-8" />
                                    </div>
                                )}
                                <label htmlFor="photo-upload-point" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vinci-accent">
                                    <span>Sélectionner...</span>
                                    <input id="photo-upload-point" name="photo-upload-point" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} />
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
                            Annuler
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-vinci-primary border border-transparent rounded-md hover:bg-vinci-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vinci-accent">
                            Ajouter le point
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPointDEauModal;