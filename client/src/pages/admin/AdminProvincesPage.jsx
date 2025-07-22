import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { fetchProvincesForAdmin, updateProvince } from '../../api';
import { Edit, X, ChevronLeft, ChevronRight } from 'lucide-react';

// --- Componente Modale per la Modifica ---
function EditProvinceModal({ province, onClose, onUpdated }) {
    const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: province });

    const onSubmit = async (data) => {
        try {
            await updateProvince(province.id, data);
            onUpdated();
            onClose();
        } catch (error) { alert("Errore aggiornamento"); }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-bold">Modifica: {province.name}</h2><button onClick={onClose}><X /></button></div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div><label>Nome</label><input {...register('name')} className="w-full border p-2 rounded"/></div>
                    <div><label>Sigla</label><input {...register('sigla')} className="w-full border p-2 rounded"/></div>
                    <div><label>Popolazione</label><input {...register('population')} className="w-full border p-2 rounded"/></div>
                    <div><label>Cosa Vedere (testo)</label><textarea {...register('toSee')} rows="4" className="w-full border p-2 rounded"></textarea></div>
                    <div><label>Descrizione</label><textarea {...register('description')} rows="4" className="w-full border p-2 rounded"></textarea></div>
                    <div className="flex justify-end gap-4"><button type="button" onClick={onClose}>Annulla</button><button type="submit" disabled={isSubmitting}>Salva Modifiche</button></div>
                </form>
            </div>
        </div>
    );
}

// --- Pagina Principale ---
function AdminProvincesPage() {
    const [provinces, setProvinces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProvince, setEditingProvince] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 25;

    const loadData = async (page) => {
        setLoading(true);
        try {
            const res = await fetchProvincesForAdmin(page, LIMIT);
            setProvinces(res.data.data);
            setTotalPages(Math.ceil(res.data.total / LIMIT));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        loadData(currentPage);
    }, [currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <>
            <Helmet><title>Gestione Province - Admin</title></Helmet>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-4">Gestione Province</h1>
                <p className="text-sm text-gray-500 mb-6">Modifica i dati descrittivi per ogni provincia.</p>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th>Provincia</th><th>Sigla</th><th>Azione</th></tr></thead>
                        <tbody>
                        {loading ? <tr><td colSpan="3">Caricamento...</td></tr> : provinces.map(prov => (
                            <tr key={prov.id} className="bg-white border-b">
                                <td className="px-6 py-4 font-medium">{prov.name}</td>
                                <td className="px-6 py-4">{prov.sigla}</td>
                                <td className="px-6 py-4"><button onClick={() => setEditingProvince(prov)} className="text-blue-600"><Edit /></button></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-between items-center mt-6">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft/> Precedente</button>
                    <span>Pagina {currentPage} di {totalPages}</span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Successiva <ChevronRight/></button>
                </div>
            </div>
            {editingProvince && <EditProvinceModal province={editingProvince} onClose={() => setEditingProvince(null)} onUpdated={() => loadData(currentPage)} />}
        </>
    );
}

export default AdminProvincesPage;