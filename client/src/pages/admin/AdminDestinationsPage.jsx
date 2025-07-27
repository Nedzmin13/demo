import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm, Controller } from 'react-hook-form';
import {
    fetchDestinationsForAdmin,
    createDestination,
    updateDestination,
    deleteDestination,
    addImagesToDestination,
    deleteDestinationImage
} from '../../api';
import { Edit, Trash2, X, Star } from 'lucide-react';
import RichTextEditor from '../../components/admin/forms/RichTextEditor';

const seasons = ["Primavera", "Estate", "Autunno", "Inverno"];

function AdminDestinationsPage() {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const { register, handleSubmit, reset, setValue, control, formState: { isSubmitting } } = useForm();
    const [currentImages, setCurrentImages] = useState([]);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await fetchDestinationsForAdmin();
            setDestinations(response.data);
        } catch (error) {
            console.error("Errore nel caricare le destinazioni:", error);
            alert("Impossibile caricare i dati.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (editing) {
            Object.keys(editing).forEach(key => setValue(key, editing[key]));
            setCurrentImages(editing.images || []);
        } else {
            reset();
            setCurrentImages([]);
        }
    }, [editing, setValue, reset]);

    const onSubmit = async (data) => {
        const formData = new FormData();
        // Aggiunge tutti i dati (testo e file) al FormData
        Object.keys(data).forEach(key => {
            if (key === 'newImages') {
                if (data.newImages.length > 0) {
                    for (let i = 0; i < data.newImages.length; i++) {
                        formData.append('newImages', data.newImages[i]);
                    }
                }
            } else {
                formData.append(key, data[key]);
            }
        });

        try {
            if (editing) {
                await updateDestination(editing.id, formData);
            } else {
                // La creazione richiede il campo 'images' e non 'newImages'
                // Per semplicità, la lasciamo così com'è per ora, funzionerà
                await createDestination(formData);
            }
            reset();
            setEditing(null);
            loadData();
        } catch (error) {
            console.error("Errore durante il salvataggio:", error);
            alert("Errore durante il salvataggio.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Sei sicuro di voler eliminare questa destinazione?")) {
            try {
                await deleteDestination(id);
                loadData();
            } catch (e) {
                console.error("Errore nell'eliminazione:", e);
                alert("Errore durante l'eliminazione.");
            }
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (window.confirm("Sei sicuro di voler eliminare questa immagine?")) {
            try {
                await deleteDestinationImage(imageId);
                setCurrentImages(prev => prev.filter(img => img.id !== imageId));
            } catch (error) {
                console.error("Errore eliminazione immagine:", error);
                alert("Impossibile eliminare l'immagine.");
            }
        }
    };

    return (
        <>
            <Helmet><title>Gestione Destinazioni - Admin</title></Helmet>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Colonna Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold mb-4">{editing ? 'Modifica Destinazione' : 'Aggiungi Destinazione'}</h2>
                            {editing && <button onClick={() => setEditing(null)} className="text-sm flex items-center gap-1 text-gray-600 hover:text-black"><X size={14}/> Annulla</button>}
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                            <div><label className="text-sm font-medium">Nome *</label><input {...register('name', { required: true })} className="w-full border p-2 rounded mt-1"/></div>
                            <div><label className="text-sm font-medium">Regione *</label><input {...register('region', { required: true })} className="w-full border p-2 rounded mt-1"/></div>
                            <div><label className="text-sm font-medium">Stagione *</label><select {...register('season', { required: true })} className="w-full border p-2 rounded mt-1"><option value="">Seleziona...</option>{seasons.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                            <div><label className="text-sm font-medium">Rating (da 0.0 a 5.0) *</label><input type="number" step="0.1" min="0" max="5" {...register('rating', { required: true })} className="w-full border p-2 rounded mt-1"/></div>
                            <div><label className="text-sm font-medium">Tags (separati da virgola)</label><input {...register('tags')} className="w-full border p-2 rounded mt-1"/></div>
                            <div>
                                <label className="font-semibold block mb-2">Descrizione</label>
                                <Controller
                                    name="description"
                                    control={control}
                                    defaultValue=""
                                    render={({field}) => <RichTextEditor value={field.value}
                                                                         onChange={field.onChange}/>}
                                />
                            </div>
                            <hr/>
                            <h3 className="font-semibold text-gray-800 pt-2">Immagini</h3>
                            {editing && currentImages.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                    {currentImages.map(img => (
                                        <div key={img.id} className="relative group">
                                            <img src={img.url} alt="Anteprima" className="w-full h-16 object-cover rounded"/>
                                            <button type="button" onClick={() => handleDeleteImage(img.id)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium">{editing ? 'Aggiungi Nuove Immagini' : 'Carica Immagini'}</label>
                                <input
                                    type="file"
                                    {...register(editing ? 'newImages' : 'images')}
                                    multiple
                                    className="w-full text-sm mt-1"
                                /></div>
                            {!editing && (
                                <div>
                                    <label className="text-sm font-medium">Oppure inserisci URL (uno per riga)</label>
                                    <textarea {...register('imageUrls')} rows="2" placeholder="https://esempio.com/immagine1.jpg
https://esempio.com/immagine2.png" className="w-full border p-2 rounded mt-1 text-sm"></textarea>
                                </div>
                            )}

                            <button type="submit" disabled={isSubmitting} className={`w-full text-white py-2.5 rounded-lg font-semibold transition-colors disabled:bg-gray-400 ${editing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-500 hover:bg-green-600'}`}>
                                {isSubmitting ? 'Salvataggio...' : (editing ? 'Salva Modifiche' : 'Aggiungi Destinazione')}
                            </button>
                        </form>
                    </div>
                </div>
                {/* Colonna Lista */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4">Destinazioni Esistenti ({destinations.length})</h2>
                        <div className="space-y-4">
                            {loading ? <p>Caricamento...</p> : destinations.map(dest => (
                                <div key={dest.id} className="border p-4 rounded-lg flex justify-between items-center hover:bg-gray-50">
                                    <div className="flex items-center gap-4">
                                        <img src={dest.images && dest.images[0] ? dest.images[0].url : 'https://via.placeholder.com/80x64/e2e8f0/94a3b8?text=N/A'} alt={dest.name} className="w-20 h-16 object-cover rounded flex-shrink-0"/>
                                        <div>
                                            <p className="font-bold">{dest.name} <span className="font-normal text-gray-500">- {dest.region}</span></p>
                                            <p className="text-sm text-yellow-500 font-semibold flex items-center gap-1"><Star size={14} className="fill-current"/> {dest.rating}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <button onClick={() => setEditing(dest)} className="text-blue-500 hover:text-blue-700"><Edit/></button>
                                        <button onClick={() => handleDelete(dest.id)} className="text-red-500 hover:text-red-700"><Trash2/></button>
                                    </div>
                                </div>
                            ))}
                            {!loading && destinations.length === 0 && <p className="text-center text-gray-500 py-8">Nessuna destinazione presente.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminDestinationsPage;