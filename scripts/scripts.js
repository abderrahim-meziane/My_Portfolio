// ============================================================
// PARTIE 1 : INTERFACE & ANIMATIONS
// ============================================================
// --- VARIABLES POUR L'ANIMATION ---
const messageH1 = "Bonjour, je suis\nAbderrahim\nMEZIANE";
const messageP = "Étudiant en L3 Informatique\nà Sorbonne Université";
const elementH1 = document.getElementById("texteAnime");
const elementP = document.getElementById("paragrapheAnime");
const vitesse = 55; // Vitesse en ms
let iH1 = 0; 
let iP = 0;
document.addEventListener('DOMContentLoaded', function() {
    // --- A. GESTION DU MENU MOBILE (FERMETURE AUTO) ---
    const menuCollapseElement = document.getElementById('monMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            // Si le menu est ouvert (classe 'show'), on le ferme après le clic
            if (menuCollapseElement.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(menuCollapseElement, {
                    toggle: false 
                });
                bsCollapse.hide();
            }
        });
    });

    // --- B. LANCEMENT DE L'ANIMATION MACHINE À ÉCRIRE ---
    // On vérifie que les éléments existent avant de lancer
    if(elementH1 && elementP) {
        elementH1.innerHTML = ""; // On vide le texte initial
        elementP.innerHTML = "";
        elementH1.classList.add("curseur-actif"); // On allume le curseur
        machineAEcrireH1(); 
    }
    // --- GESTION DU BOUTON RETOUR EN HAUT ---
    const btnScroll = document.getElementById('scrollTopBtn');

    if (btnScroll) { // Petite sécurité : on vérifie que le bouton existe
        
        // 1. On écoute le scroll
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                btnScroll.classList.add('show'); // Ajoute la classe CSS qui met opacity: 1
            } else {
                btnScroll.classList.remove('show');
            }
        });

        // 2. On écoute le clic
        btnScroll.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    } else {
        console.error("Erreur : Le bouton avec l'ID 'scrollTopBtn' est introuvable dans le HTML.");
    }

});
// Fonction écriture Titre
function machineAEcrireH1() {
  if (iH1 < messageH1.length) {
    if (messageH1.charAt(iH1) === "\n") {
      elementH1.innerHTML += "<br>";
    } else {
      elementH1.innerHTML += messageH1.charAt(iH1);
    }
    iH1++;
    setTimeout(machineAEcrireH1, vitesse);
  } else {
    // Transition vers le paragraphe
    elementH1.classList.remove("curseur-actif");
    elementP.classList.add("curseur-actif");
    machineAEcrireP();
  }
}

// Fonction écriture Paragraphe
function machineAEcrireP() {
  if (iP < messageP.length) {
    if (messageP.charAt(iP) === "\n") {
      elementP.innerHTML += "<br>";
    } else {
      elementP.innerHTML += messageP.charAt(iP);
    }
    iP++;
    setTimeout(machineAEcrireP, vitesse);
  }else {
    // On retire la classe 'curseur-actif' pour faire disparaître le trait |
    elementP.classList.remove("curseur-actif");
  }
}



// ============================================================
// PARTIE 2 : GESTION DU FORMULAIRE (MON PROPRE SERVEUR NODE.JS)
// ============================================================

// Adresse du serveur de contact (dossier contact-api/ déployé sur Vercel).
// Exemple : "https://mon-projet.vercel.app/api/contact"
// Tant qu'elle est vide, le formulaire ouvre la messagerie du visiteur (mailto).
const CONTACT_API_URL = "";
const EMAIL_CONTACT = "rahimdest@gmail.com";

const a = document.getElementById("message_envoye"); // Succès (Vert)
const er = document.getElementById("meserr");        // Erreur (Rouge)
const f = document.getElementById("contact-form");   // Le formulaire
const btnEnvoyer = document.getElementById("sendmsg");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;     // Validation Email

function afficherErreur(texte) {
    er.innerText = texte;
    er.classList.remove("d-none");
}

function afficherSucces(texte) {
    f.style.display = 'none'; // On cache le formulaire
    a.textContent = texte;
    a.classList.remove("d-none");
}

if (f) {
    f.addEventListener("submit", async function(e) {// On déclenche cette fonction quand l'utilisateur clique sur "Envoyer"

      // 1. On empêche la page de se recharger
      e.preventDefault();

      // 2. Récupération des données
      let nom = document.getElementById("nom").value.trim();
      let email = document.getElementById("email").value.trim();
      let message = document.getElementById("message").value.trim();
      let site = document.getElementById("site").value; // Champ piège anti-spam

      let manquants = [];

      // 3. Validation locale (Navigateur)
      if (nom === "") manquants.push("nom");
      if (email === "") manquants.push("email");
      if (message === "") manquants.push("message");

      // Reset des messages affichés
      er.classList.add("d-none");
      a.classList.add("d-none");

      // Gestion des erreurs de saisie
      if (manquants.length > 0) {
        afficherErreur("⚠️ Veuillez remplir : " + manquants.join(", "));
        return;
      }
      if (!emailRegex.test(email)) {
        afficherErreur("⚠️ Format d'email invalide (ex: nom@domaine.com)");
        return;
      }

      // 4. Pas encore de serveur configuré : on ouvre la messagerie du visiteur
      if (CONTACT_API_URL === "") {
        const sujet = encodeURIComponent("Message de " + nom + " via le portfolio");
        const corps = encodeURIComponent(message + "\n\n" + nom + " (" + email + ")");
        window.location.href = "mailto:" + EMAIL_CONTACT + "?subject=" + sujet + "&body=" + corps;
        return;
      }

      // 5. Envoi au serveur Node.js
      btnEnvoyer.disabled = true;
      btnEnvoyer.textContent = "Envoi en cours…";

      try {
        const response = await fetch(CONTACT_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nom, email, message, site })
        });
        const data = await response.json().catch(() => ({}));

        if (response.ok) {
            // --- SUCCÈS ---
            afficherSucces("✅ Merci ! Votre message a bien été envoyé.");
        } else {
            // --- ERREUR RENVOYÉE PAR LE SERVEUR ---
            afficherErreur("❌ " + (data.error || "Une erreur s'est produite lors de l'envoi."));
        }
      } catch (error) {
        // --- ERREUR RÉSEAU ---
        console.error("Erreur Fetch:", error);
        afficherErreur("❌ Impossible de contacter le serveur. Vous pouvez m'écrire à " + EMAIL_CONTACT);
      } finally {
        btnEnvoyer.disabled = false;
        btnEnvoyer.textContent = "Envoyer";
      }
    });
}
