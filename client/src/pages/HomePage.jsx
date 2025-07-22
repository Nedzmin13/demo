import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import HomeCard from '../components/HomeCard';
import NewsPreviewCard from '../components/NewsPreviewCard';
import { Briefcase, Tag, Gift, Zap, Plane, Plus } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { fetchNews } from '../api';

function HomePage() {
    const cardIconClass = "h-10 w-10 text-sky-500";
    const [latestNews, setLatestNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadNews = async () => {
            try {
                // MODIFICATION: Call the imported function directly
                const response = await fetchNews({ limit: 2 });
                setLatestNews(response.data);
            } catch (error) {
                console.error("Errore nel caricare le ultime notizie:", error);
            } finally {
                setLoading(false);
            }
        };
        loadNews();
    }, []);

    return (
        <>
            <Helmet>
                <title>FastInfo - Viaggi, Offerte, Bonus e Notizie per l'Italia</title>
                <meta name="description" content="Il portale che ti tiene aggiornato su tutto ciò che serve: viaggi, offerte, bonus e notizie utili per l'Italia." />
            </Helmet>

            <Hero />

            {/* Sezione Cards sotto l'Hero */}
            <div className="bg-gray-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <HomeCard icon={<Plane className={cardIconClass} />} title="Viaggio" description="Scopri l'Italia" linkTo="/viaggio" />
                        <HomeCard icon={<Tag className={cardIconClass} />} title="Affari & Sconti" description="Migliori offerte" linkTo="/affari-sconti" />
                        <HomeCard icon={<Gift className={cardIconClass} />} title="Bonus" description="Incentivi disponibili" linkTo="/bonus" />
                        <HomeCard icon={<Zap className={cardIconClass} />} title="Notizie Utili" description="Info in tempo reale" linkTo="/notizie-utili" />
                    </div>
                </div>
            </div>

            {/* Sezione Ultime Novità */}
            <div className="bg-gray-100 pt-20 pb-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
                        Ultime Novità
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading ? <p>Caricamento notizie...</p> : latestNews.map(news => (
                            <NewsPreviewCard key={news.id} title={news.title} imageUrl={news.imageUrl} />
                        ))}

                        <div className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-8 hover:border-sky-500 hover:bg-gray-50 transition-all">
                            <div className="bg-gray-200 rounded-full p-3 mb-4">
                                <Plus className="h-8 w-8 text-gray-500" />
                            </div>
                            <h3 className="font-semibold text-lg text-gray-800">Altre novità</h3>
                            <p className="text-gray-500 mt-1">Scopri tutte le ultime notizie</p>
                            <Link to="/notizie" className="mt-4 text-sky-600 font-semibold hover:underline">
                                Vedi tutte
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default HomePage;