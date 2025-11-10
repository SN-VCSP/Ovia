import { MockData, TypePrelevement, TypePointDEau, StatutPointDEau } from '../types';

export const MOCK_DATA: MockData = {
    pays: [
        { id: 'fr', nom: 'France' },
    ],
    delegations: [
        { id: 'nord', nom: 'Délégation Nord', paysId: 'fr' },
        { id: 'idf-hn', nom: 'Délégation Île-de-France – Haute-Normandie', paysId: 'fr' },
        { id: 'centre-ouest', nom: 'Délégation Centre-Ouest', paysId: 'fr' },
        { id: 'sud-ouest', nom: 'Délégation Sud-Ouest', paysId: 'fr' },
        { id: 'med', nom: 'Délégation Méditerranée', paysId: 'fr' },
        { id: 'centre-est', nom: 'Délégation Centre-Est', paysId: 'fr' },
        { id: 'est', nom: 'Délégation Est', paysId: 'fr' },
    ],
    agences: [
        // Agences for Délégation Méditerranée
        { id: 'baillargues', nom: 'Baillargues', delegationId: 'med' },
        { id: 'juvignac', nom: 'Juvignac', delegationId: 'med' },
        { id: 'frejus', nom: 'Fréjus', delegationId: 'med' },
        { id: 'port-de-bouc', nom: 'Port-de-Bouc', delegationId: 'med' },
        { id: 'vinon-sur-verdon', nom: 'Vinon-sur-Verdon', delegationId: 'med' },
        { id: 'nimes', nom: 'Nîmes', delegationId: 'med' },
        { id: 'perpignan', nom: 'Perpignan', delegationId: 'med' },
        { id: 'avignon', nom: 'Avignon', delegationId: 'med' },
        { id: 'aix-en-provence', nom: 'Aix-en-Provence', delegationId: 'med' },
        { id: 'marseille', nom: 'Marseille', delegationId: 'med' },
        { id: 'toulon', nom: 'Toulon', delegationId: 'med' },
        { id: 'ajaccio', nom: 'Ajaccio', delegationId: 'med' },
        { id: 'bastia', nom: 'Bastia', delegationId: 'med' },
    ],
    chantiers: [],
    pointsDEau: [],
};