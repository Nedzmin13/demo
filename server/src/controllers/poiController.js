// server/src/controllers/poiController.js
import prisma from '../config/prismaClient.js';
import cloudinary from '../config/cloudinary.js';

// @desc   Recupera tutti i POI in vetrina per una data categoria (essenziali o attrazioni)
// @route  GET /api/pois/featured?type=essential
// @route  GET /api/pois/featured?type=attraction
// @access Public
const getFeaturedPois = async (req, res) => {
    const { type } = req.query;

    if (!type || (type !== 'essential' && type !== 'attraction')) {
        return res.status(400).json({ message: "Tipo non valido. Usare 'essential' o 'attraction'." });
    }

    const whereClause = type === 'essential'
        ? { isEssentialService: true }
        : { isFeaturedAttraction: true };

    try {
        const pois = await prisma.pointOfInterest.findMany({
            where: whereClause,
            include: {
                // Includiamo il comune e la provincia per mostrare la località
                comune: {
                    include: {
                        province: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
        res.status(200).json(pois);
    } catch (error) {
        console.error(`Errore nel recuperare i POI in vetrina:`, error);
        res.status(500).json({ message: 'Errore del server.' });
    }
};
const getFeaturedPoisByProvince = async (req, res) => {
    const { provinceId } = req.params;
    const { type } = req.query;

    if (!type || (type !== 'essential' && type !== 'attraction')) {
        return res.status(400).json({ message: "Tipo non valido. Usare 'essential' o 'attraction'." });
    }

    const whereClause = {
        comune: {
            provinceId: parseInt(provinceId, 10)
        },
        ...(type === 'essential' ? { isEssentialService: true } : { isFeaturedAttraction: true })
    };

    try {
        const pois = await prisma.pointofinterest.findMany({
            where: whereClause,
            include: {
                comune: true // Includiamo il comune per avere il nome
            },
            orderBy: {
                name: 'asc'
            }
        });
        res.status(200).json(pois);
    } catch (error) {
        console.error(`Errore nel recuperare i POI per la provincia ${provinceId}:`, error);
        res.status(500).json({ message: 'Errore del server.' });
    }
};

const createPoi = async (req, res) => {
    // Dati base del POI
    const {
        name, category, address, comuneId, description, website, phoneNumber,
        isEssentialService, isFeaturedAttraction,
        // Dati specifici per categoria
        cuisineType, priceRange, menuUrl, openingHours,
        dieselPrice, petrolPrice,
        hasLeaflet, leafletUrl,
        specialty, hasOutdoorSpace,
        parkingType,
        // ... e altri che potresti voler aggiungere
    } = req.body;

    try {
        const newPoi = await prisma.$transaction(async (tx) => {
            const poi = await tx.pointofinterest.create({ /* ... Crea il POI principale ... */ });

            // Logica per le tabelle specifiche
            if (category === 'Restaurant') {
                await tx.restaurant.create({
                    data: {
                        poiId: poi.id,
                        cuisineType: cuisineType || null,
                        priceRange: priceRange || null,
                        openingHours: openingHours || null,
                        menuUrl: menuUrl || null // Aggiunto
                    }
                });
            } else if (category === 'FuelStation') {
                await tx.fuelstation.create({
                    data: {
                        poiId: poi.id,
                        dieselPrice: dieselPrice ? parseFloat(dieselPrice) : null,
                        petrolPrice: petrolPrice ? parseFloat(petrolPrice) : null,
                        openingHours: openingHours || null,
                    }
                });
            } else if (category === 'Supermarket') {
                await tx.supermarket.create({
                    data: {
                        poiId: poi.id,
                        openingHours: openingHours || null,
                        hasLeaflet: hasLeaflet === 'true', // Aggiunto
                        leafletUrl: leafletUrl || null // Aggiunto
                    }
                });
            } else if (category === 'Bar') {
                await tx.bar.create({
                    data: {
                        poiId: poi.id,
                        openingHours: openingHours || null,
                        specialty: specialty || null, // Aggiunto
                        hasOutdoorSpace: hasOutdoorSpace === 'true', // Aggiunto
                        menuUrl: menuUrl || null // Aggiunto
                    }
                });
            } else if (category === 'Parking') {
                await tx.parking.create({
                    data: {
                        poiId: poi.id,
                        openingHours: openingHours || null,
                        parkingType: parkingType || null // Aggiunto
                    }
                });
            }
            // ... Aggiungi qui gli 'else if' per le altre categorie

            // Logica di upload immagini (rimane uguale)
            if (req.files && req.files.length > 0) { /* ... */ }

            return poi;
        });

        res.status(201).json(newPoi);

    } catch (error) {
        console.error("Errore nella creazione del POI:", error);
        res.status(500).json({ message: "Errore del server durante la creazione del POI." });
    }
};
const updatePoi = async (req, res) => {
    const poiId = parseInt(req.params.id);
    const { name, category, address, ...otherData } = req.body;

    try {
        // Aggiorniamo prima il record principale in pointofinterest
        const updatedPoi = await prisma.pointofinterest.update({
            where: { id: poiId },
            data: {
                name,
                address,
                // Aggiungi qui altri campi base da aggiornare
                isEssentialService: otherData.isEssentialService === 'true',
                isFeaturedAttraction: otherData.isFeaturedAttraction === 'true',
            }
        });

        // Poi, aggiorniamo i dati specifici della categoria
        // Nota: qui si assume che la categoria non cambi.
        // Una logica più complessa potrebbe gestire il cambio di categoria.
        if (category === 'Restaurant') {
            await prisma.restaurant.update({
                where: { poiId: poiId },
                data: {
                    cuisineType: otherData.cuisineType,
                    priceRange: otherData.priceRange,
                }
            });
        }
        // ... Aggiungi qui gli 'else if' per le altre categorie (FuelStation, etc.)

        res.status(200).json(updatedPoi);
    } catch (error) {
        console.error(`Errore nell'aggiornare il POI ${poiId}:`, error);
        res.status(500).json({ message: "Errore del server" });
    }
};

// @desc   Elimina un Punto di Interesse
// @route  DELETE /api/pois/:id
// @access Private (Admin)
const deletePoi = async (req, res) => {
    const poiId = parseInt(req.params.id);
    try {
        // Grazie alla configurazione "onDelete: Cascade" nel nostro schema Prisma (se impostata),
        // eliminando il POI principale verranno eliminate anche le righe collegate nelle altre tabelle.
        // Se non è impostata, dobbiamo eliminarle manualmente con una transazione.
        // Per sicurezza, usiamo una transazione.
        await prisma.$transaction(async (tx) => {
            // 1. Elimina i record collegati (se non c'è onDelete: Cascade)
            await tx.restaurant.deleteMany({ where: { poiId } });
            await tx.fuelstation.deleteMany({ where: { poiId } });
            await tx.image.deleteMany({ where: { poiId } });
            // ... aggiungi deleteMany per tutte le altre tabelle collegate

            // 2. Elimina il record principale
            await tx.pointofinterest.delete({ where: { id: poiId } });
        });

        res.status(200).json({ message: 'Punto di Interesse eliminato con successo.' });
    } catch (error) {
        console.error(`Errore nell'eliminare il POI ${poiId}:`, error);
        res.status(500).json({ message: "Errore del server" });
    }
};

const getPoiDetails = async (req, res) => {
    const poiId = parseInt(req.params.id);
    try {
        const poi = await prisma.pointofinterest.findUnique({
            where: { id: poiId },
            include: { // Includiamo TUTTE le possibili relazioni
                restaurant: true,
                fuelstation: true,
                supermarket: true,
                bar: true,
                parking: true,
                touristattraction: true,
                emergencyservice: true,
                image: true // Usiamo il nome corretto dal tuo schema
            }
        });

        if (!poi) return res.status(404).json({ message: "POI non trovato" });
        res.json(poi);
    } catch (error) {
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

            const newImage = await prisma.image.create({
                data: {
                    url: result.secure_url,
                    poiId: poiId
                }
            });
            uploadedImages.push(newImage);
        }
        res.status(201).json(uploadedImages);
    } catch (error) {
        console.error("Errore nell'aggiungere immagini:", error);
        res.status(500).json({ message: "Errore del server" });
    }
};

// @desc   Elimina un'immagine
// @route  DELETE /api/pois/images/:imageId
// @access Private (Admin)
const deleteImage = async (req, res) => {
    const imageId = parseInt(req.params.imageId);
    try {
        // Opzionale: eliminare anche da Cloudinary
        // const image = await prisma.image.findUnique({ where: { id: imageId } });
        // if (image) {
        //     const publicId = image.url.split('/').pop().split('.')[0];
        //     await cloudinary.uploader.destroy(`fastinfo_pois/${publicId}`);
        // }

        await prisma.image.delete({ where: { id: imageId } });
        res.status(200).json({ message: 'Immagine eliminata con successo.' });
    } catch (error) {
        console.error("Errore nell'eliminare l'immagine:", error);
        res.status(500).json({ message: "Errore del server" });
    }
};

export { getFeaturedPoisByProvince, createPoi, updatePoi, deletePoi, getPoiDetails, addImagesToPoi, deleteImage};