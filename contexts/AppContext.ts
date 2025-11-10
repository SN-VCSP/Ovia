// FIX: Defined the AppContext and its type to be used across the application.
import { createContext } from 'react';
import { Page, Chantier, Consommation, MockData, PointDEau } from '../types';

export interface AppContextType {
    // State
    currentPage: Page;
    currentChantier: Chantier | null;
    editingConsommation: Consommation | null;
    data: MockData;
    
    // Actions
    navigateTo: (page: Page) => void;
    selectChantier: (chantier: Chantier) => void;
    logout: () => void;
    returnToLogin: () => void;
    
    // Data modification
    addChantier: (chantierData: Omit<Chantier, 'id' | 'consommations'>) => Chantier;
    addConsommation: (consommationData: Omit<Consommation, 'id' | 'date'>) => void;
    updateConsommation: (updatedConsommation: Consommation) => void;
    deleteConsommation: (consommationId: string, motDePasse: string) => Promise<void>;
    setEditingConsommation: (consommation: Consommation | null) => void;
    addPointDEau: (pointDEauData: Omit<PointDEau, 'id'>) => void;
    setData: (newData: MockData) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);