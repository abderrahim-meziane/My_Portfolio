// ============================================================
// PARTIE 1 : INTERFACE & ANIMATIONS
// ============================================================
// --- VARIABLES POUR L'ANIMATION ---
const messageH1 = "Bonjour, je suis\nAbderrahim\nMEZIANE";
const messageP = "Etudiant en Licence d'informatique\nà Sorbonne Université.";
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
// PARTIE 2 : GESTION DU FORMULAIRE (FORMSPREE)
// ============================================================

const a = document.getElementById("message_envoye"); // Succès (Vert)
const er = document.getElementById("meserr");        // Erreur (Rouge)
const f = document.querySelector("form");            // Le formulaire
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;     // Validation Email

const FORMSPREE_URL = "https://formspree.io/f/xeoydlpv"; 

if (f) { 
    f.addEventListener("submit", function(e) {// On déclenche cette fonction quand l'utilisateur clique sur "Envoyer"
      
      // 1. On empêche la page de se recharger
      e.preventDefault(); 

      // 2. Récupération des données
      let nom = document.getElementById("nom").value.trim();
      let email = document.getElementById("email").value.trim();
      let message = document.getElementById("message").value.trim();

      let manquants = [];
      let emailInvalide = false; 

      // 3. Validation locale (Navigateur)
      if (nom === "") manquants.push("nom");
      if (email === "") {
          manquants.push("email");
      } else if (!emailRegex.test(email)) {
          emailInvalide = true;
      }
      if (message === "") manquants.push("message");

      // Reset des messages affichés
      er.classList.add("d-none");
      a.classList.add("d-none");

      // Gestion des erreurs de saisie
      if (manquants.length > 0) {
        er.innerText = "⚠️ Veuillez remplir : " + manquants.join(", ");
        er.classList.remove("d-none");
      } else if (emailInvalide) {
        er.innerText = "⚠️ Format d'email invalide (ex: nom@domaine.com)";
        er.classList.remove("d-none");

      } else {
        // Création d'un objet FormData qui contient toutes les infos du formulaire
        let formData = new FormData(f);
        // Appel réseau (AJAX) vers Formspree
        fetch(FORMSPREE_URL, {
            method: "POST", // Méthode d'envoi
            body: formData, // Les données
            headers: {
                'Accept': 'application/json' // On attend une réponse au format JSON
            }
        })
        .then(response => {
          //TRAITEMENT DE LA RÉPONSE DU SERVEUR
            if (response.ok) {
                // --- SUCCÈS ---
                f.style.display = 'none'; // On cache le formulaire
                a.textContent = "✅ Merci ! Votre message a bien été envoyé.";
                a.classList.remove("d-none");
            } else {
                // --- ERREUR FORMSPREE ---
                response.json().then(data => {
                    if (Object.hasOwn(data, 'errors')) {
                        er.innerText = "❌ " + data["errors"].map(error => error["message"]).join(", ");
                    } else {
                        er.innerText = "❌ Une erreur s'est produite lors de l'envoi.";
                    }
                    er.classList.remove("d-none");
                });
            }
        })
        .catch(error => {
            // --- ERREUR RÉSEAU ---
            console.error("Erreur Fetch:", error);
            er.innerText = "❌ Impossible de contacter le serveur. Vérifiez votre connexion.";
            er.classList.remove("d-none");
        });
      }
    });
}

