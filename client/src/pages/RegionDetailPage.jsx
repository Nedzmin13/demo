import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchRegionByName } from '../api';
import { ChevronRight, Users, MapPin, Building, Star, List, Eye, HeartHandshake } from 'lucide-react';

// Componente di caricamento
const LoadingSkeleton = () => (
    <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-10"></div>
        <div className="h-72 bg-gray-200 rounded-xl mb-8"></div>
        <div className="h-10 bg-gray-300 rounded w-1/2 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-12"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
        </div>
    </div>
);

function RegionDetailPage() {
    const { regionName } = useParams();
    const [region, setRegion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getRegionData = async () => {
            setLoading(true);
            try {
                const response = await fetchRegionByName(regionName);
                setRegion(response.data);
                setError(null);
            } catch (err) {
                setError('Impossibile caricare i dati della regione.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        getRegionData();
    }, [regionName]);

    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

    if (loading) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <LoadingSkeleton />
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500 py-20">{error}</div>;
    }

    if (!region) {
        return <div className="text-center text-gray-500 py-20">Regione non trovata.</div>;
    }

    const pageTitle = `Guida della Regione ${region.name} | Province e Città | InfoSubito`;
    const metaDescription = `Scopri la regione ${region.name}: guida completa alle sue province, città principali, attrazioni e informazioni utili per il tuo viaggio.`;

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={metaDescription} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={metaDescription} />
            </Helmet>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <nav className="flex items-center text-sm text-gray-500 mb-8">
                    <Link to="/viaggio" className="hover:underline">Viaggio</Link>
                    <ChevronRight size={16} className="mx-2" />
                    <Link to="/viaggio/regioni" className="hover:underline">Italia</Link>
                    <ChevronRight size={16} className="mx-2" />
                    <span className="font-semibold text-gray-700">{region.name}</span>
                </nav>

                {region.imageUrl && (
                    <div className="mb-12">
                        <img src={region.imageUrl} alt={`Veduta di ${region.name}`} className="w-full h-72 object-cover rounded-xl shadow-lg"/>
                    </div>
                )}

                <div className="mb-12">
                    <h1 className="text-5xl font-extrabold text-gray-900">{region.name}</h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-3xl">{region.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-16">
                    <div className="bg-white p-6 rounded-lg shadow-sm"><Users className="mx-auto mb-2 text-sky-500" size={28}/> <span className="text-2xl font-bold">{region.province.length}</span><p className="text-gray-500">Province</p></div>
                    <div className="bg-white p-6 rounded-lg shadow-sm"><MapPin className="mx-auto mb-2 text-sky-500" size={28}/> <span className="text-2xl font-bold">{region.comuni}</span><p className="text-gray-500">Comuni</p></div>
                    <div className="bg-white p-6 rounded-lg shadow-sm"><Building className="mx-auto mb-2 text-sky-500" size={28}/> <span className="text-2xl font-bold">{region.population}</span><p className="text-gray-500">Abitanti</p></div>
                    <div className="bg-white p-6 rounded-lg shadow-sm"><Star className="mx-auto mb-2 text-sky-500" size={28}/> <span className="text-2xl font-bold">{region.attractions}</span><p className="text-gray-500">Attrazioni</p></div>
                </div>

                <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Province di {region.name}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {region.province.map(province => (
                            <div key={province.id} className="bg-white p-6 rounded-lg shadow-sm border flex flex-col">
                                <h3 className="font-bold text-xl text-gray-900">{province.name}</h3>
                                <p className="text-gray-500 mb-4">{province.sigla}</p>
                                <div className="mt-auto space-y-2">
                                    <Link to={`/viaggio/${region.name.toLowerCase()}/${province.sigla.toLowerCase()}`} className="flex items-center justify-center gap-2 w-full bg-gray-100 py-2 rounded-md hover:bg-gray-200 transition-colors text-gray-700 font-semibold"><List size={16} /> Elenco Comuni</Link>
                                    <Link to={`/servizi-essenziali/${region.name.toLowerCase()}/${province.name.toLowerCase()}/${province.id}`} className="flex items-center justify-center gap-2 w-full bg-blue-100 text-blue-800 py-2 rounded-md hover:bg-blue-200 transition-colors font-semibold"><HeartHandshake size={16} /> Servizi Essenziali</Link>
                                    <Link to={`/cosa-vedere/${region.name.toLowerCase()}/${province.name.toLowerCase()}/${province.id}`} className="flex items-center justify-center gap-2 w-full bg-green-100 text-green-800 py-2 rounded-md hover:bg-green-200 transition-colors font-semibold"><Eye size={16} /> Cosa Vedere</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default RegionDetailPage;