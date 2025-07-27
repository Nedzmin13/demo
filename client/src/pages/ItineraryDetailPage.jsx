import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchItineraryById } from '../api';
import { ChevronRight, Calendar } from 'lucide-react';
import { ImageGallery } from '../components/ImageGallery';

function ItineraryDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [itinerary, setItinerary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const loadData = async () => {
            setLoading(true);
            try {
                const response = await fetchItineraryById(id);
                setItinerary(response.data);
            } catch (error) {
                console.error("Errore caricamento itinerario:", error);
                setItinerary(null);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading) {
        return <p className="text-center py-20">Caricamento itinerario...</p>;
    }

    if (!itinerary) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">Itinerario non trovato</h2>
                <button
                    onClick={() => navigate('/itinerari')}
                    className="mt-4 bg-sky-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-700"
                >
                    Torna a tutti gli Itinerari
                </button>
            </div>
        );
    }

    return (
        <>
            <Helmet><title>{itinerary.title} - Itinerari FastInfo</title></Helmet>
            <div className="bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-5xl">
                    <ImageGallery images={itinerary.images || []} />
                    <div className="bg-white p-6 md:p-8 rounded-b-lg shadow-lg -mt-2">
                        <nav className="flex items-center text-sm text-gray-500 mb-6">
                            <Link to="/itinerari" className="hover:underline">Itinerari</Link>
                            <ChevronRight size={16} className="mx-2" />
                            <span className="font-semibold text-gray-700">{itinerary.title}</span>
                        </nav>

                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">{itinerary.title}</h1>
                        <div className="flex items-center flex-wrap gap-4 text-gray-500 mt-2">
                            {itinerary.region && <span>{itinerary.region}</span>}
                            {itinerary.duration && <span className="flex items-center gap-2"><Calendar size={16}/> {itinerary.duration}</span>}
                        </div>

                        {/* --- DESCRIZIONE GENERALE CON SPAZIATURA CORRETTA --- */}
                        <div
                            className="prose max-w-none text-lg text-gray-600 mt-4 prose-p:m-0"
                            dangerouslySetInnerHTML={{ __html: itinerary.description }}
                        />

                        <hr className="my-10" />

                        <div className="mt-12">
                            <h2 className="text-3xl font-bold text-gray-800 mb-8">Tappe del Viaggio</h2>
                            <div className="relative border-l-2 border-sky-200 ml-6 pl-10 space-y-12">
                                {itinerary.steps.map(step => (
                                    <div key={step.id} className="relative">
                                        <div className="absolute -left-[49px] top-1 bg-sky-600 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold text-md ring-8 ring-white">
                                            {step.day}
                                        </div>
                                        <p className="text-sm font-semibold text-gray-500">Giorno {step.day}</p>
                                        <h3 className="text-2xl font-bold text-gray-800 mt-1">{step.title}</h3>

                                        {/* --- DESCRIZIONE TAPPA CON SPAZIATURA CORRETTA --- */}
                                        <div
                                            className="prose max-w-none mt-2 text-gray-600 prose-p:m-0"
                                            dangerouslySetInnerHTML={{ __html: step.description }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ItineraryDetailPage;