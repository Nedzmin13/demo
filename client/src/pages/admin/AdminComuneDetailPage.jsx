import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import {
    fetchComuneByIdForAdmin,
    updateComune,
    addComuneImages,
    deleteComuneImage,
    deletePoi // Assicurati di averla in api/index.js
} from '../../api';
import { ArrowLeft, Plus, Edit, Trash2, X } from 'lucide-react';
import AddPoiModal from '../../components/admin/AddPoiModal';
import EditPoiModal from '../../components/admin/EditPoiModal';

function AdminComuneDetailPage() {
    const { id } = useParams();
    const [comune, setComune] = useState(null);
    const [loading, setLoading] = useState(true);

    // Stati per i modali
    const [isAddPoiModalOpen, setIsAddPoiModalOpen] = useState(false);
    const [poiToEdit, setPoiToEdit] = useState(null);

    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetchComuneByIdForAdmin(id);
            setComune(response.data);
            reset({ description: response.data.description }); // Popola il campo descrizione del form
        } catch (error) {
            console.error("Errore nel caricare i dati del comune:", error);
        } finally {
            setLoading(false);
        }
    }, [id, reset]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onComuneSubmit = async (data) => {
        try {
            const { newImages, ...textData } = data;

            // 1. Aggiorna solo i dati testuali
            await updateComune(id, textData);

            // 2. SE ci sono nuove immagini, caricale con una chiamata separata
        /*    if (newImages && newImages.length > 0) {
                const imageFormData = new FormData();
                for (let i = 0; i < newImages.length; i++) {
                    imageFormData.append('newImages', newImages[i]);
                }
                await addComuneImages(id, imageFormData);
            } */

            alert("Dati del comune aggiornati con successo!");
            loadData(); // Ricarica i dati per mostrare tutte le modifiche, incluse le nuove immagini
        } catch (error) {
            console.error("Errore durante l'aggiornamento del comune:", error);
            alert("Errore durante l'aggiornamento. Controlla la console per i dettagli.");
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (window.confirm("Eliminare questa immagine?")) {
            try {
                await deleteComuneImage(imageId);
                loadData();
            } catch (error) { alert("Impossibile eliminare l'immagine."); }
        }
    };

    const handlePoiAdded = () => { loadData(); };
    const handlePoiUpdated = () => { loadData(); };

    const handleDeletePoi = async (poiId) => {
        if (window.confirm("Sei sicuro di voler eliminare questo Punto di Interesse?")) {
            try {
                await deletePoi(poiId);
                loadData();
            } catch (error) { alert("Impossibile eliminare il POI."); }
        }
    };

    if (loading) return <div className="p-8">Caricamento...</div>;
    if (!comune) return <div className="p-8">Comune non trovato.</div>;

    return (
        <>
            <Helmet><title>Dettagli: {comune.name} - Admin</title></Helmet>

            <Link to="/admin/comuni" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft size={16} /> Torna a tutti i comuni
            </Link>

            {/* Form per Dati Comune */}
            <form onSubmit={handleSubmit(onComuneSubmit)} className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Gestione Dettagli: {comune.name}</h1>
                <div className="my-4">
                    <label className="font-semibold">Descrizione</label>
                    <textarea {...register('description')} rows="5" className="w-full border p-2 rounded mt-1"></textarea>
                </div>

                {/* Gestione Immagini Comune */}
                <div className="my-4">
                    <h3 className="font-semibold mb-2">Immagini del Comune</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mb-4">
                        {comune.images && comune.images.map(img => (
                            <div key={img.id} className="relative group">
                                <img src={img.url} alt="Comune" className="w-full h-24 object-cover rounded-md border"/>
                                <button type="button" onClick={() => handleDeleteImage(img.id)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"><X size={12}/></button>
                            </div>
                        ))}
                    </div>
                    <label className="text-sm font-medium">Aggiungi Nuove Immagini</label>
                    <input type="file" {...register('newImages')} multiple className="w-full text-sm mt-1"/>
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">
                        {isSubmitting ? 'Salvataggio...' : 'Salva Dati Comune'}
                    </button>
                </div>
            </form>

            {/* Sezione Gestione POI */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Punti di Interesse Associati</h2>
                    <button onClick={() => setIsAddPoiModalOpen(true)} className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600">
                        <Plus size={18} /> Aggiungi POI
                    </button>
                </div>
                <div className="space-y-4">
                    {comune.pointofinterest.length > 0 ? (
                        comune.pointofinterest.map(poi => (
                            <div key={poi.id} className="border p-4 rounded-lg flex justify-between items-center hover:bg-gray-50">
                                <div>
                                    <p className="font-bold text-gray-900">{poi.name}</p>
                                    <p className="text-sm text-gray-500">{poi.category}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setPoiToEdit(poi)} className="text-blue-600 hover:text-blue-800" title="Modifica"><Edit size={20} /></button>
                                    <button onClick={() => handleDeletePoi(poi.id)} className="text-red-600 hover:text-red-800" title="Elimina"><Trash2 size={20} /></button>
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

            {isAddPoiModalOpen && <AddPoiModal comuneId={comune.id} onClose={() => setIsAddPoiModalOpen(false)} onPoiAdded={handlePoiAdded} />}
            {poiToEdit && <EditPoiModal poiToEdit={poiToEdit} onClose={() => setPoiToEdit(null)} onPoiUpdated={handlePoiUpdated} />}
        </>
    );
}
export default AdminComuneDetailPage;