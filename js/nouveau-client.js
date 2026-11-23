/**
 * Nouveau client (maquette) : particulier ou professionnel, recherche par SIREN qui pré-remplit la société, aide à la
 * saisie de l'adresse. Dans le cockpit type, ces deux recherches interrogent les services publics (annuaire des
 * entreprises, base adresse nationale) ; ici tout est FICTIF et rien ne sort de l'ordinateur.
 */
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const sans = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Entreprises FICTIVES de la démonstration (numéros SIREN inventés, clé de contrôle valide). */
const ENTREPRISES = {
  "999123458": { raison: "ATELIER DUVAL MENUISERIE", forme: "SAS", naf: "16.23Z · Fabrication de menuiseries en bois", adresse: "18 Rue de la Charité", cp: "69002", ville: "Lyon", tva: "FR12999123458", dirigeant: "Marc DUVAL (président)", creation: "14/03/2011", effectif: "10 à 19 salariés" },
  "999456783": { raison: "CABINET MÉDICAL DES BROTTEAUX", forme: "SCM", naf: "86.21Z · Activité des médecins généralistes", adresse: "5 Boulevard des Brotteaux", cp: "69006", ville: "Lyon", tva: "FR45999456783", dirigeant: "Dr Claire FONTAINE (gérante)", creation: "02/09/2016", effectif: "3 à 5 salariés" },
  "999789019": { raison: "HORIZON TRANSPORTS RHÔNE", forme: "SARL", naf: "49.41A · Transports routiers de fret", adresse: "40 Avenue Jean Jaurès", cp: "69007", ville: "Lyon", tva: "FR78999789019", dirigeant: "Nadia BENALI (gérante)", creation: "21/06/2005", effectif: "20 à 49 salariés" },
};
export const SIREN_DEMO = "999 123 458";

/** Clé de contrôle d'un SIREN (algorithme de Luhn). */
export function sirenValide(s) {
  if (!/^\d{9}$/.test(s)) return false;
  let total = 0;
  [...s].forEach((c, i) => {
    let n = Number(c);
    if (i % 2 === 1) n = n * 2 > 9 ? n * 2 - 9 : n * 2;
    total += n;
  });
  return total % 10 === 0;
}
export const chercherSiren = (s) => ENTREPRISES[s] ?? null;

/** Rues FICTIVES/génériques pour l'aide à la saisie de l'adresse (région lyonnaise). */
const RUES = [
  ["Rue de la République", "69002", "Lyon"], ["Rue de la Charité", "69002", "Lyon"], ["Rue Victor Hugo", "69002", "Lyon"],
  ["Avenue Jean Jaurès", "69007", "Lyon"], ["Boulevard des Brotteaux", "69006", "Lyon"], ["Rue Garibaldi", "69006", "Lyon"],
  ["Cours Lafayette", "69003", "Lyon"], ["Rue de la Part-Dieu", "69003", "Lyon"], ["Avenue de Saxe", "69006", "Lyon"],
  ["Chemin des Vignes", "69130", "Écully"], ["Avenue Foch", "69006", "Lyon"], ["Rue du Plat", "69002", "Lyon"],
  ["Route de Lyon", "69160", "Tassin-la-Demi-Lune"], ["Rue Pasteur", "69300", "Caluire-et-Cuire"], ["Grande Rue", "69110", "Sainte-Foy-lès-Lyon"],
];
export function suggestionsAdresse(q) {
  const m = q.trim().match(/^(\d+\s*(?:bis|ter)?)?\s*,?\s*(.*)$/i);
  const num = (m?.[1] ?? "").trim();
  const mots = sans(m?.[2] ?? "").split(/\s+/).filter((x) => x.length > 1);
  if (!mots.length) return [];
  return RUES.filter(([r, cp, v]) => mots.every((x) => sans(`${r} ${cp} ${v}`).includes(x)))
    .slice(0, 5)
    .map(([r, cp, v]) => ({ adresse: `${num ? num + " " : ""}${r}`, cp, ville: v }));
}

const champ = (id, lib, val = "", extra = "") => `<label class="champ-reglage">${lib}<input id="${id}" value="${esc(val)}" autocomplete="off" ${extra}></label>`;
const adresse = (pref) => `
  <div class="champ-adresse">
    ${champ(`${pref}-adresse`, "Adresse", "", 'placeholder="Commencez à taper : 12 rue de la…" data-adresse="' + pref + '"')}
    <div class="propositions-adresse verre" id="${pref}-propositions" hidden></div>
  </div>
  <div class="grille" style="grid-template-columns:120px 1fr;gap:10px">${champ(`${pref}-cp`, "Code postal")}${champ(`${pref}-ville`, "Ville")}</div>`;

