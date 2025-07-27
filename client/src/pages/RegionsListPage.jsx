import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchRegions } from '../api';
import { MapPin, Search } from 'lucide-react';

const RegionCard = ({ region }) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-800">{region.name}</h3>
            <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </div>
        <p className="text-sm text-gray-500 mb-4">{region.comuni} comuni</p>
        <div className="text-sm text-gray-600 flex-grow">
            <span className="font-semibold">Città principali:</span>
            <p>{region.main_cities}</p>
        </div>
        <Link
            to={`/viaggio/${region.name.toLowerCase()}`}
            className="mt-6 block w-full bg-sky-600 text-white text-center font-semibold py-2 rounded-lg hover:bg-sky-700 transition-colors"
        >
            Esplora {region.name}
        </Link>
    </div>
);

const LoadingSkeleton = () => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-5"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-7"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
    </div>
);

function RegionsListPage() {
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const getRegions = async () => {
            try {
                setLoading(true);
                const response = await fetchRegions();
                setRegions(response.data);
                setError(null);
            } catch (err) {
                setError('Impossibile caricare le regioni. Riprova più tardi.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        getRegions();
    }, []);

    const filteredRegions = regions.filter(region =>
        region.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Helmet>
                <title>Guida alle Regioni d'Italia: Mappa e Informazioni | InfoSubito</title>
                <meta name="description" content="Esplora tutte le 20 regioni d'Italia. Clicca sulla mappa o sulla lista per accedere alle guide dettagliate su cosa vedere, fare e dove andare in ogni regione." />
                <meta property="og:title" content="Guida alle Regioni d'Italia: Mappa e Informazioni" />
            </Helmet>
            <div className="bg-gray-50 py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900">Esplora l'Italia</h1>
                        <p className="mt-3 text-lg text-gray-600">
                            Seleziona una regione per scoprire informazioni utili su città, servizi e attrazioni
                        </p>
                    </div>

                    <div className="mb-12 max-w-lg mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Cerca una regione..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-6 w-6 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-center text-red-500">{error}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {loading ? (
                            Array.from({ length: 12 }).map((_, index) => <LoadingSkeleton key={index} />)
                        ) : (
                            filteredRegions.map((region) => (
                                <RegionCard key={region.id} region={region} />
                            ))
                        )}
                        {!loading && filteredRegions.length === 0 && (
                            <p className="text-center text-gray-500 md:col-span-2 lg:col-span-3 xl:col-span-4 py-8">
                                Nessuna regione trovata con questo nome.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default RegionsListPage;