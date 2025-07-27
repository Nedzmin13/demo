import prisma from '../config/prismaClient.js';
import cloudinary from '../config/cloudinary.js';

// =======================================================
// ---             FUNZIONI HELPER                     ---
// =======================================================

// Converte stringhe vuote o undefined in null per il database
const toNull = (value) => (value === '' || value === undefined || value === null ? null : value);

// Converte in Float, gestendo la virgola e i valori null
const toFloatOrNull = (value) => (toNull(value) !== null ? parseFloat(String(value).replace(',', '.')) : null);

// Converte in Int, gestendo i valori null
const toIntOrNull = (value) => (toNull(value) !== null ? parseInt(String(value), 10) : null);

// Converte in Boolean in modo sicuro
const toBoolean = (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return !!value;
};

// Funzione di upload (non esportata, usata solo qui)
const uploadImageToCloudinary = async (file) => {
    const b64 = Buffer.from(file.buffer).toString("base64");
    let dataURI = `data:${file.mimetype};base64,${b64}`;
    return cloudinary.uploader.upload(dataURI, { folder: "fastinfo_pois" });
};


// =======================================================
// ---                FUNZIONI PUBBLICHE               ---
// =======================================================

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
                touristattraction: true, emergencyservice: true, leaflet: true,
                accommodation: true
            }
        });
        if (!poi) return res.status(404).json({ message: "Punto di Interesse non trovato" });
        res.json(poi);
    } catch (error) { res.status(500).json({ message: "Errore del server" }); }
};

// =======================================================
// ---                  FUNZIONI ADMIN                 ---
// =======================================================

const createPoi = async (req, res) => {
    const { name, category, address, comuneId, description, website, phoneNumber, openingHours, isEssentialService, isFeaturedAttraction,
        dieselPrice, petrolPrice, gasPrice, type, stars, services, bookingUrl, cuisineType, priceRange, hasLeaflet,
        pdfUrl, leafletTitle, specialty, hasOutdoorSpace, parkingType } = req.body;
    try {
        const poi = await prisma.$transaction(async (tx) => {
            const createdPoi = await tx.pointofinterest.create({
                data: {
                    name, category, address, comuneId: parseInt(comuneId),
                    description: toNull(description), website: toNull(website), phoneNumber: toNull(phoneNumber),
                    openingHours: toNull(openingHours),
                    dieselPrice: toFloatOrNull(dieselPrice), petrolPrice: toFloatOrNull(petrolPrice), gasPrice: toFloatOrNull(gasPrice),
                    type: toNull(type), stars: toIntOrNull(stars), services: toNull(services), bookingUrl: toNull(bookingUrl),
                    isEssentialService: toBoolean(isEssentialService), isFeaturedAttraction: toBoolean(isFeaturedAttraction),
                }
            });
            const poiId = createdPoi.id;
            if (category === 'Restaurant') await tx.restaurant.create({ data: { poiId, cuisineType: toNull(cuisineType), priceRange: toNull(priceRange) } });
            else if (category === 'FuelStation') await tx.fuelstation.create({ data: { poiId, website: toNull(website) } });
            else if (category === 'Supermarket') {
                await tx.supermarket.create({ data: { poiId, hasLeaflet: toBoolean(hasLeaflet) } });
                if (toBoolean(hasLeaflet) && toNull(pdfUrl)) await tx.leaflet.create({ data: { poiId: createdPoi.id, title: toNull(leafletTitle) || `Volantino ${name}`, pdfUrl } });
            }
            else if (category === 'Bar') await tx.bar.create({ data: { poiId, specialty: toNull(specialty), hasOutdoorSpace: toBoolean(hasOutdoorSpace) } });
            else if (category === 'Parking') await tx.parking.create({ data: { poiId, parkingType: toNull(parkingType) } });
            else if (category === 'Accommodation') await tx.accommodation.create({ data: { poiId } });

            if (req.files && req.files.length > 0) {
                const uploadPromises = req.files.map(file => uploadImageToCloudinary(file));
                const uploadResults = await Promise.all(uploadPromises);
                await tx.image.createMany({ data: uploadResults.map(r => ({ url: r.secure_url, poiId })) });
            }
            return createdPoi;
        });
        res.status(201).json(poi);
    } catch (error) { console.error("Errore creazione POI:", error); res.status(500).json({ message: "Errore durante la creazione del POI." }); }
};

