import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Trash2 } from 'lucide-react';
import { updatePoi, fetchPoiDetails, addImagesToPoi, deleteImage as apiDeleteImage } from '../../api';

// Componente per i campi specifici, per mantenere il codice pulito
const SpecificFields = ({ category, register, watch }) => {
    const hasLeafletChecked = watch('hasLeaflet'); // Controlla lo stato della checkbox

    switch (category) {
        case 'Restaurant':
            return (
                <>
                    <div><label className="text-sm font-medium text-gray-700">Tipo Cucina</label><input {...register('cuisineType')} className="mt-1 w-full border rounded p-2" /></div>
                    <div><label className="text-sm font-medium text-gray-700">Fascia di Prezzo</label><input {...register('priceRange')} className="mt-1 w-full border rounded p-2" /></div>
                    <div><label className="text-sm font-medium text-gray-700">Orari di Apertura</label><input {...register('openingHours')} className="mt-1 w-full border rounded p-2" /></div>
                </>
            );
        case 'FuelStation':
            return (
                <>
                    <div><label className="text-sm font-medium text-gray-700">Prezzo Diesel</label><input type="number" step="0.001" {...register('dieselPrice', { valueAsNumber: true })} className="mt-1 w-full border rounded p-2" /></div>
                    <div><label className="text-sm font-medium text-gray-700">Prezzo Benzina</label><input type="number" step="0.001" {...register('petrolPrice', { valueAsNumber: true })} className="mt-1 w-full border rounded p-2" /></div>
                    <div><label className="text-sm font-medium text-gray-700">Orari di Apertura</label><input {...register('openingHours')} className="mt-1 w-full border rounded p-2" /></div>
                </>
            );
        case 'Supermarket':
            return (
                <>
                    <div><label className="text-sm font-medium text-gray-700">Orari di Apertura</label><input {...register('openingHours')} className="mt-1 w-full border rounded p-2" /></div>
                    <label className="flex items-center gap-2 mt-2"><input type="checkbox" {...register('hasLeaflet')} /> Volantino attivo</label>
                    {hasLeafletChecked && (
                        <>
                            <div className="mt-2"><label className="text-sm font-medium text-gray-700">Titolo Volantino</label><input {...register('leafletTitle')} placeholder="Es. Offerte Settimanali" className="w-full border rounded p-2 mt-1"/></div>
                            <div><label className="text-sm font-medium text-gray-700">URL Volantino</label><input {...register('pdfUrl')} className="w-full border rounded p-2 mt-1"/></div>
                        </>
                    )}
                </>
            );
        case 'Parking':
            return (
                <>
                    <div><label className="text-sm font-medium text-gray-700">Tipo Parcheggio</label><input {...register('parkingType')} className="mt-1 w-full border rounded p-2" /></div>
                    <div><label className="text-sm font-medium text-gray-700">Orari di Apertura</label><input {...register('openingHours')} className="mt-1 w-full border rounded p-2" /></div>
                </>
            );
        case 'Bar':
            return (
                <>
                    <div><label className="text-sm font-medium text-gray-700">Specialità</label><input {...register('specialty')} className="mt-1 w-full border rounded p-2" /></div>
                    <div><label className="text-sm font-medium text-gray-700">Orari di Apertura</label><input {...register('openingHours')} className="mt-1 w-full border rounded p-2" /></div>
                    <label className="flex items-center gap-2 mt-2"><input type="checkbox" {...register('hasOutdoorSpace')} /> Spazio all'aperto</label>
                </>
            );
        default:
            return null;
    }
};

