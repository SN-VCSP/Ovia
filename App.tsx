import React, { useState, useCallback, useEffect } from 'react';
import { AppContext, AppContextType } from './contexts/AppContext';
import { Page, Chantier, Consommation, MockData, PointDEau } from './types';
import { MOCK_DATA } from './data/mockData';
import LoginScreen from './components/screens/LoginScreen';
import DashboardScreen from './components/screens/DashboardScreen';
import AddConsumptionScreen from './components/screens/AddConsumptionScreen';
import MapScreen from './components/screens/MapScreen';
import AnalysisScreen from './components/screens/AnalysisScreen';
import { v4 as uuidv4 } from 'uuid';

const APP_DATA_KEY = 'ovia-app-data';

// Helper function to parse dates from storage
const parseDataDates = (data: MockData): MockData => {
    data.chantiers.forEach((chantier: Chantier) => {
        chantier.consommations.forEach((conso: Consommation) => {
            conso.date = new Date(conso.date);
        });
    });
    return data;
};


const App: React.FC = () => {
    const [data, setDataState] = useState<MockData>(() => {
        try {
            const storedData = localStorage.getItem(APP_DATA_KEY);
            if (storedData) {
                return parseDataDates(JSON.parse(storedData));
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        }
        return MOCK_DATA;
    });

    const [currentPage, setCurrentPage] = useState<Page>(Page.Login);
    const [currentChantier, setCurrentChantier] = useState<Chantier | null>(null);
    const [editingConsommation, setEditingConsommation] = useState<Consommation | null>(null);

    const setData = useCallback((newData: MockData) => {
        try {
            localStorage.setItem(APP_DATA_KEY, JSON.stringify(newData));
            setDataState(newData);
        } catch (error) {
            console.error("Failed to save data to localStorage", error);
        }
    }, []);

    const navigateTo = (page: Page) => {
        setCurrentPage(page);
    };

    const selectChantier = (chantier: Chantier) => {
        setCurrentChantier(chantier);
        navigateTo(Page.Dashboard);
    };

    const logout = () => {
        setCurrentChantier(null);
        navigateTo(Page.Login);
    };
    
    const returnToLogin = () => {
        setCurrentChantier(null);
        navigateTo(Page.Login);
    };

    const addChantier = (chantierData: Omit<Chantier, 'id' | 'consommations'>): Chantier => {
        const newChantier: Chantier = {
            ...chantierData,
            id: uuidv4(),
            consommations: [],
        };
        const newData = { ...data, chantiers: [...data.chantiers, newChantier] };
        setData(newData);
        return newChantier;
    };

    const addConsommation = (consommationData: Omit<Consommation, 'id'|'date'>) => {
        if (!currentChantier) return;

        const newConsommation: Consommation = {
            ...consommationData,
            id: uuidv4(),
            date: new Date(),
        };
        
        let updatedChantier: Chantier | null = null;
        
        const updatedChantiers = data.chantiers.map(c => {
            if (c.id === currentChantier.id) {
                updatedChantier = { ...c, consommations: [...c.consommations, newConsommation] };
                return updatedChantier;
            }
            return c;
        });

        const newData = { ...data, chantiers: updatedChantiers };
        
        // Atomic update of both data and currentChantier
        setData(newData);
        if(updatedChantier) {
            setCurrentChantier(updatedChantier);
        }
    };

    const updateConsommation = (updatedConsommation: Consommation) => {
         if (!currentChantier) return;

         let updatedCurrentChantier: Chantier | null = null;

         const updatedChantiers = data.chantiers.map(c => {
             if (c.id === updatedConsommation.chantierId) {
                const updatedConsommations = c.consommations.map(conso => 
                    conso.id === updatedConsommation.id ? updatedConsommation : conso
                );
                const updatedChantier = { ...c, consommations: updatedConsommations };
                if (c.id === currentChantier.id) {
                    updatedCurrentChantier = updatedChantier;
                }
                return updatedChantier;
             }
             return c;
         });

         const newData = { ...data, chantiers: updatedChantiers };

         // Atomic update
         setData(newData);
         if (updatedCurrentChantier) {
             setCurrentChantier(updatedCurrentChantier);
         }
         setEditingConsommation(null); // Close modal
    };

    const deleteConsommation = (consommationId: string, motDePasse: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const chantierOfConsumption = data.chantiers.find(ch =>
                ch.consommations.some(co => co.id === consommationId)
            );
            
            if (!chantierOfConsumption) {
                return reject(new Error("Consommation non trouvée."));
            }

            const consommationToDelete = chantierOfConsumption.consommations.find(c => c.id === consommationId);
            if (!consommationToDelete) {
                 return reject(new Error("Consommation non trouvée."));
            }

            const now = new Date();
            const consoDate = new Date(consommationToDelete.date);
            const hoursDiff = (now.getTime() - consoDate.getTime()) / (1000 * 60 * 60);

            if (hoursDiff > 24) {
                return reject(new Error("La suppression n'est autorisée que dans les 24 heures suivant la saisie."));
            }

            if (motDePasse !== chantierOfConsumption.motDePasse) {
                return reject(new Error("Mot de passe du chantier incorrect."));
            }

            let updatedCurrentChantier: Chantier | null = null;

            const updatedChantiers = data.chantiers.map(c => {
                if (c.id === chantierOfConsumption.id) {
                    const updatedConsommations = c.consommations.filter(conso => conso.id !== consommationId);
                    const updatedChantier = { ...c, consommations: updatedConsommations };
                    
                    if (currentChantier && currentChantier.id === updatedChantier.id) {
                        updatedCurrentChantier = updatedChantier;
                    }
                    return updatedChantier;
                }
                return c;
            });

            const newData = { ...data, chantiers: updatedChantiers };
            
            // Atomic update
            setData(newData);
            if (updatedCurrentChantier) {
                setCurrentChantier(updatedCurrentChantier);
            }

            resolve();
        });
    };

    const addPointDEau = (pointDEauData: Omit<PointDEau, 'id'>) => {
        const newPoint: PointDEau = {
            ...pointDEauData,
            id: uuidv4(),
        };
        setData({ ...data, pointsDEau: [...data.pointsDEau, newPoint] });
    };


    const contextValue: AppContextType = {
        currentPage,
        currentChantier,
        editingConsommation,
        data,
        navigateTo,
        selectChantier,
        logout,
        returnToLogin,
        addChantier,
        addConsommation,
        updateConsommation,
        deleteConsommation,
        setEditingConsommation,
        addPointDEau,
        setData,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {
                {
                    [Page.Login]: <LoginScreen />,
                    [Page.Dashboard]: <DashboardScreen />,
                    [Page.AddConsumption]: <AddConsumptionScreen />,
                    [Page.Map]: <MapScreen />,
                    [Page.Analysis]: <AnalysisScreen />,
                }[currentPage]
            }
        </AppContext.Provider>
    );
};

export default App;