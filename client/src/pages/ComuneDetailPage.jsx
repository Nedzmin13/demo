import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchComuneBySlug } from '../api';
import { ChevronRight, HeartHandshake, Utensils, Eye, AlertTriangle } from 'lucide-react';
import { ImageGallery } from '../components/ImageGallery';

// Componente per una singola sezione di POI
const PoiSection = ({ title, pois, category }) => {
    const filteredPois = pois ? pois.filter(poi => poi.category === category) : [];

    return (
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
            {filteredPois.length > 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
                    {filteredPois.map(poi => (
                        <div key={poi.id} className="border-b pb-2 last:border-b-0">
                            <h3 className="font-bold text-gray-800">{poi.name}</h3>
                            <p className="text-sm text-gray-500">{poi.address}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-sm border text-center text-gray-500">
                    Nessun dato disponibile per questa categoria.
                </div>
            )}
        </div>
    );
};

function ComuneDetailPage() {
    const { regionName, provinceSigla, comuneSlug } = useParams();
    const [comune, setComune] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('servizi');

    useEffect(() => {
        const getComuneData = async () => {
            if (!comuneSlug) return;
            setLoading(true);
            try {
                const response = await fetchComuneBySlug(comuneSlug);
                setComune(response.data);
                setError(null);
            } catch (err) {
                setError('Impossibile caricare i dati del comune.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        getComuneData();
    }, [comuneSlug]);

    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

    const TabButton = ({ id, label, icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === id
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    if (loading) return <div className="text-center py-20">Caricamento...</div>;
    if (error) return <div className="text-center text-red-500 py-20">{error}</div>;
    if (!comune) return <div className="text-center text-gray-500 py-20">Comune non trovato.</div>;

    const fullDescription = `Il comune di ${comune.name} si trova nella provincia di ${comune.province?.name || ''}${comune.province?.region?.name ? `, in ${comune.province.region.name}` : ''}. ${comune.description || 'Descrizione non ancora disponibile.'}`;

    return (
        <>
            <Helmet>
                <title>{comune.name} - Guida e Servizi - FastInfo</title>
            </Helmet>

            <div className="bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-5xl">

                    <div className="mb-8">
                        <ImageGallery images={comune.images || []} />
                    </div>

                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        {regionName && provinceSigla && (
                            <nav className="flex items-center text-sm text-gray-500 mb-6 flex-wrap">
                                <Link to="/viaggio" className="hover:underline">Viaggio</Link>
                                <ChevronRight size={16} className="mx-2" />
                                <Link to={`/viaggio/${regionName}`} className="hover:underline">{capitalize(regionName)}</Link>
                                <ChevronRight size={16} className="mx-2" />
                                <Link to={`/viaggio/${regionName}/${provinceSigla}`} className="hover:underline">{comune.province?.name}</Link>
                                <ChevronRight size={16} className="mx-2" />
                                <span className="font-semibold text-gray-700">{comune.name}</span>
                            </nav>
                        )}

                        <div className="mb-8">
                            <h1 className="text-5xl font-extrabold text-gray-900">{comune.name}</h1>
                            <p className="text-lg text-gray-500">{comune.province?.name}, {comune.province?.sigla}</p>
                        </div>

                        <div className="prose max-w-none text-gray-700 leading-relaxed">
                            <p>{fullDescription}</p>
                        </div>

                        <hr className="my-10"/>

                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Informazioni e Servizi</h2>
                        <div className="flex space-x-2 sm:space-x-4 border-b pb-4 mb-8 overflow-x-auto">
                            <TabButton id="servizi" label="Servizi Essenziali" icon={<HeartHandshake size={20} />} />
                            <TabButton id="ristorazione" label="Ristorazione" icon={<Utensils size={20} />} />
                            <TabButton id="vedere" label="Cosa Vedere" icon={<Eye size={20} />} />
                            <TabButton id="emergenze" label="Emergenze" icon={<AlertTriangle size={20} />} />
                        </div>

                        <div>
                            {activeTab === 'servizi' && (
                                <div>
                                    <PoiSection title="Distributori di Carburante" pois={comune.pointofinterest} category="FuelStation" />
                                    <PoiSection title="Supermercati" pois={comune.pointofinterest} category="Supermarket" />
                                    <PoiSection title="Parcheggi" pois={comune.pointofinterest} category="Parking" />
                                </div>
                            )}
                            {activeTab === 'ristorazione' && (
                                <div>
                                    <PoiSection title="Ristoranti" pois={comune.pointofinterest} category="Restaurant" />
                                    <PoiSection title="Bar" pois={comune.pointofinterest} category="Bar" />
                                </div>
                            )}
                            {activeTab === 'vedere' && (
                                <div>
                                    <PoiSection title="Attrazioni Turistiche" pois={comune.pointofinterest} category="TouristAttraction" />
                                </div>
                            )}
                            {activeTab === 'emergenze' && (
                                <div>
                                    <PoiSection title="Servizi di Emergenza" pois={comune.pointofinterest} category="EmergencyService" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ComuneDetailPage;