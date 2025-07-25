import prisma from '../config/prismaClient.js';
import cloudinary from '../config/cloudinary.js';

// --- DEFINIZIONE DI TUTTE LE FUNZIONI (SENZA 'export' QUI) ---

const getAllItineraries = async (req, res) => {
    try {
        const itineraries = await prisma.itinerary.findMany({
            include: { images: true },
            orderBy: { title: 'asc' }
        });
        res.status(200).json(itineraries);
    } catch (error) { res.status(500).json({ message: 'Errore del server.' }); }
};

const getItineraryById = async (req, res) => {
    try {
        const itinerary = await prisma.itinerary.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                images: true,
                steps: { orderBy: { day: 'asc' } }
            }
        });
        if (!itinerary) return res.status(404).json({ message: 'Itinerario non trovato.' });
        res.status(200).json(itinerary);
    } catch (error) { res.status(500).json({ message: 'Errore del server.' }); }
};

const createItinerary = async (req, res) => {
    const { title, description, region, duration, isPopular, steps } = req.body;
    try {
        const newItinerary = await prisma.itinerary.create({
            data: {
                title, description, region, duration,
                isPopular: isPopular === 'true',
                steps: { create: JSON.parse(steps || '[]') }
            }
        });
        res.status(201).json(newItinerary);
    } catch (error) {
        console.error("Errore creazione itinerario:", error);
        res.status(500).json({ message: 'Errore creazione itinerario' });
    }
};

const updateItinerary = async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, description, region, duration, isPopular, steps } = req.body;
    try {
        const parsedSteps = JSON.parse(steps || '[]').map(step => ({
            day: step.day,
            title: step.title,
            description: step.description
        }));
        await prisma.$transaction(async (tx) => {
            await tx.itineraryStep.deleteMany({ where: { itineraryId: id } });
            await tx.itinerary.update({
                where: { id },
                data: {
                    title, description, region, duration,
                    isPopular: isPopular === 'true',
                    steps: { create: parsedSteps }
                }
            });
        });
        res.status(200).json({ message: 'Itinerario aggiornato' });
    } catch (error) {
        console.error("Errore aggiornamento itinerario:", error);
        res.status(500).json({ message: 'Errore aggiornamento itinerario' });
    }
};

const deleteItinerary = async (req, res) => {
    try {
        await prisma.itinerary.delete({ where: { id: parseInt(req.params.id) } });
        res.status(200).json({ message: 'Itinerario eliminato' });
    } catch (error) { res.status(500).json({ message: 'Errore eliminazione' }); }
};

const addItineraryImages = async (req, res) => {
    const itineraryId = parseInt(req.params.id);
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Nessun file fornito.' });
    }
    try {
        for (const file of req.files) {
            const b64 = Buffer.from(file.buffer).toString("base64");
            let dataURI = "data:" + file.mimetype + ";base64," + b64;
            const result = await cloudinary.uploader.upload(dataURI, { folder: "fastinfo_itineraries" });

            await prisma.itineraryImage.create({
                data: { url: result.secure_url, itineraryId: itineraryId }
            });
        }
        res.status(201).json({ message: 'Immagini aggiunte.' });
    } catch (error) { res.status(500).json({ message: "Errore del server" }); }
};

const deleteItineraryImage = async (req, res) => {
    const imageId = parseInt(req.params.imageId);
    try {
        await prisma.itineraryImage.delete({ where: { id: imageId } });
        res.status(200).json({ message: 'Immagine eliminata.' });
    } catch (error) { res.status(500).json({ message: "Errore del server" }); }
};

// --- UNICO BLOCCO DI EXPORT ALLA FINE DEL FILE ---
export {
    getAllItineraries,
    getItineraryById,
    createItinerary,
    updateItinerary,
    deleteItinerary,
    addItineraryImages,
    deleteItineraryImage
};