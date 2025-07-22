// server/createAdmin.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline/promises';

const prisma = new PrismaClient();
const rl = readline.createInterface({ input, output });

async function main() {
    console.log("--- Creazione Utente Amministratore ---");
    const email = await rl.question('Inserisci l\'email dell\'admin: ');
    const password = await rl.question('Inserisci la password dell\'admin: ');

    if (!email || !password) {
        console.error("Email e password sono obbligatori.");
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const admin = await prisma.admin.create({
            data: {
                email: email,
                password: hashedPassword,
            },
        });
        console.log(`✅ Utente admin creato con successo: ${admin.email}`);
    } catch (error) {
        if (error.code === 'P2002') {
            console.error("❌ Errore: Esiste già un utente con questa email.");
        } else {
            console.error("❌ Errore durante la creazione dell'utente:", error);
        }
    } finally {
        await prisma.$disconnect();
        rl.close();
    }
}

main();