import prisma from '../config/prismaClient.js';
import cloudinary from '../config/cloudinary.js';

const toNull = (value) => (value === '' || value === undefined ? null : value);
const uploadImageToCloudinary = async (file) => {
    const b64 = Buffer.from(file.buffer).toString("base64");
    let dataURI = `data:${file.mimetype};base64,${b64}`;
    return cloudinary.uploader.upload(dataURI, { folder: "fastinfo_itineraries" });
};

// --- FUNZIONI PUBBLICHE ---
export const getAllItineraries = async (req, res) => {
    const { region } = req.query;
    try {
        let itineraries = await prisma.itinerary.findMany({
            include: { images: true },
            orderBy: { title: 'asc' }
        });
        if (region) {
            const formattedRegion = region.replace(/-/g, ' ').toLowerCase();
            itineraries = itineraries.filter(it => it.region?.toLowerCase() === formattedRegion);
        }
        res.status(200).json(itineraries);
    } catch (error) { res.status(500).json({ message: 'Errore del server.' }); }
};

export const getItineraryById = async (req, res) => {
    try {
        const itinerary = await prisma.itinerary.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { images: true, steps: { orderBy: { day: 'asc' } } }
        });
        if (!itinerary) return res.status(404).json({ message: 'Itinerario non trovato.' });
        res.status(200).json(itinerary);
    } catch (error) { res.status(500).json({ message: 'Errore del server.' }); }
};

// --- FUNZIONI ADMIN ---
export const getAllItinerariesForAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;
        const [itineraries, total] = await prisma.$transaction([
            prisma.itinerary.findMany({ orderBy: { title: 'asc' }, skip, take: limit }),
            prisma.itinerary.count()
        ]);
        res.status(200).json({
            data: itineraries,
            pagination: { total, page: page, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) { res.status(500).json({ message: 'Errore server.' }); }
};

export const createItinerary = async (req, res) => {
    const { title, description, region, duration, isPopular, steps } = req.body;
    try {
        const newItinerary = await prisma.$transaction(async (tx) => {
            const itinerary = await tx.itinerary.create({
                data: {
                    title, region, duration,
                    description: toNull(description),
                    isPopular: isPopular === 'true',
                    steps: { create: JSON.parse(steps || '[]') }
                }
            });
            if (req.files && req.files.length > 0) {
                const uploadPromises = req.files.map(file => uploadImageToCloudinary(file));
                const uploadResults = await Promise.all(uploadPromises);
                await tx.itineraryImage.createMany({
                    data: uploadResults.map(result => ({
                        url: result.secure_url,
                        itineraryId: itinerary.id
                    }))
                });
            }
            return tx.itinerary.findUnique({ where: { id: itinerary.id }, include: { images: true, steps: true } });
        });
        res.status(201).json(newItinerary);
    } catch (error) {
        console.error("Errore creazione itinerario:", error);
        res.status(500).json({ message: 'Errore creazione itinerario' });
    }
};

export const updateItinerary = async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, description, region, duration, isPopular, steps } = req.body;
    try {
        await prisma.$transaction(async (tx) => {
            await tx.itineraryStep.deleteMany({ where: { itineraryId: id } });
            await tx.itinerary.update({
                where: { id },
                data: {
                    title, region, duration,
                    description: toNull(description),
                    isPopular: isPopular === 'true',
                    steps: { create: JSON.parse(steps || '[]') }
                }
            });
            if (req.files && req.files.length > 0) {
                const uploadPromises = req.files.map(file => uploadImageToCloudinary(file));
                const uploadResults = await Promise.all(uploadPromises);
                await tx.itineraryImage.createMany({
                    data: uploadResults.map(result => ({
                        url: result.secure_url,
                        itineraryId: id
                    }))
                });
            }
        });
        res.status(200).json({ message: 'Itinerario aggiornato' });
    } catch (error) {
        console.error("Errore aggiornamento itinerario:", error);
        res.status(500).json({ message: 'Errore aggiornamento itinerario' });
    }
};

export const deleteItinerary = async (req, res) => {
    try {
        await prisma.itinerary.delete({ where: { id: parseInt(req.params.id) } });
        res.status(200).json({ message: 'Itinerario eliminato' });
    } catch (error) { res.status(500).json({ message: 'Errore eliminazione' }); }
};

export const addItineraryImages = async (req, res) => {
    const itineraryId = parseInt(req.params.id);
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Nessun file fornito.' });
    }
    try {
        for (const file of req.files) {
            const b64 = Buffer.from(file.buffer).toString("base64");
            let dataURI = "data:" + file.mimetype + ";base64," + b64;
            const result = await cloudinary.uploader.upload(dataURI, { folder: "fastinfo_itineraries" });
            await prisma.itineraryImage.create({ data: { url: result.secure_url, itineraryId: itineraryId } });
        }
        res.status(201).json({ message: 'Immagini aggiunte.' });
    } catch (error) { res.status(500).json({ message: "Errore del server" }); }
};


export const deleteItineraryImage = async (req, res) => {
    const imageId = parseInt(req.params.imageId);
    try {
        await prisma.itineraryImage.delete({ where: { id: imageId } });
        res.status(200).json({ message: 'Immagine eliminata.' });
    } catch (error) { res.status(500).json({ message: "Errore del server" }); }
};

