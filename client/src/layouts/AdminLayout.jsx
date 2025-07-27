// client/src/layouts/AdminLayout.jsx
import React from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import {
    LayoutDashboard, Newspaper, Tag, Gift, Map, MapPin, Building, Route as RouteIcon,
    Zap, AlertTriangle, TrafficCone, Star, LogOut, BookOpen, Wrench
} from 'lucide-react';

const SidebarLink = ({ to, icon, children }) => {
    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
            isActive
                ? 'bg-sky-100 text-sky-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`;
    return <NavLink to={to} className={navLinkClass}>{icon}{children}</NavLink>;
};

function AdminLayout() {
    const { logout, userInfo } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-white border-r flex flex-col">
                <div className="h-16 flex items-center justify-center border-b">
                    <Link to="/admin/dashboard" className="text-2xl font-bold text-sky-600">FastInfo Admin</Link>
                </div>
                <nav className="flex-grow p-4 space-y-2">
                    <SidebarLink to="/admin/dashboard" icon={<LayoutDashboard size={18}/>}>Dashboard</SidebarLink>
                    <SidebarLink to="/admin/notizie" icon={<Newspaper size={18}/>}>Notizie</SidebarLink>
                    <SidebarLink to="/admin/offerte" icon={<Tag size={18}/>}>Offerte</SidebarLink>
                    <SidebarLink to="/admin/bonus" icon={<Gift size={18}/>}>Bonus</SidebarLink>

                    <p className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase">Geografico</p>
                    <SidebarLink to="/admin/regioni" icon={<Map size={18}/>}>Regioni</SidebarLink>
                    <SidebarLink to="/admin/province" icon={<MapPin size={18}/>}>Province</SidebarLink>
                    <SidebarLink to="/admin/comuni" icon={<Building size={18}/>}>Comuni</SidebarLink>

                    <p className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase">Contenuti</p>
                    <SidebarLink to="/admin/itinerari" icon={<RouteIcon size={18}/>}>Itinerari</SidebarLink>
                    <SidebarLink to="/admin/destinazioni" icon={<Star size={18}/>}>Destinazioni</SidebarLink>
                    <SidebarLink to="/admin/guide" icon={<BookOpen size={18}/>}>Pratiche Utili</SidebarLink>
                    <SidebarLink to="/admin/howto" icon={<Wrench size={18}/>}>Come Fare</SidebarLink>


                    <p className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase">Utilità</p>
                    <SidebarLink to="/admin/scioperi" icon={<AlertTriangle size={18}/>}>Scioperi</SidebarLink>
                    <SidebarLink to="/admin/traffico" icon={<TrafficCone size={18}/>}>Traffico</SidebarLink>
                </nav>
                <div className="p-4 border-t">
                    <p className="text-sm font-semibold">{userInfo?.email}</p>
                    <button onClick={handleLogout} className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}

export default AdminLayout;