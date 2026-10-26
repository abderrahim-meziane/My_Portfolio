# 📬 API de contact du portfolio

Petit back-end **Node.js** qui reçoit les messages du formulaire de contact et me les envoie par e-mail (Gmail via **Nodemailer**). Il remplace un service tiers comme Formspree.

## Fonctionnement
`POST /api/contact` avec un corps JSON `{ nom, email, message }` :
* vérification des champs (présence, format de l'e-mail, longueur) ;
* **CORS** : seul le site du portfolio peut appeler l'API ;
* **anti-spam** : champ piège invisible (honeypot) et limite de 5 messages / 10 min par adresse IP ;
* envoi de l'e-mail avec `Reply-To` sur l'adresse du visiteur pour pouvoir lui répondre directement.

Les identifiants sont lus dans des variables d'environnement, jamais dans le code.

## Lancer en local
```bash
cd contact-api
npm install
cp .env.example .env   # puis remplir GMAIL_APP_PASSWORD
npm start              # http://localhost:3000/api/contact
```

## Déployer gratuitement sur Vercel
1. Créer un **mot de passe d'application** Gmail : https://myaccount.google.com/apppasswords (la validation en 2 étapes doit être activée).
2. Sur https://vercel.com, se connecter avec GitHub → **Add New… → Project** → importer `My_Portfolio`.
3. **Root Directory** : `contact-api`.
4. **Environment Variables** : `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `MAIL_TO`, `ALLOWED_ORIGIN` (voir `.env.example`).
5. **Deploy**, puis copier l'URL obtenue (ex. `https://contact-api-xxx.vercel.app`).
6. Dans `scripts/scripts.js`, renseigner :
   ```js
   const CONTACT_API_URL = "https://contact-api-xxx.vercel.app/api/contact";
   ```
