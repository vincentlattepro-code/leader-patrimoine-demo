/**
 * Support (maquette) : le gérant déclare un problème ou demande un ajout à SYNIUM, et suit la réponse par un statut en
 * couleur. Mêmes mots et mêmes couleurs que l'onglet natif du cockpit type (contrat d'échange 1.3.0, § 12).
 * Données FICTIVES. Le statut est décidé par l'agence, jamais par le cockpit.
 */
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const AGENCE = "SYNIUM";

/** Ce que le client peut demander (codes du contrat § 12). */
export const NATURES = [
  { valeur: "probleme", libelle: "Un problème", aide: "Quelque chose ne marche pas comme prévu" },
  { valeur: "fonction", libelle: "Une nouvelle fonction", aide: "Le cockpit pourrait faire quelque chose de plus" },
  { valeur: "champ", libelle: "Une information à ajouter", aide: "Une case de plus à remplir dans une fiche" },
  { valeur: "automatisation", libelle: "Une automatisation", aide: "Une tâche qui se ferait toute seule" },
  { valeur: "autre", libelle: "Autre chose", aide: "Une question, une idée…" },
];
const LIBELLE_NATURE = Object.fromEntries(NATURES.map((n) => [n.valeur, n.libelle]));

const quand = (iso) => new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(":", " h ");
const rdv = (iso) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} à ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", " h ")}`;
};

/** Statut → [libellé, couleur]. Rouge = problème neuf, bleu = demande d'ajout neuve, orange = en cours, vert = fait, gris = non retenue. */
export function libelleStatut(d) {
  switch (d.statut) {
    case "envoi":
      return ["En cours d'envoi", ""];
    case "correction-en-cours":
      return ["Correction en cours", "orange"];
    case "ajout-en-cours":
      return ["Ajout en cours", "orange"];
    case "corrige":
      return ["Corrigé", "vert"];
    case "ajoute":
      return ["Ajouté", "vert"];
    case "refusee":
      return ["Non retenue", "gris"];
    case "rdv-demande":
      return ["Rendez-vous client demandé", "orange"];
    case "rdv-pris":
      return [`RDV pris pour le ${rdv(d.rdvLe)}`, "vert"];
    default:
      return d.nature === "probleme" ? ["Problème technique", "rouge"] : ["Demande d'ajout", "bleu"];
  }
}

/** Demandes d'exemple (fictives), une par couleur de statut. */
export const DEMANDES_SUPPORT = [
  { id: "s1", nature: "probleme", titre: "Les relevés d'Atlantique Prévoyance ne sont pas arrivés", texte: "Ce matin, les encours d'Atlantique Prévoyance n'ont pas bougé depuis vendredi. Les autres partenaires sont à jour.", creeLe: "2026-11-24T08:12:00", statut: null },
  { id: "s2", nature: "champ", titre: "Ajouter le régime matrimonial dans la fiche", texte: "J'aimerais une case « régime matrimonial » (communauté, séparation de biens…) dans la fiche patrimoniale, utile pour les successions.", creeLe: "2026-11-23T16:40:00", statut: null },
  { id: "s3", nature: "probleme", titre: "Un rappel SMS parti deux fois", texte: "Mme NGUYEN a reçu deux fois le SMS de rappel de son rendez-vous.", creeLe: "2026-11-22T10:05:00", statut: "correction-en-cours" },
  { id: "s4", nature: "automatisation", titre: "Relancer les lettres de mission non signées", texte: "Pouvez-vous ajouter une relance automatique quand une lettre de mission n'est pas signée au bout de 7 jours ?", creeLe: "2026-11-20T09:30:00", statut: "rdv-pris", rdvLe: "2026-12-02T10:30:00" },
  { id: "s5", nature: "fonction", titre: "Un simulateur de donation", texte: "Ce serait bien de simuler une donation aux enfants, avec les abattements.", creeLe: "2026-11-18T14:00:00", statut: "rdv-demande" },
  { id: "s6", nature: "probleme", titre: "Le bouton « Exporter » ne répondait pas", texte: "Quand je cliquais sur Exporter dans les encours, rien ne se passait.", creeLe: "2026-11-15T11:20:00", statut: "corrige" },
  { id: "s7", nature: "fonction", titre: "Afficher la photo des clients", texte: "Pour reconnaître mes clients plus vite.", creeLe: "2026-11-12T17:00:00", statut: "ajoute" },
  { id: "s8", nature: "fonction", titre: "Envoyer les e-mails depuis Gmail", texte: "Je préférerais que les e-mails partent de ma boîte Gmail personnelle.", creeLe: "2026-11-10T19:00:00", statut: "refusee", message: "Les e-mails partent de l'adresse du cabinet pour être reconnus comme sûrs par les boîtes de vos clients ; une boîte Gmail personnelle les ferait souvent classer en indésirables. Merci pour l'idée !" },
];

