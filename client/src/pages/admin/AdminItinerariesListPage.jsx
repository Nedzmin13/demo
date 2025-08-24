import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { fetchItinerariesForAdmin, deleteItinerary } from '../../api';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

function AdminItinerariesListPage() {
    const [itineraries, setItineraries] = useState([]); // Inizializza SEMPRE con un array vuoto
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const loadItineraries = async () => {
        setLoading(true);
        try {
            const response = await fetchItinerariesForAdmin({ page: currentPage, limit: 15 });
            setItineraries(response.data.data); // Leggi i dati da response.data.data
            setPagination(response.data.pagination); // Leggi la paginazione da response.data.pagination
        } catch (error) {
            console.error("Errore nel caricare gli itinerari:", error);
            setItineraries([]); // In caso di errore, imposta un array vuoto per evitare crash
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItineraries();
    }, [currentPage]);

    const handleDelete = async (id) => {
        if (window.confirm("Sei sicuro di voler eliminare questo itinerario?")) {
            await deleteItinerary(id);
            loadItineraries();
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(p => p - 1);
    };

    const handleNextPage = () => {
        if (pagination && currentPage < pagination.totalPages) {
            setCurrentPage(p => p + 1);
        }
    };

    return (
        <>
            <Helmet><title>Gestione Itinerari - Admin</title></Helmet>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Gestione Itinerari ({pagination ? pagination.total : 0})</h1>
                    <Link to="/admin/itinerari/nuovo" className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600">
                        <Plus size={18} /> Aggiungi Itinerario
                    </Link>
                </div>
                <div className="space-y-4">
                    {loading ? <p>Caricamento...</p> : itineraries.map(it => (
                        <div key={it.id} className="border p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-bold">{it.title}</p>
                                <p className="text-sm text-gray-500">{it.region} - {it.duration}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link to={`/admin/itinerari/modifica/${it.id}`} className="text-blue-500 hover:text-blue-700"><Edit/></Link>
                                <button onClick={() => handleDelete(it.id)} className="text-red-500 hover:text-red-700"><Trash2/></button>
                            </div>
                        </div>
                    ))}
                    {!loading && itineraries.length === 0 && <p className="text-center text-gray-500 py-8">Nessun itinerario creato.</p>}
                </div>
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6">
                        <button onClick={handlePrevPage} disabled={currentPage === 1 || loading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50">
                            <ChevronLeft size={16} /> Precedente
                        </button>
                        <span className="text-sm text-gray-700">Pagina <strong>{currentPage}</strong> di <strong>{pagination.totalPages}</strong></span>
                        <button onClick={handleNextPage} disabled={currentPage === pagination.totalPages || loading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50">
                            Successiva <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

export default AdminItinerariesListPage;