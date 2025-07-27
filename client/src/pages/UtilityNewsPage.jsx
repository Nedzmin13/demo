import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { fetchUtilityInfo } from '../api';
import { Train, Car, Phone, TriangleAlert, Thermometer, Droplet, Wind, Newspaper, Plus } from 'lucide-react'; // <-- Importa Newspaper, Plus
import { Link } from 'react-router-dom'; // <-- Importa Link
import axios from 'axios';
import NewsPreviewCard from '../components/NewsPreviewCard';
// --- Componenti Specifici per questa Pagina ---

// Componente Meteo Migliorato
const WeatherWidget = ({ city }) => {
    const [weather, setWeather] = useState(null);
    const API_KEY = '6848c8465b7730a0fe14449285f7b515';

    useEffect(() => {
        const getWeather = async () => {
            try {
                const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city},IT&appid=${API_KEY}&units=metric&lang=it`);
                setWeather(response.data);
            } catch (error) {
                console.error(`Errore meteo per ${city}:`, error);
            }
        };
        getWeather();
    }, [city]);

    if (!weather) return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col justify-center items-center h-40 animate-pulse">
            <div className="h-6 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-full my-2"></div>
            <div className="h-5 w-20 bg-gray-200 rounded"></div>
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 text-center">
            <h3 className="font-bold text-xl text-gray-800">{weather.name}</h3>
            <div className="flex items-center justify-center gap-2 my-2">
                <Thermometer className="text-red-500" size={28}/>
                <span className="text-4xl font-bold text-gray-900">{Math.round(weather.main.temp)}°C</span>
            </div>
            <p className="text-gray-600 capitalize">{weather.weather[0].description}</p>
            <p className="text-sm text-gray-500 mt-2 flex justify-center items-center gap-1">
                <Droplet size={14}/> Pioggia {weather.rain ? weather.rain['1h'] : 0}%
            </p>
        </div>
    );
};

// Componente per singolo Sciopero
const StrikeCard = ({ strike }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-400">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-800">{strike.type}</h3>
            <span className="font-semibold bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                {new Date(strike.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
        </div>
        <p className="text-sm"><strong className="text-gray-600">Zona:</strong> {strike.zone}</p>
        <p className="text-sm"><strong className="text-gray-600">Durata:</strong> {strike.duration}</p>
        <div className="mt-3 pt-3 border-t text-sm">
            <p><strong className="text-gray-600">Servizi coinvolti:</strong> {strike.services}</p>
        </div>
    </div>
);

// Componente per singola Allerta Traffico
const TrafficCard = ({ alert }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-800">{alert.highway}</h3>
            <span className="font-semibold bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                +{alert.delay}
            </span>
        </div>
        <p className="text-sm"><strong className="text-gray-600">Tratto:</strong> {alert.stretch}</p>
        <p className="text-sm"><strong className="text-gray-600">Problema:</strong> {alert.problem}</p>
        <div className="mt-3 pt-3 border-t text-sm bg-blue-50 text-blue-800 p-3 rounded-lg">
            <strong>Percorso alternativo:</strong> {alert.alternative}
        </div>
    </div>
);

// Componente per Numero Emergenza
const EmergencyNumberCard = ({ num }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 text-center">
        <h3 className="text-5xl font-extrabold text-red-600">{num.number}</h3>
        <p className="font-semibold text-gray-800 mt-2">{num.title}</p>
    </div>
);

// --- Pagina Principale ---
function UtilityNewsPage() {
    const [utilityData, setUtilityData] = useState({ traffic: [], strikes: [], emergency: [], news: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetchUtilityInfo();
                setUtilityData(response.data);
            } catch (error) {
                console.error("Errore caricamento notizie utili:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <>
            <Helmet>
                <title>Notizie Utili in Tempo Reale | Traffico, Scioperi, Meteo e News | InfoSubito</title>
                <meta name="description" content="Rimani aggiornato con le notizie utili per chi viaggia e vive in Italia: situazione del traffico, scioperi programmati, previsioni meteo e le ultime notizie del giorno." />
                <meta property="og:title" content="Notizie Utili in Tempo Reale | Traffico, Scioperi e News" />
                <meta property="og:description" content="Tutte le informazioni di servizio in un unico posto: viabilità, agitazioni sindacali e ultime news." />
            </Helmet>
            <div className="bg-gray-50 py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

                    {/* Sezione Meteo */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <WeatherWidget city="Milan"/>
                        <WeatherWidget city="Rome"/>
                        <WeatherWidget city="Naples"/>
                        <WeatherWidget city="Florence"/>
                    </div>

                    {/* Sezione Numeri di Emergenza */}
                    <div>
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3"><Phone
                            className="text-red-600"/> Numeri di Emergenza</h2>
                        {loading ? <p>Caricamento...</p> : utilityData.emergency.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {utilityData.emergency.map(num => <EmergencyNumberCard key={num.id} num={num}/>)}
                            </div>
                        ) : <p className="bg-white p-6 rounded-xl shadow-sm text-gray-500">Nessun numero di emergenza
                            disponibile.</p>}
                    </div>

                    {/* Sezione Scioperi */}
                    <div>
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3"><Train
                            className="text-orange-500"/> Scioperi Trasporti</h2>
                        {loading ? <p>Caricamento...</p> : utilityData.strikes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {utilityData.strikes.map(strike => <StrikeCard key={strike.id} strike={strike}/>)}
                            </div>
                        ) : <p className="bg-white p-6 rounded-xl shadow-sm text-gray-500">Nessuno sciopero previsto al
                            momento.</p>}
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3"><Newspaper
                            className="text-sky-600"/> Ultime Notizie</h2>
                        {loading ? <p>Caricamento...</p> : utilityData.news && utilityData.news.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {utilityData.news.map(newsItem => (
                                    <NewsPreviewCard key={newsItem.id} news={newsItem}/>
                                ))}
                            </div>
                        ) : <p className="bg-white p-6 rounded-xl shadow-sm text-gray-500">Nessuna notizia disponibile
                            al momento.</p>}
                    </div>

                    {/* Sezione Traffico */}
                    <div>
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3"><TriangleAlert
                            className="text-red-500"/> Traffico e Viabilità</h2>
                        {loading ? <p>Caricamento...</p> : utilityData.traffic.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {utilityData.traffic.map(alert => <TrafficCard key={alert.id} alert={alert}/>)}
                            </div>
                        ) : <p className="bg-white p-6 rounded-xl shadow-sm text-gray-500">Nessuna segnalazione di
                            traffico rilevante.</p>}
                    </div>


                </div>
            </div>
        </>
    );
}

export default UtilityNewsPage;