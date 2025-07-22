import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchDestinationById } from '../api';
import { Star, MapPin, Tag } from 'lucide-react';
import { ImageGallery } from '../components/ImageGallery'; // <-- IMPORTIAMO LA NUOVA GALLERIA

function DestinationDetailPage() {
    const { id } = useParams();
    const [destination, setDestination] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetchDestinationById(id);
                setDestination(res.data);
            } catch (error) { console.error(error); }
            finally { setLoading(false); }
        };
        loadData();
    }, [id]);

    if (loading) return <div>Caricamento...</div>;
    if (!destination) return <div>Destinazione non trovata.</div>;

    return (
        <>
            <Helmet><title>{destination.name} - FastInfo</title></Helmet>
            <div className="bg-gray-50">
                <div className="container mx-auto py-12 px-4 max-w-5xl">

                    {/* --- SOSTITUIAMO LA VECCHIA GRIGLIA CON IL NUOVO COMPONENTE --- */}
                    <ImageGallery images={destination.images} />

                    <div className="bg-white p-8 rounded-b-lg shadow-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-4xl font-extrabold text-gray-900">{destination.name}</h1>
                                <p className="text-lg text-gray-500 flex items-center gap-2 mt-1"><MapPin size={18}/> {destination.region}</p>
                            </div>
                            <div className="flex items-center gap-1 bg-yellow-400 text-white font-bold px-3 py-1.5 rounded-full text-lg">
                                <Star size={18} className="fill-white"/> {destination.rating.toFixed(1)}
                            </div>
                        </div>
                        <hr className="my-6"/>
                        <p className="text-gray-700 leading-relaxed">{destination.description}</p>
                        {destination.tags && (
                            <div className="mt-6 flex items-center gap-2 flex-wrap">
                                <Tag size={16} className="text-gray-400"/>
                                {destination.tags.split(',').map(tag => (
                                    <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">{tag.trim()}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default DestinationDetailPage;