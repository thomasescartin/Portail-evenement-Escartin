// Variables gloables

let eventsData = [];
let favoris = [];
const API_URL =
  "https://demo.theeventscalendar.com/wp-json/tribe/events/v1/events";

//Eléments du DOM
const header = document.querySelector("header");
const section = document.querySelector("section");

// Création dynamique
const btnTheme = document.createElement("button");
const eventsContainer = document.createElement("div");
const favorisDiv = document.createElement("div");

// Bouton thème
btnTheme.id = "theme-btn";

// Containers
eventsContainer.id = "events";
favorisDiv.id = "favoris";

header.appendChild(btnTheme);
section.appendChild(eventsContainer);
section.appendChild(favorisDiv);

//  Cookie
function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value
  )};expires=${date.toUTCString()};path=/`;
}

function getCookie(name) {
  const v = `; ${document.cookie}`;
  const parts = v.split(`; ${encodeURIComponent(name)}=`);
  if (parts.length === 2)
    return decodeURIComponent(parts.pop().split(";").shift());
  return undefined;
}

//  Thème clair / sombre
function applyThemeFromCookie() {
  const theme = getCookie("theme");
  if (theme === "dark") {
    document.body.classList.add("dark");
    btnTheme.textContent = "Mode clair";
  } else {
    document.body.classList.remove("dark");
    btnTheme.textContent = "Mode sombre";
  }
}

btnTheme.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  btnTheme.textContent = isDark ? "Mode clair" : "Mode sombre";
  // écriture cookie 365 jours
  setCookie("theme", isDark ? "dark" : "light", 365);
});
//  LOCAL STORAGE
function chargerFavoris() {
  try {
    favoris = JSON.parse(localStorage.getItem("favoris")) || [];
  } catch (e) {
    favoris = [];
  }
}

function sauvegarderFavoris() {
  localStorage.setItem("favoris", JSON.stringify(favoris));
}

//  API FETCH
async function chargerEvenements() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      console.warn(
        "Fetch events a retourné un statut non OK :",
        response.status
      );
      eventsContainer.innerHTML =
        "<p>Impossible de charger les événements (API).</p>";
      return;
    }
    const data = await response.json();
    eventsData = Array.isArray(data.events) ? data.events : [];
    afficherEvenements();
  } catch (err) {
    console.error("Erreur fetch événements :", err);
    eventsContainer.innerHTML =
      "<p>Erreur réseau lors du chargement des événements.</p>";
  }
}

//  AFFICHAGE DES EVENTS
function clearContainer(container) {
  while (container.firstChild) container.removeChild(container.firstChild);
}

function afficherEvenements() {
  clearContainer(eventsContainer);
  const titre = document.createElement("h2");
  titre.textContent = "Événements disponibles";
  eventsContainer.appendChild(titre);

  if (!eventsData.length) {
    const p = document.createElement("p");
    p.textContent = "Aucun événement trouvé.";
    eventsContainer.appendChild(p);
    return;
  }

  eventsData.forEach((evt) => {
    const card = document.createElement("div");
    card.className = "card";

    const venueText =
      evt && evt.venue && evt.venue.venue ? evt.venue.venue : "Non spécifié";
    const startDate =
      evt && evt.start_date ? evt.start_date : "Date non définie";

    card.innerHTML = `
      <h3>${evt.title || "Titre non fourni"}</h3>
      <p><strong>Date :</strong> ${startDate}</p>
      <p><strong>Lieu :</strong> ${venueText}</p>
      <button class="details-btn">Détails</button>
      <button class="favoris-btn">Ajouter aux favoris</button>
    `;

    // Bouton Détails
    const detailsBtn = card.querySelector(".details-btn");
    if (detailsBtn)
      detailsBtn.addEventListener("click", () => afficherModale(evt));

    // Bouton Favoris
    const favBtn = card.querySelector(".favoris-btn");
    if (favBtn) favBtn.addEventListener("click", () => ajouterAuxFavoris(evt));

    eventsContainer.appendChild(card);
  });
}
