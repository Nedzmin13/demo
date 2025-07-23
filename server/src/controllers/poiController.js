import prisma from '../config/prismaClient.js';
import cloudinary from '../config/cloudinary.js';

// --- Funzioni Pubbliche ---

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
        const pois = await prisma.pointofinterest.findMany({
            where: whereClause,
            include: { comune: true },
            orderBy: { name: 'asc' }
        });
        res.status(200).json(pois);
    } catch (error) {
        console.error(`Errore nel recuperare i POI per la provincia ${provinceId}:`, error);
        res.status(500).json({ message: 'Errore del server.' });
    }
};

const getPoiDetailsById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const poi = await prisma.pointofinterest.findUnique({
            where: { id },
            include: {
                comune: { include: { province: { include: { region: true } } } },
                image: true,
                restaurant: true,
                fuelstation: true,
                supermarket: true,
                bar: true,
                parking: true,
                touristattraction: true,
                emergencyservice: true,
                leaflet: true
            }
        });
        if (!poi) return res.status(404).json({ message: "Punto di Interesse non trovato" });
        res.json(poi);
    } catch (error) {
        console.error(`Errore recupero dettagli POI con ID ${id}:`, error);
        res.status(500).json({ message: "Errore del server" });
    }
};


// --- Funzioni Admin ---

const createPoi = async (req, res) => {
    const { name, category, address, comuneId, description, website, phoneNumber, isEssentialService, isFeaturedAttraction,
        cuisineType, priceRange, openingHours, menuUrl, dieselPrice, petrolPrice, hasLeaflet, pdfUrl,
        leafletTitle, specialty, hasOutdoorSpace, parkingType } = req.body;
    try {
        const poi = await prisma.$transaction(async (tx) => {
            const createdPoi = await tx.pointofinterest.create({
                data: {
                    name, category, address, description, website, phoneNumber,
                    comuneId: parseInt(comuneId),
                    isEssentialService: isEssentialService === 'true',
                    isFeaturedAttraction: isFeaturedAttraction === 'true',
                }
            });
            if (category === 'Restaurant') await tx.restaurant.create({ data: { poiId: createdPoi.id, cuisineType, priceRange, openingHours } });
            else if (category === 'FuelStation') await tx.fuelstation.create({ data: { poiId: createdPoi.id, dieselPrice: parseFloat(dieselPrice) || null, petrolPrice: parseFloat(petrolPrice) || null, openingHours } });
            else if (category === 'Supermarket') {
                await tx.supermarket.create({ data: { poiId: createdPoi.id, openingHours, hasLeaflet: hasLeaflet === 'true' } });
                if (hasLeaflet === 'true' && pdfUrl) {
                    await tx.leaflet.create({ data: { poiId: createdPoi.id, title: leafletTitle || `Volantino ${name}`, pdfUrl } });
                }
            }
            else if (category === 'Bar') await tx.bar.create({ data: { poiId: createdPoi.id, openingHours, specialty, hasOutdoorSpace: hasOutdoorSpace === 'true' } });
            else if (category === 'Parking') await tx.parking.create({ data: { poiId: createdPoi.id, openingHours, parkingType } });

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
    } catch (error) {
        console.error("Errore creazione POI:", error);
        res.status(500).json({ message: "Errore del server" });
    }
};

const updatePoi = async (req, res) => {
    const poiId = parseInt(req.params.id);
    const { name, category, address, description, website, phoneNumber, isEssentialService, isFeaturedAttraction,
        cuisineType, priceRange, openingHours, menuUrl, dieselPrice, petrolPrice, hasLeaflet, pdfUrl,
        leafletTitle, specialty, hasOutdoorSpace, parkingType } = req.body;
    try {
        await prisma.$transaction(async (tx) => {
            await tx.pointofinterest.update({ where: { id: poiId }, data: { name, address, description, website, phoneNumber, isEssentialService: isEssentialService === 'true', isFeaturedAttraction: isFeaturedAttraction === 'true' } });
            if (category === 'Restaurant') await tx.restaurant.upsert({ where: { poiId }, update: { cuisineType, priceRange, openingHours }, create: { poiId, cuisineType, priceRange, openingHours } });
            else if (category === 'FuelStation') await tx.fuelstation.upsert({ where: { poiId }, update: { dieselPrice: parseFloat(dieselPrice) || null, petrolPrice: parseFloat(petrolPrice) || null, openingHours }, create: { poiId, dieselPrice: parseFloat(dieselPrice) || null, petrolPrice: parseFloat(petrolPrice) || null, openingHours } });
            else if (category === 'Supermarket') {
                await tx.supermarket.upsert({ where: { poiId }, update: { openingHours, hasLeaflet: hasLeaflet === 'true' }, create: { poiId, openingHours, hasLeaflet: hasLeaflet === 'true' } });
                if (hasLeaflet === 'true' && pdfUrl) {
                    await tx.leaflet.upsert({ where: { poiId }, update: { title: leafletTitle, pdfUrl }, create: { poiId, title: leafletTitle, pdfUrl } });
                } else {
                    await tx.leaflet.deleteMany({ where: { poiId } });
                }
            }
            else if (category === 'Bar') await tx.bar.upsert({ where: { poiId }, update: { openingHours, specialty, hasOutdoorSpace: hasOutdoorSpace === 'true' }, create: { poiId, openingHours, specialty, hasOutdoorSpace: hasOutdoorSpace === 'true' } });
            else if (category === 'Parking') await tx.parking.upsert({ where: { poiId }, update: { openingHours, parkingType }, create: { poiId, openingHours, parkingType } });
        });
        const updatedPoi = await prisma.pointofinterest.findUnique({ where: { id: poiId }, include: { image: true, restaurant: true, fuelstation: true, supermarket: true, bar: true, parking: true, touristattraction: true, emergencyservice: true, leaflet: true }});
        res.status(200).json(updatedPoi);
    } catch (error) {
        console.error("Errore aggiornamento POI:", error);
        res.status(500).json({ message: "Errore del server" });
    }
};

const deletePoi = async (req, res) => {
    const poiId = parseInt(req.params.id);
    try {
        // onDelete: Cascade nello schema si occupa di eliminare i record collegati
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
        const uploadedImages = [];
        for (const file of req.files) {
            const b64 = Buffer.from(file.buffer).toString("base64");
            let dataURI = "data:" + file.mimetype + ";base64," + b64;
            const result = await cloudinary.uploader.upload(dataURI, { folder: "fastinfo_pois" });
            const newImage = await prisma.image.create({ data: { url: result.secure_url, poiId: poiId } });
            uploadedImages.push(newImage);
        }
        res.status(201).json(uploadedImages);
    } catch (error) { res.status(500).json({ message: "Errore del server" }); }
};

const deleteImage = async (req, res) => {
    const imageId = parseInt(req.params.imageId);
    try {
        await prisma.image.delete({ where: { id: imageId } });
        res.status(200).json({ message: 'Immagine eliminata.' });
    } catch (error) { res.status(500).json({ message: "Errore del server" }); }
};

export {
    getFeaturedPoisByProvince,
    getPoiDetailsById,
    createPoi,
    updatePoi,
    deletePoi,
    addImagesToPoi,
    deleteImage
};