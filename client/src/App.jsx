// client/src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import TravelPage from './pages/TravelPage';
import RegionsListPage from './pages/RegionsListPage';
import RegionDetailPage from "./pages/RegionDetailPage.jsx";
import ProvinceDetailPage from "./pages/ProvinceDetailPage.jsx";
import ComuneDetailPage from "./pages/ComuneDetailPage.jsx";
import OffersPage from "./pages/OffersPage.jsx";
// NON importiamo più i file cancellati
import ServiceRegionsPage from "./pages/services/ServiceRegionsPage.jsx";
import ServiceProvinceListPage from "./pages/services/ServiceProvinceListPage.jsx";
import AttractionRegionsPage from "./pages/attractions/AttractionRegionsPage.jsx";
import AttractionProvinceListPage from "./pages/attractions/AttractionProvinceListPage.jsx";
import ItineraryDetailPage from "./pages/ItineraryDetailPage.jsx";
import ItinerariesListPage from "./pages/ItinerariesListPage.jsx";
import TopDestinationsPage from "./pages/TopDestinationsPage.jsx";
import BonusPage from "./pages/BonusPage.jsx";
import UtilityNewsPage from "./pages/UtilityNewsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import AdminComuniListPage from "./pages/admin/AdminComuniListPage.jsx";
import AdminComuneDetailPage from "./pages/admin/AdminComuneDetailPage.jsx";
import AdminOffersPage from "./pages/admin/AdminOffersPage.jsx";
import AdminBonusPage from "./pages/admin/AdminBonusPage.jsx";
import AdminDestinationsPage from "./pages/admin/AdminDestinationsPage.jsx";
import AdminItinerariesListPage from './pages/admin/AdminItinerariesListPage';
import AdminItineraryEditPage from './pages/admin/AdminItineraryEditPage';
import AdminNewsPage from "./pages/admin/AdminNewsPage.jsx";
import AdminStrikesPage from "./pages/admin/AdminStrikesPage.jsx";
import AdminTrafficPage from "./pages/admin/AdminTrafficPage.jsx";
import AdminRegionsPage from "./pages/admin/AdminRegionsPage.jsx";
import AdminProvincesPage from "./pages/admin/AdminProvincesPage.jsx";
import DestinationDetailPage from "./pages/DestinationDetailPage.jsx";
import OfferDetailPage from "./pages/OfferDetailPage.jsx";
import PoiDetailPage from "./pages/PoiDetailPage.jsx";

const Placeholder = ({ title }) => <div className="text-center p-20 text-3xl font-bold">{title}</div>;

function App() {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>

                <Route index element={<HomePage />} />

                {/* FLUSSO DI NAVIGAZIONE GEOGRAFICA */}
                <Route path="viaggio" element={<TravelPage />} />
                <Route path="viaggio/regioni" element={<RegionsListPage />} />
                <Route path="viaggio/:regionName" element={<RegionDetailPage />} />
                <Route path="viaggio/:regionName/:provinceSigla" element={<ProvinceDetailPage />} />
                <Route path="viaggio/:regionName/:provinceSigla/:comuneSlug" element={<ComuneDetailPage />} />
                <Route path="/comune/:comuneSlug" element={<ComuneDetailPage />} />
                <Route path="/poi/:id" element={<PoiDetailPage />} />


                {/* FLUSSO SERVIZI ESSENZIALI */}
                <Route path="/servizi-essenziali" element={<ServiceRegionsPage />} />
                {/* La rotta seguente riutilizza RegionDetailPage per mostrare le province di una regione nel flusso "servizi" */}
                <Route path="/servizi-essenziali/:regionName" element={<RegionDetailPage />} />
                {/* La rotta finale che mostra la lista dei servizi per una data provincia */}
                <Route path="/servizi-essenziali/:regionName/:provinceName/:provinceId" element={<ServiceProvinceListPage />} />

                {/* --- FLUSSO COSA VEDERE --- */}
                <Route path="/cosa-vedere" element={<AttractionRegionsPage />} />
                <Route path="/cosa-vedere/:regionName" element={<RegionDetailPage />} />
                <Route path="/cosa-vedere/:regionName/:provinceName/:provinceId" element={<AttractionProvinceListPage />} />

                {/* --- FLUSSO ITINERARI --- */}
                <Route path="/itinerari" element={<ItinerariesListPage />} />
                <Route path="/itinerari/:id" element={<ItineraryDetailPage />} />

                {/* ALTRE PAGINE PRINCIPALI */}
                <Route path="affari-sconti" element={<OffersPage />} />
                <Route path="/offerte/:id" element={<OfferDetailPage />} />

                <Route path="bonus" element={<BonusPage />} />
                <Route path="top-destinazioni" element={<TopDestinationsPage />} />
                <Route path="/destinazioni/:id" element={<DestinationDetailPage />} />
                <Route path="notizie-utili" element={<UtilityNewsPage />} />

                {/* PAGINE FOOTER */}
                <Route path="chi-siamo" element={<Placeholder title="Chi Siamo" />} />
                <Route path="contatti" element={<Placeholder title="Contatti" />} />
                <Route path="admin" element={<Placeholder title="Area Admin" />} />
                <Route path="faq" element={<Placeholder title="FAQ" />} />
                <Route path="privacy-policy" element={<Placeholder title="Privacy Policy" />} />
                <Route path="cookie-policy" element={<Placeholder title="Cookie Policy" />} />
                <Route path="termini-e-condizioni" element={<Placeholder title="Termini e Condizioni" />} />

                <Route path="*" element={<Placeholder title="404 - Pagina Non Trovata" />} />
            </Route>

            <Route path="/login" element={<LoginPage />} />
            {/* --- ROTTE PROTETTE DELL'ADMIN --- */}
            <Route element={<ProtectedRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="comuni" element={<AdminComuniListPage />} />
                    <Route path="comuni/:id" element={<AdminComuneDetailPage />} />
                    <Route path="offerte" element={<AdminOffersPage />} />
                    <Route path="bonus" element={<AdminBonusPage />} />
                    <Route path="destinazioni" element={<AdminDestinationsPage />} />
                    <Route path="itinerari" element={<AdminItinerariesListPage />} />
                    <Route path="itinerari/nuovo" element={<AdminItineraryEditPage />} />
                    <Route path="itinerari/modifica/:id" element={<AdminItineraryEditPage />} />
                    <Route path="notizie" element={<AdminNewsPage />} />
                    <Route path="/admin/scioperi" element={<AdminStrikesPage />} />
                    <Route path="/admin/traffico" element={<AdminTrafficPage />} />
                    <Route path="/admin/regioni" element={<AdminRegionsPage />} />
                    <Route path="/admin/province" element={<AdminProvincesPage />} />




                    {/* Qui aggiungeremo le altre pagine dell'admin (gestione comuni, offerte, etc.) */}
                    <Route path="notizie" element={<div />} />
                    <Route path="offerte" element={<div />} />
                    {/* Aggiungi altri placeholder per evitare errori 404 cliccando i link */}
                </Route>
            </Route>

        </Routes>
    );
}

export default App;