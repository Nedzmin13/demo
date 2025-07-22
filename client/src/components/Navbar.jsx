import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Tag, Route as RouteIcon } from 'lucide-react';
import { useCombobox } from 'downshift';
import useDebounce from '../hooks/useDebounce';
import { globalSearch } from '../api';

function Navbar() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const debouncedInputValue = useDebounce(inputValue, 500); // Attende 500ms prima di cercare

    useEffect(() => {
        if (debouncedInputValue.length < 3) {
            setItems([]);
            return;
        }
        const fetchData = async () => {
            try {
                const response = await globalSearch(debouncedInputValue);
                const combinedResults = [
                    ...response.data.comuni.map(item => ({ ...item, resultType: 'Comune' })),
                    ...response.data.offers.map(item => ({ ...item, resultType: 'Offerta' })),
                    ...response.data.itineraries.map(item => ({ ...item, resultType: 'Itinerario' })),
                ];
                setItems(combinedResults);
            } catch (error) {
                console.error("Errore nella ricerca globale:", error);
            }
        };
        fetchData();
    }, [debouncedInputValue]);

    const {
        isOpen,
        getMenuProps,
        getInputProps,
        getItemProps,
        closeMenu,
        reset, // Aggiungiamo 'reset' dalle proprietà di downshift
    } = useCombobox({
        items,
        // Ora il valore dell'input è controllato dal nostro stato 'inputValue'
        inputValue,
        itemToString: (item) => (item ? item.title || item.name : ''),
        onInputValueChange: ({ inputValue: newInputValue }) => {
            setInputValue(newInputValue || '');
        },
        onSelectedItemChange: ({ selectedItem }) => {
            if (!selectedItem) return;

            if (selectedItem.resultType === 'Comune') {
                navigate(`/comune/${selectedItem.slug}`);
            } else if (selectedItem.resultType === 'Offerta') {
                window.open(selectedItem.link, '_blank', 'noopener,noreferrer');
            } else if (selectedItem.resultType === 'Itinerario') {
                navigate(`/itinerari/${selectedItem.id}`);
            }

            // Usiamo il metodo reset() di downshift che pulisce tutto il suo stato interno
            reset();
            setItems([]);
        },
    });

    const navLinkClass = ({ isActive }) =>
        isActive
            ? 'text-sky-500 font-semibold border-b-2 border-sky-500 pb-1'
            : 'text-gray-600 hover:text-sky-500 transition-colors duration-200';

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-2xl font-bold text-sky-600">FastInfo</Link>
                    </div>

                    <div className="hidden md:flex md:items-center md:space-x-8">
                        <NavLink to="/" className={navLinkClass} end>Home</NavLink>
                        <NavLink to="/viaggio" className={navLinkClass}>Viaggio</NavLink>
                        <NavLink to="/affari-sconti" className={navLinkClass}>Affari & Sconti</NavLink>
                        <NavLink to="/bonus" className={navLinkClass}>Bonus</NavLink>
                        <NavLink to="/top-destinazioni" className={navLinkClass}>Top Destinazioni</NavLink>
                        <NavLink to="/notizie-utili" className={navLinkClass}>Notizie Utili</NavLink>
                    </div>

                    <div className="relative w-40 sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            {...getInputProps({
                                value: inputValue, // Forziamo il valore a essere quello del nostro stato
                            })}
                            placeholder="Cerca città, offerte..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                        <ul {...getMenuProps()} className={`absolute mt-1 w-full bg-white shadow-lg rounded-md max-h-80 overflow-auto ${!isOpen && 'hidden'}`}>
                            {isOpen && items.length > 0 && items.map((item, index) => (
                                <li
                                    key={`${item.id}-${item.resultType}`}
                                    {...getItemProps({ item, index })}
                                    className="px-4 py-2 hover:bg-sky-50 cursor-pointer flex items-center gap-3 border-b last:border-b-0"
                                >
                                    {item.resultType === 'Comune' && <MapPin size={16} className="text-gray-400 flex-shrink-0"/>}
                                    {item.resultType === 'Offerta' && <Tag size={16} className="text-gray-400 flex-shrink-0"/>}
                                    {item.resultType === 'Itinerario' && <RouteIcon size={16} className="text-gray-400 flex-shrink-0"/>}
                                    <div>
                                        <p className="font-semibold text-sm text-gray-800">{item.title || item.name}</p>
                                        <p className="text-xs text-gray-500">{item.resultType} {item.province ? `- ${item.province.name}` : ''}</p>
                                    </div>
                                </li>
                            ))}
                            {isOpen && debouncedInputValue.length >= 3 && items.length === 0 && (
                                <li className="px-4 py-2 text-sm text-gray-500">Nessun risultato trovato.</li>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Navbar;