// client/src/layouts/MainLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CookieBanner from "../components/CookieBanner.jsx";

function MainLayout() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-grow">
                {/* L'Outlet renderizzerà la pagina corrente (es. HomePage) */}
                <Outlet />
            </main>
            <Footer />
            <CookieBanner />
        </div>
    );
}

export default MainLayout;