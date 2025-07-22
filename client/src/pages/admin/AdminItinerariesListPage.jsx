import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { fetchItinerariesForAdmin, deleteItinerary } from '../../api';
import { Plus, Edit, Trash2 } from 'lucide-react';

function AdminItinerariesListPage() {
    const [itineraries, setItineraries] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadItineraries = async () => {
        setLoading(true);
        try {
            // Usa la funzione API che chiama la rotta protetta
            const response = await fetchItinerariesForAdmin();
            setItineraries(response.data);
        } catch (error) {
            console.error("Errore nel caricare gli itinerari:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItineraries();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Sei sicuro di voler eliminare questo itinerario e tutte le sue tappe?")) {
            try {
                await deleteItinerary(id);
                loadItineraries();
            } catch (error) {
                alert("Errore durante l'eliminazione.");
            }
        }
    };

    return (
        <>
            <Helmet><title>Gestione Itinerari - Admin</title></Helmet>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Gestione Itinerari</h1>
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
            </div>
        </>
    );
}

export default AdminItinerariesListPage;