// client/src/pages/TravelPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Map, List, Eye, Route } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon, title, description, linkTo }) => (
    <motion.div whileHover={{ y: -5 }} className="w-full">
        <Link to={linkTo} className="block bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
            <div className="flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mx-auto mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-center text-gray-800">{title}</h3>
            <p className="text-gray-500 text-center mt-2">{description}</p>
        </Link>
    </motion.div>
);

function TravelPage() {
    const iconClass = "w-8 h-8 text-sky-600";

    return (
        <>
            <Helmet>
                <title>Scopri l'Italia - FastInfo</title>
                <meta name="description" content="Trova informazioni utili per il tuo viaggio in Italia: regioni, province, servizi essenziali, attrazioni e itinerari." />
            </Helmet>
            <div className="bg-gray-50 py-16 sm:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-sky-600 tracking-tight">Scopri l'Italia</h1>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                            Trova informazioni utili per il tuo viaggio: benzinai, supermercati, farmacie, ristoranti e molto altro
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<Map className={iconClass} />}
                            title="Esplora per Regione"
                            description="Naviga per regione e provincia"
                            linkTo="/viaggio/regioni" // Link alla nuova pagina
                        />
                        <FeatureCard
                            icon={<List className={iconClass} />}
                            title="Servizi Essenziali"
                            description="Farmacie, ospedali, benzinai"
                            linkTo="/servizi-essenziali"
                        />
                        <FeatureCard
                            icon={<Eye className={iconClass} />}
                            title="Cosa Vedere"
                            description="Attrazioni e punti di interesse"
                            linkTo="/cosa-vedere"
                        />
                        <FeatureCard
                            icon={<Route className={iconClass} />}
                            title="Itinerari"
                            description="Percorsi consigliati"
                            linkTo="/itinerari"
                        />
                    </div>

                    <div className="mt-20 text-center">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Destinazioni Popolari</h2>
                        <p className="text-gray-500">Nessuna destinazione popolare trovata.</p>
                        {/* Qui in futuro mostreremo le destinazioni con isPopular=true */}
                    </div>
                </div>
            </div>
        </>
    );
}

export default TravelPage;