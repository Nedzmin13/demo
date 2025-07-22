import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Trash2 } from 'lucide-react';
import { updatePoi, fetchPoiDetails, addImagesToPoi, deleteImage as apiDeleteImage } from '../../api';

// Componente per i campi specifici, per mantenere il codice pulito
const SpecificFields = ({ category, register }) => {
    switch (category) {
        case 'Restaurant':
            return (
                <>
                    <div><label className="text-sm font-medium text-gray-700">Tipo Cucina (es. Italiana, Pesce)</label><input {...register('cuisineType')} className="mt-1 w-full border rounded p-2" /></div>
                    <div><label className="text-sm font-medium text-gray-700">Fascia di Prezzo (€, €€, €€€)</label><input {...register('priceRange')} className="mt-1 w-full border rounded p-2" /></div>
                    <div><label className="text-sm font-medium text-gray-700">Orari di Apertura</label><input {...register('openingHours')} className="mt-1 w-full border rounded p-2" /></div>
                    <div><label className="text-sm font-medium text-gray-700">URL del Menu (opzionale)</label><input {...register('menuUrl')} className="mt-1 w-full border rounded p-2" /></div>
                </>
            );
        case 'FuelStation':
            return (
                <>
                    <div><label className="text-sm font-medium text-gray-700">Prezzo Diesel</label><input type="number" step="0.001" {...register('dieselPrice')} className="mt-1 w-full border rounded p-2" /></div>
                    <div><label className="text-sm font-medium text-gray-700">Prezzo Benzina</label><input type="number" step="0.001" {...register('petrolPrice')} className="mt-1 w-full border rounded p-2" /></div>
                    <div><label className="text-sm font-medium text-gray-700">Orari di Apertura</label><input {...register('openingHours')} className="mt-1 w-full border rounded p-2" /></div>
                </>
            );
        case 'Supermarket':
            return (
                <>
                    <div><label className="text-sm font-medium text-gray-700">Orari di Apertura</label><input {...register('openingHours')} className="mt-1 w-full border rounded p-2" /></div>
                    <div><label className="text-sm font-medium text-gray-700">URL Volantino (PDF o link)</label><input {...register('leafletUrl')} className="mt-1 w-full border rounded p-2" /></div>
                    <label className="flex items-center gap-2"><input type="checkbox" {...register('hasLeaflet')} /> Ha un volantino attivo</label>
                </>
            );
        case 'Parking':
            return (
                <>
                    <div><label className="text-sm font-medium text-gray-700">Tipo Parcheggio (es. A pagamento, Gratuito, Coperto)</label><input {...register('parkingType')} className="mt-1 w-full border rounded p-2" /></div>
                    <div><label className="text-sm font-medium text-gray-700">Orari di Apertura</label><input {...register('openingHours')} className="mt-1 w-full border rounded p-2" /></div>
                </>
            );
        case 'Bar':
            return (
                <>
                    <div><label className="text-sm font-medium text-gray-700">Specialità (es. Aperitivi, Colazioni)</label><input {...register('specialty')} className="mt-1 w-full border rounded p-2" /></div>
                    <div><label className="text-sm font-medium text-gray-700">Orari di Apertura</label><input {...register('openingHours')} className="mt-1 w-full border rounded p-2" /></div>
                    <div><label className="text-sm font-medium text-gray-700">URL del Menu (opzionale)</label><input {...register('menuUrl')} className="mt-1 w-full border rounded p-2" /></div>
                    <label className="flex items-center gap-2"><input type="checkbox" {...register('hasOutdoorSpace')} /> Ha spazio all'aperto</label>
                </>
            );
        default:
            return null;
    }
};

