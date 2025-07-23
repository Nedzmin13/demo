import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import {
    fetchOffersForAdmin, createOffer, updateOffer, deleteOffer, deleteOfferImage
} from '../../api';
import { Edit, Trash2, X } from 'lucide-react';

const categories = [
    "Elettronica",
    "Casa",
    "Abbigliamento",
    "Alimentari",
    "Bambini",
    "Cosmetici",
    "Auto & Moto",
    "Sport e Tempo Libero",
    "Altro"
];

function AdminOffersPage() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingOffer, setEditingOffer] = useState(null);

    // Unico useForm per gestire sia creazione che modifica
    const { register, handleSubmit, reset, setValue, formState: { isSubmitting, errors } } = useForm();

    const loadOffers = async () => {
        setLoading(true);
        try {
            const response = await fetchOffersForAdmin();
            setOffers(response.data);
        } catch (error) {
            console.error("Errore caricamento offerte:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadOffers(); }, []);

    // Popola il form quando si clicca su "Modifica"
    useEffect(() => {
        if (editingOffer) {
            // Popola tutti i campi del form con i dati dell'offerta da modificare
            Object.keys(editingOffer).forEach(key => {
                if (key !== 'images') { // Escludiamo le immagini che non sono un campo del form
                    setValue(key, editingOffer[key]);
                }
            });
        } else {
            // Resetta il form a valori vuoti quando si annulla la modifica
            reset({ title: '', store: '', discount: '', link: '', category: '', description: '', images: null });
        }
    }, [editingOffer, setValue, reset]);

    // --- NUOVA LOGICA DI SUBMIT UNIFICATA ---
    const onSubmit = async (data) => {
        const formData = new FormData();

        // 1. Aggiungi tutti i campi di testo al FormData
        Object.keys(data).forEach(key => {
            if (key !== 'images') { // Escludiamo i file per ora
                formData.append(key, data[key]);
            }
        });

        // 2. Aggiungi i file di immagine al FormData
        if (data.images && data.images.length > 0) {
            for (let i = 0; i < data.images.length; i++) {
                formData.append('images', data.images[i]);
            }
        }

        try {
            if (editingOffer) {
                // Se stiamo modificando, usiamo l'API di update
                await updateOffer(editingOffer.id, formData);
            } else {
                // Altrimenti, usiamo l'API di creazione
                await createOffer(formData);
            }

            // 3. Reset finale e ricaricamento della lista
            setEditingOffer(null); // Esci dalla modalità di modifica
            loadOffers(); // Ricarica la lista per mostrare le modifiche

        } catch (error) {
            console.error("Errore durante il salvataggio:", error);
            alert("Errore durante il salvataggio. Controlla la console.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Sei sicuro di voler eliminare questa offerta?")) {
            try {
                await deleteOffer(id);
                loadOffers();
            } catch (error) { alert("Errore durante l'eliminazione."); }
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (window.confirm("Sei sicuro di voler eliminare questa immagine?")) {
            try {
                await deleteOfferImage(imageId);
                // Aggiorniamo l'offerta in modifica per riflettere l'immagine rimossa
                setEditingOffer(prev => ({
                    ...prev,
                    images: prev.images.filter(img => img.id !== imageId)
                }));
            } catch (error) { alert("Errore eliminazione immagine."); }
        }
    };

    // Funzione per mostrare un'immagine di fallback
    const getImageUrl = (offer) => {
        if (offer.images && offer.images.length > 0 && offer.images[0].url) {
            return offer.images[0].url;
        }
        // Fallback robusto se placeholder.com non funziona
        return `https://ui-avatars.com/api/?name=${offer.title.charAt(0)}&background=e0e7ff&color=4f46e5&size=128`;
    };

    return (
        <>
            <Helmet><title>Gestione Offerte - Admin</title></Helmet>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Colonna del Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">{editingOffer ? 'Modifica Offerta' : 'Aggiungi Nuova Offerta'}</h2>
                            {editingOffer && <button onClick={() => setEditingOffer(null)} className="text-sm flex items-center gap-1 text-gray-600 hover:text-gray-900"><X size={14}/> Annulla</button>}
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div><label>Titolo *</label><input {...register('title', { required: true })} className="w-full border p-2 rounded mt-1"/></div>
                            <div><label>Store *</label><input {...register('store', { required: true })} className="w-full border p-2 rounded mt-1"/></div>
                            <div><label>Sconto (es. 50% o -20€) *</label><input {...register('discount', { required: true })} className="w-full border p-2 rounded mt-1"/></div>
                            <div><label>Link all'offerta *</label><input type="url" {...register('link', { required: true })} className="w-full border p-2 rounded mt-1"/></div>
                            <div><label>Categoria *</label>
                                <select {...register('category', { required: true })} className="w-full border p-2 rounded mt-1">
                                    <option value="">Seleziona...</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div><label>Descrizione</label><textarea {...register('description')} className="w-full border p-2 rounded mt-1" rows="3"></textarea></div>
                            <hr />
                            <h3 className="font-semibold">Immagini</h3>
                            {editingOffer && editingOffer.images && editingOffer.images.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                    {editingOffer.images.map(img => (
                                        <div key={img.id} className="relative group">
                                            <img src={img.url} className="w-full h-16 object-cover rounded"/>
                                            <button type="button" onClick={() => handleDeleteImage(img.id)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div>
                                <label className="text-sm">{editingOffer ? 'Aggiungi Nuove Immagini' : 'Carica Immagini'}</label>
                                <input type="file" {...register('images')} multiple className="w-full text-sm mt-1 p-2 border rounded"/>
                            </div>
                            <button type="submit" disabled={isSubmitting} className={`w-full text-white py-2.5 rounded-lg font-semibold transition-colors ${editingOffer ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-500 hover:bg-green-600'} disabled:bg-gray-400`}>
                                {isSubmitting ? 'Salvataggio...' : (editingOffer ? 'Salva Modifiche' : 'Aggiungi Offerta')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Colonna della Lista */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4">Offerte Esistenti ({offers.length})</h2>
                        <div className="space-y-4">
                            {loading ? <p>Caricamento...</p> : offers.map(offer => (
                                <div key={offer.id} className="border p-4 rounded-lg flex justify-between items-center">
                                    <div className="flex items-center gap-4 flex-grow">
                                        <img src={getImageUrl(offer)} alt={offer.title} className="w-16 h-16 object-cover rounded-md bg-indigo-100"/>
                                        <div>
                                            <p className="font-bold">{offer.title}</p>
                                            <p className="text-sm text-gray-500">{offer.store}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                                        <button onClick={() => setEditingOffer(offer)} className="text-blue-500 hover:text-blue-700"><Edit size={18}/></button>
                                        <button onClick={() => handleDelete(offer.id)} className="text-red-500 hover:red-700"><Trash2 size={18}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminOffersPage;