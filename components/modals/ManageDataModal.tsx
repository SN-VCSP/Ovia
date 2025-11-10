// FIX: Implemented the ManageDataModal component for data operations.
import React, { useRef } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { MOCK_DATA } from '../../data/mockData';
import { XMarkIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface ManageDataModalProps {
    onClose: () => void;
}

const ManageDataModal: React.FC<ManageDataModalProps> = ({ onClose }) => {
    const { data, setData } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        try {
            const dataStr = JSON.stringify(data, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = 'ovia_data_export.json';

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        } catch (error) {
            console.error("Failed to export data", error);
            alert("Erreur lors de l'exportation des données.");
        }
    };
    
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("File content is not a string");
                }
                const importedData = JSON.parse(text);
                // Basic validation can be added here
                if (importedData.chantiers && importedData.pointsDEau) {
                    setData(importedData);
                    alert('Données importées avec succès !');
                    onClose();
                } else {
                    throw new Error("Invalid data format");
                }
            } catch (error) {
                console.error("Failed to import data", error);
                alert("Erreur lors de l'importation du fichier. Assurez-vous que le fichier JSON est valide.");
            }
        };
        reader.readAsText(file);
        // Reset file input value to allow re-importing the same file
        event.target.value = '';
    };

    const handleReset = () => {
        if (window.confirm("Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.")) {
            setData(MOCK_DATA);
            alert('Les données ont été réinitialisées.');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-vinci-primary">Gérer les données</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                        <XMarkIcon className="h-6 w-6 text-gray-600"/>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                     <p className="text-sm text-gray-600">
                        Vous pouvez exporter les données actuelles, importer un fichier de données, ou réinitialiser l'application aux données par défaut.
                    </p>
                    <button
                        onClick={handleExport}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                        Exporter les données (.json)
                    </button>
                    <button
                        onClick={handleImportClick}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                        Importer les données (.json)
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".json"
                        className="hidden"
                    />
                     <button
                        onClick={handleReset}
                        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <ArrowPathIcon className="h-5 w-5 mr-2 text-red-500" />
                        Réinitialiser les données
                    </button>
                </div>
                 <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageDataModal;