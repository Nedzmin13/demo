import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from "./layouts/AdminLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Import Pagine Pubbliche
import HomePage from './pages/HomePage';
import TravelPage from './pages/TravelPage';
import RegionsListPage from './pages/RegionsListPage';
import RegionDetailPage from "./pages/RegionDetailPage.jsx";
import ProvinceDetailPage from "./pages/ProvinceDetailPage.jsx";
import ComuneDetailPage from "./pages/ComuneDetailPage.jsx";
import OffersPage from "./pages/OffersPage.jsx";
import OfferDetailPage from "./pages/OfferDetailPage.jsx";
import ItineraryDetailPage from "./pages/ItineraryDetailPage.jsx";
import ItinerariesListPage from "./pages/ItinerariesListPage.jsx";
import TopDestinationsPage from "./pages/TopDestinationsPage.jsx";
import DestinationDetailPage from "./pages/DestinationDetailPage.jsx";
import BonusPage from "./pages/BonusPage.jsx";
import BonusDetailPage from "./pages/BonusDetailPage.jsx";
import UtilityNewsPage from "./pages/UtilityNewsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import PoiDetailPage from "./pages/PoiDetailPage.jsx";
import GuidesPage from "./pages/GuidesPage.jsx";
import GuideCategoryPage from "./pages/GuideCategoryPage.jsx";
import GuideDetailPage from "./pages/GuideDetailPage.jsx";
import ServiceRegionsPage from "./pages/services/ServiceRegionsPage.jsx";
import ServiceProvinceListPage from "./pages/services/ServiceProvinceListPage.jsx";
import AttractionRegionsPage from "./pages/attractions/AttractionRegionsPage.jsx";
import AttractionProvinceListPage from "./pages/attractions/AttractionProvinceListPage.jsx";

// Import Pagine Admin
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

// --- NUOVI IMPORT PER LA SEZIONE ADMIN GUIDE ---
import AdminGuidesCategoriesPage from "./pages/admin/AdminGuidesCategoriesPage.jsx";
import AdminGuidesListPage from './pages/admin/AdminGuidesListPage';
import AdminGuideEditPage from "./pages/admin/AdminGuideEditPage.jsx";
import AdminHowToCategoriesPage from "./pages/admin/AdminHowToCategoriesPage.jsx";
import AdminHowToArticlesListPage from "./pages/admin/AdminHowToArticlesListPage.jsx";
import AdminHowToArticleEditPage from "./pages/admin/AdminHowToArticleEditPage.jsx";
import HowToPage from "./pages/HowToPage.jsx";
import HowToCategoryPage from "./pages/HowToCategoryPage.jsx";
import HowToArticlePage from "./pages/HowToArticlePage.jsx";
import NewsDetailPage from "./pages/NewsDetailPage.jsx";


const Placeholder = ({ title }) => <div className="text-center p-20 text-3xl font-bold">{title}</div>;

function App() {
    return (
        <Routes>
            {/* --- ROTTE PUBBLICHE --- */}
            <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="viaggio" element={<TravelPage />} />
                <Route path="viaggio/regioni" element={<RegionsListPage />} />
                <Route path="viaggio/:regionName" element={<RegionDetailPage />} />
                <Route path="viaggio/:regionName/:provinceSigla" element={<ProvinceDetailPage />} />
                <Route path="viaggio/:regionName/:provinceSigla/:comuneSlug" element={<ComuneDetailPage />} />
                <Route path="/comune/:comuneSlug" element={<ComuneDetailPage />} />
                <Route path="/poi/:id" element={<PoiDetailPage />} />
                <Route path="/servizi-essenziali" element={<ServiceRegionsPage />} />
                <Route path="/servizi-essenziali/:regionName" element={<RegionDetailPage />} />
                <Route path="/servizi-essenziali/:regionName/:provinceName/:provinceId" element={<ServiceProvinceListPage />} />
                <Route path="/cosa-vedere" element={<AttractionRegionsPage />} />
                <Route path="/cosa-vedere/:regionName" element={<RegionDetailPage />} />
                <Route path="/cosa-vedere/:regionName/:provinceName/:provinceId" element={<AttractionProvinceListPage />} />
                <Route path="/itinerari" element={<ItinerariesListPage />} />
                <Route path="/itinerari/:id" element={<ItineraryDetailPage />} />
                <Route path="affari-sconti" element={<OffersPage />} />
                <Route path="/offerte/:id" element={<OfferDetailPage />} />
                <Route path="bonus" element={<BonusPage />} />
                <Route path="/bonus/:id" element={<BonusDetailPage />} />
                <Route path="top-destinazioni" element={<TopDestinationsPage />} />
                <Route path="/destinazioni/:id" element={<DestinationDetailPage />} />
                <Route path="notizie-utili" element={<UtilityNewsPage />} />
                <Route path="/notizie/:id" element={<NewsDetailPage />} />
                <Route path="/pratiche-utili" element={<GuidesPage />} />
                <Route path="/pratiche-utili/category/:categorySlug" element={<GuideCategoryPage />} />
                <Route path="/pratiche-utili/:slug" element={<GuideDetailPage />} />
                <Route path="/come-fare" element={<HowToPage />} />
                <Route path="/come-fare/category/:categorySlug" element={<HowToCategoryPage />} />
                <Route path="/come-fare/:slug" element={<HowToArticlePage />} />

                <Route path="chi-siamo" element={<Placeholder title="Chi Siamo" />} />
                <Route path="contatti" element={<Placeholder title="Contatti" />} />
                <Route path="faq" element={<Placeholder title="FAQ" />} />
                <Route path="privacy-policy" element={<Placeholder title="Privacy Policy" />} />
                <Route path="cookie-policy" element={<Placeholder title="Cookie Policy" />} />
                <Route path="termini-e-condizioni" element={<Placeholder title="Termini e Condizioni" />} />
                <Route path="*" element={<Placeholder title="404 - Pagina Non Trovata" />} />
            </Route>

            {/* --- ROTTE LOGIN E ADMIN --- */}
            <Route path="/login" element={<LoginPage />} />
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
                    <Route path="scioperi" element={<AdminStrikesPage />} />
                    <Route path="traffico" element={<AdminTrafficPage />} />
                    <Route path="regioni" element={<AdminRegionsPage />} />
                    <Route path="province" element={<AdminProvincesPage />} />

                    {/* --- INIZIO BLOCCO GUIDE ADMIN --- */}
                    <Route path="guide" element={<AdminGuidesCategoriesPage />} />
                    <Route path="guide/category/:categoryId" element={<AdminGuidesListPage />} />
                    <Route path="guide/category/:categoryId/nuovo" element={<AdminGuideEditPage />} />
                    <Route path="guide/modifica/:guideId" element={<AdminGuideEditPage />} />
                    {/* --- FINE BLOCCO GUIDE ADMIN --- */}
                    <Route path="howto" element={<AdminHowToCategoriesPage />} />
                    <Route path="howto/category/:categoryId" element={<AdminHowToArticlesListPage />} />
                    <Route path="howto/category/:categoryId/nuovo" element={<AdminHowToArticleEditPage />} />
                    <Route path="howto/modifica/:articleId" element={<AdminHowToArticleEditPage />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default App;