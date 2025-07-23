// client/src/components/admin/AddPoiModal.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { createPoi } from '../../api';

const categories = ["Restaurant", "FuelStation", "Supermarket", "Bar", "TouristAttraction", "EmergencyService", "Parking"];

// Componente per i campi specifici, per mantenere il codice pulito
const SpecificFields = ({ category, register }) => {
    switch (category) {
        case 'Restaurant':
            return (
                <>
                    <div><label>Tipo Cucina (es. Italiana, Pesce)</label><input {...register('cuisineType')} className="w-full border rounded p-2" /></div>
                    <div><label>Fascia di Prezzo (€, €€, €€€)</label><input {...register('priceRange')} className="w-full border rounded p-2" /></div>
                    <div><label>Orari di Apertura</label><input {...register('openingHours')} className="w-full border rounded p-2" /></div>
                    <div><label>URL del Menu (opzionale)</label><input {...register('menuUrl')} className="w-full border rounded p-2" /></div>
                </>
            );
        case 'FuelStation':
            return (
                <>
                    <div><label>Prezzo Diesel</label><input type="number" step="0.001" {...register('dieselPrice')} className="w-full border rounded p-2" /></div>
                    <div><label>Prezzo Benzina</label><input type="number" step="0.001" {...register('petrolPrice')} className="w-full border rounded p-2" /></div>
                    <div><label>Orari di Apertura</label><input {...register('openingHours')} className="w-full border rounded p-2" /></div>
                </>
            );
        case 'Supermarket':
            return (
                <>
                    <div><label>Orari di Apertura</label><input {...register('openingHours')}
                                                                className="w-full border rounded p-2"/></div>

                    {/* --- NUOVA LOGICA PER IL VOLANTINO --- */}
                    <label className="flex items-center gap-2 mt-2">
                        <input type="checkbox" {...register('hasLeaflet')} /> Ha un volantino attivo
                    </label>
                    <div>
                        <label>Titolo Volantino</label>
                        <input {...register('leafletTitle')} placeholder="Es. Offerte di Agosto"
                               className="w-full border rounded p-2"/>
                    </div>
                    <div><label>URL Volantino (PDF o link)</label><input {...register('pdfUrl')}
                                                                         className="w-full ..."/></div>

                </>
            );
        case 'Parking':
            return (
                <>
                    <div><label>Tipo Parcheggio (es. A pagamento, Gratuito, Coperto)</label><input {...register('parkingType')} className="w-full border rounded p-2" /></div>
                    <div><label>Orari di Apertura</label><input {...register('openingHours')} className="w-full border rounded p-2" /></div>
                </>
            );
        case 'Bar':
            return (
                <>
                    <div><label>Specialità (es. Aperitivi, Colazioni)</label><input {...register('specialty')} className="w-full border rounded p-2" /></div>
                    <div><label>Orari di Apertura</label><input {...register('openingHours')} className="w-full border rounded p-2" /></div>
                    <div><label>URL del Menu (opzionale)</label><input {...register('menuUrl')} className="w-full border rounded p-2" /></div>
                    <label><input type="checkbox" {...register('hasOutdoorSpace')} /> Ha spazio all'aperto</label>
                </>
            );
        default:
            return null;
    }
};

function AddPoiModal({ comuneId, onClose, onPoiAdded }) {
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
    const selectedCategory = watch("category");

    const onSubmit = async (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'images') {
                if (data.images.length > 0) {
                    for (let i = 0; i < data.images.length; i++) {
                        formData.append('images', data.images[i]);
                    }
                }
            } else {
                formData.append(key, data[key]);
            }
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">Aggiungi Punto di Interesse</h2>
                    <button onClick={onClose}><X /></button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto">
                    {/* Campi Comuni */}
                    <div><label>Nome *</label><input {...register('name', { required: true })} className="w-full border rounded p-2" /></div>
                    <div><label>Indirizzo *</label><input {...register('address', { required: true })} className="w-full border rounded p-2" /></div>
                    <div><label>Categoria *</label>
                        <select {...register('category', { required: true })} className="w-full border rounded p-2">
                            <option value="">Seleziona...</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div><label>Descrizione</label><textarea {...register('description')} className="w-full border rounded p-2"></textarea></div>
                    <div><label>Sito Web</label><input {...register('website')} className="w-full border rounded p-2" /></div>
                    <div><label>Telefono</label><input {...register('phoneNumber')} className="w-full border rounded p-2" /></div>

                    {/* Divisore e Campi Specifici */}
                    {selectedCategory && <hr />}
                    {selectedCategory && <h3 className="font-bold text-lg">Dettagli per: {selectedCategory}</h3>}
                    <SpecificFields category={selectedCategory} register={register} />

                    <hr />
                    <div><label>Immagini</label><input type="file" {...register('images')} className="w-full" multiple /></div>
                    <div className="flex items-center gap-4">
                        <label><input type="checkbox" {...register('isEssentialService')} /> Servizio Essenziale</label>
                        <label><input type="checkbox" {...register('isFeaturedAttraction')} /> Attrazione in Vetrina</label>
                    </div>

                    <div className="pt-4 border-t flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded">Annulla</button>
                        <button type="submit" disabled={isSubmitting} className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400">
                            {isSubmitting ? 'Salvataggio...' : 'Salva POI'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default AddPoiModal;