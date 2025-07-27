// client/src/pages/admin/AdminBonusPage.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm, Controller } from 'react-hook-form';
import { fetchBonusesForAdmin, createBonus, updateBonus, deleteBonus } from '../../api/index.js';
import { Edit, Trash2, X, Gift } from 'lucide-react';
import RichTextEditor from '../../components/admin/forms/RichTextEditor';

const categories = ["Famiglia", "Lavoro", "Casa", "Mobilità", "Fiscale"];

function AdminBonusPage() {
    const [bonuses, setBonuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingBonus, setEditingBonus] = useState(null);
    const { register, handleSubmit, reset, setValue, control, formState: { isSubmitting } } = useForm();

    const loadBonuses = async () => {
        setLoading(true);
        try {
            const response = await fetchBonusesForAdmin();
            setBonuses(response.data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadBonuses(); }, []);

    useEffect(() => {
        if (editingBonus) {
            // Formatta la data per l'input type="date"
            const formattedDate = new Date(editingBonus.expiresAt).toISOString().split('T')[0];
            setValue('title', editingBonus.title);
            setValue('description', editingBonus.description);
            setValue('amount', editingBonus.amount);
            setValue('category', editingBonus.category);
            setValue('target', editingBonus.target);
            setValue('expiresAt', formattedDate);
            setValue('howToApply', editingBonus.howToApply);
        } else {
            reset();
        }
    }, [editingBonus, setValue, reset]);

    const onSubmit = async (data) => {
        try {
            if (editingBonus) {
                await updateBonus(editingBonus.id, data);
            } else {
                await createBonus(data);
            }
            reset();
            setEditingBonus(null);
            loadBonuses();
        } catch (error) { alert("Errore durante il salvataggio."); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Sei sicuro di voler eliminare questo bonus?")) {
            try {
                await deleteBonus(id);
                loadBonuses();
            } catch (error) { alert("Errore durante l'eliminazione."); }
        }
    };

    return (
        <>
        <Helmet><title>Gestione Bonus - Admin</title></Helmet>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
                <h2 className="text-2xl font-bold mb-4">{editingBonus ? 'Modifica Bonus' : 'Aggiungi Nuovo Bonus'}</h2>
                {editingBonus && <button onClick={() => setEditingBonus(null)} className="text-sm ..."><X size={14}/> Annulla Modifica</button>}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                    <div><label>Titolo *</label><input {...register('title', { required: true })} className="w-full border p-2 rounded"/></div>
                    <div><label>Importo *</label><input {...register('amount', { required: true })} className="w-full border p-2 rounded"/></div>
                    <div><label>Categoria *</label><select {...register('category', { required: true })} className="w-full border p-2 rounded">{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>

                    {/* --- SOSTITUZIONE TEXTAREA CON EDITOR --- */}
                    <div>
                        <label className="font-semibold block mb-2">Descrizione</label>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} />}
                        />
                    </div>

                    <div><label>Target</label><textarea {...register('target')} rows="2" className="w-full border p-2 rounded"></textarea></div>
                    <div><label>Come richiederlo</label><textarea {...register('howToApply')} rows="2" className="w-full border p-2 rounded"></textarea></div>
                    <div><label>Scadenza *</label><input type="date" {...register('expiresAt', { required: true })} className="w-full border p-2 rounded"/></div>

                    <button type="submit" disabled={isSubmitting} className={`w-full ...`}>{isSubmitting ? 'Salvataggio...' : (editingBonus ? 'Salva Modifiche' : 'Aggiungi Bonus')}</button>
                </form>
            </div>
        </div>
        <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4">Bonus Esistenti ({bonuses.length})</h2>
                        <div className="space-y-4">
                            {loading ? <p>Caricamento...</p> : bonuses.map(bonus => (
                                <div key={bonus.id} className="border p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-bold">{bonus.title} <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-full">{bonus.category}</span></p>
                                        <p className="text-sm text-green-600 font-semibold">{bonus.amount}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setEditingBonus(bonus)} className="text-blue-500"><Edit/></button>
                                        <button onClick={() => handleDelete(bonus.id)} className="text-red-500"><Trash2/></button>
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
export default AdminBonusPage;