import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import {
    fetchComuneByIdForAdmin,
    updateComune,
    deleteComuneImage,
    updateComuneImage, // Importa la nuova funzione
    deletePoi,
    createPoi
} from '../../api';
import { ArrowLeft, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import AddPoiModal from '../../components/admin/AddPoiModal';
import EditPoiModal from '../../components/admin/EditPoiModal';
import RichTextEditor from '../../components/admin/forms/RichTextEditor';

function AdminComuneDetailPage() {
    const { id } = useParams();
    const [comune, setComune] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAddPoiModalOpen, setIsAddPoiModalOpen] = useState(false);
    const [poiToEdit, setPoiToEdit] = useState(null);

    // Stato per la modifica delle attribuzioni
    const [editingImageId, setEditingImageId] = useState(null);
    const [attributionText, setAttributionText] = useState('');

    const { register, handleSubmit, reset, control, formState: { isSubmitting } } = useForm();

    const loadData = useCallback(async () => {
        // Non serve setLoading(true) qui, lo gestiamo all'interno
        try {
            const response = await fetchComuneByIdForAdmin(id);
            setComune(response.data);
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
        setLoading(true);
        loadData();
    }, [loadData]);

    // Submit per il form principale (descrizione e aggiunta nuove immagini)
    const onComuneSubmit = async (data) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        if (data.images && data.images.length > 0) {
            for (let i = 0; i < data.images.length; i++) {
                formData.append('images', data.images[i]);
            }
        }
        try {
            await updateComune(id, formData);
            alert("Dati e/o immagini del comune aggiornati!");
            loadData();
        } catch (error) {
            alert("Errore durante l'aggiornamento.");
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (window.confirm("Sei sicuro di voler eliminare questa immagine?")) {
            try {
                await deleteComuneImage(imageId);
                loadData();
            } catch (error) { alert("Impossibile eliminare l'immagine."); }
        }
    };

    // Nuove funzioni per la modifica dell'attribuzione
    const handleEditAttribution = (image) => {
        setEditingImageId(image.id);
        setAttributionText(image.attribution || '');
    };

    const handleSaveAttribution = async (imageId) => {
        try {
            await updateComuneImage(imageId, { attribution: attributionText });
            setEditingImageId(null);
            loadData();
        } catch (error) {
            alert("Errore durante il salvataggio dell'attribuzione.");
        }
    };

    const handleDeletePoi = async (poiId) => {
        if (window.confirm("Sei sicuro di voler eliminare questo POI?")) {
            try {
                await deletePoi(poiId);
                loadData();
            } catch (error) { alert("Impossibile eliminare il POI."); }
        }
    };

    const handlePoiActionCompletion = () => {
        setIsAddPoiModalOpen(false);
        setPoiToEdit(null);
        loadData();
    };

    if (loading) return <div className="p-8 text-center">Caricamento...</div>;
    if (!comune) return <div className="p-8 text-center">Comune non trovato.</div>;

    return (
        <>
            <Helmet><title>Dettagli: {comune.name} - Admin</title></Helmet>
            <Link to="/admin/comuni" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft size={16} /> Torna a tutti i comuni
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Colonna 1: Form e Gestione POI */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-lg shadow-md self-start">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Gestione Dettagli: {comune.name}</h1>
                        <form onSubmit={handleSubmit(onComuneSubmit)} className="space-y-4">
                            <div><label className="font-semibold text-gray-700">Nome Comune</label><input {...register('name')} className="w-full border p-2 rounded mt-1 bg-gray-50" readOnly /></div>
                            <div>
                                <label className="font-semibold text-gray-700 block mb-2">Descrizione</label>
                                <Controller
                                    name="description"
                                    control={control}
                                    defaultValue={comune.description || ''}
                                    render={({field}) => <RichTextEditor value={field.value}
                                                                         onChange={field.onChange}/>}
                                />
                            </div>
                            <div><label className="text-sm font-medium text-gray-700">Aggiungi Nuove Immagini</label><input type="file" {...register('images')} multiple className="w-full text-sm mt-1 p-2 border rounded-md" /></div>
                            <div className="flex justify-end pt-2"><button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400">{isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}</button></div>
                        </form>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md self-start">
                        <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-gray-800">Punti di Interesse</h2><button onClick={() => setIsAddPoiModalOpen(true)} className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"><Plus size={18} /> Aggiungi POI</button></div>
                        <div className="space-y-3">
                            {comune.pointofinterest.length > 0 ? (
                                comune.pointofinterest.map(poi => (
                                    <div key={poi.id} className="border p-3 rounded-lg flex justify-between items-center hover:bg-gray-50">
                                        <div><p className="font-bold text-gray-900">{poi.name}</p><p className="text-sm text-gray-500">{poi.category}</p></div>
                                        <div className="flex items-center gap-4"><button onClick={() => setPoiToEdit(poi)} className="text-blue-600 hover:text-blue-800" title="Modifica"><Edit size={18} /></button><button onClick={() => handleDeletePoi(poi.id)} className="text-red-600 hover:text-red-800" title="Elimina"><Trash2 size={18} /></button></div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-10 border-2 border-dashed rounded-lg"><p>Nessun POI aggiunto.</p></div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Colonna 2: Gestione Immagini Esistenti */}
                <div className="bg-white p-6 rounded-lg shadow-md self-start">
                    <h2 className="text-2xl font-bold mb-4">Gestione Immagini Esistenti</h2>
                    <div className="space-y-4">
                        {comune.images && comune.images.length > 0 ? (
                            comune.images.map(img => (
                                <div key={img.id} className="border-b pb-4 last:border-b-0">
                                    <div className="flex gap-4">
                                        <img src={img.url} alt={`Immagine di ${comune.name}`} className="w-24 h-24 object-cover rounded-md border flex-shrink-0"/>
                                        <div className="flex-grow">
                                            {editingImageId === img.id ? (
                                                <textarea value={attributionText} onChange={(e) => setAttributionText(e.target.value)} className="w-full border p-2 rounded text-xs" rows="3" placeholder="Es. Autore: Mario Rossi, Licenza: CC BY-SA 4.0"/>
                                            ) : (
                                                <p className="text-xs text-gray-600 italic h-full">{img.attribution || "Nessuna attribuzione"}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-end items-center gap-2 mt-2">
                                        {editingImageId === img.id ? (
                                            <>
                                                <button onClick={() => setEditingImageId(null)} className="text-gray-500 p-1 hover:bg-gray-100 rounded-full" title="Annulla"><X size={16}/></button>
                                                <button onClick={() => handleSaveAttribution(img.id)} className="text-green-600 p-1 hover:bg-green-100 rounded-full" title="Salva Attribuzione"><Save size={16}/></button>
                                            </>
                                        ) : (
                                            <button onClick={() => handleEditAttribution(img)} className="text-blue-600 p-1 hover:bg-blue-100 rounded-full" title="Modifica Attribuzione"><Edit size={16}/></button>
                                        )}
                                        <button onClick={() => handleDeleteImage(img.id)} className="text-red-600 p-1 hover:bg-red-100 rounded-full" title="Elimina Immagine"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))
                        ) : <p className="text-sm text-gray-500 text-center py-8">Nessuna immagine presente. Aggiungine una dal form a sinistra.</p>}
                    </div>
                </div>
            </div>

            {isAddPoiModalOpen && <AddPoiModal comuneId={comune.id} onClose={() => setIsAddPoiModalOpen(false)} onPoiCreated={handlePoiActionCompletion} />}
            {poiToEdit && <EditPoiModal poiToEdit={poiToEdit} onClose={() => setPoiToEdit(null)} onPoiUpdated={handlePoiActionCompletion} />}
        </>
    );
}

export default AdminComuneDetailPage;