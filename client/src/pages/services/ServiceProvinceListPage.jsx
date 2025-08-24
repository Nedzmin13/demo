import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchFeaturedPoisByProvince } from '../../api';
import { ChevronRight, HeartHandshake, MapPin } from 'lucide-react';

// --- COMPONENTE CARD CORRETTO ---
const FeaturedPoiCard = ({ poi }) => {
    // Funzione per tagliare il testo HTML in modo sicuro
    const truncateHTML = (html, length = 100) => {
        if (!html) return 'Nessuna descrizione disponibile.';
        const textOnly = html.replace(/<[^>]+>/g, '');
        if (textOnly.length <= length) return html;
        return textOnly.substring(0, length) + '...';
    };

    return (
        // 1. Avvolgiamo la card in un componente Link
        <Link to={`/poi/${poi.id}`} className="block bg-white p-6 rounded-lg shadow-sm border hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full">
            <h3 className="text-xl font-bold text-gray-800">{poi.name}</h3>
            <p className="text-gray-500 flex items-center gap-2 mt-1 text-sm">
                <MapPin size={14} />
                {poi.comune.name}
            </p>
            {/* 2. Usiamo dangerouslySetInnerHTML per renderizzare l'HTML */}
            <div
                className="mt-2 text-sm text-gray-600 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: truncateHTML(poi.description) }}
            />
        </Link>
    );
};


function ServiceProvinceListPage() {
    const { regionName, provinceId, provinceName } = useParams();
    const [pois, setPois] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPois = async () => {
            setLoading(true);
            try {
                const response = await fetchFeaturedPoisByProvince(provinceId, 'essential');
                setPois(response.data);
            } catch (error) {
                console.error("Errore caricamento POI:", error);
            } finally {
                setLoading(false);
            }
        };
        if(provinceId) loadPois();
    }, [provinceId]);

    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

    return (
        <>
            <Helmet><title>Servizi Essenziali in provincia di {provinceName}</title></Helmet>
            <div className="bg-gray-50 py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex items-center text-sm text-gray-500 mb-8">
                        <Link to="/servizi-essenziali" className="hover:underline">Servizi Essenziali</Link>
                        <ChevronRight size={16} className="mx-2" />
                        <span className="font-semibold text-gray-700">{capitalize(provinceName)}</span>
                    </nav>
                    <div className="text-center mb-12">
                        <HeartHandshake className="mx-auto h-12 w-12 text-sky-600" />
                        <h1 className="mt-4 text-4xl font-bold text-gray-900">Servizi Essenziali a {capitalize(provinceName)}</h1>
                    </div>
                    {loading ? <p>Caricamento...</p> : pois.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pois.map(poi => <FeaturedPoiCard key={poi.id} poi={poi} />)}
                        </div>
                    ) : (
                        <p className="text-center bg-white p-10 rounded-lg shadow-sm">Nessun servizio essenziale in vetrina per questa provincia.</p>
                    )}
                </div>
            </div>
        </>
    );
}

export default ServiceProvinceListPage;