import prisma from '../config/prismaClient.js';

// GET /api/traffic (sia pubblico che admin)
export const getAllTrafficAlerts = async (req, res) => {
    try {
        const alerts = await prisma.trafficalert.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(alerts);
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

// POST /api/traffic/admin
export const createTrafficAlert = async (req, res) => {
    const { highway, stretch, problem, alternative, delay } = req.body;
    try {
        if (!highway || !stretch || !problem || !alternative || !delay) {
            return res.status(400).json({ message: "Tutti i campi sono obbligatori." });
        }
        const alert = await prisma.trafficalert.create({
            // Rimuoviamo createdAt dai dati
            data: { highway, stretch, problem, alternative, delay }
        });
        res.status(201).json(alert);
    } catch (error) {
        console.error("Errore creazione allerta traffico:", error);
        res.status(500).json({ message: "Errore server" });
    }
};

// PUT /api/traffic/admin/:id
export const updateTrafficAlert = async (req, res) => {
    const { highway, stretch, problem, alternative, delay } = req.body;
    try {
        const alert = await prisma.trafficalert.update({
            where: { id: parseInt(req.params.id) },
            data: { highway, stretch, problem, alternative, delay }
        });
        res.json(alert);
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

// DELETE /api/traffic/admin/:id
export const deleteTrafficAlert = async (req, res) => {
    try {
        await prisma.trafficalert.delete({ where: { id: parseInt(req.params.id) } });
        res.status(200).json({ message: "Allerta eliminata" });
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};