import React, { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X, Trash2 } from 'lucide-react';
import { updatePoi, fetchPoiDetails, addImagesToPoi, deleteImage as apiDeleteImage } from '../../api';
import RichTextEditor from './forms/RichTextEditor';

// Componente per i campi specifici, per mantenere il codice pulito
const SpecificFields = ({ category, register, watch }) => {
    const hasLeafletChecked = watch('hasLeaflet');

    // Il tuo codice per i campi specifici è corretto. Assicurati che sia completo.
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
                    <div><label>Prezzo Diesel</label><input type="number" step="0.001" {...register('dieselPrice')} /></div>
                    <div><label>Prezzo Benzina</label><input type="number" step="0.001" {...register('petrolPrice')} /></div>
                    <div><label>Prezzo Gas (GPL/Metano)</label><input type="number" step="0.001" {...register('gasPrice')} /></div>
                </>
            );
        case 'Supermarket':
            return (
                <>
                    <label className="flex items-center gap-2"><input type="checkbox" {...register('hasLeaflet')} /> Volantino attivo</label>
                    {hasLeafletChecked && (
                        <>
                            <div><label>Titolo Volantino</label><input {...register('leafletTitle')} /></div>
                            <div><label>URL Volantino</label><input {...register('pdfUrl')} /></div>
                        </>
                    )}
                </>
            );
        case 'Parking':
            return ( <> <div><label>Tipo Parcheggio</label><input {...register('parkingType')} /></div> </> );
        case 'Bar':
            return ( <> <div><label>Specialità</label><input {...register('specialty')} /></div> <label><input type="checkbox" {...register('hasOutdoorSpace')} /> Spazio all'aperto</label> </> );
        case 'Accommodation':
            return (
                <>
                    <div><label>Tipo di Alloggio *</label><select {...register('type', { required: true })}>{/* ... */}</select></div>
                    <div><label>Stelle (1-5)</label><input type="number" {...register('stars')} /></div>
                    <div><label>Servizi</label><input {...register('services')} /></div>
                    <div><label>Link Prenotazione</label><input type="url" {...register('bookingUrl')} /></div>
                </>
            );
        default:
            return <p className="text-sm text-gray-500">Nessun dettaglio specifico per questa categoria.</p>;
    }
};

function EditPoiModal({ poiToEdit, onClose, onPoiUpdated }) {
    const { register, handleSubmit, reset, watch, control, formState: { isSubmitting } } = useForm();
    const [currentImages, setCurrentImages] = useState([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);

    const loadAndSetPoiData = useCallback(async () => {
        if (!poiToEdit) return;
        setIsLoadingDetails(true);
        try {
            const response = await fetchPoiDetails(poiToEdit.id);
            const fullPoiData = response.data;
            setCurrentImages(fullPoiData.image || []);

            const specificData =
                fullPoiData.restaurant?.[0] || fullPoiData.fuelstation?.[0] ||
                fullPoiData.supermarket?.[0] || fullPoiData.bar?.[0] ||
                fullPoiData.parking?.[0] || fullPoiData.accommodation?.[0] ||
                fullPoiData.touristattraction?.[0] || fullPoiData.emergencyservice?.[0] ||
                {};

            const leafletData = fullPoiData.leaflet?.[0] ? {
                leafletTitle: fullPoiData.leaflet[0].title,
                pdfUrl: fullPoiData.leaflet[0].pdfUrl
            } : {};

            // Crea un oggetto pulito, escludendo chiavi non necessarie come 'id' dai sottomodelli
            delete specificData.id;
            delete specificData.poiId;

            const defaultValues = { ...fullPoiData, ...specificData, ...leafletData };
            reset(defaultValues);
        } catch (error) {
            console.error("Errore caricamento dettagli POI:", error);
            alert("Impossibile caricare i dettagli del POI.");
            onClose();
        } finally {
            setIsLoadingDetails(false);
        }
    }, [poiToEdit, reset]);

    useEffect(() => {
        loadAndSetPoiData();
    }, [loadAndSetPoiData]);

    const onSubmit = async (data) => {
        const { newImages, ...textData } = data;
        try {
            await updatePoi(poiToEdit.id, textData);
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
            console.error("Errore aggiornamento POI:", error);
            alert("Errore durante l'aggiornamento.");
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
                    <div className="p-8 text-center">Caricamento dettagli...</div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto">
                        <input type="hidden" {...register('category')} />
                        <div><label>Nome *</label><input {...register('name', { required: true })} className="mt-1 w-full border rounded p-2" /></div>
                        <div><label>Indirizzo *</label><input {...register('address', { required: true })} className="mt-1 w-full border rounded p-2" /></div>
                        <div><label>Categoria</label><input defaultValue={poiToEdit.category} disabled className="mt-1 w-full border rounded p-2 bg-gray-100" /></div>

                        <div>
                            <label className="font-semibold block mb-2">Descrizione</label>
                            <Controller name="description" control={control} render={({ field }) => <RichTextEditor value={field.value || ''} onChange={field.onChange} />} />
                        </div>

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
                            <label className="flex items-center gap-2"><input type="checkbox" {...register('isEssentialService')} /> Servizio Essenziale</label>
                            <label className="flex items-center gap-2"><input type="checkbox" {...register('isFeaturedAttraction')} /> Attrazione in Vetrina</label>
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