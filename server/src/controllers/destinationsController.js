import prisma from '../config/prismaClient.js';
import cloudinary from '../config/cloudinary.js';

const toNull = (value) => (value === '' || value === undefined ? null : value);


// --- Funzioni Pubbliche ---
const getDestinationsBySeason = async (req, res) => {
    const { season } = req.query;
    if (!season) return res.status(400).json({ message: 'Il parametro "season" è richiesto.' });
    const capitalizedSeason = season.charAt(0).toUpperCase() + season.slice(1).toLowerCase();
    try {
        const destinations = await prisma.destination.findMany({
            where: { season: { equals: capitalizedSeason } },
            include: { images: true },
            orderBy: { rating: 'desc' }
        });
        res.status(200).json(destinations);
    } catch (error) { res.status(500).json({ message: 'Errore del server.' }); }
};

const getDestinationById = async (req, res) => {
    try {
        const dest = await prisma.destination.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { images: true }
        });
        if (!dest) return res.status(404).json({ message: "Destinazione non trovata" });
        res.json(dest);
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

// --- Funzioni Admin ---
const getAllDestinationsForAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15; // Mostra 15 per pagina
        const skip = (page - 1) * limit;

        const [destinations, total] = await prisma.$transaction([
            prisma.destination.findMany({
                orderBy: { name: 'asc' },
                include: { images: true },
                skip: skip,
                take: limit,
            }),
            prisma.destination.count()
        ]);

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            data: destinations,
            pagination: {
                total,
                page,
                totalPages,
                limit
            }
        });
    } catch (error) {
        console.error("Errore nel recuperare le destinazioni per l'admin:", error);
        res.status(500).json({ message: 'Errore del server.' });
    }
};

const createDestination = async (req, res) => {
    const { name, region, description, tags, season, rating, imageUrls } = req.body;
    try {
        const destination = await prisma.destination.create({
            data: {
                name, region,  description: toNull(description),  tags: toNull(tags), season, rating: parseFloat(rating),
                images: { create: (JSON.parse(imageUrls || '[]')).map(url => ({ url })) }
            }
        });
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const b64 = Buffer.from(file.buffer).toString("base64");
                let dataURI = "data:" + file.mimetype + ";base64," + b64;
                const result = await cloudinary.uploader.upload(dataURI, { folder: "fastinfo_destinations" });
                await prisma.destinationImage.create({ data: { url: result.secure_url, destinationId: destination.id } });
            }
        }
        const finalDestination = await prisma.destination.findUnique({ where: { id: destination.id }, include: { images: true } });
        res.status(201).json(finalDestination);
    } catch (error) { res.status(500).json({ message: 'Errore nella creazione' }); }
};

const updateDestination = async (req, res) => {
    const id = parseInt(req.params.id);
    const { name, region, description, tags, season, rating } = req.body;
    try {
        const destination = await prisma.destination.update({
            where: { id },
            data: { name, region, description: toNull(description), tags: toNull(tags), season, rating: parseFloat(rating) }
        });
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const b64 = Buffer.from(file.buffer).toString("base64");
                let dataURI = "data:" + file.mimetype + ";base64," + b64;
                const result = await cloudinary.uploader.upload(dataURI, { folder: "fastinfo_destinations" });
                await prisma.destinationImage.create({ data: { url: result.secure_url, destinationId: id } });
            }
        }
        res.status(200).json(destination);
    } catch (error) { res.status(500).json({ message: 'Errore del server.' }); }
};

const deleteDestination = async (req, res) => {
    try {
        await prisma.destination.delete({ where: { id: parseInt(req.params.id) } });
        res.status(200).json({ message: "Destinazione eliminata" });
    } catch (error) { res.status(500).json({ message: 'Errore del server.' }); }
};

const deleteDestinationImage = async (req, res) => {
    const imageId = parseInt(req.params.imageId);
    try {
        await prisma.destinationImage.delete({ where: { id: imageId } });
        res.status(200).json({ message: 'Immagine eliminata.' });
    } catch (error) { res.status(500).json({ message: "Errore del server" }); }
};

// --- UNICO BLOCCO DI EXPORT ---
export {
    getDestinationsBySeason,
    getDestinationById,
    getAllDestinationsForAdmin,
    createDestination,
    updateDestination,
    deleteDestination,
    // La funzione addImagesToDestination non serve più, la logica è dentro updateDestination
    deleteDestinationImage
};