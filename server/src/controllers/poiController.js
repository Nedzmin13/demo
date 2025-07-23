import prisma from '../config/prismaClient.js';
import cloudinary from '../config/cloudinary.js';

// TUE FUNZIONI HELPER (CORRETTE E SPOSTATE QUI)
const toNull = (value) => {
    return value === '' || value === undefined || value === null ? null : value;
};

const uploadImageToCloudinary = async (file) => {
    const b64 = Buffer.from(file.buffer).toString("base64");
    let dataURI = `data:${file.mimetype};base64,${b64}`;
    return cloudinary.uploader.upload(dataURI, { folder: "fastinfo_pois" });
};

const toBoolean = (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return !!value;
};

// --- FUNZIONI PUBBLICHE (DAL TUO CODICE) ---
const getFeaturedPoisByProvince = async (req, res) => {
    const { provinceId } = req.params;
    const { type } = req.query;
    if (!type || (type !== 'essential' && type !== 'attraction')) {
        return res.status(400).json({ message: "Tipo non valido. Usare 'essential' o 'attraction'." });
    }
    const whereClause = {
        comune: { provinceId: parseInt(provinceId, 10) },
        ...(type === 'essential' ? { isEssentialService: true } : { isFeaturedAttraction: true })
    };
    try {
        const pois = await prisma.pointofinterest.findMany({ where: whereClause, include: { comune: true }, orderBy: { name: 'asc' } });
        res.status(200).json(pois);
    } catch (error) { res.status(500).json({ message: 'Errore del server.' }); }
};

const getPoiDetailsById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const poi = await prisma.pointofinterest.findUnique({
            where: { id },
            include: {
                comune: { include: { province: { include: { region: true } } } },
                image: true, restaurant: true, fuelstation: true,
                supermarket: true, bar: true, parking: true,
                touristattraction: true, emergencyservice: true, leaflet: true
            }
        });
        if (!poi) return res.status(404).json({ message: "Punto di Interesse non trovato" });
        res.json(poi);
    } catch (error) { res.status(500).json({ message: "Errore del server" }); }
};

// --- FUNZIONI ADMIN (DAL TUO CODICE, MA CORRETTE) ---
const createPoi = async (req, res) => {
    const {
        name, category, address, comuneId, description, website, phoneNumber, openingHours,
        isEssentialService, isFeaturedAttraction, cuisineType, priceRange, menuUrl,
        dieselPrice, petrolPrice, gasPrice,  hasLeaflet, pdfUrl, leafletTitle, specialty,
        hasOutdoorSpace, parkingType
    } = req.body;
    try {
        const poi = await prisma.$transaction(async (tx) => {
            const createdPoi = await tx.pointofinterest.create({
                data: {
                    name, category, address, comuneId: parseInt(comuneId),
                    description: toNull(description), website: toNull(website), phoneNumber: toNull(phoneNumber),
                    openingHours: toNull(openingHours),
                    isEssentialService: toBoolean(isEssentialService), isFeaturedAttraction: toBoolean(isFeaturedAttraction),
                }
            });

            if (category === 'Restaurant') await tx.restaurant.create({ data: { poiId: createdPoi.id, cuisineType: toNull(cuisineType), priceRange: toNull(priceRange) } });
            else if (category === 'FuelStation')
                await tx.fuelstation.create(
                    { data: {
                            poiId: createdPoi.id,
                            website: toNull(website)
                        } });
            else if (category === 'Supermarket') {
                await tx.supermarket.create({ data: { poiId: createdPoi.id, hasLeaflet: toBoolean(hasLeaflet) } });
                if (toBoolean(hasLeaflet) && toNull(pdfUrl)) { await tx.leaflet.create({ data: { poiId: createdPoi.id, title: toNull(leafletTitle) || `Volantino ${name}`, pdfUrl } }); }
            }
            else if (category === 'Bar') await tx.bar.create({ data: { poiId: createdPoi.id, specialty: toNull(specialty), hasOutdoorSpace: toBoolean(hasOutdoorSpace) } });
            else if (category === 'Parking') await tx.parking.create({ data: { poiId: createdPoi.id, parkingType: toNull(parkingType) } });

            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    const b64 = Buffer.from(file.buffer).toString("base64");
                    const dataURI = `data:${file.mimetype};base64,${b64}`;
                    const result = await cloudinary.uploader.upload(dataURI, { folder: "fastinfo_pois" });
                    await tx.image.create({ data: { url: result.secure_url, poiId: createdPoi.id } });
                }
            }
            return createdPoi;
        });
        res.status(201).json(poi);
    } catch (error) { console.error("Errore creazione POI:", error); res.status(500).json({ message: "Errore del server" }); }
};

