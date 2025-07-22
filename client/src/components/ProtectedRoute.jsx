// client/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function ProtectedRoute() {
    const { userInfo } = useAuthStore();

    // Se l'utente è loggato, renderizza il contenuto della rotta (usando <Outlet />)
    // Altrimenti, reindirizza alla pagina di login
    return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;