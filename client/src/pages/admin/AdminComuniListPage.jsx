// client/src/pages/admin/AdminComuniListPage.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { fetchAllComuniForAdmin } from '../../api';
import { Edit, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';

function AdminComuniListPage() {
    const [comuni, setComuni] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        // Quando la ricerca cambia, resetta la pagina a 1
        setCurrentPage(1);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        const loadComuni = async () => {
            setLoading(true);
            try {
                const response = await fetchAllComuniForAdmin({
                    search: debouncedSearchTerm,
                    page: currentPage,
                    limit: 25 // Puoi cambiare questo valore
                });
                setComuni(response.data.data);
                setPagination(response.data.pagination);
            } catch (error) {
                console.error("Errore nel caricare i comuni:", error);
            } finally {
                setLoading(false);
            }
        };
        loadComuni();
    }, [debouncedSearchTerm, currentPage]); // Si riattiva se cambia la ricerca o la pagina

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (pagination && currentPage < pagination.totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <>
            <Helmet><title>Gestione Comuni - Admin</title></Helmet>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Gestione Comuni</h1>
                </div>

                <div className="relative mb-6">
                    <input
                        type="text"
                        placeholder="Cerca per comune, provincia o sigla..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        {/* ... thead rimane uguale ... */}
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Comune</th>
                            <th scope="col" className="px-6 py-3">Provincia</th>
                            <th scope="col" className="px-6 py-3">Azioni</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan="3" className="text-center p-6">Caricamento...</td></tr>
                        ) : comuni.length > 0 ? (
                            comuni.map(comune => (
                                <tr key={comune.id} className="bg-white border-b hover:bg-gray-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{comune.name}</th>
                                    <td className="px-6 py-4">{comune.province.name} ({comune.province.sigla})</td>
                                    <td className="px-6 py-4">
                                        <Link to={`/admin/comuni/${comune.id}`} className="font-medium text-sky-600 hover:underline"><Edit size={18} /></Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="3" className="text-center p-6">Nessun comune trovato.</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Controlli Paginazione */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1 || loading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} /> Precedente
                        </button>
                        <span className="text-sm text-gray-700">
                            Pagina <strong>{pagination.page}</strong> di <strong>{pagination.totalPages}</strong> (Totale: {pagination.total})
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === pagination.totalPages || loading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Successiva <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
export default AdminComuniListPage;