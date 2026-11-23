/** Télécommande de démonstration : pilote tous les écrans ouverts (même navigateur) par un canal de diffusion local. */
import { icone } from "./icones.js";

const canal = "BroadcastChannel" in window ? new BroadcastChannel("leader-patrimoine-demo") : null;
export const envoyer = (m) => canal?.postMessage({ ...m, de: "telecommande" });
export const ecouter = (f) => canal && canal.addEventListener("message", (e) => f(e.data));

const SCENARIOS = [
  ["deverrouiller", "Déverrouiller (Face ID)", "faceid", "Ouvre le cockpit, avec Face ID sur le téléphone"],
  ["demande", "Une demande arrive du site", "demandes", "Notification + demande qualifiée en tête de liste"],
  ["reservation", "Un client réserve en ligne", "agenda", "Le rendez-vous se pose seul dans l'agenda"],
  ["page-resa", "Montrer la page de réservation", "lien", "Ce que voit le client pour prendre rendez-vous"],
  ["signature", "Signature électronique reçue", "signature", "Lettre de mission + adéquation signées"],
  ["releves", "Import des relevés partenaires", "rafraichir", "Les encours se mettent à jour"],
  ["opportunite", "Alerte du radar", "radar", "Nouvelle opportunité détectée"],
  ["assistant", "Question à l'assistant", "etoile", "« Qui proposer pour un PER ? »"],
];
const ECRANS = [
  ["accueil", "Accueil"],
  ["agenda", "Agenda"],
  ["demandes", "Demandes"],
  ["clients", "Clients"],
  ["fiche", "Fiche DELORME"],
  ["portefeuille", "Encours"],
  ["radar", "Radar"],
  ["simulateurs", "Simulateurs"],
  ["conformite", "Conformité"],
  ["remuneration", "Rémunération"],
  ["communication", "Relances"],
  ["site", "Site"],
  ["reglages", "Réglages"],
];

export function monterTelecommande(zone, { avecFenetre = true } = {}) {
  let prenom = "";
  try {
    prenom = localStorage.getItem("lp-prenom") ?? "Serkan";
  } catch {}
  zone.innerHTML = `
    <div class="tc-section"><h3>Scénarios · touches 1 à 8</h3>
      ${SCENARIOS.map(([id, t, i, d], n) => `<button class="tc-scenario" data-sc="${id}"><span class="tc-num">${n + 1}</span><span class="tc-ico">${icone(i)}</span><span><strong>${t}</strong><small>${d}</small></span></button>`).join("")}
    </div>
    <div class="tc-section"><h3>Aller à l'écran</h3><div class="tc-puces">${ECRANS.map(([id, t]) => `<button data-ecran="${id}">${t}</button>`).join("")}</div></div>
    <div class="tc-section"><h3>Réglages de la démo</h3>
      <label class="tc-champ">Prénom du gérant (accueil personnalisé)<input id="tc-prenom" value="${prenom.replace(/"/g, "&quot;")}" placeholder="ex. Alexandre"></label>
      <div class="tc-puces"><button data-theme="nuit">${icone("lune")} Nuit</button><button data-theme="jour">${icone("soleil")} Jour</button><button data-verrou>${icone("cadenas")} Reverrouiller</button><button data-reset>${icone("rafraichir")} Remettre à zéro</button></div>
      ${avecFenetre ? `<button class="tc-lien" data-fenetre>${icone("telecommande")} Ouvrir la télécommande dans une fenêtre à part</button>` : ""}
    </div>`;
  zone.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.sc) envoyer({ t: b.dataset.sc });
    if (b.dataset.ecran) envoyer(b.dataset.ecran === "fiche" ? { t: "aller", vue: "clients", params: { id: "delorme" } } : { t: "aller", vue: b.dataset.ecran });
    if (b.dataset.theme) envoyer({ t: "theme", v: b.dataset.theme });
    if (b.hasAttribute("data-verrou")) envoyer({ t: "verrouiller" });
    if (b.hasAttribute("data-reset")) envoyer({ t: "reinitialiser" });
    if (b.hasAttribute("data-fenetre")) window.open("telecommande.html", "telecommande", "width=420,height=860");
    b.classList.add("tc-ok");
    setTimeout(() => b.classList.remove("tc-ok"), 500);
  });
  zone.querySelector("#tc-prenom").addEventListener("change", (e) => {
    try {
      localStorage.setItem("lp-prenom", e.target.value.trim());
    } catch {}
    envoyer({ t: "prenom", v: e.target.value.trim() });
  });
  document.addEventListener("keydown", (e) => {
    if (e.target.closest?.("input")) return;
    const n = Number(e.key);
    if (n >= 1 && n <= SCENARIOS.length) envoyer({ t: SCENARIOS[n - 1][0] });
  });
}
