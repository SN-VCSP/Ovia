import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { CameraIcon, MapPinIcon } from '@heroicons/react/24/solid';
import SelectLocationModal from './SelectLocationModal';


interface CreateChantierModalProps {
    onClose: () => void;
}

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

const CreateChantierModal: React.FC<CreateChantierModalProps> = ({ onClose }) => {
    const { data, addChantier, selectChantier } = useAppContext();
    
    // Find default values programmatically for robustness
    const franceDefault = data.pays.find(p => p.nom === 'France');
    const medDefault = data.delegations.find(d => d.nom.includes('Méditerranée'));
    const portDeBoucDefault = data.agences.find(a => a.nom === 'Port-de-Bouc' && a.delegationId === medDefault?.id);

    const [paysId, setPaysId] = useState<string>(franceDefault?.id || data.pays[0]?.id || '');
    const [delegationId, setDelegationId] = useState<string>(medDefault?.id || '');
    const [agenceId, setAgenceId] = useState<string>(portDeBoucDefault?.id || '');
    const [nom, setNom] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isMapModalOpen, setMapModalOpen] = useState(false);

    const delegations = useMemo(() => data.delegations.filter(d => d.paysId === paysId), [data.delegations, paysId]);
    const agences = useMemo(() => data.agences.filter(a => a.delegationId === delegationId), [data.agences, delegationId]);
    
    // Auto-select the first delegation when the list changes and none is selected
    useEffect(() => {
        if (delegations.length > 0 && !delegationId) {
            setDelegationId(delegations[0].id);
        }
    }, [delegations, delegationId]);

    // Auto-select the first agency when the list changes and none is selected
    useEffect(() => {
        if (agences.length > 0 && !agenceId) {
            setAgenceId(agences[0].id);
        }
         // Reset agency if it's not in the new list of agencies
        if (agenceId && !agences.some(a => a.id === agenceId)) {
            setAgenceId(agences[0]?.id || '');
        }
    }, [agences, agenceId]);


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
        if (!agenceId || !nom || !motDePasse) {
            alert("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        let photoUrl = `https://picsum.photos/seed/${nom}/400/300`;
        if (photoFile) {
            photoUrl = await fileToBase64(photoFile);
        }

        const newChantier = addChantier({
            nom,
            agenceId,
            motDePasse,
            photoUrl: photoUrl,
            latitude: location?.lat,
            longitude: location?.lng,
        });

        selectChantier(newChantier);
        onClose();
    };

    return (
        <>
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6 border-b">
                     <h2 className="text-xl font-bold text-vinci-primary">Créer un nouveau chantier</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <p className="text-sm text-gray-600">Renseignez les informations pour créer un nouveau chantier et commencer à suivre les consommations.</p>
                        <select value={paysId} onChange={e => { setPaysId(e.target.value); setDelegationId(''); setAgenceId(''); }} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent">
                            <option value="">Sélectionner un pays</option>
                            {data.pays.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                        </select>
                        <select value={delegationId} disabled={!paysId} onChange={e => { setDelegationId(e.target.value); setAgenceId(''); }} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent disabled:bg-gray-200">
                             {delegations.length > 0 ? (
                                delegations.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)
                            ) : (
                                <option value="">Aucune délégation</option>
                            )}
                        </select>
                        <select value={agenceId} disabled={!delegationId || agences.length === 0} onChange={e => setAgenceId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent disabled:bg-gray-200">
                           {agences.length > 0 ? (
                                agences.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)
                           ) : (
                                <option value="">Aucune agence</option>
                           )}
                        </select>
                        <hr />
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nom du chantier*</label>
                            <input type="text" value={nom} onChange={e => setNom(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mot de passe du chantier*</label>
                            <input type="password" value={motDePasse} onChange={e => setMotDePasse(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Photo du chantier (optionnel)</label>
                            <div className="mt-1 flex items-center space-x-4">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Aperçu" className="h-16 w-16 rounded-md object-cover" />
                                ) : (
                                    <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                        <CameraIcon className="h-8 w-8" />
                                    </div>
                                )}
                                <label htmlFor="photo-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vinci-accent">
                                    <span>Sélectionner...</span>
                                    <input id="photo-upload" name="photo-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} />
                                </label>
                            </div>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Localisation du chantier (optionnel)</label>
                             <div className="mt-1 flex items-center space-x-4">
                                {location ? (
                                    <div className="flex-grow p-2 bg-gray-100 border rounded-md text-sm">
                                        <p className="font-semibold text-gray-800">Coordonnées enregistrées :</p>
                                        <p className="text-gray-600">{`Lat: ${location.lat.toFixed(5)}, Lng: ${location.lng.toFixed(5)}`}</p>
                                    </div>
                                ) : (
                                     <div className="flex-grow p-2 bg-gray-100 border rounded-md text-sm text-gray-500">
                                        Aucune localisation définie.
                                    </div>
                                )}
                                <button type="button" onClick={() => setMapModalOpen(true)} className="flex items-center bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    <MapPinIcon className="h-5 w-5 mr-2 text-vinci-accent" />
                                    {location ? 'Modifier' : 'Localiser'}
                                </button>
                             </div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
                            Annuler
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-vinci-primary border border-transparent rounded-md hover:bg-vinci-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vinci-accent">
                            Créer et accéder
                        </button>
                    </div>
                </form>
            </div>
        </div>
        {isMapModalOpen && <SelectLocationModal
            onClose={() => setMapModalOpen(false)}
            onLocationSelect={(coords) => {
                setLocation(coords);
                setMapModalOpen(false);
            }}
            initialCenter={location || undefined}
        />}
        </>
    );
};

export default CreateChantierModal;