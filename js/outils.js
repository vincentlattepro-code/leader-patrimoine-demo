/** Outils communs : mise en forme, dates, calculs sur les fiches, règles du radar et de la conformité. */
import { CLIENTS, DEMANDES } from "./donnees.js";

export const AUJOURDHUI = new Date("2026-11-20T10:42:00");
export const HEURE_DEMO = { h: 10, m: 42 };

const nf = new Intl.NumberFormat("fr-FR");
export const eur = (n) => `${nf.format(Math.round(n))} €`;
export const meur = (n, d = 1) => `${(n / 1e6).toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d })} M€`;
export const keur = (n) => `${nf.format(Math.round(n / 1000))} k€`;
export const pct = (n, d = 1) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d })} %`;
export const montantCourt = (n) => (n >= 1e6 ? meur(n) : n >= 10000 ? keur(n) : eur(n));

export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export function dateFr(iso, options = { day: "numeric", month: "short", year: "numeric" }) {
  if (!iso) return "—";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", options);
}
export function moisDepuis(iso) {
  if (!iso) return Infinity;
  const d = new Date(`${iso}T12:00:00`);
  return (AUJOURDHUI.getFullYear() - d.getFullYear()) * 12 + (AUJOURDHUI.getMonth() - d.getMonth());
}
export function anneesDepuis(iso) {
  return moisDepuis(iso) / 12;
}

export const nomComplet = (c) => `${c.prenom} ${c.nom}`;
export const clientParId = (id) => CLIENTS.find((c) => c.id === id);
/** Client professionnel (société, holding, SCI…) ou particulier. */
export const estPro = (c) => !!c?.pro;
/** Pastille « Pro » ou « Particulier », affichée partout où un client est cité. */
export function pastilleNature(c) {
  if (!c) return "";
  return estPro(c) ? `<span class="nature nature-pro" title="Client professionnel · ${esc(c.pro.raison ?? "")}">Pro</span>` : `<span class="nature" title="Client particulier">Particulier</span>`;
}
/** Retrouve le client d'un rendez-vous ou d'un document (par son identifiant, sinon par son nom). */
export const clientDe = (x) => {
  const nom = x?.client ?? x?.nom;
  const c = (x?.id ? clientParId(x.id) : null) ?? CLIENTS.find((k) => nomComplet(k) === nom) ?? DEMANDES.find((d) => d.nom === nom);
  if (c) return c;
  // Prospect pas encore enregistré : particulier, sauf les rendez-vous avec un partenaire (notaire, comptable…).
  return x?.couleur === "partenaire" ? null : {};
};

/** Encours conseillé (somme des contrats suivis par le cabinet). */
export const encoursClient = (c) => c.contrats.reduce((s, k) => s + k.valeur, 0);

/** Bilan patrimonial : actifs par catégorie, passif, net. */
export function bilan(c) {
  const actifs = c.actifs ?? [
    ...c.contrats.map((k) => ({ cat: k.type === "SCPI" ? "Immobilier" : "Financier", libelle: k.nom, valeur: k.valeur })),
    { cat: "Liquidités", libelle: "Comptes et livrets", valeur: c.liquidites ?? 0 },
  ];
  const passifs = c.passifs ?? [];
  const brut = actifs.reduce((s, a) => s + a.valeur, 0);
  const passif = passifs.reduce((s, p) => s + p.crd, 0);
  const parCat = {};
  for (const a of actifs) parCat[a.cat] = (parCat[a.cat] ?? 0) + a.valeur;
  return { actifs, passifs, brut, passif, net: brut - passif, parCat };
}
export const COULEURS_CAT = { Immobilier: "#f0a37a", Financier: "#e8c07a", Liquidités: "#8cc8ff", Professionnel: "#b9a2ff" };

const liquidites = (c) => (c.actifs ? c.actifs.filter((a) => a.cat === "Liquidités").reduce((s, a) => s + a.valeur, 0) : (c.liquidites ?? 0));
const aUn = (c, type) => c.contrats.some((k) => k.type === type);

/* ================================================================ Radar d'opportunités (règles fixes, réglables) ================================================================ */

export function opportunites() {
  const regles = [
    {
      id: "per",
      titre: "Ouvrir un PER avant le 31 décembre",
      texte: "Clients imposés à 30 % ou plus, sans plan d'épargne retraite.",
      ico: "euro",
      couleur: "or",
      filtre: (c) => c.tmi >= 30 && !aUn(c, "PER individuel"),
      potentiel: (c) => Math.min(c.revenus * 0.1, 15000),
      unite: "de versements possibles",
      gain: (c) => (Math.min(c.revenus * 0.1, 15000) * c.tmi) / 100,
      gainTexte: "d'impôt économisé pour vos clients",
    },
    {
      id: "huit",
      titre: "Contrats de plus de 8 ans",
      texte: "Rachats possibles avec l'abattement annuel de 4 600 € (9 200 € pour un couple).",
      ico: "sablier",
      couleur: "bleu",
      filtre: (c) => c.contrats.some((k) => k.type === "Assurance-vie" && anneesDepuis(k.ouverture) >= 8),
      potentiel: (c) => c.contrats.filter((k) => k.type === "Assurance-vie" && anneesDepuis(k.ouverture) >= 8).reduce((s, k) => s + k.valeur, 0),
      unite: "d'encours concernés",
    },
    {
      id: "avant70",
      titre: "Verser avant 70 ans",
      texte: "152 500 € transmis hors droits par bénéficiaire, sur les versements faits avant 70 ans.",
      ico: "horloge",
      couleur: "violet",
      filtre: (c) => c.age >= 63 && c.age < 70 && aUn(c, "Assurance-vie"),
      potentiel: (c) => Math.max(0, liquidites(c) - 30000) + 50000,
      unite: "de collecte possible",
    },
    {
      id: "liquidites",
      titre: "Épargne qui dort",
      texte: "Plus de 50 000 € sur des comptes et livrets peu rémunérés.",
      ico: "tendance",
      couleur: "vert",
      filtre: (c) => liquidites(c) > 50000,
      potentiel: (c) => liquidites(c) - 30000,
      unite: "à placer (en gardant 30 000 € de précaution)",
    },
    {
      id: "transmission",
      titre: "Transmission à organiser",
      texte: "Clients de 60 ans et plus avec enfants, patrimoine net supérieur à 800 000 €.",
      ico: "famille",
      couleur: "orange",
      filtre: (c) => c.age >= 60 && (c.enfants?.length ?? 0) > 0 && bilan(c).net > 800000,
      potentiel: (c) => bilan(c).net,
      unite: "de patrimoine à transmettre",
    },
    {
      id: "revue",
      titre: "Revue annuelle à planifier",
      texte: "Pas de revue depuis plus de 12 mois : invitation automatique prête.",
      ico: "agenda",
      couleur: "rouge",
      filtre: (c) => moisDepuis(c.profil?.date) > 12 && !c.prochain,
      potentiel: (c) => encoursClient(c),
      unite: "d'encours à revoir",
    },
  ];
  return regles.map((r) => {
    const clients = CLIENTS.filter(r.filtre);
    return { ...r, clients, total: clients.reduce((s, c) => s + r.potentiel(c), 0), totalGain: r.gain ? clients.reduce((s, c) => s + r.gain(c), 0) : 0 };
  });
}

/* ================================================================ Conformité (MIF 2, DDA, LCB-FT) ================================================================ */

export function etatConformite(c) {
  const k = c.conformite ?? {};
  const points = [
    { id: "der", libelle: "Document d'entrée en relation", ok: c.courte ? true : !!k.der, date: k.der },
    { id: "kyc", libelle: "Connaissance client (< 24 mois)", ok: moisDepuis(k.kyc) <= 24, date: k.kyc, alerte: moisDepuis(k.kyc) > 21 && moisDepuis(k.kyc) <= 24 },
    { id: "profil", libelle: "Profil investisseur + durabilité", ok: c.profil?.esg !== "Non renseigné" && moisDepuis(c.profil?.date) <= 24, date: c.profil?.date },
    { id: "lettre", libelle: "Lettre de mission", ok: c.courte ? true : !!k.lettre, date: k.lettre },
    { id: "adequation", libelle: "Déclaration d'adéquation", ok: !!k.adequation, date: k.adequation },
    { id: "identite", libelle: "Pièce d'identité valide", ok: !!k.identite && k.identite > "2026-11-20", date: k.identite },
  ];
  const manquants = points.filter((p) => !p.ok);
  return { points, manquants, complet: manquants.length === 0, vigilance: k.vigilance ?? "Standard" };
}

export function syntheseConformite() {
  const etats = CLIENTS.map((c) => ({ c, e: etatConformite(c) }));
  const compte = (id) => etats.filter(({ e }) => e.manquants.some((m) => m.id === id));
  return {
    etats,
    complets: etats.filter(({ e }) => e.complet).length,
    total: etats.length,
    kyc: compte("kyc"),
    profil: compte("profil"),
    adequation: compte("adequation"),
    identite: compte("identite"),
    renforcee: etats.filter(({ e }) => e.vigilance === "Renforcée"),
  };
}

/** Tous les contrats du portefeuille, à plat. */
export function tousContrats() {
  return CLIENTS.flatMap((c) => c.contrats.map((k) => ({ ...k, client: c })));
}

/** Petite courbe (étincelle) en SVG. */
export function etincelle(valeurs, couleur = "url(#degOr)") {
  const max = Math.max(...valeurs);
  const min = Math.min(...valeurs);
  const pts = valeurs.map((v, i) => `${(i / (valeurs.length - 1)) * 80},${28 - ((v - min) / (max - min || 1)) * 24}`).join(" ");
  return `<svg class="etincelle" viewBox="0 0 80 30"><polyline points="${pts}" fill="none" stroke="${couleur}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/** Courbe d'évolution avec aire dégradée. */
