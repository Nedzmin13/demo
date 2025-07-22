import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { fetchRegionsForAdmin, updateRegion } from '../../api';
import { Edit, X } from 'lucide-react';

// --- Componente Modale per la Modifica ---
function EditRegionModal({ region, onClose, onUpdated }) {
    const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: region });

    const onSubmit = async (data) => {
        try {
            await updateRegion(region.id, data);
            onUpdated(); // Funzione per ricaricare i dati nella pagina principale
            onClose();
        } catch (error) {
            console.error("Errore aggiornamento regione:", error);
            alert("Errore durante l'aggiornamento della regione.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">Modifica: {region.name}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full"><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div><label className="font-medium text-sm">Nome</label><input {...register('name', {required: true})} className="w-full border p-2 rounded mt-1"/></div>
                    <div><label className="font-medium text-sm">Popolazione</label><input {...register('population')} className="w-full border p-2 rounded mt-1"/></div>
                    <div><label className="font-medium text-sm">N. Attrazioni</label><input {...register('attractions')} className="w-full border p-2 rounded mt-1"/></div>
                    <div><label className="font-medium text-sm">Città Principali</label><input {...register('main_cities')} className="w-full border p-2 rounded mt-1"/></div>
                    <div><label className="font-medium text-sm">URL Immagine</label><input type="url" {...register('imageUrl')} className="w-full border p-2 rounded mt-1"/></div>
                    <div><label className="font-medium text-sm">Descrizione</label><textarea {...register('description')} rows="4" className="w-full border p-2 rounded mt-1"></textarea></div>
                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-lg font-semibold">Annulla</button>
                        <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold disabled:bg-gray-400">
                            {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- Pagina Principale ---
function AdminRegionsPage() {
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingRegion, setEditingRegion] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetchRegionsForAdmin();
            setRegions(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <>
            <Helmet><title>Gestione Regioni - Admin</title></Helmet>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-4">Gestione Regioni</h1>
                <p className="text-sm text-gray-500 mb-6">Modifica i dati descrittivi e le immagini per ogni regione.</p>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Regione</th>
                            <th className="px-6 py-3">Azione</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan="2" className="text-center p-4">Caricamento...</td></tr>
                        ) : regions.map(region => (
                            <tr key={region.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{region.name}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => setEditingRegion(region)} className="text-blue-600 hover:text-blue-800" title="Modifica">
                                        <Edit />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {editingRegion && <EditRegionModal region={editingRegion} onClose={() => setEditingRegion(null)} onUpdated={loadData} />}
        </>
    );
}
export default AdminRegionsPage;