const updatePoi = async (req, res) => {
    const poiId = parseInt(req.params.id);
    const { name, category, address, description, website, phoneNumber, openingHours, isEssentialService, isFeaturedAttraction,
        dieselPrice, petrolPrice, gasPrice, type, stars, services, bookingUrl, cuisineType, priceRange, hasLeaflet,
        pdfUrl, leafletTitle, specialty, hasOutdoorSpace, parkingType } = req.body;
    try {
        await prisma.$transaction(async (tx) => {
            await tx.pointofinterest.update({
                where: { id: poiId }, data: {
                    name, address,
                    description: toNull(description), website: toNull(website), phoneNumber: toNull(phoneNumber),
                    openingHours: toNull(openingHours),
                    dieselPrice: toFloatOrNull(dieselPrice), petrolPrice: toFloatOrNull(petrolPrice), gasPrice: toFloatOrNull(gasPrice),
                    type: toNull(type), stars: toIntOrNull(stars), services: toNull(services), bookingUrl: toNull(bookingUrl),
                    isEssentialService: toBoolean(isEssentialService), isFeaturedAttraction: toBoolean(isFeaturedAttraction),
                }
            });
            if (category === 'Restaurant') await tx.restaurant.upsert({ where: { poiId }, update: { cuisineType: toNull(cuisineType), priceRange: toNull(priceRange) }, create: { poiId, cuisineType: toNull(cuisineType), priceRange: toNull(priceRange) } });
            else if (category === 'FuelStation') await tx.fuelstation.upsert({ where: { poiId }, update: { website: toNull(website) }, create: { poiId, website: toNull(website) } });
            else if (category === 'Supermarket') {
                await tx.supermarket.upsert({ where: { poiId }, update: { hasLeaflet: toBoolean(hasLeaflet) }, create: { poiId, hasLeaflet: toBoolean(hasLeaflet) } });
                await tx.leaflet.deleteMany({ where: { poiId } });
                if (toBoolean(hasLeaflet) && toNull(pdfUrl)) { await tx.leaflet.create({ data: { poiId: poiId, title: toNull(leafletTitle) || `Volantino ${name}`, pdfUrl: pdfUrl } }); }
            }
            else if (category === 'Bar') await tx.bar.upsert({ where: { poiId }, update: { specialty: toNull(specialty), hasOutdoorSpace: toBoolean(hasOutdoorSpace) }, create: { poiId, specialty: toNull(specialty), hasOutdoorSpace: toBoolean(hasOutdoorSpace) } });
            else if (category === 'Parking') await tx.parking.upsert({ where: { poiId }, update: { parkingType: toNull(parkingType) }, create: { poiId, parkingType: toNull(parkingType) } });
            else if (category === 'Accommodation') await tx.accommodation.upsert({ where: { poiId }, update: {}, create: { poiId } });
        });
        const updatedPoi = await prisma.pointofinterest.findUnique({ where: { id: poiId }, include: { image: true, restaurant: true, fuelstation: true, supermarket: true, bar: true, parking: true, touristattraction: true, emergencyservice: true, leaflet: true, accommodation: true } });
        res.status(200).json(updatedPoi);
    } catch (error) { console.error("Errore aggiornamento POI:", error); res.status(500).json({ message: "Errore durante l'aggiornamento del POI." }); }
};

const deletePoi = async (req, res) => {
    const poiId = parseInt(req.params.id);
    try {
        await prisma.pointofinterest.delete({ where: { id: poiId } });
        res.status(200).json({ message: 'POI eliminato con successo.' });
    } catch (error) { res.status(500).json({ message: "Errore del server" }); }
};

const addImagesToPoi = async (req, res) => {
    const poiId = parseInt(req.params.id);
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Nessun file fornito.' });
    }
    try {
        for (const file of req.files) {
            const result = await uploadImageToCloudinary(file);
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
    } catch (error) { res.status(500).json({ message: "Errore del server" }); }
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