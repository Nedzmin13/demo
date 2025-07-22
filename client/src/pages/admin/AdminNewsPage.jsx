import React, { useState, useEffect } from 'react'; // <-- LA CORREZIONE È QUI
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { fetchNewsForAdmin, createNews, updateNews, deleteNews } from '../../api';
import { Edit, Trash2, X } from 'lucide-react';

function AdminNewsPage() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm();

    const loadNews = async () => {
        setLoading(true);
        try {
            const response = await fetchNewsForAdmin();
            setNews(response.data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadNews(); }, []);

    useEffect(() => {
        if (editing) {
            Object.keys(editing).forEach(key => {
                if (key !== 'image') setValue(key, editing[key]);
            });
        } else { reset(); }
    }, [editing, setValue, reset]);

    const onSubmit = async (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'image' && data.image[0]) formData.append('image', data.image[0]);
            else if (key !== 'image') formData.append(key, data[key]);
        });

        try {
            if (editing) {
                formData.append('existingImageUrl', editing.imageUrl || '');
                await updateNews(editing.id, formData);
            } else {
                await createNews(formData);
            }
            reset();
            setEditing(null);
            loadNews();
        } catch (error) { alert("Errore durante il salvataggio."); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Sei sicuro?")) {
            try { await deleteNews(id); loadNews(); }
            catch (error) { alert("Errore eliminazione."); }
        }
    };

    return (
        <>
            <Helmet><title>Gestione Notizie - Admin</title></Helmet>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">{editing ? 'Modifica' : 'Aggiungi'} Notizia</h2>
                            {editing && <button onClick={() => setEditing(null)} className="text-sm flex items-center gap-1"><X size={14}/> Annulla</button>}
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div><label>Titolo *</label><input {...register('title', { required: true })} className="w-full border p-2 rounded mt-1"/></div>
                            <div><label>Categoria (es. Aperture, Eventi)</label><input {...register('category')} className="w-full border p-2 rounded mt-1"/></div>
                            <div><label>Luogo (es. Roma)</label><input {...register('location')} className="w-full border p-2 rounded mt-1"/></div>
                            <div><label>Estratto (breve descrizione)</label><textarea {...register('excerpt')} rows="3" className="w-full border p-2 rounded mt-1"></textarea></div>
                            <div><label>Contenuto Completo</label><textarea {...register('content')} rows="6" className="w-full border p-2 rounded mt-1"></textarea></div>
                            <div><label>Immagine</label><input type="file" {...register('image')} className="w-full text-sm mt-1"/></div>
                            {editing && editing.imageUrl && <img src={editing.imageUrl} alt="preview" className="w-24 h-24 object-cover rounded"/>}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full text-white py-2.5 rounded-lg font-semibold transition-colors disabled:bg-gray-400 ${editing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-500 hover:bg-green-600'}`}
                            >
                                {isSubmitting ? 'Salvataggio...' : (editing ? 'Salva Modifiche' : 'Aggiungi Notizia')}
                            </button>
                        </form>
                    </div>
                </div>
                {/* Lista */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4">Notizie Inserite ({news.length})</h2>
                        <div className="space-y-4">
                            {loading ? <p>Caricamento...</p> : news.map(item => (
                                <div key={item.id} className="border p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-bold">{item.title}</p>
                                        <p className="text-sm text-gray-500">{item.location} - {new Date(item.publishedAt).toLocaleDateString('it-IT')}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setEditing(item)} className="text-blue-500 hover:text-blue-700"><Edit/></button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700"><Trash2/></button>
                                    </div>
                                </div>
                            ))}
                            {!loading && news.length === 0 && <p className="text-center text-gray-500 py-8">Nessuna notizia presente.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminNewsPage;