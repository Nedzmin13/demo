import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { fetchTrafficAlertsForAdmin, createTrafficAlert, updateTrafficAlert, deleteTrafficAlert } from '../../api';
import { Edit, Trash2, X } from 'lucide-react';

function AdminTrafficPage() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm();

    const loadData = async () => {
        setLoading(true);
        try { const res = await fetchTrafficAlertsForAdmin(); setAlerts(res.data); }
        catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, []);

    useEffect(() => {
        if (editing) { Object.keys(editing).forEach(key => setValue(key, editing[key])); }
        else { reset(); }
    }, [editing, setValue, reset]);

    const onSubmit = async (data) => {
        try {
            if (editing) { await updateTrafficAlert(editing.id, data); }
            else { await createTrafficAlert(data); }
            reset(); setEditing(null); loadData();
        } catch (e) { alert("Errore"); }
    };

    const handleDelete = async (id) => {
        if(window.confirm("Sei sicuro?")) { try { await deleteTrafficAlert(id); loadData(); } catch (e) { alert("Errore"); } }
    };

    return (
        <>
            <Helmet><title>Gestione Traffico - Admin</title></Helmet>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md sticky top-8">
                    <h2 className="text-2xl font-bold mb-4">{editing ? 'Modifica' : 'Aggiungi'} Allerta Traffico</h2>
                    {editing && <button onClick={() => setEditing(null)} className="text-sm flex items-center gap-1 text-gray-600"><X size={14}/> Annulla</button>}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <div><label>Autostrada (es. A1) *</label><input {...register('highway', { required: true })} className="w-full border p-2 rounded mt-1"/></div>
                        <div><label>Tratto (es. km 45-52) *</label><input {...register('stretch', { required: true })} className="w-full border p-2 rounded mt-1"/></div>
                        <div><label>Problema (es. Lavori in corso) *</label><input {...register('problem', { required: true })} className="w-full border p-2 rounded mt-1"/></div>
                        <div><label>Percorso Alternativo *</label><input {...register('alternative', { required: true })} className="w-full border p-2 rounded mt-1"/></div>
                        <div><label>Ritardo Stimato (es. +30 min) *</label><input {...register('delay', { required: true })} className="w-full border p-2 rounded mt-1"/></div>
                        <button type="submit" disabled={isSubmitting} className={`w-full text-white py-2 rounded-lg font-semibold ${editing ? 'bg-blue-600' : 'bg-green-500'}`}>
                            {isSubmitting ? 'Salvataggio...' : (editing ? 'Salva Modifiche' : 'Aggiungi Allerta')}
                        </button>
                    </form>
                </div>
                {/* Lista */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Allerte Attive</h2>
                    <div className="space-y-4">
                        {loading ? <p>...</p> : alerts.map(alert => (
                            <div key={alert.id} className="border p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{alert.highway} - {alert.stretch}</p>
                                    <p className="text-sm text-red-600 font-semibold">{alert.problem} ({alert.delay})</p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setEditing(alert)} className="text-blue-500"><Edit/></button>
                                    <button onClick={() => handleDelete(alert.id)} className="text-red-500"><Trash2/></button>
                                </div>
                            </div>
                        ))}
                        {!loading && alerts.length === 0 && <p className="text-center py-8 text-gray-500">Nessuna allerta traffico attiva.</p>}
                    </div>
                </div>
            </div>
        </>
    );
}
export default AdminTrafficPage;