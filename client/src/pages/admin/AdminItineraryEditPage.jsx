// client/src/pages/Admin/AdminItineraryEditPage.jsx (Contenuto aggiornato)

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import {
    createItinerary, updateItinerary, fetchItineraryById, deleteItineraryImage
} from '../../api';
import { Plus, Trash2, ArrowLeft, X } from 'lucide-react';

function AdminItineraryEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isCreating = !id;

    const { register, handleSubmit, control, reset, formState: { isSubmitting, errors } } = useForm({
        defaultValues: {
            title: '', description: '', region: '', duration: '', isPopular: false,
            steps: [{ day: 1, title: '', description: '' }]
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "steps" });
    const [currentImages, setCurrentImages] = useState([]);
    const [isLoading, setIsLoading] = useState(!isCreating);

    useEffect(() => {
        if (!isCreating) {
            const loadData = async () => {
                setIsLoading(true);
                try {
                    const response = await fetchItineraryById(id);
                    // Importante: le tappe nel DB sono già oggetti, non serve JSON.parse
                    reset({ ...response.data, steps: response.data.steps || [] });
                    setCurrentImages(response.data.images || []);
                } catch (error) {
                    console.error("Errore caricamento dati itinerario:", error);
                    navigate('/admin/itinerari');
                } finally {
                    setIsLoading(false);
                }
            };
            loadData();
        }
    }, [id, isCreating, reset, navigate]);

    // NUOVA LOGICA DI SUBMIT
    const onSubmit = async (data) => {
        const formData = new FormData();

        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('region', data.region);
        formData.append('duration', data.duration);
        formData.append('isPopular', data.isPopular);

        // --- INIZIO MODIFICA QUI ---
        // Pulisci ogni tappa, mantenendo solo i campi necessari per la creazione
        const formattedSteps = data.steps.map(step => ({
            day: Number(step.day),
            title: step.title,
            description: step.description
        }));
        // --- FINE MODIFICA QUI ---

        formData.append('steps', JSON.stringify(formattedSteps));

        if (data.images && data.images.length > 0) {
            for (let i = 0; i < data.images.length; i++) {
                formData.append('images', data.images[i]);
            }
        }

        try {
            if (isCreating) {
                await createItinerary(formData);
            } else {
                await updateItinerary(id, formData);
            }
            navigate('/admin/itinerari');
        } catch (error) {
            console.error("Errore durante il salvataggio:", error);
            alert("Errore durante il salvataggio. Controlla la console per i dettagli.");
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (window.confirm("Sei sicuro di voler eliminare questa immagine? L'eliminazione è permanente.")) {
            try {
                await deleteItineraryImage(imageId);
                setCurrentImages(prev => prev.filter(img => img.id !== imageId));
            } catch (error) {
                alert("Errore durante l'eliminazione dell'immagine.");
            }
        }
    };

    if (isLoading) return <p className="p-8">Caricamento...</p>;

    return (
        <>
            {/* Il resto del JSX rimane quasi identico, non serve cambiarlo */}
            <Helmet><title>{isCreating ? 'Nuovo' : 'Modifica'} Itinerario - Admin</title></Helmet>
            <Link to="/admin/itinerari" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft size={16} /> Torna alla lista
            </Link>
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-lg shadow-md space-y-6">
                <h1 className="text-3xl font-bold text-gray-800">{isCreating ? 'Crea Nuovo Itinerario' : 'Modifica Itinerario'}</h1>

                {/* Sezione principale */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-6">
                    <div><label className="font-semibold">Titolo *</label><input {...register('title', { required: 'Il titolo è obbligatorio' })} className="w-full border p-2 rounded mt-1"/>{errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}</div>
                    <div><label className="font-semibold">Regione</label><input {...register('region')} className="w-full border p-2 rounded mt-1"/></div>
                    <div><label className="font-semibold">Durata (es. 3 giorni)</label><input {...register('duration')} className="w-full border p-2 rounded mt-1"/></div>
                    <div className="flex items-center self-end"><label className="flex items-center gap-2"><input type="checkbox" {...register('isPopular')} /> Itinerario Popolare?</label></div>
                </div>
                <div><label className="font-semibold">Descrizione Generale</label><textarea {...register('description')} rows="4" className="w-full border p-2 rounded mt-1"></textarea></div>

                {/* Sezione Tappe */}
                <div className="border-t pt-6">
                    <h2 className="text-2xl font-bold mb-4">Tappe</h2>
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="border bg-gray-50 p-4 rounded-lg space-y-2 relative">
                                <h3 className="font-semibold text-gray-700">Tappa {index + 1}</h3>
                                <div><label>Giorno *</label><input type="number" {...register(`steps.${index}.day`, { required: true, valueAsNumber: true })} className="w-full border p-2 rounded"/></div>
                                <div><label>Titolo Tappa *</label><input {...register(`steps.${index}.title`, { required: true })} className="w-full border p-2 rounded"/></div>
                                <div><label>Descrizione Tappa</label><textarea {...register(`steps.${index}.description`)} rows="3" className="w-full border p-2 rounded"></textarea></div>
                                {fields.length > 1 && (
                                    <button type="button" onClick={() => remove(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={() => append({ day: fields.length + 1, title: '', description: '' })} className="mt-4 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 flex items-center gap-2">
                        <Plus size={16}/> Aggiungi Tappa
                    </button>
                </div>

                {/* Sezione Immagini */}
                <div className="border-t pt-6">
                    <h2 className="text-2xl font-bold mb-4">Immagini</h2>
                    {!isCreating && currentImages.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-4">
                            {currentImages.map(img => (
                                <div key={img.id} className="relative group">
                                    <img src={img.url} alt="Itinerario" className="w-full h-24 object-cover rounded-md border"/>
                                    <button type="button" onClick={() => handleDeleteImage(img.id)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"><X size={12}/></button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div>
                        <label className="font-semibold">{isCreating ? 'Carica immagini' : 'Carica nuove immagini'}</label>
                        <input type="file" {...register('images')} multiple className="w-full text-sm mt-2 p-2 border rounded"/>
                    </div>
                </div>

                {/* Pulsante di salvataggio */}
                <div className="border-t pt-6 flex justify-end">
                    <button type="submit" disabled={isSubmitting} className="bg-sky-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-sky-700 disabled:bg-gray-400">
                        {isSubmitting ? 'Salvataggio...' : 'Salva Itinerario'}
                    </button>
                </div>
            </form>
        </>
    );
}

export default AdminItineraryEditPage;