function EditPoiModal({ poiToEdit, onClose, onPoiUpdated }) {
    const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm();
    const [currentImages, setCurrentImages] = useState([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);

    useEffect(() => {
        const loadPoiData = async () => {
            if (poiToEdit) {
                setIsLoadingDetails(true);
                try {
                    const response = await fetchPoiDetails(poiToEdit.id);
                    const fullPoiData = response.data;
                    setCurrentImages(fullPoiData.image || []);

                    const defaultValues = {
                        ...fullPoiData,
                        ...(fullPoiData.restaurant || {})[0],
                        ...(fullPoiData.fuelstation || {})[0],
                        ...(fullPoiData.supermarket || {})[0],
                        ...(fullPoiData.bar || {})[0],
                        ...(fullPoiData.parking || {})[0],
                        ...(fullPoiData.touristattraction || {})[0],
                        ...(fullPoiData.emergencyservice || {})[0],
                        ...(fullPoiData.leaflet && fullPoiData.leaflet[0] ? {
                            leafletTitle: fullPoiData.leaflet[0].title,
                            pdfUrl: fullPoiData.leaflet[0].pdfUrl
                        } : {}),
                    };
                    reset(defaultValues);
                } catch (error) {
                    console.error("Errore nel caricare i dettagli del POI", error);
                    onClose(); // Chiudi il modale se c'è un errore
                } finally {
                    setIsLoadingDetails(false);
                }
            }
        };
        loadPoiData();
    }, [poiToEdit, reset, onClose]);

    const onSubmit = async (data) => {
        const { newImages, ...textData } = data;
        try {
            // 1. Prima chiamata: aggiorna i dati testuali
            await updatePoi(poiToEdit.id, textData);

            // 2. Seconda chiamata (opzionale): se ci sono nuove immagini, caricale
            if (newImages && newImages.length > 0) {
                const imageFormData = new FormData();
                for (let i = 0; i < newImages.length; i++) {
                    imageFormData.append('newImages', newImages[i]);
                }
                await addImagesToPoi(poiToEdit.id, imageFormData);
            }

            onPoiUpdated();
            onClose();
        } catch (error) {
            console.error("Errore aggiornamento POI:", error.response?.data || error);
            alert("Errore durante l'aggiornamento del POI.");
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (window.confirm("Sei sicuro di voler eliminare questa immagine?")) {
            try {
                await apiDeleteImage(imageId);
                setCurrentImages(prev => prev.filter(img => img.id !== imageId));
            } catch (error) {
                alert("Impossibile eliminare l'immagine.");
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold">Modifica: {poiToEdit.name}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X /></button>
                </div>
                {isLoadingDetails ? (
                    <div className="p-6 text-center">Caricamento dettagli...</div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto">
                        <input type="hidden" {...register('category')} defaultValue={poiToEdit.category} />

                        <div><label>Nome *</label><input {...register('name', { required: true })} className="mt-1 w-full border rounded p-2" /></div>
                        <div><label>Indirizzo *</label><input {...register('address', { required: true })} className="mt-1 w-full border rounded p-2" /></div>
                        <div><label>Categoria</label><input defaultValue={poiToEdit.category} disabled className="mt-1 w-full border rounded p-2 bg-gray-100" /></div>
                        <div><label>Descrizione</label><textarea {...register('description')} className="mt-1 w-full border rounded p-2"></textarea></div>
                        <div><label>Sito Web</label><input {...register('website')} className="mt-1 w-full border rounded p-2" /></div>
                        <div><label>Telefono</label><input {...register('phoneNumber')} className="mt-1 w-full border rounded p-2" /></div>

                        <hr />
                        <h3 className="font-bold text-lg">Dettagli per: {poiToEdit.category}</h3>
                        <div className="space-y-4">
                            <SpecificFields category={poiToEdit.category} register={register} watch={watch} />
                        </div>

                        <hr />
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-bold mb-2">Immagini Caricate</h3>
                                {currentImages.length > 0 ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                                        {currentImages.map(img => (
                                            <div key={img.id} className="relative group">
                                                <img src={img.url} alt="POI" className="w-full h-24 object-cover rounded-md border"/>
                                                <button type="button" onClick={() => handleDeleteImage(img.id)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"><X size={12}/></button>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-sm text-gray-500">Nessuna immagine.</p>}
                            </div>
                            <div>
                                <label>Aggiungi Nuove Immagini</label>
                                <input type="file" {...register('newImages')} className="mt-1 w-full text-sm" multiple />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <label><input type="checkbox" {...register('isEssentialService')} /> Servizio Essenziale</label>
                            <label><input type="checkbox" {...register('isFeaturedAttraction')} /> Attrazione in Vetrina</label>
                        </div>

                        <div className="pt-4 border-t flex justify-end gap-4">
                            <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-lg">Annulla</button>
                            <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                                {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default EditPoiModal;