// client/src/pages/BonusPage.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { fetchBonuses } from '../api';
import { Gift, Target, Calendar, Home, Briefcase, Car, FileText, Users } from 'lucide-react';

const bonusCategories = [
    { id: 'famiglia', label: 'Famiglia', icon: <Users size={16} /> },
    { id: 'lavoro', label: 'Lavoro', icon: <Briefcase size={16} /> },
    { id: 'casa', label: 'Casa', icon: <Home size={16} /> },
    { id: 'mobilità', label: 'Mobilità', icon: <Car size={16} /> },
    { id: 'fiscale', label: 'Fiscale', icon: <FileText size={16} /> },
];

const BonusCard = ({ bonus }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 relative overflow-hidden transition-transform hover:scale-105 duration-300">
        <div className="absolute top-0 left-0 h-full w-2 bg-orange-400"></div>
        <div className="flex justify-between items-start mb-4">
            <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-2">
                <Car size={14} /> {bonus.category}
            </span>
            <span className="font-bold text-lg text-orange-500">fino a {bonus.amount}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900">{bonus.title}</h3>
        <p className="text-gray-600 my-2 flex-grow">{bonus.description}</p>
        <div className="text-sm space-y-2 mt-4 border-t border-gray-100 pt-4">
            <p className="flex items-center gap-2 text-gray-500"><Target size={16}/> <strong>Target:</strong> {bonus.target || 'Non specificato'}</p>
            <p className="flex items-center gap-2 text-red-600 font-semibold"><Calendar size={16}/> <strong>Scadenza:</strong> {new Date(bonus.expiresAt).toLocaleDateString('it-IT')}</p>
        </div>
    </div>
);

function BonusPage() {
    const [bonuses, setBonuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState(null);

    useEffect(() => {
        const loadBonuses = async () => {
            setLoading(true);
            try {
                const params = {};
                if (activeCategory) {
                    params.category = activeCategory;
                }
                const response = await fetchBonuses(params);
                setBonuses(response.data);
            } catch (error) {
                console.error("Errore caricamento bonus:", error);
            } finally {
                setLoading(false);
            }
        };
        loadBonuses();
    }, [activeCategory]); // Ricarica i dati quando cambia la categoria

    return (
        <>
            <Helmet><title>Bonus e Incentivi - FastInfo</title></Helmet>
            <div className="bg-gray-50 min-h-[60vh] py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900">Bonus 2025</h1>
                        <p className="mt-3 text-lg text-gray-600">Tutti gli incentivi e bonus disponibili in Italia, aggiornati e verificati</p>
                    </div>

                    {/* Filtri Categoria */}
                    <div className="flex justify-center items-center flex-wrap gap-3 mb-12">
                        <button onClick={() => setActiveCategory(null)} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${!activeCategory ? 'bg-orange-500 text-white shadow' : 'bg-white text-gray-700 border hover:bg-gray-100'}`}>
                            Tutti i Bonus
                        </button>
                        {bonusCategories.map(cat => (
                            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${activeCategory === cat.id ? 'bg-orange-500 text-white shadow' : 'bg-white text-gray-700 border hover:bg-gray-100'}`}>
                                {cat.icon} {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Griglia Risultati */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-6">Bonus Disponibili ({bonuses.length})</h2>
                        {loading ? (
                            <p className="text-center">Caricamento bonus...</p>
                        ) : bonuses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {bonuses.map(bonus => <BonusCard key={bonus.id} bonus={bonus} />)}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                                <p className="text-gray-500">Nessun bonus trovato per la categoria selezionata.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default BonusPage;