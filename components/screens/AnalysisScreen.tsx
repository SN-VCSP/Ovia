import React, { useMemo, useState, useCallback } from 'react';
import Header from '../common/Header';
import { useAppContext } from '../../hooks/useAppContext';
import { Page, TypePrelevement, Agence, Chantier, Delegation, Consommation } from '../../types';
import { ArrowLeftIcon, ChartBarIcon, BeakerIcon, FireIcon, MapIcon, BuildingOffice2Icon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import Card from '../common/Card';
import { BottleIcon, FaucetIcon } from '../common/Icons';

interface ComparisonItem {
    id: string;
    nom: string;
    totalVolume: number;
}

const PieChart: React.FC<{data: Record<TypePrelevement, number>}> = ({ data }) => {
    const total = (Object.values(data) as number[]).reduce((sum, value) => sum + value, 0);
    if (total === 0) return <div className="text-center text-gray-500 py-8">Aucune donnée pour le graphique.</div>;

    const colors: Record<TypePrelevement, string> = {
        [TypePrelevement.BorneIncendie]: 'text-red-500',
        [TypePrelevement.Bouteilles]: 'text-blue-500',
        [TypePrelevement.RobinetExterieur]: 'text-green-500',
    };
    
    const icons: Record<TypePrelevement, React.ReactNode> = {
        [TypePrelevement.BorneIncendie]: <FireIcon className="h-5 w-5 text-red-500" />,
        [TypePrelevement.Bouteilles]: <BottleIcon className="w-5 h-5 text-blue-500" />,
        [TypePrelevement.RobinetExterieur]: <FaucetIcon className="w-5 h-5 text-green-500" />,
    };

    let cumulativePercent = 0;
    const segments = (Object.entries(data) as [TypePrelevement, number][]).map(([key, value]) => {
        const percent = (value / total) * 100;
        const segment = {
            key: key,
            value,
            percent,
            strokeDasharray: `${percent} ${100 - percent}`,
            strokeDashoffset: 25 - cumulativePercent
        };
        cumulativePercent += percent;
        return segment;
    });

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="relative w-48 h-48">
                 <svg viewBox="0 0 36 36" className="transform -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#e6e6e6" strokeWidth="3.8" />
                    {segments.map(s => (
                        <circle key={s.key}
                            cx="18" cy="18" r="15.915"
                            fill="transparent"
                            strokeWidth="3.8"
                            strokeDasharray={s.strokeDasharray}
                            strokeDashoffset={s.strokeDashoffset}
                            className={`stroke-current ${colors[s.key]}`}
                        />
                    ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-vinci-primary">{total.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">Litres</span>
                </div>
            </div>
            <div className="space-y-3">
                {segments.map(s => (
                     s.value > 0 && <div key={s.key} className="flex items-center">
                        <div className={`p-1 rounded-full mr-3 ${colors[s.key].replace('text-', 'bg-').replace('-500', '-100')}`}>
                             {icons[s.key]}
                        </div>
                        <div>
                            <span className="font-semibold text-gray-700">{s.key}</span>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-lg font-bold text-vinci-primary">{s.value.toLocaleString()} L</span>
                                <span className="text-sm font-medium text-gray-500">{s.percent.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const BarChart: React.FC<{data: ComparisonItem[], onBarClick: (id: string) => void}> = ({data, onBarClick}) => {
    if (!data || data.length === 0) return null;

    const maxVolume = Math.max(1, ...data.map(d => d.totalVolume));
    
    return (
        <div className="space-y-3">
            {data.map((item, index) => {
                const barWidth = (item.totalVolume / maxVolume) * 100;
                const isMax = index === 0 && item.totalVolume > 0 && data.length > 1;

                return (
                    <div key={item.id} onClick={() => onBarClick(item.id)} className="group cursor-pointer">
                        <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm ${isMax ? 'font-bold' : 'font-medium'} text-gray-700 truncate`}>{isMax ? `★ ${item.nom}` : item.nom}</span>
                            <span className="text-sm font-bold text-vinci-primary">{item.totalVolume.toLocaleString()} L</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div 
                                className={`h-4 rounded-full ${isMax ? 'bg-vinci-accent' : 'bg-vinci-secondary'} group-hover:bg-vinci-primary-dark transition-all duration-300`} 
                                style={{width: `${barWidth}%`}}>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}


const AnalysisScreen: React.FC = () => {
    const { navigateTo, data } = useAppContext();
    
    // Default to 'Méditerranée'
    const medDelegation = data.delegations.find(d => d.nom.includes('Méditerranée'));

    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0], // Default to 3 months ago
        end: new Date().toISOString().split('T')[0] // Default to today
    });
    
    const [drilldown, setDrilldown] = useState<{delegation: Delegation | null, agence: Agence | null}>({
        delegation: medDelegation || null,
        agence: null,
    });

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateRange(prev => ({...prev, [e.target.name]: e.target.value}));
    };

    const handleDrilldown = useCallback((agenceId: string) => {
        const agence = data.agences.find(a => a.id === agenceId);
        if (agence) {
            setDrilldown(prev => ({...prev, agence}));
        }
    }, [data.agences]);

    const handleBreadcrumbClick = (level: 'delegation' | 'root') => {
        if (level === 'delegation') {
            setDrilldown(prev => ({...prev, agence: null}));
        }
    };

    const analysisData = useMemo(() => {
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;
        if(endDate) endDate.setHours(23, 59, 59, 999); // Include the whole end day

        const agenceMap = new Map<string, Agence>(data.agences.map(a => [a.id, a]));

        let chantiersToAnalyze = data.chantiers;
        let title = `Analyse pour la Délégation ${drilldown.delegation?.nom}`;

        if (drilldown.agence) {
            chantiersToAnalyze = chantiersToAnalyze.filter(c => c.agenceId === drilldown.agence!.id);
            title = `Analyse pour l'Agence ${drilldown.agence.nom}`;
        } else if (drilldown.delegation) {
            const agenceIdsInDelegation = data.agences.filter(a => a.delegationId === drilldown.delegation!.id).map(a => a.id);
            chantiersToAnalyze = chantiersToAnalyze.filter(c => agenceIdsInDelegation.includes(c.agenceId));
        }

        const consommationsInDateRange = chantiersToAnalyze.flatMap(c => c.consommations).filter(conso => {
            const consoDate = new Date(conso.date);
            if (startDate && consoDate < startDate) return false;
            if (endDate && consoDate > endDate) return false;
            return true;
        });

        const totalVolume = consommationsInDateRange.reduce((sum, conso) => sum + conso.volume, 0);

        const volumeByType = consommationsInDateRange.reduce((acc, conso) => {
            acc[conso.type] = (acc[conso.type] || 0) + conso.volume;
            return acc;
        }, {} as Record<TypePrelevement, number>);

        let comparisonTitle = '';
        let comparisonData: ComparisonItem[] = [];

        if (drilldown.agence) { // Show chantiers for the selected agence
            comparisonTitle = 'Consommation par Chantier';
            const volumeByChantier = new Map<string, number>();
            consommationsInDateRange.forEach(conso => {
                volumeByChantier.set(conso.chantierId, (volumeByChantier.get(conso.chantierId) || 0) + conso.volume);
            });
            comparisonData = Array.from(volumeByChantier.entries()).map(([chantierId, volume]) => ({
                id: chantierId,
                nom: chantiersToAnalyze.find(c => c.id === chantierId)?.nom || 'Inconnu',
                totalVolume: volume
            }));
        } else if (drilldown.delegation) { // Show agences for the selected delegation
            comparisonTitle = 'Consommation par Agence';
            const volumeByAgence = new Map<string, number>();
            consommationsInDateRange.forEach(conso => {
                const chantier = data.chantiers.find(c => c.id === conso.chantierId);
                if (chantier) {
                    volumeByAgence.set(chantier.agenceId, (volumeByAgence.get(chantier.agenceId) || 0) + conso.volume);
                }
            });
            comparisonData = Array.from(volumeByAgence.entries()).map(([agenceId, volume]) => ({
                id: agenceId,
                nom: agenceMap.get(agenceId)?.nom || 'Inconnu',
                totalVolume: volume
            }));
        }

        comparisonData.sort((a, b) => b.totalVolume - a.totalVolume);
        
        const topConsumer = comparisonData[0] || null;
        
        let topChantierConsumer: ComparisonItem | null = null;
        if (comparisonData.length > 0) {
            const allChantiersWithVolume = chantiersToAnalyze.map(chantier => {
                const volume = chantier.consommations
                    .filter(c => {
                        const consoDate = new Date(c.date);
                        return (!startDate || consoDate >= startDate) && (!endDate || consoDate <= endDate);
                     })
                    .reduce((sum, c) => sum + c.volume, 0);
                return { id: chantier.id, nom: chantier.nom, totalVolume: volume };
            }).sort((a,b) => b.totalVolume - a.totalVolume);
            topChantierConsumer = allChantiersWithVolume[0] || null;
        }


        return {
            title,
            totalVolume,
            totalConsumptions: consommationsInDateRange.length,
            volumeByType: {
                [TypePrelevement.BorneIncendie]: volumeByType[TypePrelevement.BorneIncendie] || 0,
                [TypePrelevement.Bouteilles]: volumeByType[TypePrelevement.Bouteilles] || 0,
                [TypePrelevement.RobinetExterieur]: volumeByType[TypePrelevement.RobinetExterieur] || 0,
            },
            comparisonTitle,
            comparisonData,
            topAgenceConsumer: drilldown.agence ? null : topConsumer,
            topChantierConsumer: topChantierConsumer,
        };
    }, [data, dateRange, drilldown]);
    
    const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode; }> = ({ label, value, icon }) => (
        <div className="bg-gray-50 p-4 rounded-lg flex items-start space-x-4">
            <div className="bg-white p-3 rounded-full shadow-sm text-vinci-accent">{icon}</div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-xl font-bold text-vinci-primary truncate">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-vinci-gray">
            <Header />
            <main className="flex-grow p-4 md:p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    <button onClick={() => navigateTo(Page.Dashboard)} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vinci-primary">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Retour au tableau de bord
                    </button>

                    <Card>
                        <h2 className="text-2xl font-bold text-vinci-primary mb-2">Analyse Détaillée - {medDelegation?.nom}</h2>
                        <p className="text-gray-600 mb-6">Filtrez par date et naviguez dans les données pour identifier les tendances.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
                            <div>
                                <label htmlFor="start" className="block text-xs font-medium text-gray-700">Date de début</label>
                                <input type="date" name="start" id="start" value={dateRange.start} onChange={handleDateChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent" />
                            </div>
                            <div>
                                <label htmlFor="end" className="block text-xs font-medium text-gray-700">Date de fin</label>
                                <input type="date" name="end" id="end" value={dateRange.end} onChange={handleDateChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vinci-accent focus:border-vinci-accent" />
                            </div>
                        </div>
                    </Card>

                    {analysisData.totalConsumptions > 0 ? (
                        <>
                        <Card>
                            <h3 className="text-xl font-bold text-vinci-primary mb-4">Indicateurs Clés de Performance (KPIs)</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard label="Volume total" value={`${analysisData.totalVolume.toLocaleString()} L`} icon={<BeakerIcon className="h-6 w-6" />} />
                                <StatCard label="Prélèvements" value={analysisData.totalConsumptions.toString()} icon={<ChartBarIcon className="h-6 w-6" />} />
                                {analysisData.topAgenceConsumer && <StatCard label="Top Agence" value={analysisData.topAgenceConsumer.nom} icon={<BuildingOffice2Icon className="h-6 w-6" />} />}
                                {analysisData.topChantierConsumer && <StatCard label="Top Chantier" value={analysisData.topChantierConsumer.nom} icon={<BuildingStorefrontIcon className="h-6 w-6" />} />}
                            </div>
                        </Card>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                            <div className="lg:col-span-2">
                                <Card>
                                    <h3 className="text-xl font-bold text-vinci-primary mb-4">Répartition par type</h3>
                                    <PieChart data={analysisData.volumeByType} />
                                </Card>
                            </div>
                            <div className="lg:col-span-3">
                                <Card>
                                    <nav className="flex text-sm font-medium text-gray-500 mb-4" aria-label="Breadcrumb">
                                        <ol className="inline-flex items-center space-x-1 md:space-x-3">
                                            <li className="inline-flex items-center">
                                                <span className="text-vinci-primary font-semibold">{drilldown.delegation?.nom}</span>
                                            </li>
                                            {drilldown.agence && (
                                                <li>
                                                    <div className="flex items-center">
                                                        <span className="mx-2.5">/</span>
                                                        <a href="#" onClick={(e) => {e.preventDefault(); handleBreadcrumbClick('delegation')}} className="hover:text-vinci-accent">{drilldown.agence.nom}</a>
                                                    </div>
                                                </li>
                                            )}
                                        </ol>
                                    </nav>
                                    <h3 className="text-xl font-bold text-vinci-primary mb-4">{analysisData.comparisonTitle}</h3>
                                    <BarChart data={analysisData.comparisonData} onBarClick={!drilldown.agence ? handleDrilldown : () => {}} />
                                    {!drilldown.agence && <p className="text-xs text-center text-gray-500 mt-4">Cliquez sur une agence pour voir le détail de ses chantiers.</p>}
                                </Card>
                            </div>
                        </div>
                        </>
                    ) : (
                        <Card>
                            <div className="text-center py-12">
                                <MapIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune donnée de consommation</h3>
                                <p className="mt-1 text-sm text-gray-500">Aucune consommation n'a été trouvée pour les filtres sélectionnés.</p>
                            </div>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AnalysisScreen;