function EditPoiModal({ poiToEdit, onClose, onPoiUpdated }) {
    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
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
                        ...(fullPoiData.restaurant && { ...fullPoiData.restaurant[0] }),
                        ...(fullPoiData.fuelstation && { ...fullPoiData.fuelstation[0] }),
                        ...(fullPoiData.supermarket && { ...fullPoiData.supermarket[0] }),
                        ...(fullPoiData.bar && { ...fullPoiData.bar[0] }),
                        ...(fullPoiData.parking && { ...fullPoiData.parking[0] }),
                    };

                    reset(defaultValues);
                } catch (error) {
                    console.error("Errore nel caricare i dettagli del POI", error);
                } finally {
                    setIsLoadingDetails(false);
                }
            }
        };
        loadPoiData();
    }, [poiToEdit, reset]);

    const onSubmit = async (data) => {
        const formData = new FormData();
        formData.append('category', poiToEdit.category);
        const { newImages, ...textData } = data;
        Object.keys(textData).forEach(key => formData.append(key, data[key]));

        try {
            const updatedPoiData = await updatePoi(poiToEdit.id, formData);

            if (data.newImages && data.newImages.length > 0) {
                const imageFormData = new FormData();
                for(let i = 0; i < data.newImages.length; i++) {
                    imageFormData.append('newImages', data.newImages[i]);
                }
                await addImagesToPoi(poiToEdit.id, imageFormData);
            }

            // Dopo l'aggiornamento, ricarichiamo i dati per avere la lista immagini aggiornata
            const finalDataResponse = await fetchPoiDetails(poiToEdit.id);
            onPoiUpdated(finalDataResponse.data);
            onClose();

        } catch (error) {
            console.error("Errore aggiornamento POI:", error);
            alert("Errore durante l'aggiornamento del POI.");
        }
    };

    const handleDeleteImage = async (imageId) => {
        if(window.confirm("Sei sicuro di voler eliminare questa immagine?")) {
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
                        {/* Campi Comuni */}
                        <div><label className="text-sm font-medium text-gray-700">Nome *</label><input {...register('name', { required: true })} className="mt-1 w-full border rounded p-2" /></div>
                        <div><label className="text-sm font-medium text-gray-700">Indirizzo *</label><input {...register('address', { required: true })} className="mt-1 w-full border rounded p-2" /></div>
                        <div><label className="text-sm font-medium text-gray-700">Categoria</label><input value={poiToEdit.category} disabled className="mt-1 w-full border rounded p-2 bg-gray-100 cursor-not-allowed" /></div>
                        <div><label className="text-sm font-medium text-gray-700">Descrizione</label><textarea {...register('description')} className="mt-1 w-full border rounded p-2"></textarea></div>
                        <div><label className="text-sm font-medium text-gray-700">Sito Web</label><input {...register('website')} className="mt-1 w-full border rounded p-2" /></div>
                        <div><label className="text-sm font-medium text-gray-700">Telefono</label><input {...register('phoneNumber')} className="mt-1 w-full border rounded p-2" /></div>

                        <hr />
                        <h3 className="font-bold text-lg">Dettagli per: {poiToEdit.category}</h3>
                        <div className="space-y-4">
                            <SpecificFields category={poiToEdit.category} register={register} />
                        </div>

                        <hr />
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-bold mb-2">Immagini Caricate</h3>
                                {currentImages.length > 0 ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                        {currentImages.map(img => (
                                            <div key={img.id} className="relative group">
                                                <img src={img.url} alt="Punto di Interesse" className="w-full h-24 object-cover rounded-md border"/>
                                                <button type="button" onClick={() => handleDeleteImage(img.id)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100">
                                                    <Trash2 size={14}/>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-sm text-gray-500">Nessuna immagine caricata.</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Aggiungi Nuove Immagini</label>
                                <input type="file" {...register('newImages')} className="mt-1 w-full text-sm" multiple />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <label className="flex items-center gap-2"><input type="checkbox" {...register('isEssentialService')} /> Servizio Essenziale</label>
                            <label className="flex items-center gap-2"><input type="checkbox" {...register('isFeaturedAttraction')} /> Attrazione in Vetrina</label>
                        </div>

                        <div className="pt-4 border-t flex justify-end gap-4 flex-shrink-0">
                            <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300">Annulla</button>
                            <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400">
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