export enum Page {
    Login,
    Dashboard,
    AddConsumption,
    Map,
    Analysis,
}

export enum TypePrelevement {
    BorneIncendie = 'Borne incendie',
    Bouteilles = 'Bouteilles',
    RobinetExterieur = 'Robinet extérieur',
}

export interface Consommation {
    id: string;
    chantierId: string;
    date: Date;
    type: TypePrelevement;
    volume: number; // in Liters
    commentaire?: string;
}

export interface Chantier {
    id: string;
    nom: string;
    agenceId: string;
    photoUrl?: string;
    motDePasse: string;
    consommations: Consommation[];
    latitude?: number;
    longitude?: number;
}

export interface Agence {
    id: string;
    nom: string;
    delegationId: string;
}

export interface Delegation {
    id: string;
    nom: string;
    paysId: string;
}

export interface Pays {
    id: string;
    nom: string;
}

export enum TypePointDEau {
    BorneIncendie = 'Borne incendie',
    Robinet = 'Robinet',
}

export enum StatutPointDEau {
    EnService = 'En service',
    HorsService = 'Hors service',
}

export interface PointDEau {
    id: string;
    type: TypePointDEau;
    latitude: number;
    longitude: number;
    nom: string;
    photoUrl?: string;
    statut: StatutPointDEau;
    contactNom?: string;
    contactTel?: string;
}

export interface MockData {
    pays: Pays[];
    delegations: Delegation[];
    agences: Agence[];
    chantiers: Chantier[];
    pointsDEau: PointDEau[];
}