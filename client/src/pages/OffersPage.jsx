import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { fetchOffers } from '../api';
import { Tag, Search, Home, Shirt, ShoppingBasket, Tv, Baby, Heart, Car, Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

const categories = [
    { id: 'Elettronica', label: 'Elettronica', icon: <Tv size={16} /> },
    { id: 'Casa', label: 'Casa', icon: <Home size={16} /> },
    { id: 'Abbigliamento', label: 'Abbigliamento', icon: <Shirt size={16} /> },
    { id: 'Alimentari', label: 'Alimentari', icon: <ShoppingBasket size={16} /> },
    { id: 'Bambini', label: 'Bambini', icon: <Baby size={16} /> },
    { id: 'Cosmetici', label: 'Cosmetici', icon: <Heart size={16} /> },
    { id: 'Auto & Moto', label: 'Auto & Moto', icon: <Car size={16} /> },
    { id: 'Sport e Tempo Libero', label: 'Sport e Tempo Libero', icon: <Dumbbell size={16} /> },
];

const OfferCard = ({ offer }) => {
    // Non ci serve più la funzione truncate in JavaScript!

    const getImageUrl = (offer) => {
        if (offer.images && offer.images.length > 0 && offer.images[0].url) {
            return offer.images[0].url;
        }
        return `https://ui-avatars.com/api/?name=${offer.title.replace(/\s/g, '+')}&size=400&background=e0f2fe&color=0891b2`;
    };

    return (
        <motion.div variants={cardVariants}>
            <Link to={`/offerte/${offer.id}`} className="block bg-white rounded-lg shadow-md border overflow-hidden flex flex-col group h-full">
                <div className="overflow-hidden aspect-[4/3] bg-gray-100">
                    <img src={getImageUrl(offer)} alt={offer.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"/>
                </div>
                <div className="p-4 flex-grow flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-sky-600 transition-colors">{offer.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">da {offer.store}</p>

                    {/* --- ECCO LA SOLUZIONE DEFINITIVA --- */}
                    <div
                        // line-clamp-3 limita il testo a 3 righe, poi mette "..."
                        className="text-gray-600 flex-grow text-sm min-h-[60px] line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: offer.description }}
                    />

                    <div className="mt-4 flex justify-between items-center pt-4 border-t">
                        <span className="text-2xl font-extrabold text-red-600">{offer.discount}</span>
                        <div className="bg-sky-600 text-white px-4 py-2 rounded-lg font-semibold text-sm">Vedi Dettagli</div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

function OffersPage() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ category: null, search: '' });

    useEffect(() => {
        const loadOffers = async () => {
            setLoading(true);
            try {
                const params = {};
                if (filters.category) params.category = filters.category;
                if (filters.search) params.search = filters.search;
                const response = await fetchOffers(params);
                setOffers(response.data);
            } catch (error) { console.error("Errore nel caricare le offerte:", error); }
            finally { setLoading(false); }
        };
        loadOffers();
    }, [filters]);

    const handleCategoryChange = (categoryId) => { setFilters(prev => ({ ...prev, search: '', category: prev.category === categoryId ? null : categoryId })); };
    const handleSearchChange = (e) => { setFilters(prev => ({ ...prev, category: null, search: e.target.value })); };

    return (
        <>
            <Helmet><title>Affari & Sconti - FastInfo</title></Helmet>
            <div className="bg-gray-100 py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900">Affari & Sconti</h1>
                        <p className="mt-3 text-lg text-gray-600">Le migliori offerte dai principali store italiani, aggiornate in tempo reale</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm mb-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div>
                                <h3 className="font-semibold mb-3">Categorie</h3>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => handleCategoryChange(null)} className={`flex items-center gap-2 px-3 py-2 text-sm rounded-full transition-colors ${!filters.category ? 'bg-sky-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                        <Tag size={16} /> Tutte le categorie
                                    </button>
                                    {categories.map(cat => (
                                        <button key={cat.id} onClick={() => handleCategoryChange(cat.id)} className={`flex items-center gap-2 px-3 py-2 text-sm rounded-full transition-colors ${filters.category === cat.id ? 'bg-sky-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                            {cat.icon} {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="relative">
                                <input type="text" placeholder="Cerca prodotti o negozi..." onChange={handleSearchChange} value={filters.search} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Tutte le Offerte ({loading ? '...' : offers.length} disponibili)</h2>
                        {loading ? <p>Caricamento...</p> : offers.length > 0 ? (
                            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" variants={containerVariants} initial="hidden" animate="visible">
                                {offers.map(offer => <OfferCard key={offer.id} offer={offer}/>)}
                            </motion.div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-lg shadow-sm"><p>Nessuna offerta trovata.</p></div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default OffersPage;