/** Visites de l'agence en lecture seule (fictives) : le client voit qui est venu, quand et pourquoi. */
export const VISITES_AGENCE = [
  { visiteur: "Vincent", quand: "2026-11-23T14:05:00", minutes: 12, motif: "Contrôle de la demande « Le bouton Exporter ne répondait pas »" },
  { visiteur: "Vincent", quand: "2026-11-15T09:40:00", minutes: 6, motif: "Vérification après mise à jour" },
];
export const ligneVisite = (v) => `<div class="ligne"><span class="carte-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.6"/></svg></span><div class="ligne-texte"><strong style="white-space:normal">${esc(v.visiteur)}, ${AGENCE} — ${quand(v.quand)} — lecture seule — ${v.minutes} min</strong><span style="white-space:normal">${esc(v.motif)}</span></div></div>`;

export function ligneDemande(d) {
  const [libelle, couleur] = libelleStatut(d);
  return `<button class="support-ligne" data-action="support-ouvrir" data-id="${d.id}">
    <span class="support-ligne-haut"><span class="pastille statut-${couleur || "neutre"}"><span class="point"></span>${esc(libelle)}</span><small>${quand(d.creeLe)}</small></span>
    <strong class="support-ligne-titre">${esc(d.titre)}</strong>
    <small class="support-ligne-nature">${esc(LIBELLE_NATURE[d.nature])}</small>
    ${d.statut === "refusee" && d.message ? `<small class="support-ligne-message">${esc(d.message)}</small>` : ""}
  </button>`;
}

export function detailDemande(d, icone) {
  const [libelle, couleur] = libelleStatut(d);
  return `<div class="feuille-tete"><span class="carte-ico">${icone("support")}</span><h2>${esc(d.titre)}</h2><button class="btn btn-icone" data-action="fermer">${icone("fermer")}</button></div>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px"><span class="pastille statut-${couleur || "neutre"}"><span class="point"></span>${esc(libelle)}</span><span style="font-size:12.5px;color:var(--texte-3)">${esc(LIBELLE_NATURE[d.nature])} · envoyée le ${quand(d.creeLe)}</span></div>
    ${d.message ? `<div class="support-reponse"><strong>Réponse de ${AGENCE}</strong><p>${esc(d.message)}</p></div>` : ""}
    <p class="support-texte">${esc(d.texte)}</p>
    <div class="pied-feuille"><button class="btn btn-or" data-action="fermer">Fermer</button></div>`;
}

/** Formulaire « Nouvelle demande » : trois questions, un bouton. */
export function formulaireSupport(icone, nature = "probleme") {
  return `<div class="feuille-tete"><span class="carte-ico">${icone("support")}</span><h2>Nouvelle demande</h2><button class="btn btn-icone" data-action="fermer">${icone("fermer")}</button></div>
    <div class="support-legende">De quoi s'agit-il ?</div>
    <div class="support-natures">${NATURES.map((n) => `<button type="button" class="support-nature ${n.valeur === nature ? "actif" : ""}" data-action="support-nature" data-v="${n.valeur}"><i></i><span><strong>${n.libelle}</strong><small>${n.aide}</small></span></button>`).join("")}</div>
    <label class="champ-reglage" style="margin-top:12px">En quelques mots<input id="support-titre" maxlength="120" placeholder="Ex. : les relevés d'un partenaire ne sont pas arrivés" autocomplete="off"></label>
    <label class="champ-reglage" style="margin-top:12px">Expliquez-nous<textarea id="support-texte" rows="7" placeholder="Ce que vous faisiez, ce qui s'est passé, ce que vous attendiez… Plus c'est précis, plus vite c'est réglé."></textarea></label>
    <p class="support-aide">Évitez d'écrire les coordonnées de vos clients.</p>
    <p id="support-erreur" style="margin:4px 0 0;color:var(--rouge);min-height:18px;font-size:12.5px"></p>
    <div class="pied-feuille"><button class="btn" data-action="fermer">Annuler</button><button class="btn btn-or" data-action="support-envoyer">${icone("envoyer")} Envoyer à ${AGENCE}</button></div>`;
}