export function courbe(valeurs, libelles, { hauteur = 180, format = (v) => v } = {}) {
  const L = 600;
  const H = hauteur;
  const max = Math.max(...valeurs) * 1.03;
  const min = Math.min(...valeurs) * 0.97;
  const x = (i) => 30 + (i / (valeurs.length - 1)) * (L - 40);
  const y = (v) => 10 + (1 - (v - min) / (max - min)) * (H - 40);
  const pts = valeurs.map((v, i) => `${x(i)},${y(v)}`);
  const d = `M${pts.join(" L")}`;
  const aire = `${d} L${x(valeurs.length - 1)},${H - 30} L${x(0)},${H - 30} Z`;
  const lignes = [0, 0.5, 1].map((t) => {
    const v = min + (max - min) * t;
    return `<line class="grille-l" x1="30" x2="${L - 10}" y1="${y(v)}" y2="${y(v)}"/><text x="0" y="${y(v) + 4}">${format(v)}</text>`;
  });
  return `<svg class="graphe" viewBox="0 0 ${L} ${H}">
    <defs><linearGradient id="aireOr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6b86a" stop-opacity=".38"/><stop offset="1" stop-color="#e6b86a" stop-opacity="0"/></linearGradient></defs>
    ${lignes.join("")}
    <path class="aire" d="${aire}" fill="url(#aireOr)"/>
    <path class="trace" d="${d}"/>
    <circle cx="${x(valeurs.length - 1)}" cy="${y(valeurs.at(-1))}" r="5" fill="#ffd565" stroke="#fff" stroke-width="2"/>
    ${libelles.map((l, i) => (i % 2 === 0 || i === libelles.length - 1 ? `<text x="${x(i) - 10}" y="${H - 8}">${l}</text>` : "")).join("")}
  </svg>`;
}

/** Anneau de répartition. */
export function anneau(parts) {
  const total = parts.reduce((s, p) => s + p.valeur, 0);
  const r = 60;
  const C = 2 * Math.PI * r;
  let cumul = 0;
  const arcs = parts.map((p, i) => {
    const long = (p.valeur / total) * C;
    const arc = `<circle cx="75" cy="75" r="${r}" stroke="${p.couleur}" stroke-dasharray="${Math.max(0, long - 3)} ${C}" stroke-dashoffset="${-cumul}" style="animation-delay:${i * 0.08}s"/>`;
    cumul += long;
    return arc;
  });
  return `<div class="anneau"><svg viewBox="0 0 150 150">${arcs.join("")}</svg><div class="legende">${parts.map((p) => `<div><i style="background:${p.couleur}"></i>${esc(p.libelle)}<b>${p.affiche ?? `${p.valeur} %`}</b></div>`).join("")}</div></div>`;
}
