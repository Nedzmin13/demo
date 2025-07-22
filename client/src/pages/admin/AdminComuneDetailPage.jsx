import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import {
    fetchComuneByIdForAdmin,
    updateComune,
    deleteComuneImage,
    deletePoi,
    createPoi // Assicurati che sia importata e definita in api/index.js
} from '../../api';
import { ArrowLeft, Plus, Edit, Trash2, X } from 'lucide-react';
import AddPoiModal from '../../components/admin/AddPoiModal';
import EditPoiModal from '../../components/admin/EditPoiModal';

function AdminComuneDetailPage() {
    const { id } = useParams();
    const [comune, setComune] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAddPoiModalOpen, setIsAddPoiModalOpen] = useState(false);
    const [poiToEdit, setPoiToEdit] = useState(null);

    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

    // Funzione per caricare/ricaricare tutti i dati della pagina
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetchComuneByIdForAdmin(id);
            setComune(response.data);
            // Popola il form con i dati del comune
            reset({
                name: response.data.name,
                description: response.data.description
            });
        } catch (error) {
            console.error("Errore nel caricare i dati del comune:", error);
        } finally {
            setLoading(false);
        }
    }, [id, reset]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Funzione di submit per aggiornare i dati del comune (testo + immagini)
    const onComuneSubmit = async (data) => {
        const formData = new FormData();

        // Aggiungi i dati testuali al FormData
        formData.append('name', data.name);
        formData.append('description', data.description);

        // Aggiungi i nuovi file di immagine, se presenti
        if (data.images && data.images.length > 0) {
            for (let i = 0; i < data.images.length; i++) {
                formData.append('images', data.images[i]);
            }
        }

        try {
            // Esegui una singola chiamata API per l'aggiornamento
            await updateComune(id, formData);
            alert("Dati del comune aggiornati con successo!");
            loadData(); // Ricarica tutti i dati per visualizzare le modifiche
        } catch (error) {
            console.error("Errore durante l'aggiornamento del comune:", error);
            alert("Errore durante l'aggiornamento. Controlla la console.");
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (window.confirm("Sei sicuro di voler eliminare questa immagine?")) {
            try {
                await deleteComuneImage(imageId);
                loadData(); // Ricarica i dati per rimuovere l'immagine dall'interfaccia
            } catch (error) {
                alert("Impossibile eliminare l'immagine.");
            }
        }
    };

    const handleDeletePoi = async (poiId) => {
        if (window.confirm("Sei sicuro di voler eliminare questo Punto di Interesse? L'azione è irreversibile.")) {
            try {
                await deletePoi(poiId);
                loadData(); // Ricarica i dati per rimuovere il POI dalla lista
            } catch (error) {
                alert("Impossibile eliminare il POI.");
            }
        }
    };

    // Funzioni di callback per i modali dei POI
    const handlePoiActionCompletion = () => {
        setIsAddPoiModalOpen(false);
        setPoiToEdit(null);
        loadData(); // Ricarica sempre i dati dopo un'azione sui POI
    };

    // --- Gestione del rendering condizionale ---
    if (loading) return <div className="p-8 text-center">Caricamento...</div>;
    if (!comune) return <div className="p-8 text-center">Comune non trovato.</div>;

    return (
        <>
            <Helmet><title>Dettagli: {comune.name} - Admin</title></Helmet>

            <Link to="/admin/comuni" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft size={16} /> Torna a tutti i comuni
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Colonna 1: Form per Dati e Immagini del Comune */}
                <div className="bg-white p-6 rounded-lg shadow-md self-start">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Gestione Dettagli: {comune.name}</h1>
                    <form onSubmit={handleSubmit(onComuneSubmit)} className="space-y-4">
                        <div>
                            <label className="font-semibold text-gray-700">Nome Comune</label>
                            <input {...register('name')} className="w-full border p-2 rounded mt-1 bg-gray-50" readOnly/>
                        </div>
                        <div>
                            <label className="font-semibold text-gray-700">Descrizione</label>
                            <textarea {...register('description')} rows="5" className="w-full border p-2 rounded mt-1"></textarea>
                        </div>
                        <hr/>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-gray-700">Immagini del Comune</h3>
                            {comune.images && comune.images.length > 0 ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {comune.images.map(img => (
                                        <div key={img.id} className="relative group">
                                            <img src={img.url} alt={`Immagine di ${comune.name}`} className="w-full h-20 object-cover rounded-md border"/>
                                            <button type="button" onClick={() => handleDeleteImage(img.id)} className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X size={12}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-gray-500">Nessuna immagine presente.</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Aggiungi Nuove Immagini</label>
                            <input type="file" {...register('images')} multiple className="w-full text-sm mt-1 p-2 border rounded-md"/>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400">
                                {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Colonna 2: Gestione Punti di Interesse */}
                <div className="bg-white p-6 rounded-lg shadow-md self-start">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Punti di Interesse</h2>
                        <button onClick={() => setIsAddPoiModalOpen(true)} className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600">
                            <Plus size={18} /> Aggiungi POI
                        </button>
                    </div>
                    <div className="space-y-3">
                        {comune.pointofinterest.length > 0 ? (
                            comune.pointofinterest.map(poi => (
                                <div key={poi.id} className="border p-3 rounded-lg flex justify-between items-center hover:bg-gray-50">
                                    <div>
                                        <p className="font-bold text-gray-900">{poi.name}</p>
                                        <p className="text-sm text-gray-500">{poi.category}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setPoiToEdit(poi)} className="text-blue-600 hover:text-blue-800" title="Modifica"><Edit size={18} /></button>
                                        <button onClick={() => handleDeletePoi(poi.id)} className="text-red-600 hover:text-red-800" title="Elimina"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-10 border-2 border-dashed rounded-lg">
                                <p>Nessun POI aggiunto. Clicca su "Aggiungi POI" per iniziare.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modali per Aggiungere e Modificare POI */}
            {isAddPoiModalOpen && <AddPoiModal comuneId={comune.id} onClose={() => setIsAddPoiModalOpen(false)} onPoiCreated={handlePoiActionCompletion} />}
            {poiToEdit && <EditPoiModal poiToEdit={poiToEdit} onClose={() => setPoiToEdit(null)} onPoiUpdated={handlePoiActionCompletion} />}
        </>
    );
}

export default AdminComuneDetailPage;