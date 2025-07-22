import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { fetchStrikesForAdmin, createStrike, updateStrike, deleteStrike } from '../../api';
import { Edit, Trash2, X } from 'lucide-react';

function AdminStrikesPage() {
    const [strikes, setStrikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm();

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetchStrikesForAdmin();
            setStrikes(res.data);
        } catch (e) {
            console.error("Errore nel caricare gli scioperi:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (editing) {
            const formattedDate = new Date(editing.date).toISOString().split('T')[0];
            setValue('type', editing.type);
            setValue('zone', editing.zone);
            setValue('duration', editing.duration);
            setValue('services', editing.services);
            setValue('date', formattedDate);
        } else {
            reset();
        }
    }, [editing, setValue, reset]);

    const onSubmit = async (data) => {
        try {
            if (editing) {
                await updateStrike(editing.id, data);
            } else {
                await createStrike(data);
            }
            reset();
            setEditing(null);
            loadData();
        } catch (e) {
            alert("Errore durante il salvataggio.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Sei sicuro di voler eliminare questo sciopero?")) {
            try {
                await deleteStrike(id);
                loadData();
            } catch (e) {
                alert("Errore durante l'eliminazione.");
            }
        }
    };

    return (
        <>
            <Helmet><title>Gestione Scioperi - Admin</title></Helmet>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
                        <h2 className="text-2xl font-bold mb-4">{editing ? 'Modifica Sciopero' : 'Aggiungi Sciopero'}</h2>
                        {editing && <button onClick={() => setEditing(null)} className="text-sm flex items-center gap-1 text-gray-600"><X size={14}/> Annulla</button>}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                            <div><label>Tipo (es. Trasporto Pubblico) *</label><input {...register('type', { required: true })} className="w-full border p-2 rounded mt-1"/></div>
                            <div><label>Zona (es. Milano, Nazionale) *</label><input {...register('zone', { required: true })} className="w-full border p-2 rounded mt-1"/></div>
                            <div><label>Durata (es. 4 ore, 24 ore) *</label><input {...register('duration', { required: true })} className="w-full border p-2 rounded mt-1"/></div>
                            <div><label>Servizi Coinvolti *</label><input {...register('services', { required: true })} className="w-full border p-2 rounded mt-1"/></div>
                            <div><label>Data *</label><input type="date" {...register('date', { required: true })} className="w-full border p-2 rounded mt-1"/></div>
                            <button type="submit" disabled={isSubmitting} className={`w-full text-white py-2 rounded-lg font-semibold ${editing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-500 hover:bg-green-600'}`}>
                                {isSubmitting ? 'Salvataggio...' : (editing ? 'Salva Modifiche' : 'Aggiungi Sciopero')}
                            </button>
                        </form>
                    </div>
                </div>
                {/* Lista */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4">Scioperi Programmati</h2>
                        <div className="space-y-4">
                            {loading ? <p>Caricamento...</p> : strikes.map(strike => (
                                <div key={strike.id} className="border p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-bold">{strike.type} - {strike.zone}</p>
                                        <p className="text-sm text-gray-500">{new Date(strike.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => setEditing(strike)} className="text-blue-500 hover:text-blue-700"><Edit/></button>
                                        <button onClick={() => handleDelete(strike.id)} className="text-red-500 hover:text-red-700"><Trash2/></button>
                                    </div>
                                </div>
                            ))}
                            {!loading && strikes.length === 0 && <p className="text-center py-8 text-gray-500">Nessuno sciopero in programma.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default AdminStrikesPage;