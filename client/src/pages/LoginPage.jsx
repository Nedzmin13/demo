// client/src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useAuthStore from '../store/authStore';
import { loginAdmin } from '../api';

function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const { login, userInfo } = useAuthStore();
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        // Se l'utente è già loggato, reindirizzalo alla dashboard
        if (userInfo) {
            navigate('/admin/dashboard');
        }
    }, [userInfo, navigate]);

    const onSubmit = async (data) => {
        try {
            setApiError('');
            const response = await loginAdmin(data);
            login(response.data); // Salva utente e token nello store
            navigate('/admin/dashboard');
        } catch (error) {
            setApiError(error.response?.data?.message || 'Errore durante il login. Riprova.');
        }
    };

    return (
        <>
            <Helmet><title>Login Admin - FastInfo</title></Helmet>
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                    <h1 className="text-3xl font-bold text-center text-sky-600 mb-6">Admin Login</h1>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                id="email"
                                type="email"
                                {...register('email', { required: 'Email è obbligatoria' })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="password"  className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                id="password"
                                type="password"
                                {...register('password', { required: 'Password è obbligatoria' })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>
                        {apiError && <p className="text-red-500 text-sm text-center">{apiError}</p>}
                        <div>
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                                Accedi
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default LoginPage;