export function formulaireClient(icone) {
  return `<div class="feuille-tete"><span class="carte-ico">${icone("clients")}</span><h2>Nouveau client</h2><button class="btn btn-icone" data-action="fermer">${icone("fermer")}</button></div>
  <div class="segments-nc">
    <button class="actif" data-action="nc-type" data-t="particulier">${icone("famille")} Particulier</button>
    <button data-action="nc-type" data-t="pro">${icone("document")} Professionnel</button>
  </div>

  <div id="nc-particulier">
    <div class="grille g-2" style="gap:10px">
      <label class="champ-reglage">Civilité<select id="nc-civilite" class="champ-select"><option>Madame</option><option>Monsieur</option><option>Madame et Monsieur</option></select></label>
      <label class="champ-reglage">Situation<select id="nc-situation" class="champ-select"><option>Personne seule</option><option>Couple marié</option><option>Couple pacsé</option><option>Union libre</option></select></label>
      ${champ("nc-prenom", "Prénom")}${champ("nc-nom", "Nom")}
      ${champ("nc-mail", "E-mail", "", 'type="email"')}${champ("nc-tel", "Téléphone", "", 'inputmode="tel"')}
    </div>
    <div style="margin-top:10px">${adresse("nc")}</div>
  </div>

  <div id="nc-pro" hidden>
    <div class="recherche-siren">
      ${champ("nc-siren", "Numéro SIREN (9 chiffres)", "", `inputmode="numeric" maxlength="11" placeholder="Ex. : ${SIREN_DEMO}"`)}
      <button class="btn btn-or" data-action="nc-siren">${icone("recherche")} Rechercher</button>
    </div>
    <p id="nc-siren-info" class="info-siren">Tapez le SIREN : la société se remplit toute seule (nom, adresse, TVA, dirigeant…).</p>
    <div id="nc-societe" hidden>
      <div class="grille g-2" style="gap:10px">
        ${champ("nc-raison", "Société")}${champ("nc-forme", "Forme juridique")}
        ${champ("nc-naf", "Activité")}${champ("nc-tva", "N° TVA intracommunautaire")}
        ${champ("nc-dirigeant", "Dirigeant")}${champ("nc-creation", "Créée le")}
      </div>
      <div style="margin-top:10px">${adresse("ncp")}</div>
      <h3 class="titre-contact">${icone("clients")} Contact dans la société <span>à écrire</span></h3>
      <div class="grille g-2" style="gap:10px">
        ${champ("ncp-prenom", "Prénom")}${champ("ncp-nom", "Nom")}
        ${champ("ncp-fonction", "Fonction", "", 'placeholder="Ex. : gérant, DAF…"')}${champ("ncp-tel", "Téléphone", "", 'inputmode="tel"')}
        ${champ("ncp-mail", "E-mail", "", 'type="email"')}
      </div>
    </div>
  </div>

  <label class="champ-reglage" style="margin-top:12px">C'est…<select id="nc-statut" class="champ-select"><option>Un prospect</option><option>Un client</option></select></label>
  <p id="nc-erreur" style="margin:10px 0 0;color:var(--rouge);min-height:18px;font-size:12.5px"></p>
  <p style="margin:0;font-size:12px;color:var(--texte-3)">À la création, le questionnaire de découverte part tout seul : la fiche se remplira avec ses réponses.</p>
  <div class="pied-feuille"><button class="btn" data-action="fermer">Annuler</button><button class="btn btn-or" data-action="nc-creer">${icone("coche")} Créer la fiche</button></div>`;
}

/** Fiche minimale d'un nouveau client ou prospect (complétée ensuite par le questionnaire de découverte). */
export function ficheNouvelle(id, d) {
  const initiales = ((d.prenom?.[0] ?? "") + (d.nom?.[0] ?? "")).toUpperCase() || "?";
  return {
    id,
    nom: d.nom.toUpperCase(),
    prenom: d.prenom,
    type: d.pro ? `Professionnel · ${d.raison}` : d.situation,
    initiales,
    age: 0,
    profession: d.pro ? `${d.fonction || "Contact"} · ${d.raison}` : "À compléter",
    ville: d.ville || "—",
    segment: d.statut === "Un prospect" ? "Prospect" : "Essentiel",
    depuis: "2026",
    tmi: 0,
    revenus: 0,
    profil: { risque: 0, horizon: "À définir", experience: "À définir", esg: "Non renseigné", date: "2020-01-01" },
    liquidites: 0,
    contrats: [],
    conformite: { kyc: "2020-01-01", identite: "2020-01-01", adequation: "2020-01-01", vigilance: "Standard", ppe: false },
    prochain: null,
    remuneration: { honoraires: 0, encours: 0, entree: 0 },
    courte: true,
    nouveau: true,
    pro: d.pro ? { raison: d.raison, forme: d.forme, siren: d.siren, tva: d.tva, naf: d.naf, dirigeant: d.dirigeant } : undefined,
    coordonnees: { mail: d.mail, tel: d.tel, adresse: d.adresse, cp: d.cp, ville: d.ville },
  };
}