const updatePoi = async (req, res) => {
    const poiId = parseInt(req.params.id);
    const { name, category, address, description, website, phoneNumber, openingHours, isEssentialService, isFeaturedAttraction,
        cuisineType, priceRange, menuUrl, dieselPrice, petrolPrice, gasPrice, hasLeaflet, pdfUrl, leafletTitle, specialty, hasOutdoorSpace, parkingType } = req.body;
    try {
        await prisma.$transaction(async (tx) => {
            await tx.pointofinterest.update({ where: { id: poiId }, data: {
                    name, address,
                    description: toNull(description), website: toNull(website), phoneNumber: toNull(phoneNumber),
                    openingHours: toNull(openingHours),
                    dieselPrice: toNull(dieselPrice) ? parseFloat(dieselPrice) : null,
                    petrolPrice: toNull(petrolPrice) ? parseFloat(petrolPrice) : null,
                    gasPrice: toNull(gasPrice) ? parseFloat(gasPrice) : null,
                    isEssentialService: toBoolean(isEssentialService),
                    isFeaturedAttraction: toBoolean(isFeaturedAttraction)
                }});
            if (category === 'Restaurant') await tx.restaurant.upsert({ where: { poiId }, update: { cuisineType: toNull(cuisineType), priceRange: toNull(priceRange) }, create: { poiId, cuisineType, priceRange } });
            else if (category === 'FuelStation') {
                await tx.fuelstation.upsert({
                    where: { poiId },
                    update: {
                        website: toNull(website)
                    },
                    create: {
                        poiId,  website: toNull(website)
                    }
                });
            }
            else if (category === 'Supermarket') {
                await tx.supermarket.upsert({ where: { poiId }, update: { hasLeaflet: toBoolean(hasLeaflet) }, create: { poiId, hasLeaflet: toBoolean(hasLeaflet) } });
                await tx.leaflet.deleteMany({ where: { poiId } });
                if (toBoolean(hasLeaflet) && toNull(pdfUrl)) { await tx.leaflet.create({ data: { poiId: poiId, title: toNull(leafletTitle) || `Volantino ${name}`, pdfUrl: pdfUrl } }); }
            }
            else if (category === 'Bar') await tx.bar.upsert({ where: { poiId }, update: { specialty: toNull(specialty), hasOutdoorSpace: toBoolean(hasOutdoorSpace) }, create: { poiId, specialty, hasOutdoorSpace: toBoolean(hasOutdoorSpace) } });
            else if (category === 'Parking') await tx.parking.upsert({ where: { poiId }, update: { parkingType: toNull(parkingType) }, create: { poiId, parkingType } });
        });
        const updatedPoi = await prisma.pointofinterest.findUnique({ where: { id: poiId }, include: { image: true, restaurant: true, fuelstation: true, supermarket: true, bar: true, parking: true, touristattraction: true, emergencyservice: true, leaflet: true }});
        res.status(200).json(updatedPoi);
    } catch (error) { console.error("Errore aggiornamento POI:", error); res.status(500).json({ message: "Errore del server" }); }
};

const deletePoi = async (req, res) => {
    const poiId = parseInt(req.params.id);
    try {
        await prisma.pointofinterest.delete({ where: { id: poiId } });
        res.status(200).json({ message: 'POI eliminato con successo.' });
    } catch (error) {
        console.error(`Errore eliminazione POI ${poiId}:`, error);
        res.status(500).json({ message: "Errore del server" });
    }
};

const addImagesToPoi = async (req, res) => {
    const poiId = parseInt(req.params.id);
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Nessun file fornito.' });
    }
    try {
        for (const file of req.files) {
            const b64 = Buffer.from(file.buffer).toString("base64");
            const dataURI = `data:${file.mimetype};base64,${b64}`;
            const result = await cloudinary.uploader.upload(dataURI, { folder: "fastinfo_pois" });
            await prisma.image.create({ data: { url: result.secure_url, poiId: poiId } });
        }
        res.status(201).json({ message: 'Immagini aggiunte.' });
    } catch (error) { res.status(500).json({ message: "Errore del server" }); }
};

const deleteImage = async (req, res) => {
    const imageId = parseInt(req.params.imageId);
    try {
        await prisma.image.delete({ where: { id: imageId } });
        res.status(200).json({ message: 'Immagine eliminata.' });
    } catch (error) {
        res.status(500).json({ message: "Errore del server" });
    }
};

// --- BLOCCO EXPORT COMPLETO E CORRETTO ---
export {
    getFeaturedPoisByProvince,
    getPoiDetailsById,
    createPoi,
    updatePoi,
    deletePoi,
    addImagesToPoi,
    deleteImage
};