// ============================================================
// API DE CONTACT : reçoit le formulaire du portfolio et m'envoie un e-mail
// Fonction serverless (Vercel) : POST /api/contact
// ============================================================
import nodemailer from "nodemailer";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Limites de taille des champs
const MAX = { nom: 100, email: 200, message: 5000 };

// Anti-spam simple : 5 messages max par adresse IP toutes les 10 minutes
const FENETRE_MS = 10 * 60 * 1000;
const MAX_PAR_FENETRE = 5;
const historique = new Map(); // ip -> [dates d'envoi]

function tropDeMessages(ip) {
    const maintenant = Date.now();
    const envois = (historique.get(ip) || []).filter(t => maintenant - t < FENETRE_MS);
    envois.push(maintenant);
    historique.set(ip, envois);
    return envois.length > MAX_PAR_FENETRE;
}

// Le transporteur SMTP est créé une seule fois puis réutilisé
let transporteur;
function getTransporteur() {
    if (!transporteur) {
        transporteur = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });
    }
    return transporteur;
}

function repondre(res, statut, donnees) {
    res.statusCode = statut;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(donnees));
}

// Lit le corps JSON de la requête (déjà lu par Vercel, à lire soi-même en local)
async function lireCorps(req) {
    if (req.body !== undefined) {
        return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    }
    let brut = "";
    for await (const morceau of req) {
        brut += morceau;
        if (brut.length > 20000) throw new Error("Corps trop volumineux");
    }
    return brut ? JSON.parse(brut) : {};
}

export default async function handler(req, res) {
    // --- CORS : seul mon portfolio a le droit d'appeler l'API ---
    const originesAutorisees = (process.env.ALLOWED_ORIGIN || "").split(",").map(o => o.trim());
    const origine = req.headers.origin;
    if (origine && originesAutorisees.includes(origine)) {
        res.setHeader("Access-Control-Allow-Origin", origine);
        res.setHeader("Vary", "Origin");
    }
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.statusCode = 204;
        return res.end();
    }
    if (req.method !== "POST") {
        return repondre(res, 405, { error: "Méthode non autorisée." });
    }
    if (!origine || !originesAutorisees.includes(origine)) {
        return repondre(res, 403, { error: "Origine non autorisée." });
    }

    // --- Lecture et validation des données ---
    let corps;
    try {
        corps = await lireCorps(req);
    } catch {
        return repondre(res, 400, { error: "Requête invalide." });
    }

    const nom = String(corps.nom || "").trim();
    const email = String(corps.email || "").trim();
    const message = String(corps.message || "").trim();
    const site = String(corps.site || "");

    // Champ piège rempli = robot : on fait semblant que tout va bien
    if (site !== "") {
        return repondre(res, 200, { ok: true });
    }

    if (!nom || !email || !message) {
        return repondre(res, 400, { error: "Veuillez remplir tous les champs." });
    }
    if (!emailRegex.test(email)) {
        return repondre(res, 400, { error: "Format d'email invalide." });
    }
    if (nom.length > MAX.nom || email.length > MAX.email || message.length > MAX.message) {
        return repondre(res, 400, { error: "Un des champs est trop long." });
    }

    const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "inconnue").split(",")[0].trim();
    if (tropDeMessages(ip)) {
        return repondre(res, 429, { error: "Trop de messages envoyés, réessayez plus tard." });
    }

    // --- Envoi de l'e-mail ---
    try {
        await getTransporteur().sendMail({
            from: `"Portfolio" <${process.env.GMAIL_USER}>`,
            to: process.env.MAIL_TO || process.env.GMAIL_USER,
            replyTo: `"${nom.replace(/"/g, "")}" <${email}>`, // « Répondre » écrit directement au visiteur
            subject: `Nouveau message de ${nom} (portfolio)`,
            text: `Nom : ${nom}\nEmail : ${email}\n\n${message}`
        });
        return repondre(res, 200, { ok: true });
    } catch (erreur) {
        console.error("Erreur d'envoi :", erreur.message);
        return repondre(res, 500, { error: "L'envoi a échoué, réessayez plus tard." });
    }
}
