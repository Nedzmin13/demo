// client/src/pages/ItineraryDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { fetchItineraryById } from '../api';
import { ChevronRight, Calendar } from 'lucide-react';

function ItineraryDetailPage() {
    const { id } = useParams();
    const [itinerary, setItinerary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetchItineraryById(id);
                setItinerary(response.data);
            } catch (error) {
                console.error("Errore caricamento itinerario:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading) return <p className="text-center py-20">Caricamento itinerario...</p>;
    if (!itinerary) return <p className="text-center py-20">Itinerario non trovato.</p>;

    return (
        <>
            <Helmet><title>{itinerary.title} - FastInfo</title></Helmet>
            <div className="bg-white">
                {/* --- SEZIONE IMMAGINE CORRETTA --- */}
                <div className="w-full aspect-video md:aspect-[2.5/1] bg-gray-200">
                    <img
                        src={itinerary.images[0]?.url || 'https://via.placeholder.com/1200x480/e0f2fe/0ea5e9?text=Itinerario'}
                        alt={itinerary.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <nav className="flex items-center text-sm text-gray-500 mb-8">
                        <Link to="/itinerari" className="hover:underline">Itinerari</Link>
                        <ChevronRight size={16} className="mx-2" />
                        <span className="font-semibold text-gray-700">{itinerary.title}</span>
                    </nav>

                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">{itinerary.title}</h1>
                    <p className="text-lg text-gray-600 mt-2">{itinerary.description}</p>

                    <div className="mt-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Tappe del Viaggio</h2>
                        <div className="space-y-8">
                            {itinerary.steps.map(step => (
                                <div key={step.id} className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-shrink-0 flex md:flex-col items-center gap-2">
                                        <div className="bg-sky-600 text-white rounded-full h-12 w-12 flex items-center justify-center font-bold text-lg">
                                            {step.day}
                                        </div>
                                        <div className="text-sm font-semibold text-gray-500 mt-1">Giorno</div>
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-lg border flex-grow">
                                        <h3 className="text-2xl font-bold text-gray-800">{step.title}</h3>
                                        <p className="mt-2 text-gray-600 whitespace-pre-line">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default ItineraryDetailPage;