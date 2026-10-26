// ============================================================
// SERVEUR LOCAL pour tester l'API sans la déployer
// Lancement : npm start  (lit les variables du fichier .env)
// ============================================================
import http from "node:http";
import handler from "./api/contact.js";

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
    if (req.url === "/api/contact") {
        handler(req, res);
    } else {
        res.statusCode = 404;
        res.end("Introuvable");
    }
}).listen(PORT, () => {
    console.log(`API de contact sur http://localhost:${PORT}/api/contact`);
});
