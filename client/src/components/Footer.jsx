import React from 'react';
import { Link } from 'react-router-dom';
// Ho usato 'Linkedin' come placeholder per l'icona di TikTok, puoi cambiarla in futuro
import { Facebook, Instagram } from 'lucide-react';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-800 text-gray-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sezione "InfoSubito" */}
                    <div className="md:col-span-1">
                        <h3 className="text-xl font-bold text-white mb-4">InfoSubito</h3>
                        <p className="text-sm">
                            Il portale che ti tiene aggiornato su viaggi, offerte, bonus, pratiche utili, guide "come fare" e notizie per l'Italia.
                        </p>
                        <div className="flex space-x-4 mt-4">
                            <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-white"><Facebook size={20} /></a>
                            <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white"><Instagram size={20} /></a>
                        </div>
                    </div>

                    {/* Link Utili */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Link Utili</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/chi-siamo" className="hover:text-white">Chi Siamo</Link></li>
                            <li><a href="mailto:info@infosubito.it" className="hover:text-white">info@infosubito.it</a></li>
                            <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Legale */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Legale</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
                            <li><Link to="/cookie-policy" className="hover:text-white">Cookie Policy</Link></li>
                            <li><Link to="/termini-e-condizioni" className="hover:text-white">Termini e Condizioni</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Iscriviti alla Newsletter</h4>
                        <p className="text-sm mb-4">Rimani aggiornato con le ultime notizie e offerte.</p>
                        {/* --- FORM STATICO (temporaneo) --- */}
                        <form action="#" method="post" className="flex items-center">
                            <div className="relative w-full">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="La tua email"
                                    required
                                    className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-sky-600 text-white font-semibold px-6 py-3 rounded-r-md hover:bg-sky-700 transition-colors"
                            >
                                Iscriviti
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <div className="bg-gray-900 py-4">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
                    <p>© {currentYear} InfoSubito.it. Tutti i diritti riservati.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;