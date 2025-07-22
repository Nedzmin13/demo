import prisma from '../config/prismaClient.js';

// GET /api/strikes (sia pubblico che admin)
export const getAllStrikes = async (req, res) => {
    try {
        const strikes = await prisma.transportstrike.findMany({ orderBy: { date: 'asc' } });
        res.json(strikes);
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

// POST /api/strikes/admin (Admin)
export const createStrike = async (req, res) => {
    const { type, zone, duration, services, date } = req.body;
    try {
        if (!type || !zone || !duration || !services || !date) {
            return res.status(400).json({ message: "Tutti i campi sono obbligatori." });
        }
        const strike = await prisma.transportstrike.create({
            // Rimuoviamo createdAt dai dati
            data: {
                type,
                zone,
                duration,
                services,
                date: new Date(date)
            }
        });
        res.status(201).json(strike);
    } catch (error) {
        console.error("Errore creazione sciopero:", error);
        res.status(500).json({ message: "Errore server" });
    }
};

export const updateStrike = async (req, res) => {
    const { type, zone, duration, services, date } = req.body;
    try {
        if (!type || !zone || !duration || !services || !date) {
            return res.status(400).json({ message: "Tutti i campi sono obbligatori." });
        }
        const strike = await prisma.transportstrike.update({
            where: { id: parseInt(req.params.id) },
            data: {
                type,
                zone,
                duration,
                services,
                date: new Date(date)
            }
        });
        res.json(strike);
    } catch (error) {
        console.error("Errore aggiornamento sciopero:", error); // Aggiungiamo un log dettagliato
        res.status(500).json({ message: "Errore server" });
    }
};

// DELETE /api/strikes/admin/:id (Admin)
export const deleteStrike = async (req, res) => {
    try {
        await prisma.transportstrike.delete({ where: { id: parseInt(req.params.id) } });
        res.status(200).json({ message: "Sciopero eliminato" });
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};