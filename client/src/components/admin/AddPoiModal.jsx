import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { createPoi } from '../../api';

const categories = ["Restaurant", "FuelStation", "Supermarket", "Bar", "Parking", "TouristAttraction", "EmergencyService", "Accommodation"];

const SpecificFields = ({ category, register, watch }) => {
    const hasLeafletChecked = watch('hasLeaflet');
    switch (category) {
        case 'Restaurant':
            return ( <> <div><label>Tipo Cucina</label><input {...register('cuisineType')} className="w-full border p-2 rounded mt-1"/></div> <div><label>Fascia Prezzo</label><input {...register('priceRange')} className="w-full border p-2 rounded mt-1"/></div> </> );
        case 'FuelStation':
            return (<>
                <div><label>Prezzo Diesel</label><input type="number" step="0.001" {...register('dieselPrice')} /></div>
                <div><label>Prezzo Benzina</label><input type="number" step="0.001" {...register('petrolPrice')} />
                </div>
                <div><label>Prezzo Gas (GPL/Metano)</label><input type="number"
                                                                  step="0.001" {...register('gasPrice')} /></div>
                <div>
                    <label>Sito Web (opzionale)</label>
                    <input {...register('website')} className="w-full border p-2 rounded mt-1"/>
                </div>

            </>);
        case 'Supermarket':
            return (
                <>
                    <label className="flex items-center gap-2"><input
                        type="checkbox" {...register('hasLeaflet')} /> Volantino attivo</label>
                    {hasLeafletChecked && (<>
                        <div><label>Titolo Volantino</label><input {...register('leafletTitle')}
                                                                   className="w-full border p-2 rounded mt-1"/></div>
                        <div><label>URL Volantino</label><input {...register('pdfUrl')} className="w-full border p-2 rounded mt-1"/></div> </> )}
                </>
            );

        case 'Parking':
            return ( <> <div><label>Tipo Parcheggio</label><input {...register('parkingType')} className="w-full border p-2 rounded mt-1"/></div> </> );
        case 'Bar':
            return ( <> <div><label>Specialità</label><input {...register('specialty')} className="w-full border p-2 rounded mt-1"/></div> <label className="flex items-center gap-2"><input type="checkbox" {...register('hasOutdoorSpace')} /> Spazio all'aperto</label> </> );
        case 'Accommodation':
            return (
                <>
                    <div><label>Tipo di Alloggio *</label>
                        <select {...register('type', { required: true })} className="w-full ...">
                            <option value="">Seleziona...</option>
                            <option value="Hotel">Hotel</option>
                            <option value="B&B">B&B</option>
                            <option value="Appartamento">Appartamento</option>
                            <option value="Agriturismo">Agriturismo</option>
                            <option value="Altro">Altro</option>
                        </select>
                    </div>
                    <div><label>Stelle (1-5)</label><input type="number" {...register('stars')} /></div>
                    <div><label>Servizi</label><input {...register('services')} /></div>
                    <div><label>Link Prenotazione</label><input type="url" {...register('bookingUrl')} /></div>
                </>
            );
        default:
            return null;
    }
};

function AddPoiModal({ comuneId, onClose, onPoiAdded }) {
    const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm();
    const selectedCategory = watch("category");
    const onSubmit = async (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'images') {
                if (data.images.length > 0) {
                    for (let i = 0; i < data.images.length; i++) formData.append('images', data.images[i]);
                }
            } else { formData.append(key, data[key]); }
        });
        formData.append('comuneId', comuneId);
        try {
            const response = await createPoi(formData);
            onPoiAdded(response.data);
            onClose();
        } catch (error) {
            console.error("Errore creazione POI:", error);
            alert("Errore durante la creazione del POI.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-bold">Aggiungi Punto di Interesse</h2><button onClick={onClose}><X /></button></div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto">
                    <div><label>Nome *</label><input {...register('name', { required: true })} className="w-full border p-2 rounded mt-1"/></div>
                    <div><label>Indirizzo *</label><input {...register('address', { required: true })} className="w-full border p-2 rounded mt-1"/></div>
                    <div><label>Categoria *</label><select {...register('category', { required: true })} className="w-full border p-2 rounded mt-1"><option value="">Seleziona...</option>{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                    <div><label>Orari di Apertura</label><input {...register('openingHours')} className="w-full border p-2 rounded mt-1"/></div>
                    <div><label>Descrizione</label><textarea {...register('description')} className="w-full border p-2 rounded mt-1"></textarea></div>
                    <div><label>Sito Web</label><input {...register('website')} className="w-full border p-2 rounded mt-1"/></div>
                    <div><label>Telefono</label><input {...register('phoneNumber')} className="w-full border p-2 rounded mt-1"/></div>
                    <hr />
                    {selectedCategory && <h3 className="font-bold text-lg">Dettagli per: {selectedCategory}</h3>}
                    <div className="space-y-4">
                        <SpecificFields category={selectedCategory} register={register} watch={watch} />
                    </div>
                    <hr />
                    <div><label>Immagini</label><input type="file" {...register('images')} multiple className="w-full text-sm"/></div>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2"><input type="checkbox" {...register('isEssentialService')} /> Servizio Essenziale</label>
                        <label className="flex items-center gap-2"><input type="checkbox" {...register('isFeaturedAttraction')} /> Attrazione in Vetrina</label>
                    </div>
                    <div className="pt-4 border-t flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-lg font-semibold">Annulla</button>
                        <button type="submit" disabled={isSubmitting} className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">{isSubmitting ? 'Salvataggio...' : 'Salva POI'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddPoiModal;