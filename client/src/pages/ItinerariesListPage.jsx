// client/src/pages/ItinerariesListPage.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { fetchItineraries } from '../api';
import { Map, Clock } from 'lucide-react';

const ItineraryCard = ({ itinerary }) => (
    <Link to={`/itinerari/${itinerary.id}`} className="block bg-white rounded-lg shadow-md overflow-hidden group">
        <div className="relative">
            <img
                src={itinerary.images[0]?.url || 'https://via.placeholder.com/400x250/e2e8f0/94a3b8?text=Itinerario'}
                alt={itinerary.title}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />
        </div>
        <div className="p-4">
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-sky-600 transition-colors">{itinerary.title}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-2 gap-4">
                <span className="flex items-center gap-1"><Map size={14} /> {itinerary.region}</span>
                <span className="flex items-center gap-1"><Clock size={14} /> {itinerary.duration}</span>
            </div>
        </div>
    </Link>
);

function ItinerariesListPage() {
    const [itineraries, setItineraries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetchItineraries();
                setItineraries(response.data);
            } catch (error) {
                console.error("Errore caricamento itinerari:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <>
            <Helmet><title>Itinerari in Italia - InfoSubito</title></Helmet>
            <div className="bg-gray-50 py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900">Itinerari</h1>
                        <p className="mt-3 text-lg text-gray-600">Scopri i percorsi e i viaggi più belli da fare in Italia.</p>
                    </div>
                    {loading ? <p>Caricamento...</p> : itineraries.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {itineraries.map(it => <ItineraryCard key={it.id} itinerary={it} />)}
                        </div>
                    ) : (
                        <p className="text-center bg-white p-10 rounded-lg shadow-sm">Nessun itinerario disponibile al momento.</p>
                    )}
                </div>
            </div>
        </>
    );
}
export default ItinerariesListPage;