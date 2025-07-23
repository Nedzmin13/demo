// server/src/controllers/bonusesController.js
import prisma from '../config/prismaClient.js';

// @desc   Recupera tutti i bonus (con filtro per la pagina pubblica)
// @route  GET /api/bonuses
// @access Public
const getBonuses = async (req, res) => {
    const { category } = req.query;
    let whereClause = {};
    if (category) {
        const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
        whereClause.category = { equals: capitalizedCategory };
    }
    try {
        const bonuses = await prisma.bonus.findMany({ where: whereClause, orderBy: { expiresAt: 'asc' } });
        res.status(200).json(bonuses);
    } catch (error) { res.status(500).json({ message: 'Errore del server.' }); }
};

// @desc   Crea un nuovo bonus
// @route  POST /api/bonuses/admin
// @access Private
const createBonus = async (req, res) => {
    const { title, description, amount, category, target, expiresAt, howToApply } = req.body;
    try {
        const bonus = await prisma.bonus.create({
            data: { title, description, amount, category, target, expiresAt: new Date(expiresAt), howToApply }
        });
        res.status(201).json(bonus);
    } catch (error) { res.status(500).json({ message: 'Errore del server.' }); }
};

// @desc   Aggiorna un bonus
// @route  PUT /api/bonuses/admin/:id
// @access Private
const updateBonus = async (req, res) => {
    const bonusId = parseInt(req.params.id);
    const { title, description, amount, category, target, expiresAt, howToApply } = req.body;
    try {
        const updatedBonus = await prisma.bonus.update({
            where: { id: bonusId },
            data: { title, description, amount, category, target, expiresAt: new Date(expiresAt), howToApply }
        });
        res.status(200).json(updatedBonus);
    } catch (error) { res.status(500).json({ message: 'Errore del server.' }); }
};

// @desc   Elimina un bonus
// @route  DELETE /api/bonuses/admin/:id
// @access Private
const deleteBonus = async (req, res) => {
    try {
        await prisma.bonus.delete({ where: { id: parseInt(req.params.id) } });
        res.status(200).json({ message: "Bonus eliminato" });
    } catch (error) { res.status(500).json({ message: 'Errore del server.' }); }
};

const getBonusById = async (req, res) => {
    try {
        const bonus = await prisma.bonus.findUnique({
            where: { id: parseInt(req.params.id) }
        });
        if (!bonus) {
            return res.status(404).json({ message: "Bonus non trovato" });
        }
        res.json(bonus);
    } catch (error) {
        res.status(500).json({ message: "Errore del server" });
    }
};

export { getBonuses, createBonus, updateBonus, deleteBonus, getBonusById };