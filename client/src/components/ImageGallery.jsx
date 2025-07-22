import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

// Lightbox per ingrandire l'immagine
const Lightbox = ({ images, activeIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(activeIndex);

    const goToPrev = () => setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    const goToNext = () => setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));

    // Gestione frecce da tastiera
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') goToPrev();
            if (e.key === 'ArrowRight') goToNext();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={onClose}>
            <button className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/20"><X size={32} /></button>
            <button className="absolute left-4 text-white p-2 rounded-full hover:bg-white/20" onClick={(e) => { e.stopPropagation(); goToPrev(); }}><ChevronLeft size={48} /></button>
            <button className="absolute right-4 text-white p-2 rounded-full hover:bg-white/20" onClick={(e) => { e.stopPropagation(); goToNext(); }}><ChevronRight size={48} /></button>
            <div className="max-w-4xl max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                <img src={images[currentIndex].url} alt="Ingrandimento" className="max-w-full max-h-full object-contain" />
            </div>
        </div>
    );
};

// Componente Galleria Principale
export const ImageGallery = ({ images }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
    const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
    const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setPrevBtnEnabled(emblaApi.canScrollPrev());
        setNextBtnEnabled(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
    }, [emblaApi, onSelect]);

    const openLightbox = (index) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    if (!images || images.length === 0) {
        return <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center">Nessuna immagine</div>;
    }

    return (
        <div className="relative">
            <div className="overflow-hidden rounded-xl shadow-lg" ref={emblaRef}>
                <div className="flex">
                    {images.map((img, index) => (
                        <div className="flex-shrink-0 flex-grow-0 w-full" key={img.id}>
                            <div className="aspect-video bg-gray-100" onClick={() => openLightbox(index)}>
                                <img src={img.url} alt={`Immagine ${index + 1}`} className="w-full h-full object-cover cursor-pointer" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <button onClick={scrollPrev} disabled={!prevBtnEnabled} className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/80 rounded-full p-2 disabled:opacity-0 transition-opacity"><ChevronLeft /></button>
            <button onClick={scrollNext} disabled={!nextBtnEnabled} className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/80 rounded-full p-2 disabled:opacity-0 transition-opacity"><ChevronRight /></button>

            {lightboxOpen && <Lightbox images={images} activeIndex={lightboxIndex} onClose={() => setLightboxOpen(false)} />}
        </div>
    );
};